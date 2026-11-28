import { HttpError } from "../middleware/errors";

export const ANALYTICS_DAYS = [7, 30] as const;
export type AnalyticsDays = (typeof ANALYTICS_DAYS)[number];

export interface PageViewInput {
  visitor_id: string;
  path: string;
  artifact_slug: string | null;
}

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const ARTIFACT_PATH_PATTERN =
  /^\/artifacts\/([a-z0-9]+(?:-[a-z0-9]+)*)$/u;
const MAX_PATH_LENGTH = 300;

export function parsePageViewInput(body: unknown): PageViewInput {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError(400, "Dữ liệu lượt xem không hợp lệ");
  }

  const record = body as Record<string, unknown>;
  const visitorId = record.visitor_id;
  if (typeof visitorId !== "string" || !UUID_V4_PATTERN.test(visitorId)) {
    throw new HttpError(400, "Định danh khách không hợp lệ");
  }

  const path = record.path;
  if (
    typeof path !== "string" ||
    path.length === 0 ||
    path.length > MAX_PATH_LENGTH ||
    !path.startsWith("/")
  ) {
    throw new HttpError(400, "Đường dẫn không hợp lệ");
  }

  const pathname = normalizePathname(path);
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    throw new HttpError(400, "Không ghi nhận lượt xem trang quản trị");
  }

  return {
    visitor_id: visitorId,
    path,
    artifact_slug: ARTIFACT_PATH_PATTERN.exec(pathname)?.[1] ?? null,
  };
}

export function parseAnalyticsDays(value: unknown): AnalyticsDays {
  if (value === "7" || value === 7) {
    return 7;
  }
  if (value === "30" || value === 30) {
    return 30;
  }

  throw new HttpError(400, "Khoảng thời gian thống kê không hợp lệ");
}

function normalizePathname(path: string): string {
  const withoutQuery = path.split(/[?#]/u, 1)[0] ?? "";
  const withoutTrailingSlash = withoutQuery.replace(/\/+$/u, "");
  return (withoutTrailingSlash || "/").toLowerCase();
}
