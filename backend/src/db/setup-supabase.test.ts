import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const script = readFileSync(
  join(process.cwd(), "scripts/setup-supabase.ts"),
  "utf8",
);

describe("Supabase demo setup guard", () => {
  it("requires an explicit project ref and rejects production targets", () => {
    assert.match(script, /SUPABASE_PROJECT_REF/);
    assert.match(script, /DATABASE_URL không khớp SUPABASE_PROJECT_REF/);
    assert.match(script, /NODE_ENV === "production"/);
    assert.match(script, /hostname\.toLowerCase\(\)\.includes\("supabase"\)/);
  });

  it("applies schema, migrations, seeds and admin/analytics scripts in order", () => {
    assert.match(script, /runPsqlFile\("schema\.sql"\)/);
    assert.match(script, /startsWith\("migrate-"\)/);
    assert.match(script, /runPsqlFile\("seed\.sql"\)/);
    assert.match(script, /runPsqlFile\("seed-map\.sql"\)/);
    assert.match(script, /runNpmScript\("seed:admin"\)/);
    assert.match(script, /runNpmScript\("seed:analytics"\)/);

    const order = [
      "schema.sql",
      "migrate-",
      "seed.sql",
      "seed-map.sql",
      "seed:admin",
      "seed:analytics",
    ].map((token) => script.indexOf(token));
    assert.deepEqual(order, [...order].sort((a, b) => a - b));
  });

  it("requires a separate confirmation before destructive reset", () => {
    assert.match(script, /CONFIRM_RESET/);
    assert.match(script, /supabase-non-production/);
    assert.match(script, /TRUNCATE TABLE/);
    assert.match(script, /resetRequested && seedOnly/);
  });

  it("redacts the connection string and password from command output", () => {
    assert.match(script, /redact\(/);
    assert.match(script, /<DATABASE_URL>/);
    assert.match(script, /<redacted>/);
    assert.doesNotMatch(script, /console\.log\([^)]*databaseUrl/);
  });
});
