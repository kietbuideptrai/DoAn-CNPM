# Thuyết minh hiện vật đa ngôn ngữ

Ứng dụng giới thiệu hiện vật bảo tàng bằng mã QR: khách mở trang hiện vật, chọn
một trong năm ngôn ngữ (Việt, Anh, Trung, Nhật, Hàn), đọc nội dung hoặc nghe
thuyết minh bằng giọng nói. Hệ thống gồm website, ứng dụng di động và backend
dùng chung một database PostgreSQL.

## Chạy nhanh với database thật

Cần Node.js LTS và Podman. Chạy lần lượt từ thư mục gốc:

```bash
# 1. Database: PostgreSQL trong container + schema + 8 hiện vật
bash backend/scripts/setup-local-db.sh

# 2. Backend
cd backend
npm install
cp .env.example .env
# Dán DATABASE_URL do script in ra vào .env
npm run dev

# 3. Web (terminal khác)
cd web
npm install
cp .env.example .env.local
npm run dev
```

Mở `http://localhost:3000/api/health`; khi cả `backend` và `database` đều `ok`
thì mở `http://localhost:5173`.

### Mobile

```bash
cd mobile
npm install
cp .env.example .env.local
# Sửa EXPO_PUBLIC_API_URL thành IP LAN của máy tính, ví dụ http://192.168.1.18:3000
npm start
```

Quét QR của Expo bằng **Expo Go**. Điện thoại và máy tính phải cùng Wi-Fi;
`localhost` không dùng được từ điện thoại.

## Chế độ demo offline (tùy chọn)

Khi không có backend, đặt `VITE_DEMO_MODE=true` (web) hoặc
`EXPO_PUBLIC_DEMO_MODE=true` (mobile) để dùng 8 hiện vật mẫu trong
`shared/demoArtifacts.ts`. Chế độ này chỉ để trình bày giao diện, không chứng
minh database đã kết nối.

## Cách dùng

1. Vào **Hiện vật**, tìm theo tên tiếng Việt hoặc tiếng Anh.
2. Mở một hiện vật để xem chi tiết.
3. Chọn ngôn ngữ ở đầu trang; lựa chọn được ghi nhớ.
4. Bấm **Nghe thuyết minh** để phát, tạm dừng, tiếp tục hoặc dừng.
5. Nếu thiếu voice, trang vẫn hiển thị văn bản và báo **“Hiện giờ chưa có voice”**.

URL hiện vật dùng dạng `http://localhost:5173/artifacts/<slug>`; thêm `?lang=en`
để mở sẵn ngôn ngữ. QR in tại hiện vật luôn trỏ URL web này.

## Cấu trúc repository

| Thư mục | Vai trò |
| --- | --- |
| `web/` | Website React + Vite + TypeScript. |
| `mobile/` | Ứng dụng React Native + Expo. |
| `backend/` | REST API Express + PostgreSQL. |
| `shared/` | Kiểu dữ liệu và dữ liệu demo dùng chung. |
| `docs/` | PRD, kế hoạch, báo cáo kiểm thử. |

## Kiểm thử

```bash
cd web && npm test && npm run build        # 55 test
cd backend && npm test && npm run build    # 14 test
cd mobile && npm run typecheck && npm run lint
```

Mobile cần kiểm thử thêm trên máy thật theo
[checklist mobile](mobile/docs/MOBILE-TEST-CHECKLIST.md).

## Tài liệu

- [PRD](docs/PRD.md) — yêu cầu và tiêu chí nghiệm thu.
- [Kế hoạch hoàn thiện](docs/TASKS.md) — việc còn lại và thứ tự ưu tiên.
- [Kế hoạch bổ sung](docs/KE-HOACH-ADMIN-MAP-THONG-KE.md) — quản trị, thống kê
  truy cập, bản đồ bảo tàng (schema, API, phân công).
- [Bộ vấn đáp](docs/BAO-CAO-DO-AN.md) — chuẩn bị bảo vệ đồ án.
- [Kết quả kiểm thử](docs/qa/README.md) — responsive, accessibility, E2E.
- [Hướng dẫn database](backend/src/db/README.md) — schema, seed, kiểm tra an toàn.

## Triển khai

- **Backend:** Render hoặc Railway, root directory `backend`, biến môi trường
  `DATABASE_URL`, `CORS_ORIGINS`, `NODE_ENV=production`.
- **Web:** Vercel, root directory `web`, biến `VITE_API_URL`, `VITE_PUBLIC_URL`,
  `VITE_DEMO_MODE=false`.
- **Database:** Supabase PostgreSQL non-production; chạy schema và seed một lần,
  sau đó gọi `/api/health` trước buổi demo.

## Ghi chú dữ liệu

8 hiện vật tham khảo chuyên mục “Hiện vật kể chuyện” của Bảo tàng Hồ Chí Minh.
Bản dịch là bản nháp cần hiệu đính; ảnh đang dùng placeholder. Trước khi công bố
chính thức cần duyệt nội dung và xác nhận quyền sử dụng ảnh.

## Sự cố thường gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| `database: unavailable` | Chạy `podman start studyhub-postgres`, kiểm tra `DATABASE_URL` trong `backend/.env`. |
| Web báo lỗi tải dữ liệu | Kiểm tra `VITE_DEMO_MODE=false` và backend đang chạy ở `VITE_API_URL`. |
| Điện thoại không gọi được API | Dùng IP LAN thay cho `localhost`, mở firewall cho cổng 3000. |
| Không nghe tiếng | Kiểm tra âm lượng và gói voice của hệ điều hành; thử Chrome/Edge. |
