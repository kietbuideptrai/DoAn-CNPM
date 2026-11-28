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

export interface MuseumZone {
  id: string;
  name: string;
  short_name: string;
  description: string;
  kind: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  sort_order: number;
}

export interface AdminArtifactMapPosition {
  zone_id: string | null;
  map_x: number | null;
  map_y: number | null;
}

export interface AdminArtifact extends AdminArtifactMapPosition {
  id: string;
  name: string;
  slug: string;
  category: string;
  image_url: string;
  is_published?: boolean;
  translations: AdminArtifactTranslation[];
}

export interface AdminArtifactListItem extends AdminArtifactMapPosition {
  id: string;
  name: string;
  slug: string;
  category: string;
  is_published: boolean;
}

export interface AdminArtifactInput extends AdminArtifactMapPosition {
  name: string;
  slug: string;
  category: string;
  image_url: string;
}

export async function getMuseumZones(): Promise<MuseumZone[]> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/museum/zones`);
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

  const payload: unknown = await response.json();
  const zones =
    typeof payload === "object" && payload !== null && "zones" in payload
      ? payload.zones
      : payload;
  if (!Array.isArray(zones)) {
    throw new ApiRequestError("Danh sách khu vực không hợp lệ.", response.status);
  }

  return zones.map((zone: unknown) => {
    if (typeof zone !== "object" || zone === null) {
      throw new ApiRequestError("Dữ liệu khu vực không hợp lệ.", null);
    }
    const item = zone as Record<string, unknown>;
    const readNumber = (value: unknown): number => {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new ApiRequestError("Dữ liệu khu vực không hợp lệ.", null);
      }
      return value;
    };
    if (
      typeof item.id !== "string" ||
      typeof item.name !== "string" ||
      typeof item.short_name !== "string" ||
      typeof item.kind !== "string" ||
      typeof item.color !== "string"
    ) {
      throw new ApiRequestError("Dữ liệu khu vực không đầy đủ.", null);
    }

    return {
      id: item.id,
      name: item.name,
      short_name: item.short_name,
      description:
        typeof item.description === "string" ? item.description : "",
      kind: item.kind,
      x: readNumber(item.x),
      y: readNumber(item.y),
      width: readNumber(item.width),
      height: readNumber(item.height),
      color: item.color,
      sort_order: readNumber(item.sort_order),
    } satisfies MuseumZone;
  });
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

    const mapX =
      typeof item.map_x === "number" ? item.map_x : Number(item.map_x);
    const mapY =
      typeof item.map_y === "number" ? item.map_y : Number(item.map_y);

    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      category: item.category,
      is_published: item.is_published,
      zone_id: typeof item.zone_id === "string" ? item.zone_id : null,
      map_x: Number.isFinite(mapX) ? mapX : null,
      map_y: Number.isFinite(mapY) ? mapY : null,
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
