import { pool } from "../db/pool";
import type { Language } from "./artifacts.service";

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

export interface MuseumMapArtifact {
  slug: string;
  title: string;
  summary: string;
  image_url: string;
  zone_id: string;
  x: number;
  y: number;
}

export interface UnplacedArtifact {
  slug: string;
  title: string;
  image_url: string;
}

export interface MuseumMapResponse {
  zones: MuseumZone[];
  artifacts: MuseumMapArtifact[];
  unplaced_artifacts: UnplacedArtifact[];
}

interface ZoneRow extends Omit<MuseumZone, "x" | "y" | "width" | "height"> {
  x: string | number;
  y: string | number;
  width: string | number;
  height: string | number;
}

interface PlacedRow {
  slug: string;
  title: string;
  summary: string;
  image_url: string;
  zone_id: string;
  map_x: string | number;
  map_y: string | number;
}

interface UnplacedRow {
  slug: string;
  title: string;
  image_url: string;
}

function toZone(row: ZoneRow): MuseumZone {
  return {
    ...row,
    x: Number(row.x),
    y: Number(row.y),
    width: Number(row.width),
    height: Number(row.height),
  };
}

function toPlacedArtifact(row: PlacedRow): MuseumMapArtifact {
  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    image_url: row.image_url,
    zone_id: row.zone_id,
    x: Number(row.map_x),
    y: Number(row.map_y),
  };
}

const TRANSLATION_JOIN = `
  FROM artifacts AS artifact
  LEFT JOIN artifact_translations AS requested
    ON requested.artifact_id = artifact.id AND requested.language_code = $1
  LEFT JOIN artifact_translations AS vietnamese
    ON vietnamese.artifact_id = artifact.id AND vietnamese.language_code = 'vi'
  WHERE artifact.is_published = TRUE`;

export async function getMuseumZones(): Promise<MuseumZone[]> {
  const result = await pool.query<ZoneRow>(
    `SELECT id, name, short_name, description, kind, x, y, width, height, color, sort_order
     FROM museum_zones
     ORDER BY sort_order, id`,
  );

  return result.rows.map(toZone);
}

export async function getMuseumMap(
  language: Language,
): Promise<MuseumMapResponse> {
  const [zones, placed, unplaced] = await Promise.all([
    getMuseumZones(),
    pool.query<PlacedRow>(
      `SELECT artifact.slug,
         COALESCE(requested.title, vietnamese.title) AS title,
         COALESCE(requested.summary, vietnamese.summary) AS summary,
         artifact.image_url, artifact.zone_id, artifact.map_x, artifact.map_y
       ${TRANSLATION_JOIN}
         AND artifact.zone_id IS NOT NULL
         AND artifact.map_x IS NOT NULL
         AND artifact.map_y IS NOT NULL
       ORDER BY artifact.zone_id, artifact.map_y, artifact.map_x`,
      [language],
    ),
    pool.query<UnplacedRow>(
      `SELECT artifact.slug,
         COALESCE(requested.title, vietnamese.title) AS title,
         artifact.image_url
       ${TRANSLATION_JOIN}
         AND (artifact.zone_id IS NULL OR artifact.map_x IS NULL OR artifact.map_y IS NULL)
       ORDER BY artifact.slug`,
      [language],
    ),
  ]);

  return {
    zones: zones,
    artifacts: placed.rows.map(toPlacedArtifact),
    unplaced_artifacts: unplaced.rows,
  };
}
