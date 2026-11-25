import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getHealthStatus } from "./health.service";

describe("getHealthStatus", () => {
  it("reports backend and database ready when the database check succeeds", async () => {
    let checkCount = 0;
    const result = await getHealthStatus(async () => {
      checkCount += 1;
    });

    assert.equal(checkCount, 1);
    assert.deepEqual(result, {
      status: {
        status: "ok",
        checks: { backend: "ok", database: "ok" },
      },
      httpStatus: 200,
    });
  });

  it("reports database unavailable without exposing database errors", async () => {
    const result = await getHealthStatus(async () => {
      throw new Error("postgres://user:secret@db.example.test/app");
    });

    assert.deepEqual(result, {
      status: {
        status: "unavailable",
        checks: { backend: "ok", database: "unavailable" },
      },
      httpStatus: 503,
    });
    assert.doesNotMatch(JSON.stringify(result), /secret|db\.example/);
  });
});
