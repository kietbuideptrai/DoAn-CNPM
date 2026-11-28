import { HttpError } from "../middleware/errors";
import type { AnalyticsDays, PageViewInput } from "./analytics.validation";

const TIMEZONE = "Asia/Ho_Chi_Minh";
const GENERIC_ERROR_MESSAGE = "Đã xảy ra lỗi máy chủ";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Minimal query surface shared by `pool.query` and test doubles. */
export type AnalyticsQuery = <T = unknown>(
  sql: string,
  values?: unknown[],
) => Promise<{ rows: T[] }>;

export interface DailyStatsRow {
  date: string;
  pageviews: number | string;
  unique_visitors: number | string;
}

export interface TotalsRow {
  pageviews: number | string;
  unique_visitors: number | string;
  today_pageviews: number | string;
  today_unique_visitors: number | string;
}

export interface TopArtifactRow {
  slug: string;
  title: string | null;
  views: number | string;
}

export interface AnalyticsSummary {
  range: { days: number; from: string; to: string };
  totals: {
    pageviews: number;
    unique_visitors: number;
    today_pageviews: number;
    today_unique_visitors: number;
    peak_day: { date: string; pageviews: number } | null;
  };
  daily: Array<{ date: string; pageviews: number; unique_visitors: number }>;
  top_artifacts: Array<{ slug: string; title: string; views: number }>;
}

export interface SummarySource {
  days: AnalyticsDays;
  today: string;
  dailyRows: DailyStatsRow[];
  totalsRow?: TotalsRow | null;
  topRows: TopArtifactRow[];
}

const PAGE_VIEW_INSERT_SQL = `
  INSERT INTO page_views (visitor_id, path, artifact_slug)
  VALUES ($1, $2, $3)
`;

const DAILY_STATS_SQL = `-- analytics:daily
  SELECT (viewed_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date::text AS date,
         COUNT(*)::int AS pageviews,
         COUNT(DISTINCT visitor_id)::int AS unique_visitors
  FROM page_views
  WHERE viewed_at >= ($1::date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')
    AND viewed_at < (($1::date + $2::int)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')
  GROUP BY 1
  ORDER BY 1
`;

const TOTALS_SQL = `-- analytics:totals
  SELECT COUNT(*)::int AS pageviews,
         COUNT(DISTINCT visitor_id)::int AS unique_visitors,
         CAST(COUNT(*) FILTER (
           WHERE (viewed_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = $3::date
         ) AS integer) AS today_pageviews,
         CAST(COUNT(DISTINCT visitor_id) FILTER (
           WHERE (viewed_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = $3::date
         ) AS integer) AS today_unique_visitors
  FROM page_views
  WHERE viewed_at >= ($1::date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')
    AND viewed_at < (($1::date + $2::int)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')
`;

const TOP_ARTIFACTS_SQL = `-- analytics:top-artifacts
  SELECT pv.artifact_slug AS slug,
         COALESCE(a.name, pv.artifact_slug) AS title,
         COUNT(*)::int AS views
  FROM page_views AS pv
  LEFT JOIN artifacts AS a ON a.slug = pv.artifact_slug
  WHERE pv.artifact_slug IS NOT NULL
    AND pv.viewed_at >= ($1::date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')
    AND pv.viewed_at < (($1::date + $2::int)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')
  GROUP BY pv.artifact_slug, a.name
  ORDER BY views DESC, pv.artifact_slug ASC
  LIMIT 5
`;

export async function recordPageView(
  input: PageViewInput,
  query: AnalyticsQuery,
): Promise<void> {
  await runQuery(query, PAGE_VIEW_INSERT_SQL, [
    input.visitor_id,
    input.path,
    input.artifact_slug,
  ]);
}

export async function getAnalyticsSummary(
  days: AnalyticsDays,
  query: AnalyticsQuery,
  now: () => Date = () => new Date(),
): Promise<AnalyticsSummary> {
  const today = getZonedDate(now());
  const from = dateDaysBefore(today, days - 1);
  const rangeValues = [from, days];

  const [dailyRows, totalsRows, topRows] = await Promise.all([
    runQuery<DailyStatsRow>(query, DAILY_STATS_SQL, rangeValues),
    runQuery<TotalsRow>(query, TOTALS_SQL, [...rangeValues, today]),
    runQuery<TopArtifactRow>(query, TOP_ARTIFACTS_SQL, rangeValues),
  ]);

  return buildAnalyticsSummary({
    days,
    today,
    dailyRows,
    totalsRow: totalsRows[0],
    topRows,
  });
}

export function buildAnalyticsSummary(source: SummarySource): AnalyticsSummary {
  const dates = Array.from({ length: source.days }, (_, index) =>
    dateDaysBefore(source.today, source.days - 1 - index),
  );
  const dailyByDate = new Map(
    source.dailyRows.map((row) => [String(row.date).slice(0, 10), row]),
  );
  const daily = dates.map((date) => {
    const row = dailyByDate.get(date);
    return {
      date,
      pageviews: toCount(row?.pageviews),
      unique_visitors: toCount(row?.unique_visitors),
    };
  });

  const totalPageviews = daily.reduce((sum, point) => sum + point.pageviews, 0);
  const busiestDay =
    totalPageviews > 0
      ? daily.reduce((best, point) =>
          point.pageviews > best.pageviews ? point : best,
        )
      : null;

  return {
    range: { days: source.days, from: dates[0], to: source.today },
    totals: {
      pageviews: toCount(source.totalsRow?.pageviews ?? totalPageviews),
      unique_visitors: toCount(source.totalsRow?.unique_visitors),
      today_pageviews: toCount(source.totalsRow?.today_pageviews),
      today_unique_visitors: toCount(source.totalsRow?.today_unique_visitors),
      peak_day: busiestDay
        ? { date: busiestDay.date, pageviews: busiestDay.pageviews }
        : null,
    },
    daily,
    top_artifacts: source.topRows.map((row) => ({
      slug: row.slug,
      title: row.title || row.slug,
      views: toCount(row.views),
    })),
  };
}

export function getZonedDate(value: Date): string {
  const parts = dateFormatter.formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((entry) => entry.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

async function runQuery<T>(
  query: AnalyticsQuery,
  sql: string,
  values: unknown[],
): Promise<T[]> {
  try {
    const result = await query<T>(sql, values);
    return result.rows;
  } catch {
    // Never surface SQL text or connection details to the client or logs.
    throw new HttpError(500, GENERIC_ERROR_MESSAGE);
  }
}

function dateDaysBefore(date: string, count: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() - count);
  return value.toISOString().slice(0, 10);
}

function toCount(value: number | string | null | undefined): number {
  const count = Number(value ?? 0);
  return Number.isFinite(count) ? count : 0;
}
