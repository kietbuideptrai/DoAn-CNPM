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

## Giới hạn quan trọng

Không chạy schema/migration/seed hay gọi API ghi trên project Supabase thật trong
môi trường này. Các test ở trên là unit/guard SQL và build/typecheck. Trước
buổi nghiệm thu cần chạy `npm run setup:supabase` trên project non-production
đã duyệt rồi kiểm tra `/api/health`, `/api/museum/map?lang=vi` và
`/api/admin/analytics/summary?days=30`.
