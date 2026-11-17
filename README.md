# Thuyết minh hiện vật đa ngôn ngữ

Hệ thống hướng dẫn tham quan bảo tàng qua mã QR: khách quét mã để mở trang
hiện vật, chọn một trong năm ngôn ngữ (`vi`, `en`, `zh`, `ja`, `ko`), đọc nội
dung và nghe thuyết minh bằng TTS.

Repository gồm ba phần:

| Thư mục | Thành phần |
| --- | --- |
| `web/` | Website React + Vite, hỗ trợ truy cập trực tiếp qua `/artifacts/<slug>` |
| `mobile/` | Ứng dụng Expo SDK 58 (React Native), quét QR, xem và nghe thuyết minh |
| `backend/` | API Express + PostgreSQL/Supabase cung cấp hiện vật và bản dịch |
| `shared/` | Kiểu dữ liệu API và bộ dữ liệu demo dùng chung |
| `docs/` | PRD, backlog và checklist kiểm thử |

Phạm vi MVP không có CMS. Nội dung hiện vật được nạp bằng seed/database và cần
được chuyên gia, bảo tàng xác nhận trước khi công bố.

## Yêu cầu chung

- Node.js LTS và npm
- Trình duyệt hiện đại cho bản web
- Expo Go trên điện thoại cho bản mobile
- Tài khoản Supabase/PostgreSQL chỉ khi chạy API thật

## Chạy demo web

Demo web dùng dữ liệu và ảnh cục bộ, không cần backend hay database:

```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```

Mở URL Vite hiển thị (mặc định `http://localhost:5173`). Cấu hình mẫu đặt
`VITE_DEMO_MODE=true`; đổi thành `false` và cấu hình `VITE_API_URL` khi muốn
dùng API thật. Chi tiết xem [web/README.md](web/README.md).

## Chạy demo mobile

Cài Expo Go trên điện thoại, sau đó:

```bash
cd mobile
npm install
cp .env.example .env.local
npm start
```

Dùng Expo Go quét mã QR do Expo CLI hiển thị. Điện thoại và máy tính cần cùng
mạng Wi-Fi khi chạy qua LAN. Demo app dùng dữ liệu cục bộ và không cần backend.
Chi tiết cấu hình, quyền camera và TTS xem [mobile/README.md](mobile/README.md).

## Chạy backend và API thật

```bash
cd backend
npm install
cp .env.example .env
```

Điền `DATABASE_URL` của một dự án Supabase **phi production đã được xác nhận**
vào `backend/.env`. Không commit file `.env` và không dán chuỗi kết nối vào
chat, log hoặc ảnh chụp màn hình.

Các biến backend:

| Biến | Mô tả |
| --- | --- |
| `DATABASE_URL` | Chuỗi kết nối PostgreSQL, bật TLS |
| `PORT` | Cổng API local, mặc định `3000` |
| `CORS_ORIGINS` | Danh sách origin web chính xác, phân tách bằng dấu phẩy |
| `NODE_ENV` | `development` khi chạy local, `production` khi triển khai |

Trước khi tạo schema hoặc nạp seed, đọc kỹ
[backend/src/db/README.md](backend/src/db/README.md): kiểm tra project ref,
không chạy trên database production/dùng chung/chưa xác nhận, và chỉ áp dụng
`schema.sql` cho database rỗng. `seed.sql` tạo 8 hiện vật bảo tàng ở trạng thái
chưa công bố với nội dung nháp.

Nếu chỉ cần **database tượng trưng cho demo**, dùng
`backend/src/db/seed-demo.sql` trên một project Supabase demo riêng. Seed này
tạo 8 hiện vật hư cấu đã công bố, đủ 5 ngôn ngữ và dùng ảnh `placehold.co`; slug
có tiền tố `demo-` để không trộn với dữ liệu thật. Đây không phải dữ liệu bảo
tàng và không thay thế bước duyệt nội dung thật.

Khởi động API:

```bash
npm run dev
```

Kiểm tra `GET http://localhost:3000/api/health`. HTTP 200 và cả `backend` lẫn
`database` đều `ok` mới xác nhận API đọc được database. Sau đó kiểm tra
`/api/languages` và `/api/artifacts?lang=vi|en|zh|ja|ko`. Hướng dẫn triển khai
Render/Railway và mô tả API nằm trong [backend/README.md](backend/README.md).

Kết nối web với API thật: đặt `VITE_DEMO_MODE=false` và
`VITE_API_URL=http://localhost:3000` trong `web/.env.local`.

Kết nối mobile với API thật: đặt `EXPO_PUBLIC_DEMO_MODE=false` và
`EXPO_PUBLIC_API_URL` trong `mobile/.env.local`. Với điện thoại thật, dùng IP
LAN của máy tính (ví dụ `http://192.168.1.10:3000`), không dùng `localhost`.

## Kiểm thử và build

```bash
cd web
npm test
npm run build

cd ../backend
npm test
npm run build

cd ../mobile
npm run typecheck
npm run lint
```

Mobile chưa có bộ kiểm thử tự động; cần kiểm thử thủ công trên thiết bị thật
theo [docs/MOBILE-TEST-CHECKLIST.md](docs/MOBILE-TEST-CHECKLIST.md).

## Lưu ý về dữ liệu và phạm vi

- Nội dung năm ngôn ngữ trong `shared/demoArtifacts.ts` và seed backend là bản
  nháp, cần chuyên gia/bảo tàng kiểm chứng.
- Ảnh trong bản demo là hình giữ chỗ. Chỉ thay bằng ảnh hiện vật khi đã xác
  nhận quyền sử dụng.
- Tìm kiếm khớp không phân biệt hoa/thường với tên hiện vật tiếng Việt hoặc
  tiêu đề tiếng Anh, không phụ thuộc ngôn ngữ đang hiển thị.
- Nếu thiếu bản dịch, ứng dụng hỏi trước khi chuyển sang nội dung tiếng Anh.
  Nếu thiếu cả tiếng Anh, ứng dụng thông báo chưa có nội dung.
- Không tự phát TTS khi mở trang. Nếu thiết bị thiếu voice phù hợp, giao diện
  giữ nguyên văn bản và hiển thị `Hiện giờ chưa có voice`.
- Không có CMS, lịch sử phiên bản hay điều chỉnh tốc độ đọc trong MVP.

Xem thêm [docs/PRD.md](docs/PRD.md) và [docs/TASKS.md](docs/TASKS.md).
