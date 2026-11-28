# Backend

REST API Express + TypeScript cho ứng dụng thuyết minh hiện vật. Database chuẩn
là **Supabase PostgreSQL non-production**; backend kết nối qua connection string
pooler có TLS. Podman local chỉ là phương án dự phòng.

> Không commit `DATABASE_URL`, `ADMIN_JWT_SECRET`, `ADMIN_EMAIL`,
> `ADMIN_PASSWORD` hay project ref thật vào repo/chat/log. Đổi secret nếu từng
> bị lộ.

## Kết nối Supabase (chuẩn)

1. Xác nhận project là **non-production** và đối chiếu project ref/host pooler
   với project đã duyệt trước khi chạy bất cứ lệnh ghi nào.
2. Sao chép cấu hình và điền giá trị từ secret store:

   ```bash
   cp .env.example .env
   # DATABASE_URL=... pooler.supabase.com:5432/...?sslmode=require
   # ADMIN_JWT_SECRET=...
   # ADMIN_EMAIL=...
   # ADMIN_PASSWORD=...
   npm install
   ```

3. Apply schema, migration và seed demo bằng một lệnh (không cần cài `psql`):

   ```bash
   npm run setup:supabase
   ```

   Script dùng client `pg` có sẵn, đối chiếu project/host trước khi ghi và chạy
   theo thứ tự schema → migration → seed → admin → analytics. Có thể dùng SQL
   Editor hoặc `psql "$DATABASE_URL" -f <file>` nếu cần chạy từng file thủ công.

4. Dữ liệu demo gồm `seed.sql`, `seed-map.sql`, `npm run seed:admin` và
   `npm run seed:analytics`; đã được bao gồm ở lệnh trên (chỉ trên project đã
   duyệt).
5. Chạy API và kiểm tra:

   ```bash
   npm run dev
   curl http://localhost:3000/api/health
   ```

   HTTP 200 với `backend` và `database` đều `ok` nghĩa là backend đã nói
   chuyện được với Supabase. Chi tiết: [`src/db/README.md`](./src/db/README.md).

Backend dùng quyền PostgreSQL của connection string, **không** dùng
`SUPABASE_ANON_KEY` hay service role key cho API admin.

### Script setup/reset

Khi đã khai báo `SUPABASE_PROJECT_REF` trong `.env`, chạy một lệnh duy nhất để
apply schema, migration, seed, admin và analytics theo đúng thứ tự:

```bash
npm run setup:supabase
npm run setup:supabase -- --seed-only   # chỉ chạy seed trên project đã có schema
```

Script từ chối nếu host/project ref không khớp, nếu `NODE_ENV=production`, hoặc
nếu thiếu credentials admin. Reset là thao tác phá hủy, chỉ chạy khi thực sự cần:

```bash
CONFIRM_RESET=supabase-non-production npm run setup:supabase -- --reset
```

Script không in connection string hay mật khẩu ra log. Sau khi chạy, gọi lại
`/api/health` để xác nhận `database: ok`.

## Chạy local dự phòng (Podman)

Chỉ dùng khi cần dựng nhanh một database riêng để debug offline:

```bash
bash scripts/setup-local-db.sh
```

Script tạo container `studyhub-postgres`, chạy schema và nạp dữ liệu mẫu. Script
này không thay thế Supabase và có thể cần cập nhật slug/seed theo đợt dữ liệu mới
(xem issue #16).

## Biến môi trường

| Biến | Mô tả |
| --- | --- |
| `DATABASE_URL` | Connection string PostgreSQL/Supabase, bật TLS. Không commit giá trị thật. |
| `PORT` | Cổng API, mặc định `3000`. |
| `CORS_ORIGINS` | Danh sách origin web được phép, cách nhau bằng dấu phẩy. |
| `NODE_ENV` | `development` hoặc `production`. |
| `ADMIN_JWT_SECRET` | Secret ký token admin; bắt buộc khi triển khai. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Chỉ dùng cho `npm run seed:admin`; lấy từ secret store. |

## API

| Method | Endpoint | Chức năng |
| --- | --- | --- |
| GET | `/api/health` | Trạng thái backend và database riêng biệt. |
| GET | `/api/languages` | Danh sách ngôn ngữ hỗ trợ. |
| GET | `/api/artifacts?lang=vi&q=tank` | Danh sách hiện vật đã xuất bản. |
| GET | `/api/artifacts/:slug?lang=vi` | Chi tiết và các ngôn ngữ có sẵn. |
| POST | `/api/admin/auth/login` | Đăng nhập admin, trả JWT (issue #9). |
| GET/PATCH/DELETE | `/api/admin/artifacts` | Quản trị hiện vật, kể cả hiện vật ẩn (issue #10). |
| GET | `/api/museum/zones`, `/api/museum/map?lang=vi` | Khu vực và ghim bản đồ (issue #11). |
| POST | `/api/analytics/pageview` | Ghi lượt xem ẩn danh (issue #12). |
| GET | `/api/admin/analytics/summary?days=30` | Tổng hợp số liệu cho admin (issue #12). |

`q` tìm không phân biệt hoa/thường trong tên tiếng Việt và tiêu đề tiếng Anh,
độc lập với ngôn ngữ đang hiển thị. Các endpoint bổ sung được theo dõi trong
issue #9–#12.

## Kiểm thử

```bash
npm test          # chạy toàn bộ test backend (có test auth/validation/seed)
npm run build
```

Nên chạy thêm smoke test với backend đang trỏ Supabase non-production:
`/api/health`, `/api/languages`, `/api/artifacts?lang=vi`, `/api/museum/map`.

## Triển khai

Render hoặc Railway, root directory `backend`:

- Build: `npm ci --include=dev && npm run build`
- Start: `npm start`
- Biến từ secret store: `DATABASE_URL` (Supabase pooler, TLS),
  `ADMIN_JWT_SECRET`, `CORS_ORIGINS`, `NODE_ENV=production`
  (`PORT` do nền tảng cấp). Không dùng anon key ở server.

Gọi `/api/health` trước buổi demo để làm nóng dịch vụ và xác nhận database.
