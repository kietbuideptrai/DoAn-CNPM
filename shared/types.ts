export type Language = "vi" | "en" | "zh" | "ja" | "ko";

export interface ArtifactListItem {
  slug: string;
  image_url: string;
  title: string;
  summary: string;
}

export interface Translation {
  language_code: Language;
  title: string;
  summary: string;
  content: string;
}

export interface ArtifactDetail {
  slug: string;
  image_url: string;
  translation: Translation | null;
  available_languages: Language[];
}

export interface ApiError {
  message: string;
}

export type MuseumZoneKind = "gallery" | "lobby" | "walkway" | "service";

export interface MuseumZone {
  id: string;
  name: string;
  short_name: string;
  description: string;
  kind: MuseumZoneKind;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  sort_order: number;
}

export interface MuseumMapArtifact {
  slug: string;
  title: string;
  summary: string;
  image_url: string;
  zone_id: string;
  x: number;
  y: number;
}

export interface UnplacedMapArtifact {
  slug: string;
  title: string;
  summary: string;
  image_url: string;
}

export interface MuseumMapData {
  zones: MuseumZone[];
  artifacts: MuseumMapArtifact[];
  unplaced_artifacts?: UnplacedMapArtifact[];
}
