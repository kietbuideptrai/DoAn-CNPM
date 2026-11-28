# P4/P7 — Chốt backend Supabase (2026-11-28)

## Phạm vi

Kiểm chứng lô issue backend **#8–#16** sau khi chuyển database chuẩn sang
Supabase PostgreSQL non-production. Mã được gộp trên nhánh
`kietbuideptrai/backend-supabase` (dựa trên `kietbuideptrai/issue23` đã gộp các
nhánh web phụ thuộc).

Môi trường: Node v22.23.1, npm 10.9.8.

## Lệnh đã chạy

| Lệnh | Kết quả |
| --- | --- |
| `cd backend && npm test` | Đạt — 45 test / 14 suite, 0 lỗi |
| `cd backend && npm run build` | Đạt — `tsc` không lỗi |
| `cd web && npm test` | Đạt — 92 test / 16 file, 0 lỗi |
| `cd web && npm run build` | Đạt — Vite build thành công |

## Độ phủ theo issue

| Issue | Nội dung | Bằng chứng |
| --- | --- | --- |
| #8 | Schema/migration/seed admin | `analytics-schema.test.ts`, `seed.test.ts`; migration `admin-cascade`, `map`, `analytics` |
| #9 | Auth JWT | `admin-auth.test.ts` |
| #10 | CRUD hiện vật/bản dịch | `admin-artifacts.validation.test.ts` + web `adminClient.test.ts` |
| #11 | API bản đồ công khai | `museum-map.service.test.ts`, `seed-map.test.ts` |
| #12 | Analytics API | `analytics.validation.test.ts`, `analytics.service.test.ts` |
| #13 | Test/tài liệu API | `docs/api-samples.json`, `docs/api-samples.md`, báo cáo P4-06 |
| #14 | Seed 30 ngày | `seed-analytics.ts`; guard `--force`, deterministic PRNG |
| #15 | Seed khu/vị trí | `seed-map.test.ts`; khớp `shared/demoMap.ts` |
| #16 | Setup/reset Supabase | `setup-supabase.test.ts`; đối chiếu project, thứ tự seed, xác nhận reset |

## Kiểm tra an toàn dữ liệu

- `.env.example` chỉ giữ biến trống; không có connection string, project ref,
  anon key hay mật khẩu thật trong repo.
- `setup:supabase` từ chối nếu `DATABASE_URL` không khớp
  `SUPABASE_PROJECT_REF`, host không phải Supabase hoặc `NODE_ENV=production`.
- Reset chỉ chạy với `--reset` kèm `CONFIRM_RESET=supabase-non-production`;
  không chạy tự động trong test.
- `seed:analytics` chỉ seed khi bảng trống; `--force` cần xác nhận project.
- Output lỗi của script setup/seed được lọc để không lộ connection string/mật
  khẩu.

## Integration trên Supabase (đã chạy)

Sau khi được cấp quyền ghi, đã chạy `npm run setup:supabase` trên project
Supabase non-production đã cấu hình trong `backend/.env` (pooler + TLS). Script
tự đối chiếu project ref/host; không in connection string, project ref hay mật
khẩu ra log. Không chạy `--reset`.

| Hạng mục | Kết quả |
| --- | --- |
| `npm run setup:supabase` | Đạt — schema + 3 migration + seed + admin + analytics |
| Số lượng trong DB | 8 hiện vật, 40 bản dịch, 7 khu, 8 hiện vật có tọa độ, 1 admin, 1.484 lượt xem seed |
| `GET /api/health` | 200, `database: ok` |
| `GET /api/museum/zones` | 200, 7 khu |
| `GET /api/museum/map?lang=vi` | 200, 8 hiện vật đã đặt, 0 chưa đặt |
| `POST /api/admin/auth/login` | 200, có token; không in token/email/mật khẩu |
| `GET /api/admin/analytics/summary?days=7` | 200, đủ 7 ngày, top 5, `peak_day` |
| `GET /api/admin/analytics/summary?days=30` | 200, đủ 30 ngày, 1.485 lượt xem sau 1 request pageview thử nghiệm |
| `GET /api/admin/analytics/summary` không token | 401 |
| `POST /api/analytics/pageview` hợp lệ | 204 |
| `days=14`, UUID sai, path `/admin/...` | 400 cho cả ba |
| Ràng buộc DB | Đủ 3 constraint; index `page_views_viewed_at_idx`; không có cột IP/user-agent/cookie |

### Lỗi phát hiện khi integration và đã sửa

Truy vấn tổng hợp dùng `$1::date AT TIME ZONE 'Asia/Ho_Chi_Minh'`; PostgreSQL
trả `timestamp without time zone`, nên khi so với `viewed_at` (timestamptz)
bị lệch theo `TimeZone` của server và loại mất 36 hàng ở hai đầu khoảng. Đã đổi
sang `$1::date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'` trong cả 3 truy vấn
(`daily`, `totals`, `top-artifacts`) và thêm test guard. Sau khi sửa, tổng 30
ngày khớp đúng số hàng trong DB (1.485).

## Giới hạn còn lại

- Chỉ thao tác trên project non-production đã cấu hình; không chạy reset dữ
  liệu, không chạy trên production.
- Một lượt xem thử nghiệm đã được ghi vào `page_views` để kiểm chứng route
  `POST /api/analytics/pageview`.
