-- Existing local databases were created before the admin hard-delete flow.
-- Recreate the translation foreign key so deleting an artifact removes its
-- translations instead of failing with a 23503 violation.
ALTER TABLE artifact_translations
  DROP CONSTRAINT IF EXISTS artifact_translations_artifact_id_fkey;

ALTER TABLE artifact_translations
  ADD CONSTRAINT artifact_translations_artifact_id_fkey
  FOREIGN KEY (artifact_id) REFERENCES artifacts(id) ON DELETE CASCADE;
