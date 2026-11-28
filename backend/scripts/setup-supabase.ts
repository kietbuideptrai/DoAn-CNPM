import "dotenv/config";
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pool } from "../src/db/pool";

const backendRoot = resolve(__dirname, "..");
const dbDirectory = join(backendRoot, "src", "db");
const resetRequested = process.argv.includes("--reset");
const seedOnly = process.argv.includes("--seed-only");

if (resetRequested && seedOnly) {
  throw new Error("Không dùng --reset cùng --seed-only");
}

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  throw new Error("Cần đặt DATABASE_URL trong backend/.env");
}

if (process.env.NODE_ENV === "production") {
  throw new Error("Không chạy setup/reset trên môi trường production");
}

const projectRef = process.env.SUPABASE_PROJECT_REF?.trim().toLowerCase();
if (!projectRef) {
  throw new Error("Cần đặt SUPABASE_PROJECT_REF để đối chiếu project Supabase");
}

const parsedUrl = new URL(databaseUrl);
const targetDescription = [
  parsedUrl.username,
  parsedUrl.hostname,
  parsedUrl.pathname,
]
  .join(" ")
  .toLowerCase();

if (!targetDescription.includes(projectRef)) {
  throw new Error("DATABASE_URL không khớp SUPABASE_PROJECT_REF đã khai báo");
}

if (!parsedUrl.hostname.toLowerCase().includes("supabase")) {
  throw new Error("DATABASE_URL không trỏ tới host Supabase pooler/project");
}

if (
  !process.env.ADMIN_JWT_SECRET?.trim() ||
  !process.env.ADMIN_EMAIL?.trim() ||
  !process.env.ADMIN_PASSWORD
) {
  throw new Error(
    "Cần ADMIN_JWT_SECRET, ADMIN_EMAIL và ADMIN_PASSWORD để seed admin",
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function redact(text: string): string {
  const password = decodeURIComponent(parsedUrl.password);
  return text
    .split(databaseUrl)
    .join("<DATABASE_URL>")
    .replace(new RegExp(escapeRegExp(password), "g"), "<redacted>");
}

function errorCode(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? ` (mã ${code})` : "";
  }
  return "";
}

function runNpmScript(script: string): void {
  const result = spawnSync("npm", ["run", script], {
    cwd: backendRoot,
    encoding: "utf8",
    env: process.env,
  });

  if (result.error) {
    throw new Error(`Không chạy được npm run ${script}: ${result.error.message}`);
  }
  if (result.stdout?.trim()) {
    console.log(redact(result.stdout.trim()));
  }
  if (result.stderr?.trim()) {
    console.error(redact(result.stderr.trim()));
  }
  if (result.status !== 0) {
    throw new Error(`npm run ${script} kết thúc với mã ${result.status ?? "unknown"}`);
  }
}

async function runSqlFile(fileName: string): Promise<void> {
  const sql = readFileSync(join(dbDirectory, fileName), "utf8");
  try {
    // Không truyền giá trị nên pg dùng simple query protocol, chạy được nhiều
    // statement trong cùng một file SQL.
    await pool.query(sql);
  } catch (error) {
    throw new Error(`Chạy SQL ${fileName} thất bại${errorCode(error)}`);
  }
  console.log(`Đã apply ${fileName}.`);
}

async function resetDemoData(): Promise<void> {
  const confirmation = process.env.CONFIRM_RESET?.trim();
  if (confirmation !== "supabase-non-production") {
    throw new Error(
      'Đặt CONFIRM_RESET="supabase-non-production" để xác nhận reset demo',
    );
  }

  console.log("Đang xóa dữ liệu demo trên project Supabase đã đối chiếu...");
  await pool.query(
    "TRUNCATE TABLE page_views, artifact_translations, artifacts, admin_users, museum_zones RESTART IDENTITY CASCADE",
  );
}

async function main(): Promise<void> {
  console.log(
    "Đối chiếu project Supabase đã cấu hình — chỉ thao tác trên project non-production.",
  );

  if (resetRequested) {
    await resetDemoData();
  }

  if (!seedOnly) {
    await runSqlFile("schema.sql");
    const migrations = readdirSync(dbDirectory)
      .filter((file) => file.startsWith("migrate-") && file.endsWith(".sql"))
      .sort();
    for (const migration of migrations) {
      await runSqlFile(migration);
    }
  }

  await runSqlFile("seed.sql");
  await runSqlFile("seed-map.sql");
  runNpmScript("seed:admin");
  runNpmScript("seed:analytics");

  const connectivity = await pool.query<{ ok: number }>("SELECT 1 AS ok");
  if (connectivity.rows[0]?.ok !== 1) {
    throw new Error("Kiểm tra kết nối Supabase không thành công");
  }
  console.log("Setup Supabase demo hoàn tất; /api/health nên trả database: ok.");
}

void main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(redact(message));
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
