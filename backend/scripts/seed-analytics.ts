import "dotenv/config";
import { pool } from "../src/db/pool";

const VISITOR_COUNT = 120;
const DAY_COUNT = 30;
const PRNG_SEED = 0x20261128;
const BATCH_SIZE = 200;
const FORCE_ENV_FLAG = "ALLOW_ANALYTICS_FORCE";
const ARTIFACT_SLUGS = [
  "a-1-skyraider",
  "blu-82",
  "chuong-cop-con-dao",
  "f-5a",
  "m48-patton",
  "may-chem",
  "phao-155mm",
  "uh-1-huey",
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Ho_Chi_Minh",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

class SeedGuardError extends Error {}

interface PageViewRow {
  visitor_id: string;
  path: string;
  artifact_slug: string | null;
  viewed_at: string;
}

async function main(): Promise<void> {
  const force = process.argv.includes("--force");
  if (force) {
    assertForceAllowed();
  }

  try {
    const existing = await pool.query<{ total: string }>(
      "SELECT COUNT(*)::bigint::text AS total FROM page_views",
    );
    const existingCount = Number(existing.rows[0]?.total ?? 0);
    if (existingCount > 0 && !force) {
      console.log(
        `Bảng page_views đã có ${existingCount} hàng; bỏ qua seed. Dùng --force trên Supabase non-production nếu muốn ghi thêm.`,
      );
      return;
    }

    const random = createRandom(PRNG_SEED);
    const visitors = Array.from({ length: VISITOR_COUNT }, () => makeUuid(random));
    const rows = buildPageViews(random, visitors);

    for (let offset = 0; offset < rows.length; offset += BATCH_SIZE) {
      await insertBatch(rows.slice(offset, offset + BATCH_SIZE));
    }

    console.log(
      `Đã thêm ${rows.length} lượt xem trong ${DAY_COUNT} ngày vào page_views.` +
        (force && existingCount > 0
          ? ` Giữ lại ${existingCount} hàng có sẵn.`
          : ""),
    );
  } finally {
    await pool.end();
  }
}

function buildPageViews(
  random: () => number,
  visitors: string[],
): PageViewRow[] {
  const rows: PageViewRow[] = [];
  const dates: string[] = [];
  let cursor = getZonedDate(new Date());
  for (let index = 0; index < DAY_COUNT; index += 1) {
    dates.push(cursor);
    cursor = previousDate(cursor);
  }
  dates.reverse();

  for (const date of dates) {
    const viewCount = 20 + Math.floor(random() * 61); // 20–80
    // Never ask for more distinct visitors than there are views that day.
    const uniqueCount = Math.min(viewCount, 10 + Math.floor(random() * 31)); // 10–40
    let visitorOrder = shuffle(visitors.slice(0, uniqueCount), random);

    for (let index = 0; index < viewCount; index += 1) {
      if (index > 0 && index % uniqueCount === 0) {
        visitorOrder = shuffle(visitors.slice(0, uniqueCount), random);
      }

      const roll = random();
      let path = "/";
      let artifactSlug: string | null = null;
      if (roll < 0.35) {
        path = "/";
      } else if (roll < 0.5) {
        path = "/artifacts";
      } else if (roll < 0.9) {
        artifactSlug = ARTIFACT_SLUGS[Math.floor(random() * ARTIFACT_SLUGS.length)];
        path = `/artifacts/${artifactSlug}`;
      } else {
        path = "/map";
      }

      rows.push({
        visitor_id: visitorOrder[index % uniqueCount],
        path,
        artifact_slug: artifactSlug,
        viewed_at: makeViewedAt(date, random),
      });
    }
  }

  return rows;
}

async function insertBatch(rows: PageViewRow[]): Promise<void> {
  const values: unknown[] = [];
  const tuples = rows
    .map((row, index) => {
      const base = index * 4;
      values.push(row.visitor_id, row.path, row.artifact_slug, row.viewed_at);
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
    })
    .join(", ");

  await pool.query(
    `INSERT INTO page_views (visitor_id, path, artifact_slug, viewed_at)
     VALUES ${tuples}`,
    values,
  );
}

function assertForceAllowed(): void {
  const explicitOptIn = process.env[FORCE_ENV_FLAG] === "1";
  const databaseUrl = process.env.DATABASE_URL;
  let host = "";
  if (databaseUrl) {
    try {
      host = new URL(databaseUrl).hostname.toLowerCase();
    } catch {
      host = "";
    }
  }

  if (!explicitOptIn && !host.includes("supabase")) {
    throw new SeedGuardError(
      `Từ chối --force: chỉ ghi đè dữ liệu thống kê trên project Supabase non-production. ` +
        `Đặt ${FORCE_ENV_FLAG}=1 nếu bạn đã xác nhận project.`,
    );
  }
}

// mulberry32: deterministic, no Math.random.
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 0x100000000;
  };
}

function makeUuid(random: () => number): string {
  const bytes = Array.from({ length: 16 }, () => Math.floor(random() * 256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function getZonedDate(value: Date): string {
  const parts = dateFormatter.formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((entry) => entry.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function previousDate(date: string): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() - 1);
  return value.toISOString().slice(0, 10);
}

function makeViewedAt(date: string, random: () => number): string {
  const hour = String(Math.floor(random() * 24)).padStart(2, "0");
  const minute = String(Math.floor(random() * 60)).padStart(2, "0");
  const second = String(Math.floor(random() * 60)).padStart(2, "0");
  // Asia/Ho_Chi_Minh is UTC+7 year-round, so this offset is unambiguous.
  return new Date(`${date}T${hour}:${minute}:${second}+07:00`).toISOString();
}

void main().catch((error: unknown) => {
  // Never print a raw database error: it can contain connection details.
  console.error(
    error instanceof SeedGuardError ? error.message : "Seed analytics thất bại.",
  );
  process.exitCode = 1;
});
