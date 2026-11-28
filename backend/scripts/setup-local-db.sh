#!/usr/bin/env bash
# Dựng PostgreSQL local cho đồ án, tạo schema và nạp 8 hiện vật bảo tàng.
# Yêu cầu: podman. Chạy lại nhiều lần vẫn an toàn (không ghi đè dữ liệu đã có).
set -euo pipefail

CONTAINER="${CONTAINER:-studyhub-postgres}"
VOLUME="${VOLUME:-studyhub-pgdata}"
DB_NAME="${DB_NAME:-studyhub}"
DB_PASSWORD="${DB_PASSWORD:-studyhub_dev}"
DB_PORT="${DB_PORT:-5432}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v podman >/dev/null 2>&1; then
  echo "Không tìm thấy podman. Cài podman hoặc dùng PostgreSQL/Supabase có sẵn." >&2
  exit 1
fi

if podman container exists "$CONTAINER"; then
  podman start "$CONTAINER" >/dev/null
else
  podman run -d \
    --name "$CONTAINER" \
    --restart unless-stopped \
    -e "POSTGRES_PASSWORD=${DB_PASSWORD}" \
    -e "POSTGRES_DB=${DB_NAME}" \
    -p "127.0.0.1:${DB_PORT}:5432" \
    -v "${VOLUME}:/var/lib/postgresql/data" \
    docker.io/library/postgres:16-alpine >/dev/null
fi

for _ in $(seq 1 30); do
  if podman exec "$CONTAINER" pg_isready -U postgres -d "$DB_NAME" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

psql_run() {
  podman exec -i "$CONTAINER" psql -U postgres -d "$DB_NAME" -v ON_ERROR_STOP=1 "$@"
}

if [ -z "$(psql_run -tAc "SELECT to_regclass('public.artifacts')")" ]; then
  psql_run < "${ROOT}/src/db/schema.sql"
  echo "Đã tạo schema."
else
  echo "Schema đã tồn tại, bỏ qua."
fi

psql_run < "${ROOT}/src/db/seed.sql" >/dev/null
echo "Đã nạp seed (chỉ thêm bản ghi còn thiếu)."

psql_run < "${ROOT}/src/db/migrate-2026-11-28-admin-cascade.sql" >/dev/null
echo "Đã áp dụng migration khóa ngoại xóa hiện vật."

psql_run < "${ROOT}/src/db/migrate-2026-11-28-map.sql" >/dev/null
psql_run < "${ROOT}/src/db/seed-map.sql" >/dev/null
echo "Đã áp dụng migration và seed bản đồ."

# Xuất bản 8 hiện vật bảo tàng để API/web/mobile đọc được.
psql_run >/dev/null <<'SQL'
UPDATE artifacts
SET is_published = TRUE, updated_at = NOW()
WHERE slug IN (
  'dong-hai-dong-1946',
  'me-con-ngay-gap-mat',
  'tap-tho-trong-tuyen',
  'bao-linh-kach-menh-so-2',
  'bo-do-an-chu-tich-ho-chi-minh',
  'tui-dung-com-nuoc-ho-chi-minh',
  'doi-guoc-go-ho-chi-minh',
  'tranh-co-dong-cach-mang-thang-tam'
);
SQL

psql_run -c "
SELECT
  COUNT(*) AS artifacts,
  COUNT(*) FILTER (WHERE is_published) AS published,
  (SELECT COUNT(*) FROM artifact_translations) AS translations
FROM artifacts;"

echo
echo "Thêm dòng sau vào backend/.env:"
echo "DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@127.0.0.1:${DB_PORT}/${DB_NAME}"
