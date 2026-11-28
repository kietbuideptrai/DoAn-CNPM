# P1-03/P1-04 — Xác minh database và API thật

- **Ngày chạy:** 2026-11-25
- **Môi trường:** PostgreSQL 16 (Podman, `127.0.0.1:5432`), backend Express local
  `127.0.0.1:3000`, dữ liệu 8 hiện vật demo xuất từ Supabase.
- **Dữ liệu:** `seed.sql` + xuất bản 8 slug bằng `scripts/setup-local-db.sh`.

## Database

| Kiểm tra | Kết quả |
| --- | --- |
| Số hiện vật | 8 |
| Đã xuất bản | 8 |
| Bản dịch | 40 (8 × 5 ngôn ngữ) |
| `verify-demo-readiness.sql` | 8/8 hiện vật đủ `vi/en/zh/ja/ko` cho từng ngôn ngữ |

## Health

```json
{"status":"ok","checks":{"backend":"ok","database":"ok"}}
```

## API

| Case | Kết quả |
| --- | --- |
| `GET /api/artifacts?lang=vi` | 200, 8 hiện vật |
| `GET /api/artifacts?lang=en` | 200, 8 hiện vật |
| `GET /api/artifacts?lang=zh` | 200, 8 hiện vật |
| `GET /api/artifacts?lang=ja` | 200, 8 hiện vật |
| `GET /api/artifacts?lang=ko` | 200, 8 hiện vật |
| `GET /api/languages` | 200, đủ 5 ngôn ngữ |
| `GET /api/artifacts/a-1-skyraider?lang=ja` | 200, bản dịch `ja`, `available_languages` đủ 5 |
| `GET /api/artifacts?lang=ja&q=skyraider` | 200, khớp `a-1-skyraider` (tìm theo tên gốc khi xem tiếng Nhật) |
| `GET /api/artifacts?lang=vi&q=attack` | 200, khớp `a-1-skyraider` (tìm theo tiêu đề tiếng Anh khi xem tiếng Việt) |
| `GET /api/artifacts/khong-ton-tai?lang=vi` | 404 |

## CORS

| Origin | Kết quả |
| --- | --- |
| `http://localhost:5173` | 200, có `Access-Control-Allow-Origin` |
| `http://192.168.1.18:5173` | 200, có `Access-Control-Allow-Origin` |
| `http://evil.example` | 403 |

## Ghi chú

- Cả 8 hiện vật đều có đủ 5 bản dịch, nên nhánh `translation: null` không xuất
  hiện trên bộ dữ liệu này; nhánh fallback được kiểm tra bằng unit test web và
  E2E trước đó.
- Ảnh vẫn là placeholder; nội dung/bản dịch là bản nháp cần hiệu đính.
