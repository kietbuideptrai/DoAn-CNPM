-- Read-only check: published artifacts with all five required translations.
-- Run only against an explicitly confirmed non-production database.
WITH required_languages(language_code) AS (
  VALUES ('vi'), ('en'), ('zh'), ('ja'), ('ko')
),
complete_published_artifacts AS (
  SELECT artifacts.id, artifacts.slug, artifacts.image_url
  FROM artifacts
  INNER JOIN artifact_translations
    ON artifact_translations.artifact_id = artifacts.id
  WHERE artifacts.is_published = TRUE
  GROUP BY artifacts.id, artifacts.slug, artifacts.image_url
  HAVING COUNT(DISTINCT artifact_translations.language_code) = 5
)
SELECT
  required_languages.language_code,
  COUNT(complete_published_artifacts.id)::INTEGER AS complete_published_count,
  COUNT(complete_published_artifacts.id) >= 3 AS meets_minimum,
  COUNT(complete_published_artifacts.id) FILTER (
    WHERE complete_published_artifacts.image_url ILIKE '%placehold.co%'
  )::INTEGER AS placeholder_image_count
FROM required_languages
LEFT JOIN complete_published_artifacts ON TRUE
GROUP BY required_languages.language_code
ORDER BY required_languages.language_code;
