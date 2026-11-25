import type { Language } from "./artifacts.service";

export interface ArtifactListQuery {
  text: string;
  values: string[];
}

export function buildArtifactListQuery(
  language: Language,
  query?: string,
): ArtifactListQuery {
  const searchTerm = query?.trim();
  const searchCondition = searchTerm
    ? `AND (
        POSITION(LOWER($2) IN LOWER(artifacts.name)) > 0
        OR EXISTS (
          SELECT 1
          FROM artifact_translations AS english_translation
          WHERE english_translation.artifact_id = artifacts.id
            AND english_translation.language_code = 'en'
            AND POSITION(LOWER($2) IN LOWER(english_translation.title)) > 0
        )
      )`
    : "";
  const values = searchTerm ? [language, searchTerm] : [language];

  return {
    text: `SELECT
       artifacts.slug,
       artifacts.image_url,
       translations.title,
       translations.summary
     FROM artifacts
     INNER JOIN artifact_translations AS translations
       ON translations.artifact_id = artifacts.id
       AND translations.language_code = $1
     WHERE artifacts.is_published = TRUE
       ${searchCondition}
     ORDER BY translations.title ASC`,
    values,
  };
}
