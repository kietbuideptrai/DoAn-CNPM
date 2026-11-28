import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { HttpError } from "../middleware/errors";

export const ADMIN_TOKEN_TTL_SECONDS = 8 * 60 * 60;

export interface AdminTokenPayload {
  sub: string;
  email: string;
}

function getJwtSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET?.trim();
  if (!secret) {
    throw new HttpError(500, "Chưa cấu hình khóa bảo mật quản trị.");
  }

  return secret;
}

export function hashAdminPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyAdminPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signAdminToken(admin: AdminTokenPayload): string {
  return jwt.sign({ email: admin.email }, getJwtSecret(), {
    algorithm: "HS256",
    subject: admin.sub,
    expiresIn: ADMIN_TOKEN_TTL_SECONDS,
  });
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  let payload: unknown;
  try {
    payload = jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] });
  } catch {
    throw new HttpError(401, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
  }

  if (typeof payload !== "object" || payload === null) {
    throw new HttpError(401, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
  }

  const claims = payload as Record<string, unknown>;
  if (typeof claims.sub !== "string" || typeof claims.email !== "string") {
    throw new HttpError(401, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
  }

  return { sub: claims.sub, email: claims.email };
}
