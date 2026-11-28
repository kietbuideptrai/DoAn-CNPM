import { pool } from "../db/pool";
import { HttpError } from "../middleware/errors";
import type {
  AdminArtifactFields,
  AdminArtifactPatch,
  AdminLanguage,
  AdminTranslationFields,
} from "./admin-artifacts.validation";

export interface AdminArtifactListItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  is_published: boolean;
  zone_id: string | null;
  map_x: number | null;
  map_y: number | null;
}

function toCoordinate(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  return Number(value);
}

export interface AdminArtifactDetail extends AdminArtifactListItem {
  image_url: string;
  translations: Array<{
    language_code: AdminLanguage;
    title: string;
    summary: string;
    content: string;
  }>;
}

interface AdminArtifactRow extends Omit<AdminArtifactDetail, "translations" | "map_x" | "map_y"> {
  translations: AdminArtifactDetail["translations"] | null;
  map_x: unknown;
  map_y: unknown;
}

interface AdminArtifactListRow extends Omit<AdminArtifactListItem, "map_x" | "map_y"> {
  map_x: unknown;
  map_y: unknown;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requireArtifactId(id: string): void {
  if (!UUID_PATTERN.test(id)) {
    throw new HttpError(404, "Không tìm thấy hiện vật");
  }
}

function hasErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

function isDuplicateSlugError(error: unknown): boolean {
  return hasErrorCode(error, "23505");
}

function isInvalidZoneError(error: unknown): boolean {
  return hasErrorCode(error, "23503");
}

export async function listAdminArtifacts(): Promise<AdminArtifactListItem[]> {
  const result = await pool.query<AdminArtifactListRow>(
    `SELECT id, name, slug, category, is_published, zone_id, map_x, map_y
     FROM artifacts
     ORDER BY name, slug`,
  );

  return result.rows.map((artifact) => ({
    ...artifact,
    map_x: toCoordinate(artifact.map_x),
    map_y: toCoordinate(artifact.map_y),
  }));
}

export async function getAdminArtifact(
  id: string,
): Promise<AdminArtifactDetail | undefined> {
  requireArtifactId(id);
  const result = await pool.query<AdminArtifactRow>(
    `SELECT
       artifact.id,
       artifact.name,
       artifact.slug,
       artifact.category,
       artifact.image_url,
       artifact.is_published,
       artifact.zone_id,
       artifact.map_x,
       artifact.map_y,
       COALESCE(
         json_agg(
           json_build_object(
             'language_code', translation.language_code,
             'title', translation.title,
             'summary', translation.summary,
             'content', translation.content
           )
           ORDER BY translation.language_code
         ) FILTER (WHERE translation.id IS NOT NULL),
         '[]'::json
       ) AS translations
     FROM artifacts AS artifact
     LEFT JOIN artifact_translations AS translation
       ON translation.artifact_id = artifact.id
     WHERE artifact.id = $1
     GROUP BY artifact.id`,
    [id],
  );

  const artifact = result.rows[0];
  if (!artifact) {
    return undefined;
  }

  return {
    ...artifact,
    translations: artifact.translations ?? [],
    map_x: toCoordinate(artifact.map_x),
    map_y: toCoordinate(artifact.map_y),
  };
}

export async function createAdminArtifact(
  fields: AdminArtifactFields,
): Promise<{ id: string }> {
  try {
    const result = await pool.query<{ id: string }>(
      `INSERT INTO artifacts (name, slug, category, image_url, zone_id, map_x, map_y)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        fields.name,
        fields.slug,
        fields.category,
        fields.image_url,
        fields.zone_id,
        fields.map_x,
        fields.map_y,
      ],
    );
    return { id: result.rows[0].id };
  } catch (error) {
    if (isDuplicateSlugError(error)) {
      throw new HttpError(409, "Slug đã tồn tại. Hãy chọn slug khác.");
    }
    if (isInvalidZoneError(error)) {
      throw new HttpError(400, "Khu vực bản đồ không hợp lệ");
    }
    throw error;
  }
}

export async function updateAdminArtifact(
  id: string,
  patch: AdminArtifactPatch,
): Promise<void> {
  requireArtifactId(id);
  const columns = [
    "name",
    "slug",
    "category",
    "image_url",
    "is_published",
    "zone_id",
    "map_x",
    "map_y",
  ] as const;
  const updatedColumns = columns.filter(
    (column) => patch[column] !== undefined,
  );
  if (updatedColumns.length === 0) {
    throw new HttpError(400, "Không có trường nào để cập nhật");
  }

  const values: unknown[] = updatedColumns.map((column) => patch[column]);
  const assignments = updatedColumns.map(
    (column, index) => `${column} = $${index + 1}`,
  );
  values.push(id);

  try {
    const result = await pool.query(
      `UPDATE artifacts
       SET ${assignments.join(", ")}, updated_at = NOW()
       WHERE id = $${values.length}`,
      values,
    );
    if (result.rowCount === 0) {
      throw new HttpError(404, "Không tìm thấy hiện vật");
    }
  } catch (error) {
    if (isDuplicateSlugError(error)) {
      throw new HttpError(409, "Slug đã tồn tại. Hãy chọn slug khác.");
    }
    if (isInvalidZoneError(error)) {
      throw new HttpError(400, "Khu vực bản đồ không hợp lệ");
    }
    throw error;
  }
}

export async function deleteAdminArtifact(id: string): Promise<void> {
  requireArtifactId(id);
  const result = await pool.query("DELETE FROM artifacts WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    throw new HttpError(404, "Không tìm thấy hiện vật");
  }
}

export async function saveAdminArtifactTranslation(
  id: string,
  language: AdminLanguage,
  fields: AdminTranslationFields,
): Promise<void> {
  requireArtifactId(id);
  const artifact = await pool.query<{ id: string }>(
    "SELECT id FROM artifacts WHERE id = $1",
    [id],
  );
  if (artifact.rowCount === 0) {
    throw new HttpError(404, "Không tìm thấy hiện vật");
  }

  await pool.query(
    `INSERT INTO artifact_translations
       (artifact_id, language_code, title, summary, content)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (artifact_id, language_code) DO UPDATE
     SET title = EXCLUDED.title,
         summary = EXCLUDED.summary,
         content = EXCLUDED.content,
         updated_at = NOW()`,
    [id, language, fields.title, fields.summary, fields.content],
  );
}
