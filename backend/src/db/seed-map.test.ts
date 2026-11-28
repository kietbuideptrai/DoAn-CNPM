import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const seed = readFileSync(join(process.cwd(), "src/db/seed-map.sql"), "utf8");
const demoMap = readFileSync(
  join(process.cwd(), "../shared/demoMap.ts"),
  "utf8",
);

interface Zone {
  id: string;
  name: string;
  shortName: string;
  description: string;
  kind: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  sortOrder: number;
}

interface Position {
  slug: string;
  zoneId: string;
  x: number;
  y: number;
}

function parseSeedZones(): Zone[] {
  return [
    ...seed.matchAll(
      /\('([a-z0-9-]+)', '([^']+)', '([^']+)', '([^']+)', '(gallery|lobby|walkway|service)', (\d+), (\d+), (\d+), (\d+), '(#[0-9A-Fa-f]{6})', (\d+)\)/g,
    ),
  ].map((match) => ({
    id: match[1],
    name: match[2],
    shortName: match[3],
    description: match[4],
    kind: match[5],
    x: Number(match[6]),
    y: Number(match[7]),
    width: Number(match[8]),
    height: Number(match[9]),
    color: match[10],
    sortOrder: Number(match[11]),
  }));
}

function parseDemoZones(): Zone[] {
  return [
    ...demoMap.matchAll(
      /id: "([a-z0-9-]+)",\s*name: "([^"]+)",\s*short_name: "([^"]+)",\s*description: "([^"]+)",\s*kind: "([^"]+)",\s*x: (\d+),\s*y: (\d+),\s*width: (\d+),\s*height: (\d+),\s*color: "(#[0-9A-Fa-f]{6})",\s*sort_order: (\d+)/g,
    ),
  ].map((match) => ({
    id: match[1],
    name: match[2],
    shortName: match[3],
    description: match[4],
    kind: match[5],
    x: Number(match[6]),
    y: Number(match[7]),
    width: Number(match[8]),
    height: Number(match[9]),
    color: match[10],
    sortOrder: Number(match[11]),
  }));
}

function parsePositions(source: string, demo: boolean): Position[] {
  const pattern = demo
    ? /"([a-z0-9-]+)": \{ zone_id: "([^"]+)", x: (\d+), y: (\d+) \}/g
    : /\('([a-z0-9-]+)', '([a-z0-9-]+)', (\d+), (\d+)\)/g;

  return [...source.matchAll(pattern)].map((match) => ({
    slug: match[1],
    zoneId: match[2],
    x: Number(match[3]),
    y: Number(match[4]),
  }));
}

describe("museum map seed", () => {
  it("matches the shared demo zones and stays idempotent", () => {
    const seedZones = parseSeedZones();
    const demoZones = parseDemoZones();

    assert.equal(seedZones.length, 7);
    assert.equal(demoZones.length, 7);
    const byId = (a: Zone, b: Zone): number => a.id.localeCompare(b.id);
    assert.deepEqual([...seedZones].sort(byId), [...demoZones].sort(byId));
    assert.match(seed, /ON CONFLICT \(id\) DO UPDATE SET/);
  });

  it("places the eight demo artifacts inside their zones", () => {
    const seedPositions = parsePositions(seed, false);
    const demoPositions = parsePositions(demoMap, true);
    const zones = new Map(parseSeedZones().map((zone) => [zone.id, zone]));

    assert.equal(seedPositions.length, 8);
    assert.deepEqual(seedPositions, demoPositions);
    assert.match(seed, /artifacts\.map_x IS NULL/);
    assert.match(seed, /artifacts\.map_y IS NULL/);

    for (const position of seedPositions) {
      const zone = zones.get(position.zoneId);
      assert.ok(zone, `unknown zone ${position.zoneId}`);
      assert.ok(
        position.x >= zone.x &&
          position.x <= zone.x + zone.width &&
          position.y >= zone.y &&
          position.y <= zone.y + zone.height,
        `${position.slug} is outside ${position.zoneId}`,
      );
    }
  });
});
