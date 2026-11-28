import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HttpError } from "../middleware/errors";
import {
  parseAnalyticsDays,
  parsePageViewInput,
} from "./analytics.validation";

function assertBadRequest(action: () => unknown): void {
  assert.throws(
    action,
    (error: unknown) => error instanceof HttpError && error.statusCode === 400,
  );
}

describe("page view validation", () => {
  it("accepts a UUID v4 visitor and extracts artifact slugs", () => {
    assert.deepEqual(
      parsePageViewInput({
        visitor_id: "3f4a1b2c-8d7e-4a9b-bc12-3456789abcde",
        path: "/artifacts/a-1-skyraider",
      }),
      {
        visitor_id: "3f4a1b2c-8d7e-4a9b-bc12-3456789abcde",
        path: "/artifacts/a-1-skyraider",
        artifact_slug: "a-1-skyraider",
      },
    );
    assert.equal(
      parsePageViewInput({
        visitor_id: "3f4a1b2c-8d7e-4a9b-bc12-3456789abcde",
        path: "/artifacts/blu-82/?lang=en",
      }).artifact_slug,
      "blu-82",
    );
    assert.equal(
      parsePageViewInput({
        visitor_id: "3f4a1b2c-8d7e-4a9b-bc12-3456789abcde",
        path: "/",
      }).artifact_slug,
      null,
    );
    assert.equal(
      parsePageViewInput({
        visitor_id: "3f4a1b2c-8d7e-4a9b-bc12-3456789abcde",
        path: "/artifacts",
      }).artifact_slug,
      null,
    );
    assert.equal(
      parsePageViewInput({
        visitor_id: "3f4a1b2c-8d7e-4a9b-bc12-3456789abcde",
        path: "/artifacts/a-1/extra",
      }).artifact_slug,
      null,
    );
  });

  it("rejects malformed visitor ids and paths", () => {
    const validVisitorId = "3f4a1b2c-8d7e-4a9b-bc12-3456789abcde";
    assertBadRequest(() => parsePageViewInput(null));
    assertBadRequest(() => parsePageViewInput([]));
    assertBadRequest(() =>
      parsePageViewInput({ visitor_id: "not-a-uuid", path: "/" }),
    );
    assertBadRequest(() =>
      parsePageViewInput({
        visitor_id: "3f4a1b2c-8d7e-1a9b-bc12-3456789abcde",
        path: "/",
      }),
    );
    assertBadRequest(() =>
      parsePageViewInput({ visitor_id: validVisitorId, path: "home" }),
    );
    assertBadRequest(() =>
      parsePageViewInput({ visitor_id: validVisitorId, path: "" }),
    );
    assertBadRequest(() =>
      parsePageViewInput({ visitor_id: validVisitorId, path: `/${"a".repeat(300)}` }),
    );
    assertBadRequest(() =>
      parsePageViewInput({ visitor_id: validVisitorId, path: 42 }),
    );
  });

  it("blocks admin pages including nested and query-string paths", () => {
    const visitor_id = "3f4a1b2c-8d7e-4a9b-bc12-3456789abcde";
    for (const path of [
      "/admin",
      "/admin/",
      "/admin/analytics",
      "/admin?tab=1",
      "/ADMIN/analytics",
    ]) {
      assertBadRequest(() => parsePageViewInput({ visitor_id, path }));
    }
  });

  it("accepts only 7 or 30 day ranges", () => {
    assert.equal(parseAnalyticsDays("7"), 7);
    assert.equal(parseAnalyticsDays(30), 30);
    assertBadRequest(() => parseAnalyticsDays("14"));
    assertBadRequest(() => parseAnalyticsDays(undefined));
    assertBadRequest(() => parseAnalyticsDays(["7", "30"]));
  });
});
