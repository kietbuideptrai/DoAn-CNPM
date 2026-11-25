# Backend

REST API Express + TypeScript cho ứng dụng thuyết minh hiện vật.

## Cài đặt local

Cách nhanh nhất là dùng PostgreSQL trong Podman:

```bash
bash scripts/setup-local-db.sh
```

Script tạo container `studyhub-postgres`, chạy schema, nạp 8 hiện vật và in ra
`DATABASE_URL`. Sau đó:

```bash
npm install
cp .env.example .env
# Dán DATABASE_URL vào .env
npm run dev
```

API chạy tại `http://localhost:3000`. Kiểm tra
`http://localhost:3000/api/health`; HTTP 200 với `backend` và `database` đều `ok`
nghĩa là sẵn sàng.

### Dùng Supabase

Tạo project **non-production**, lấy connection string (TLS bật) và thay
`DATABASE_URL`. Chạy `src/db/schema.sql` một lần trên database trống, sau đó
`src/db/seed.sql`. Không chạy schema/seed trên database production hoặc chưa xác
nhận. Chi tiết: [`src/db/README.md`](./src/db/README.md).

## Biến môi trường

| Biến | Mô tả |
| --- | --- |
| `DATABASE_URL` | Chuỗi kết nối PostgreSQL. |
| `PORT` | Cổng API, mặc định `3000`. |
| `CORS_ORIGINS` | Danh sách origin web được phép, cách nhau bằng dấu phẩy. |
| `NODE_ENV` | `development` hoặc `production`. |

## API

| Method | Endpoint | Chức năng |
| --- | --- | --- |
| GET | `/api/health` | Trạng thái backend và database riêng biệt. |
| GET | `/api/languages` | Danh sách ngôn ngữ hỗ trợ. |
| GET | `/api/artifacts?lang=vi&q=tank` | Danh sách hiện vật đã xuất bản. |
| GET | `/api/artifacts/:slug?lang=vi` | Chi tiết và các ngôn ngữ có sẵn. |

`q` tìm không phân biệt hoa/thường trong tên tiếng Việt và tiêu đề tiếng Anh,
độc lập với ngôn ngữ đang hiển thị.

## Kiểm thử

```bash
npm test          # 14 test
npm run build
```

## Triển khai

Render hoặc Railway, root directory `backend`:

- Build: `npm ci --include=dev && npm run build`
- Start: `npm start`
- Biến: `DATABASE_URL`, `CORS_ORIGINS`, `NODE_ENV=production`
  (`PORT` do nền tảng cấp).

Gọi `/api/health` trước buổi demo để làm nóng dịch vụ và xác nhận database.
