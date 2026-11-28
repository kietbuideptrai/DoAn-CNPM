import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HttpError } from "../middleware/errors";
import {
  buildAnalyticsSummary,
  getAnalyticsSummary,
  getZonedDate,
  recordPageView,
  type AnalyticsQuery,
} from "./analytics.service";

interface CapturedQuery {
  sql: string;
  values?: unknown[];
}

function capture(rowsByMarker: Record<string, unknown[]>): {
  query: AnalyticsQuery;
  captured: CapturedQuery[];
} {
  const captured: CapturedQuery[] = [];
  const query: AnalyticsQuery = async <T>(
    sql: string,
    values?: unknown[],
  ): Promise<{ rows: T[] }> => {
    captured.push({ sql, values });
    const marker = Object.keys(rowsByMarker).find((key) => sql.includes(key));
    return { rows: (marker ? rowsByMarker[marker] : []) as T[] };
  };
  return { query, captured };
}

describe("analytics summary aggregation", () => {
  it("fills missing days and picks the busiest day", () => {
    const summary = buildAnalyticsSummary({
      days: 7,
      today: "2026-11-28",
      dailyRows: [
        { date: "2026-11-28", pageviews: 12, unique_visitors: 7 },
        { date: "2026-11-26", pageviews: 30, unique_visitors: 15 },
      ],
      totalsRow: {
        pageviews: 42,
        unique_visitors: 25,
        today_pageviews: 12,
        today_unique_visitors: 7,
      },
      topRows: [
        { slug: "a-1-skyraider", title: "A-1 Skyraider", views: 20 },
        { slug: "unknown-slug", title: null, views: 5 },
      ],
    });

    assert.deepEqual(summary.range, {
      days: 7,
      from: "2026-11-22",
      to: "2026-11-28",
    });
    assert.equal(summary.daily.length, 7);
    assert.deepEqual(summary.daily[0], {
      date: "2026-11-22",
      pageviews: 0,
      unique_visitors: 0,
    });
    assert.deepEqual(summary.daily[6], {
      date: "2026-11-28",
      pageviews: 12,
      unique_visitors: 7,
    });
    assert.deepEqual(summary.totals, {
      pageviews: 42,
      unique_visitors: 25,
      today_pageviews: 12,
      today_unique_visitors: 7,
      peak_day: { date: "2026-11-26", pageviews: 30 },
    });
    assert.deepEqual(summary.top_artifacts, [
      { slug: "a-1-skyraider", title: "A-1 Skyraider", views: 20 },
      { slug: "unknown-slug", title: "unknown-slug", views: 5 },
    ]);
  });

  it("returns 30 days with a null peak when there is no data", () => {
    const summary = buildAnalyticsSummary({
      days: 30,
      today: "2026-11-28",
      dailyRows: [],
      topRows: [],
    });

    assert.equal(summary.daily.length, 30);
    assert.equal(summary.range.from, "2026-10-30");
    assert.equal(summary.totals.peak_day, null);
    assert.deepEqual(summary.totals, {
      pageviews: 0,
      unique_visitors: 0,
      today_pageviews: 0,
      today_unique_visitors: 0,
      peak_day: null,
    });
  });
});

describe("analytics service queries", () => {
  it("groups by Asia/Ho_Chi_Minh date and uses the injected clock", async () => {
    const { query, captured } = capture({
      "-- analytics:daily": [
        { date: "2026-11-28", pageviews: 9, unique_visitors: 4 },
      ],
      "-- analytics:totals": [
        {
          pageviews: 9,
          unique_visitors: 4,
          today_pageviews: 9,
          today_unique_visitors: 4,
        },
      ],
      "-- analytics:top-artifacts": [
        { slug: "f-5a", title: "F-5A", views: 9 },
      ],
    });

    const summary = await getAnalyticsSummary(
      7,
      query,
      () => new Date("2026-11-28T02:00:00Z"),
    );

    assert.equal(summary.totals.today_pageviews, 9);
    assert.equal(summary.top_artifacts[0].title, "F-5A");
    assert.equal(captured.length, 3);
    assert.ok(
      captured.every(({ sql }) => sql.includes("AT TIME ZONE 'Asia/Ho_Chi_Minh'")),
    );
    assert.deepEqual(captured[0].values, ["2026-11-22", 7]);
    assert.deepEqual(captured[1].values, ["2026-11-22", 7, "2026-11-28"]);
    assert.ok(captured[2].sql.includes("LIMIT 5"));
    assert.doesNotMatch(JSON.stringify(captured), /postgres|DATABASE_URL|secret/iu);
  });

  it("formats the current date in the museum timezone", () => {
    assert.equal(getZonedDate(new Date("2026-11-28T17:30:00Z")), "2026-11-29");
    assert.equal(getZonedDate(new Date("2026-11-28T02:00:00Z")), "2026-11-28");
  });

  it("inserts only visitor id, path and artifact slug", async () => {
    const { query, captured } = capture({});
    await recordPageView(
      {
        visitor_id: "3f4a1b2c-8d7e-4a9b-bc12-3456789abcde",
        path: "/artifacts/blu-82",
        artifact_slug: "blu-82",
      },
      query,
    );

    assert.equal(captured.length, 1);
    assert.match(captured[0].sql, /INSERT INTO page_views/u);
    assert.deepEqual(captured[0].values, [
      "3f4a1b2c-8d7e-4a9b-bc12-3456789abcde",
      "/artifacts/blu-82",
      "blu-82",
    ]);
    assert.doesNotMatch(captured[0].sql, /ip|user_agent|cookie/iu);
  });

  it("maps database failures to a generic 500 without query details", async () => {
    const failingQuery: AnalyticsQuery = async () => {
      throw new Error("postgres://user:secret@db.example.test/app SELECT * FROM page_views");
    };

    for (const action of [
      () => recordPageView({ visitor_id: "id", path: "/", artifact_slug: null }, failingQuery),
      () => getAnalyticsSummary(7, failingQuery),
    ]) {
      await assert.rejects(
        action,
        (error: unknown) =>
          error instanceof HttpError &&
          error.statusCode === 500 &&
          error.message === "Đã xảy ra lỗi máy chủ" &&
          !error.message.includes("secret") &&
          !error.message.includes("SELECT"),
      );
    }
  });
});
