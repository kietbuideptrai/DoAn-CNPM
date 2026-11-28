import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { pool } from "../db/pool";
import { getMuseumMap, getMuseumZones } from "./museum-map.service";

type QueryStub = (sql: string, values?: unknown[]) => Promise<{ rows: unknown[] }>;

const originalQueryDescriptor = Object.getOwnPropertyDescriptor(pool, "query");

function stubQuery(stub: QueryStub): void {
  Object.defineProperty(pool, "query", {
    configurable: true,
    writable: true,
    value: stub,
  });
}

afterEach(() => {
  if (originalQueryDescriptor) {
    Object.defineProperty(pool, "query", originalQueryDescriptor);
    return;
  }
  delete (pool as unknown as Record<string, unknown>).query;
});

const zoneRows = [
  {
    id: "sanh",
    name: "Sảnh chính",
    short_name: "Sảnh",
    description: "Cửa vào chính và khu tiếp nhận.",
    kind: "lobby",
    x: "390.00",
    y: "460.00",
    width: "220.00",
    height: "120.00",
    color: "#E6F0EE",
    sort_order: "1",
  },
];

describe("museum map service", () => {
  it("returns zones ordered by sort_order with numeric coordinates", async () => {
    stubQuery(async (sql) => {
      assert.match(sql, /FROM museum_zones/);
      assert.match(sql, /ORDER BY sort_order, id/);
      return { rows: zoneRows };
    });

    const zones = await getMuseumZones();

    assert.equal(zones.length, 1);
    assert.deepEqual(zones[0], {
      id: "sanh",
      name: "Sảnh chính",
      short_name: "Sảnh",
      description: "Cửa vào chính và khu tiếp nhận.",
      kind: "lobby",
      x: 390,
      y: 460,
      width: 220,
      height: 120,
      color: "#E6F0EE",
      sort_order: 1,
    });
  });

  it("splits published artifacts into placed and unplaced lists", async () => {
    const queries: Array<{ sql: string; values?: unknown[] }> = [];

    stubQuery(async (sql, values) => {
      queries.push({ sql, values });
      if (sql.includes("FROM museum_zones")) {
        return { rows: zoneRows };
      }
      if (sql.includes("artifact.zone_id IS NOT NULL")) {
        return {
          rows: [
            {
              slug: "a-1-skyraider",
              title: "A-1スカイレイダー攻撃機",
              summary: "Máy bay cường kích.",
              image_url: "https://example.test/a-1.jpg",
              zone_id: "phong-1",
              map_x: "120.00",
              map_y: "130.00",
            },
          ],
        };
      }
      if (sql.includes("artifact.zone_id IS NULL")) {
        return {
          rows: [
            {
              slug: "chua-co-toa-do",
              title: "Hiện vật chưa có vị trí",
              image_url: "https://example.test/unplaced.jpg",
            },
          ],
        };
      }
      throw new Error(`Unexpected query: ${sql}`);
    });

    const result = await getMuseumMap("ja");

    assert.deepEqual(result.zones.map((zone) => zone.id), ["sanh"]);
    assert.deepEqual(result.artifacts, [
      {
        slug: "a-1-skyraider",
        title: "A-1スカイレイダー攻撃機",
        summary: "Máy bay cường kích.",
        image_url: "https://example.test/a-1.jpg",
        zone_id: "phong-1",
        x: 120,
        y: 130,
      },
    ]);
    assert.deepEqual(result.unplaced_artifacts, [
      {
        slug: "chua-co-toa-do",
        title: "Hiện vật chưa có vị trí",
        image_url: "https://example.test/unplaced.jpg",
      },
    ]);

    const artifactQueries = queries.filter((query) =>
      query.sql.includes("artifact.is_published = TRUE"),
    );
    assert.equal(artifactQueries.length, 2);
    assert.ok(
      artifactQueries.every((query) => query.values?.[0] === "ja"),
      "both artifact queries must use the requested language",
    );
  });
});
