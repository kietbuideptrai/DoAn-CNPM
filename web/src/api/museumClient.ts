import type {
  Language,
  MuseumMapArtifact,
  MuseumMapData,
  MuseumZone,
  MuseumZoneKind,
  UnplacedMapArtifact,
} from "../../../shared/types";
import { getDemoMuseumMap } from "../data/demoMap";
import { API_BASE_URL, ApiRequestError, isDemoMode } from "./client";

export const MUSEUM_MAP_PATH = "/api/museum/map";
const MUSEUM_ZONE_KINDS: MuseumZoneKind[] = [
  "gallery",
  "lobby",
  "walkway",
  "service",
];

export function getMuseumMap(
  language: Language,
  signal?: AbortSignal,
): Promise<MuseumMapData> {
  if (isDemoMode()) {
    if (signal?.aborted) {
      return Promise.reject(new DOMException("Request aborted.", "AbortError"));
    }
    return Promise.resolve(getDemoMuseumMap(language));
  }

  const params = new URLSearchParams({ lang: language });
  return requestMap(`${API_BASE_URL}${MUSEUM_MAP_PATH}?${params}`, signal).then(
    parseMuseumMap,
  );
}

async function requestMap(url: string, signal?: AbortSignal): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    throw new ApiRequestError(
      "Không thể kết nối máy chủ. Hãy kiểm tra mạng.",
      null,
    );
  }

  if (!response.ok) {
    throw new ApiRequestError(await readMapError(response), response.status);
  }

  try {
    return (await response.json()) as unknown;
  } catch {
    throw new ApiRequestError(
      "Phản hồi từ máy chủ không hợp lệ.",
      response.status,
    );
  }
}

function parseMuseumMap(response: unknown): MuseumMapData {
  if (typeof response !== "object" || response === null) {
    throw new ApiRequestError("Dữ liệu bản đồ từ máy chủ không hợp lệ.", null);
  }

  const body = response as Record<string, unknown>;
  if (!Array.isArray(body.zones) || !Array.isArray(body.artifacts)) {
    throw new ApiRequestError("Dữ liệu bản đồ từ máy chủ không đầy đủ.", null);
  }

  const zones = body.zones.map(parseZone);
  const artifacts = body.artifacts.map(parseArtifact);
  const map: MuseumMapData = { zones, artifacts };

  if (body.unplaced_artifacts !== undefined) {
    if (!Array.isArray(body.unplaced_artifacts)) {
      throw new ApiRequestError("Dữ liệu bản đồ từ máy chủ không hợp lệ.", null);
    }
    map.unplaced_artifacts = body.unplaced_artifacts.map(parseUnplacedArtifact);
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
    description:
      typeof zone.description === "string" ? zone.description : "",
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

async function readMapError(response: Response): Promise<string> {
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
    return getDefaultMapErrorMessage(response.status);
  }

  return getDefaultMapErrorMessage(response.status);
}

function getDefaultMapErrorMessage(status: number): string {
  if (status >= 500) {
    return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
  }

  return "Không thể tải bản đồ. Vui lòng thử lại.";
}
