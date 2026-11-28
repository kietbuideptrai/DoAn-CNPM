import { API_BASE_URL, ApiRequestError } from "./client";

export const ADMIN_UNAUTHORIZED_EVENT = "admin:unauthorized";
export const ADMIN_ARTIFACTS_PATH = "/api/admin/artifacts";
export const ADMIN_LANGUAGES = ["vi", "en", "zh", "ja", "ko"] as const;

interface AdminLoginResponse {
  token: string;
}

export interface AdminArtifactTranslation {
  language_code: (typeof ADMIN_LANGUAGES)[number];
  title: string;
  summary: string;
  content: string;
}

export interface AdminArtifact {
  id: string;
  name: string;
  slug: string;
  category: string;
  image_url: string;
  is_published?: boolean;
  translations: AdminArtifactTranslation[];
}

export interface AdminArtifactListItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  is_published: boolean;
}

export interface AdminArtifactInput {
  name: string;
  slug: string;
  category: string;
  image_url: string;
}

export const ANALYTICS_DAYS = [7, 30] as const;
export type AnalyticsDays = (typeof ANALYTICS_DAYS)[number];
export const ADMIN_ANALYTICS_SUMMARY_PATH = "/api/admin/analytics/summary";

export interface AnalyticsDailyPoint {
  date: string;
  pageviews: number;
  unique_visitors: number;
}

export interface AnalyticsTopArtifact {
  slug: string;
  title: string;
  views: number;
}

export interface AdminAnalyticsSummary {
  range: { days: number; from: string; to: string };
  totals: {
    pageviews: number;
    unique_visitors: number;
    today_pageviews: number;
    today_unique_visitors: number;
    peak_day: { date: string; pageviews: number } | null;
  };
  daily: AnalyticsDailyPoint[];
  top_artifacts: AnalyticsTopArtifact[];
}

export function getAdminAnalyticsSummary(
  days: AnalyticsDays,
  token: string,
): Promise<AdminAnalyticsSummary> {
  const params = new URLSearchParams({ days: String(days) });
  return requestAdmin<unknown>(
    `${ADMIN_ANALYTICS_SUMMARY_PATH}?${params.toString()}`,
    token,
  ).then(parseAnalyticsSummary);
}

function parseAnalyticsSummary(response: unknown): AdminAnalyticsSummary {
  if (typeof response !== "object" || response === null) {
    throw new ApiRequestError("Dữ liệu thống kê từ máy chủ không hợp lệ.", null);
  }

  const body = response as Record<string, unknown>;
  if (
    typeof body.range !== "object" ||
    body.range === null ||
    typeof body.totals !== "object" ||
    body.totals === null ||
    !Array.isArray(body.daily) ||
    !Array.isArray(body.top_artifacts)
  ) {
    throw new ApiRequestError("Dữ liệu thống kê từ máy chủ không đầy đủ.", null);
  }

  const range = body.range as Record<string, unknown>;
  const totals = body.totals as Record<string, unknown>;
  if (
    typeof range.days !== "number" ||
    typeof range.from !== "string" ||
    typeof range.to !== "string" ||
    typeof totals.pageviews !== "number" ||
    typeof totals.unique_visitors !== "number" ||
    typeof totals.today_pageviews !== "number"
  ) {
    throw new ApiRequestError("Dữ liệu thống kê từ máy chủ không đầy đủ.", null);
  }

  let peakDay: AdminAnalyticsSummary["totals"]["peak_day"] = null;
  if (totals.peak_day !== null && totals.peak_day !== undefined) {
    if (typeof totals.peak_day !== "object") {
      throw new ApiRequestError("Dữ liệu thống kê từ máy chủ không hợp lệ.", null);
    }
    const peak = totals.peak_day as Record<string, unknown>;
    if (typeof peak.date !== "string" || typeof peak.pageviews !== "number") {
      throw new ApiRequestError("Dữ liệu thống kê từ máy chủ không đầy đủ.", null);
    }
    peakDay = { date: peak.date, pageviews: peak.pageviews };
  }

  const daily = body.daily.map((item: unknown) => {
    if (typeof item !== "object" || item === null) {
      throw new ApiRequestError("Dữ liệu thống kê từ máy chủ không hợp lệ.", null);
    }
    const point = item as Record<string, unknown>;
    if (
      typeof point.date !== "string" ||
      typeof point.pageviews !== "number" ||
      typeof point.unique_visitors !== "number"
    ) {
      throw new ApiRequestError("Dữ liệu thống kê từ máy chủ không đầy đủ.", null);
    }
    return {
      date: point.date,
      pageviews: point.pageviews,
      unique_visitors: point.unique_visitors,
    };
  });

  const topArtifacts = body.top_artifacts.map((item: unknown) => {
    if (typeof item !== "object" || item === null) {
      throw new ApiRequestError("Dữ liệu thống kê từ máy chủ không hợp lệ.", null);
    }
    const artifact = item as Record<string, unknown>;
    if (
      typeof artifact.slug !== "string" ||
      typeof artifact.title !== "string" ||
      typeof artifact.views !== "number"
    ) {
      throw new ApiRequestError("Dữ liệu thống kê từ máy chủ không đầy đủ.", null);
    }
    return {
      slug: artifact.slug,
      title: artifact.title,
      views: artifact.views,
    };
  });

  return {
    range: { days: range.days, from: range.from, to: range.to },
    totals: {
      pageviews: totals.pageviews,
      unique_visitors: totals.unique_visitors,
      today_pageviews: totals.today_pageviews,
      today_unique_visitors:
        typeof totals.today_unique_visitors === "number"
          ? totals.today_unique_visitors
          : 0,
      peak_day: peakDay,
    },
    daily,
    top_artifacts: topArtifacts,
  };
}

export async function loginAdmin(
  email: string,
  password: string,
): Promise<AdminLoginResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new ApiRequestError(
      "Không thể kết nối máy chủ. Hãy kiểm tra mạng.",
      null,
    );
  }

  if (!response.ok) {
    throw new ApiRequestError(
      await readErrorMessage(response),
      response.status,
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiRequestError("Phản hồi đăng nhập không hợp lệ.", response.status);
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("token" in body) ||
    typeof body.token !== "string" ||
    body.token.trim().length === 0
  ) {
    throw new ApiRequestError("Phản hồi đăng nhập không có token hợp lệ.", response.status);
  }

  return { token: body.token };
}

export async function requestAdmin<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiRequestError(
      "Không thể kết nối máy chủ. Hãy kiểm tra mạng.",
      null,
    );
  }

  if (response.status === 401) {
    window.dispatchEvent(new Event(ADMIN_UNAUTHORIZED_EVENT));
  }

  if (!response.ok) {
    throw new ApiRequestError(
      await readErrorMessage(response),
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiRequestError(
      "Phản hồi từ máy chủ không hợp lệ.",
      response.status,
    );
  }
}

export function getAdminArtifact(
  id: string,
  token: string,
): Promise<AdminArtifact> {
  return requestAdmin<AdminArtifact>(
    `${ADMIN_ARTIFACTS_PATH}/${encodeURIComponent(id)}`,
    token,
  );
}

export async function getAdminArtifacts(
  token: string,
): Promise<AdminArtifactListItem[]> {
  const response: unknown = await requestAdmin<unknown>(
    ADMIN_ARTIFACTS_PATH,
    token,
  );
  const artifacts =
    typeof response === "object" &&
    response !== null &&
    "artifacts" in response
      ? response.artifacts
      : response;

  if (!Array.isArray(artifacts)) {
    throw new ApiRequestError("Danh sách hiện vật từ máy chủ không hợp lệ.", null);
  }

  return artifacts.map((artifact: unknown) => {
    if (typeof artifact !== "object" || artifact === null) {
      throw new ApiRequestError("Dữ liệu hiện vật từ máy chủ không hợp lệ.", null);
    }

    const item = artifact as Record<string, unknown>;
    if (
      typeof item.id !== "string" ||
      typeof item.name !== "string" ||
      typeof item.slug !== "string" ||
      typeof item.category !== "string" ||
      typeof item.is_published !== "boolean"
    ) {
      throw new ApiRequestError("Dữ liệu hiện vật từ máy chủ không đầy đủ.", null);
    }

    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      category: item.category,
      is_published: item.is_published,
    };
  });
}

export function updateAdminArtifactPublished(
  id: string,
  isPublished: boolean,
  token: string,
): Promise<void> {
  return requestAdmin<void>(
    `${ADMIN_ARTIFACTS_PATH}/${encodeURIComponent(id)}`,
    token,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: isPublished }),
    },
  );
}

export function createAdminArtifact(
  artifact: AdminArtifactInput,
  token: string,
): Promise<{ id: string }> {
  return requestAdmin<{ id: string }>(ADMIN_ARTIFACTS_PATH, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(artifact),
  });
}

export function updateAdminArtifact(
  id: string,
  artifact: AdminArtifactInput,
  token: string,
): Promise<void> {
  return requestAdmin<void>(
    `${ADMIN_ARTIFACTS_PATH}/${encodeURIComponent(id)}`,
    token,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(artifact),
    },
  );
}

export function deleteAdminArtifact(
  id: string,
  token: string,
): Promise<void> {
  return requestAdmin<void>(
    `${ADMIN_ARTIFACTS_PATH}/${encodeURIComponent(id)}`,
    token,
    { method: "DELETE" },
  );
}

export function saveAdminArtifactTranslation(
  id: string,
  translation: AdminArtifactTranslation,
  token: string,
): Promise<void> {
  return requestAdmin<void>(
    `${ADMIN_ARTIFACTS_PATH}/${encodeURIComponent(id)}/translations/${translation.language_code}`,
    token,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language_code: translation.language_code,
        title: translation.title,
        summary: translation.summary,
        content: translation.content,
      }),
    },
  );
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string"
    ) {
      return body.message;
    }
  } catch {
    return getDefaultErrorMessage(response.status);
  }

  return getDefaultErrorMessage(response.status);
}

function getDefaultErrorMessage(status: number): string {
  if (status === 401) {
    return "Email hoặc mật khẩu không chính xác.";
  }
  if (status >= 500) {
    return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
  }

  return "Không thể xử lý yêu cầu. Vui lòng thử lại.";
}
