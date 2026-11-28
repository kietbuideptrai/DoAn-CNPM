-- Read-only preflight report for the eight Ho Chi Minh Museum sample artifacts.
-- Run only against an explicitly confirmed non-production database.
WITH expected(slug) AS (
  VALUES
    ('a-1-skyraider'),
    ('blu-82'),
    ('chuong-cop-con-dao'),
    ('f-5a'),
    ('m48-patton'),
    ('may-chem'),
    ('phao-155mm'),
    ('uh-1-huey')
),
required_languages(language_code) AS (
  VALUES ('vi'), ('en'), ('zh'), ('ja'), ('ko')
)
SELECT
  expected.slug,
  artifacts.id IS NOT NULL AS artifact_exists,
  artifacts.is_published,
  COUNT(translations.language_code) AS translation_count,
  ARRAY_AGG(required_languages.language_code ORDER BY required_languages.language_code)
    FILTER (WHERE translations.language_code IS NULL) AS missing_languages,
  COALESCE(artifacts.image_url ILIKE '%placehold.co%', FALSE) AS development_placeholder_image
FROM expected
CROSS JOIN required_languages
LEFT JOIN artifacts ON artifacts.slug = expected.slug
LEFT JOIN artifact_translations AS translations
  ON translations.artifact_id = artifacts.id
  AND translations.language_code = required_languages.language_code
GROUP BY expected.slug, artifacts.id, artifacts.is_published, artifacts.image_url
ORDER BY expected.slug;
