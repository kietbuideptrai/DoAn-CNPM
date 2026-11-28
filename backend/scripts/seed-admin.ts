import "dotenv/config";
import { pool } from "../src/db/pool";
import { hashAdminPassword } from "../src/services/admin-auth";

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Cần đặt ADMIN_EMAIL và ADMIN_PASSWORD trước khi seed admin");
  }

  await pool.query(
    `INSERT INTO admin_users (email, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (email) DO NOTHING`,
    [email, hashAdminPassword(password)],
  );

  console.log(`Đã seed tài khoản admin ${email} nếu chưa tồn tại.`);
  await pool.end();
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
