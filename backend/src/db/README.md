# Database: schema, seed và kiểm tra

Database chuẩn của dự án là **Supabase PostgreSQL non-production**. Backend kết
nối qua `DATABASE_URL` (pooler, TLS). Không dán connection string, project ref,
anon key hay mật khẩu vào chat, log, ảnh chụp hoặc commit. Podman local chỉ là
phương án dự phòng.

## Supabase (chuẩn)

1. Xác nhận project là **non-production** và đối chiếu project ref/host pooler
   với project đã duyệt. Nếu không khớp, dừng lại.
2. Điền `DATABASE_URL` từ secret store vào `backend/.env`; giữ TLS
   (`sslmode=require`). Không dùng `SUPABASE_ANON_KEY` cho backend/admin.
3. Trên database trống, chạy `schema.sql`. Với database đã có dữ liệu, chạy các
   migration theo thứ tự do issue #8/#16 quy định, ví dụ:

   ```bash
   psql "$DATABASE_URL" -f backend/src/db/schema.sql
   psql "$DATABASE_URL" -f backend/src/db/migrate-2026-11-28-admin-cascade.sql
   psql "$DATABASE_URL" -f backend/src/db/migrate-2026-11-28-map.sql
   ```

4. Chạy seed hiện vật/bản dịch và seed khu/vị trí bằng `seed.sql`,
   `seed-map.sql`. `seed.sql` chỉ thêm bản ghi còn thiếu; không ghi đè tên, ảnh,
   trạng thái xuất bản hay bản dịch đã có. `seed-map.sql` đồng bộ lại 7 khu seed
   theo `shared/demoMap.ts` và chỉ gán vị trí cho hiện vật chưa có tọa độ.
5. Chạy `npm run seed:admin` và `npm run seed:analytics` (khi sẵn sàng) từ
   `backend/`, với credentials lấy từ secret store.
6. Kiểm tra bằng các file `verify-*.sql` (chỉ đọc) và gọi `/api/health`,
   `/api/languages`, `/api/artifacts?lang=vi`, `/api/museum/map`.

Không chạy schema/migration/seed trên database production hoặc project chưa được
xác nhận. Có thể dùng `npm run setup:supabase` (`--seed-only` nếu đã có schema)
thay cho việc gọi từng lệnh `psql`; script tự đối chiếu project ref/host và chạy
theo thứ tự schema → migration → seed → admin → analytics.

## Local dự phòng (Podman)

```bash
bash backend/scripts/setup-local-db.sh
```

Script dựng container `studyhub-postgres`, tạo schema nếu chưa có, nạp `seed.sql`
(chỉ thêm bản ghi còn thiếu), áp dụng migration khóa ngoại xóa hiện vật và xuất
bản 8 hiện vật bảo tàng. Script này có thể cần cập nhật slug/seed theo bộ dữ liệu
mới (issue #16); không coi kết quả local là dữ liệu nghiệm thu.

## Tài khoản quản trị

Admin web dùng `POST /api/admin/auth/login` và gửi token ở header
`Authorization: Bearer <token>` cho các API `/api/admin/*`. Thiết lập các biến
sau trong `backend/.env` (không commit giá trị thật):

```bash
ADMIN_JWT_SECRET=<chuỗi ngẫu nhiên dài>
ADMIN_EMAIL=admin@disan.local
ADMIN_PASSWORD=<mật khẩu demo>
cd backend && npm run seed:admin
```

`seed:admin` chỉ tạo tài khoản nếu email chưa tồn tại, không ghi đè mật khẩu cũ.
Token có hạn 8 giờ; web tự điều hướng về `/admin/login` khi nhận 401.

## Kiểm tra seed

Dùng các file `verify-seed.sql`, `verify-demo-readiness.sql`,
`verify-demo-seed.sql` (chỉ đọc) và gọi `/api/health`, `/api/languages`,
`/api/artifacts?lang=vi|en|zh|ja|ko`, `/api/museum/map`. Xuất bản riêng từng
slug đã duyệt; không xuất bản hàng loạt dữ liệu chưa rà soát.

## Kiểm tra nhanh

```sql
SELECT COUNT(*) AS artifacts, COUNT(*) FILTER (WHERE is_published) AS published
FROM artifacts;

SELECT language_code, COUNT(*)
FROM artifact_translations
GROUP BY language_code
ORDER BY language_code;

SELECT COUNT(*) AS zones FROM museum_zones;
SELECT COUNT(*) AS placed_artifacts
FROM artifacts WHERE zone_id IS NOT NULL AND map_x IS NOT NULL;
```

Bộ dữ liệu mục tiêu: 8 hiện vật đã xuất bản, 40 bản dịch (8 × 5 ngôn ngữ),
7 khu vực và 8 hiện vật có tọa độ. Với analytics, kiểm tra bảng `page_views` tồn
tại và có dữ liệu 30 ngày trước khi demo biểu đồ.

Nội dung và nguồn ảnh: [`CONTENT-REVIEW.md`](./CONTENT-REVIEW.md) và
[`image-sources.json`](./image-sources.json).
