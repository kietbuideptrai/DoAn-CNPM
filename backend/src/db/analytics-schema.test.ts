import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const schema = readFileSync(join(process.cwd(), "src/db/schema.sql"), "utf8");
const migration = readFileSync(
  join(process.cwd(), "src/db/migrate-2026-11-28-analytics.sql"),
  "utf8",
);

describe("analytics database schema", () => {
  it("creates page_views and its viewed_at index idempotently", () => {
    assert.match(schema, /CREATE TABLE IF NOT EXISTS page_views \(/u);
    assert.match(
      schema,
      /CREATE INDEX IF NOT EXISTS page_views_viewed_at_idx ON page_views \(viewed_at\)/u,
    );
    for (const column of [
      "id UUID PRIMARY KEY DEFAULT gen_random_uuid()",
      "visitor_id UUID NOT NULL",
      "path TEXT NOT NULL",
      "artifact_slug TEXT",
      "viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()",
    ]) {
      assert.ok(schema.includes(column), `Thiếu cột: ${column}`);
    }
  });

  it("keeps the analytics table free of tracking identifiers", () => {
    // Comments explaining the privacy rule may mention these words; only
    // declared columns matter here.
    const declarations = (sql: string): string =>
      sql.replace(/--.*$/gmu, "");
    assert.doesNotMatch(declarations(schema), /ip_address|user_agent|cookie/iu);
    assert.doesNotMatch(
      declarations(migration),
      /ip_address|user_agent|cookie/iu,
    );
  });

  it("ships an idempotent migration for existing databases", () => {
    assert.match(migration, /CREATE TABLE IF NOT EXISTS page_views \(/u);
    assert.match(
      migration,
      /CREATE INDEX IF NOT EXISTS page_views_viewed_at_idx ON page_views \(viewed_at\)/u,
    );
  });

  it("makes the pre-existing tables safe to re-apply", () => {
    for (const table of ["artifacts", "artifact_translations", "admin_users"]) {
      assert.match(
        schema,
        new RegExp(`CREATE TABLE IF NOT EXISTS ${table} \\(`, "u"),
      );
    }
  });
});
