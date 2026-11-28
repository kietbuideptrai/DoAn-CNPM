CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE artifact_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL CHECK (language_code IN ('vi', 'en', 'zh', 'ja', 'ko')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT artifact_translations_artifact_language_unique
    UNIQUE (artifact_id, language_code)
);

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bản đồ bảo tàng: hệ tọa độ cố định 1000 x 600.
CREATE TABLE IF NOT EXISTS museum_zones (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  short_name  TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  kind        TEXT NOT NULL DEFAULT 'gallery'
              CHECK (kind IN ('gallery', 'lobby', 'walkway', 'service')),
  x           NUMERIC(7,2) NOT NULL CHECK (x >= 0 AND x <= 1000),
  y           NUMERIC(7,2) NOT NULL CHECK (y >= 0 AND y <= 600),
  width       NUMERIC(7,2) NOT NULL CHECK (width > 0 AND width <= 1000),
  height      NUMERIC(7,2) NOT NULL CHECK (height > 0 AND height <= 600),
  color       TEXT NOT NULL DEFAULT '#EAF2EC',
  sort_order  INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS zone_id TEXT;
ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS map_x NUMERIC(7,2);
ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS map_y NUMERIC(7,2);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'artifacts_zone_id_fkey'
  ) THEN
    ALTER TABLE artifacts
      ADD CONSTRAINT artifacts_zone_id_fkey
      FOREIGN KEY (zone_id) REFERENCES museum_zones(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'artifacts_map_position_check'
  ) THEN
    ALTER TABLE artifacts
      ADD CONSTRAINT artifacts_map_position_check
      CHECK (
        (map_x IS NULL AND map_y IS NULL)
        OR (map_x BETWEEN 0 AND 1000 AND map_y BETWEEN 0 AND 600)
      );
  END IF;
END $$;
