import type {
  ApiError,
  ArtifactDetail,
  ArtifactListItem,
  Language,
  MuseumMapArtifact,
  MuseumMapData,
  MuseumZone,
  MuseumZoneKind,
  UnplacedMapArtifact,
} from "../../../shared/types";
import {
  getDemoArtifact,
  getDemoArtifacts,
} from "../../../shared/demoArtifacts";
import { getDemoMuseumMap } from "../../../shared/demoMuseumMap";

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number | null,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export function getArtifacts(
  language: Language,
  query: string,
  signal: AbortSignal,
): Promise<ArtifactListItem[]> {
  if (isDemoMode()) {
    if (signal.aborted) {
      return Promise.reject(new Error("Request aborted."));
    }

    return Promise.resolve(getDemoArtifacts(language, query));
  }

  const searchParams = new URLSearchParams({ lang: language });
  if (query.trim()) {
    searchParams.set("q", query.trim());
  }

  return request<ArtifactListItem[]>(
    `/api/artifacts?${searchParams.toString()}`,
    signal,
  );
}

export function getArtifact(
  slug: string,
  language: Language,
  signal: AbortSignal,
): Promise<ArtifactDetail> {
  if (isDemoMode()) {
    if (signal.aborted) {
      return Promise.reject(new Error("Request aborted."));
    }

    const artifact = getDemoArtifact(slug, language);
    if (!artifact) {
      return Promise.reject(new ApiRequestError("Không tìm thấy hiện vật", 404));
    }

    return Promise.resolve(artifact);
  }

  const searchParams = new URLSearchParams({ lang: language });
  return request<ArtifactDetail>(
    `/api/artifacts/${encodeURIComponent(slug)}?${searchParams.toString()}`,
    signal,
  );
}

export function getMuseumMap(
  language: Language,
  signal: AbortSignal,
): Promise<MuseumMapData> {
  if (isDemoMode()) {
    if (signal.aborted) {
      return Promise.reject(new Error("Request aborted."));
    }

    return Promise.resolve(getDemoMuseumMap(language));
  }

  const searchParams = new URLSearchParams({ lang: language });
  return request<unknown>(`/api/museum/map?${searchParams.toString()}`, signal).then(
    parseMuseumMap,
  );
}

function isDemoMode(): boolean {
  return process.env.EXPO_PUBLIC_DEMO_MODE === "true";
}

async function request<T>(path: string, signal: AbortSignal): Promise<T> {
  const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!configuredBaseUrl) {
    throw new ApiRequestError(
      "Chưa cấu hình địa chỉ API. Hãy đặt EXPO_PUBLIC_API_URL trong mobile/.env.local.",
      null,
    );
  }

  let response: Response;
  try {
    response = await fetch(
      `${configuredBaseUrl.replace(/\/+$/, "")}${path}`,
      { signal },
    );
  } catch (error) {
    if (signal.aborted) {
      throw error;
    }
    throw new ApiRequestError(
      "Không thể kết nối máy chủ. Hãy kiểm tra mạng và địa chỉ API.",
      null,
    );
  }

  if (!response.ok) {
    const apiError = await readApiError(response);
    throw new ApiRequestError(apiError.message, response.status);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiRequestError("Phản hồi từ máy chủ không hợp lệ.", response.status);
  }
}

async function readApiError(response: Response): Promise<ApiError> {
  try {
    const body: unknown = await response.json();
    if (
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string"
    ) {
      return { message: body.message };
    }
  } catch {
    return { message: getStatusMessage(response.status) };
  }

  return { message: getStatusMessage(response.status) };
}

const MUSEUM_ZONE_KINDS: MuseumZoneKind[] = [
  "gallery",
  "lobby",
  "walkway",
  "service",
];

function parseMuseumMap(response: unknown): MuseumMapData {
  if (
    typeof response !== "object" ||
    response === null ||
    !Array.isArray((response as Record<string, unknown>).zones) ||
    !Array.isArray((response as Record<string, unknown>).artifacts)
  ) {
    throw new ApiRequestError("Dữ liệu bản đồ từ máy chủ không đầy đủ.", null);
  }

  const body = response as Record<string, unknown>;
  const map: MuseumMapData = {
    zones: (body.zones as unknown[]).map(parseZone),
    artifacts: (body.artifacts as unknown[]).map(parseArtifact),
  };

  if (body.unplaced_artifacts !== undefined) {
    if (!Array.isArray(body.unplaced_artifacts)) {
      throw new ApiRequestError("Dữ liệu bản đồ từ máy chủ không hợp lệ.", null);
    }
    map.unplaced_artifacts = (body.unplaced_artifacts as unknown[]).map(
      parseUnplacedArtifact,
    );
  }

  return map;
}

function parseZone(value: unknown): MuseumZone {
  if (typeof value !== "object" || value === null) {
    throw new ApiRequestError("Dữ liệu khu vực từ máy chủ không hợp lệ.", null);
  }

  const zone = value as Record<string, unknown>;
  if (
    typeof zone.id !== "string" ||
    typeof zone.name !== "string" ||
    typeof zone.short_name !== "string" ||
    typeof zone.kind !== "string" ||
    !MUSEUM_ZONE_KINDS.includes(zone.kind as MuseumZoneKind) ||
    typeof zone.x !== "number" ||
    typeof zone.y !== "number" ||
    typeof zone.width !== "number" ||
    typeof zone.height !== "number"
  ) {
    throw new ApiRequestError("Dữ liệu khu vực từ máy chủ không đầy đủ.", null);
  }

  return {
    id: zone.id,
    name: zone.name,
    short_name: zone.short_name,
    description: typeof zone.description === "string" ? zone.description : "",
    kind: zone.kind as MuseumZoneKind,
    x: zone.x,
    y: zone.y,
    width: zone.width,
    height: zone.height,
    color: typeof zone.color === "string" ? zone.color : "#EAF2EC",
    sort_order: typeof zone.sort_order === "number" ? zone.sort_order : 0,
  };
}

function parseArtifact(value: unknown): MuseumMapArtifact {
  const artifact = parseUnplacedArtifact(value);
  const item = value as Record<string, unknown>;
  if (
    typeof item.zone_id !== "string" ||
    typeof item.x !== "number" ||
    typeof item.y !== "number"
  ) {
    throw new ApiRequestError(
      "Dữ liệu vị trí hiện vật từ máy chủ không đầy đủ.",
      null,
    );
  }

  return {
    ...artifact,
    zone_id: item.zone_id,
    x: item.x,
    y: item.y,
  };
}

function parseUnplacedArtifact(value: unknown): UnplacedMapArtifact {
  if (typeof value !== "object" || value === null) {
    throw new ApiRequestError(
      "Dữ liệu hiện vật từ máy chủ không hợp lệ.",
      null,
    );
  }

  const artifact = value as Record<string, unknown>;
  if (
    typeof artifact.slug !== "string" ||
    typeof artifact.title !== "string" ||
    typeof artifact.image_url !== "string"
  ) {
    throw new ApiRequestError("Dữ liệu hiện vật từ máy chủ không đầy đủ.", null);
  }

  return {
    slug: artifact.slug,
    title: artifact.title,
    summary: typeof artifact.summary === "string" ? artifact.summary : "",
    image_url: artifact.image_url,
  };
}

function getStatusMessage(status: number): string {
  return status === 404
    ? "Không tìm thấy dữ liệu. Vui lòng thử lại."
    : "Không thể tải dữ liệu. Vui lòng thử lại.";
}
