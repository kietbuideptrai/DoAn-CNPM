# P8-04 — Kiểm tra chốt trước khi báo cáo (2026-11-28)

## Lệnh đã chạy

| Lệnh | Kết quả |
| --- | --- |
| `cd backend && npm test && npm run build` | Đạt — 14 test, 4 suite; `tsc` không lỗi |
| `cd web && npm test && npm run build` | Đạt — 55 test / 8 file; build Vite thành công |
| `cd mobile && npm run typecheck && npm run lint` | Đạt — không lỗi |

Node v22.23.1, npm 10.9.8. Các thư mục `node_modules` đã có sẵn.

## Kịch bản demo trên database sạch

Không đụng vào database `studyhub` hiện có. Tạo database riêng
`studyhub_demo_clean_20261128` trong container Podman `studyhub-postgres`, sau đó
chạy `backend/src/db/schema.sql`, `backend/src/db/seed.sql` và xuất bản 8 slug
như `backend/scripts/setup-local-db.sh`.

| Kiểm tra | Kết quả |
| --- | --- |
| Số lượng | 8 hiện vật, 8 đã xuất bản, 40 bản dịch |
| `verify-demo-readiness.sql` | 8/8 đủ `vi/en/zh/ja/ko` cho mọi ngôn ngữ; 8 ảnh placeholder |
| `GET /api/health` | `{"status":"ok","checks":{"backend":"ok","database":"ok"}}` |
| `GET /api/artifacts?lang=vi`, `GET /api/languages` | 200, dữ liệu đúng |

Kịch bản demo mở rộng của phụ lục A (đăng nhập admin → tạo hiện vật + ghim →
analytics → map web/mobile → xóa) **chưa chạy được**: các task P4–P7 chưa có
mã nguồn tương ứng. Cụ thể, backend chỉ đăng ký `/api/artifacts`,
`/api/languages`, `/api/health`; `/api/admin/analytics/summary` và
`/api/museum/map` đều trả 404. Các script `seed:admin`, `seed:analytics` cũng
chưa có trong `backend/package.json`.

## Kết luận

- Ba lệnh test/build/typecheck/lint của issue đều đạt.
- Demo cơ bản chạy ổn định trên database sạch; demo phụ lục A chưa thể nghiệm thu.
- Không có thay đổi mã nguồn của phần bổ sung để commit: working tree sạch,
  `HEAD` đang bằng `origin/main` (`e8b37e6`).
- Epic #7 và các issue P4-01…P8-03 vẫn mở, nên issue #31 chưa thể đóng.
