# Thuyết minh hiện vật đa ngôn ngữ

Ứng dụng giới thiệu hiện vật bảo tàng bằng mã QR: khách mở trang hiện vật, chọn
một trong năm ngôn ngữ (Việt, Anh, Trung, Nhật, Hàn), đọc nội dung hoặc nghe
thuyết minh bằng giọng nói. Hệ thống gồm website, ứng dụng di động và backend
dùng chung PostgreSQL. Từ 2026-11-27 có thêm quản trị, thống kê truy cập và bản
đồ bảo tàng (xem [Phụ lục A](docs/PRD.md#phụ-lục-a--phạm-vi-bổ-sung-2026-11-27)).

## Chạy nhanh với Supabase non-production

Nguồn chuẩn là project Supabase **non-production** đã duyệt. Cần Node.js LTS;
không dán connection string, project ref hay secret vào repo/chat/log.

```bash
# 1. Backend + database
cd backend
npm install
cp .env.example .env
# Điền DATABASE_URL (pooler/TLS), SUPABASE_PROJECT_REF, ADMIN_JWT_SECRET,
# ADMIN_EMAIL và ADMIN_PASSWORD từ secret store vào backend/.env
npm run setup:supabase   # schema + migration + seed + admin + analytics
npm run dev
```

`setup:supabase` chỉ chạy trên project khớp `SUPABASE_PROJECT_REF` đã cấu hình;
không dùng `--reset` khi chưa có xác nhận riêng. Tài khoản demo quản trị do
`npm run seed:admin` tạo từ `ADMIN_EMAIL`/`ADMIN_PASSWORD` trong `backend/.env`
(hoặc script `npm run setup:supabase` gọi đến). **Không commit mật khẩu này.**

```bash
# 2. Web (terminal khác)
cd web
npm install
cp .env.example .env.local
# VITE_DEMO_MODE=false, VITE_API_URL trỏ backend ở trên
npm run dev
```

Mở `http://localhost:3000/api/health`; khi cả `backend` và `database` đều `ok`
thì mở `http://localhost:5173`. Web có thêm `/admin/login`, `/admin/analytics`
và `/map`.

### Mobile

```bash
cd mobile
npm install
cp .env.example .env.local
# EXPO_PUBLIC_API_URL=http://<IP-LAN>:3000, EXPO_PUBLIC_DEMO_MODE=false
npm start
```

Quét QR của Expo bằng **Expo Go**. Điện thoại và máy tính phải cùng Wi-Fi;
`localhost` không dùng được từ điện thoại. Tab thứ 6 **Bản đồ** vẽ 7 khu/8 ghim,
chạm ghim để mở chi tiết hiện vật.

### Fallback database local

Podman chỉ là dự phòng khi không có Supabase:

```bash
bash backend/scripts/setup-local-db.sh
podman exec studyhub-postgres pg_isready -U postgres -d studyhub
```

## Chế độ demo offline (tùy chọn)

Khi không có backend, đặt `VITE_DEMO_MODE=true` (web) hoặc
`EXPO_PUBLIC_DEMO_MODE=true` (mobile). Ngoài 8 hiện vật mẫu trong
`shared/demoArtifacts.ts`, bản đồ dùng `shared/demoMuseumMap.ts` — cùng nguồn
cho web và mobile. Chế độ này chỉ để trình bày giao diện, không chứng minh
database đã kết nối.

## Cách dùng

1. Vào **Hiện vật**, tìm theo tên tiếng Việt hoặc tiếng Anh.
2. Mở một hiện vật để xem chi tiết.
3. Chọn ngôn ngữ ở đầu trang; lựa chọn được ghi nhớ.
4. Bấm **Nghe thuyết minh** để phát, tạm dừng, tiếp tục hoặc dừng.
5. Mở **Bản đồ** để xem khu vực và ghim; danh sách bên dưới nhóm theo khu.
6. Vào `/admin/login` bằng tài khoản demo quản trị để thêm/sửa/ẩn/xóa hiện vật,
   gán khu + tọa độ, xem trước/tải QR và mở `/admin/analytics`.

URL hiện vật dùng dạng `http://localhost:5173/artifacts/<slug>`; thêm `?lang=en`
để mở sẵn ngôn ngữ. QR in tại hiện vật luôn trỏ URL web này.

## Cấu trúc repository

| Thư mục | Vai trò |
| --- | --- |
| `web/` | Website React + Vite + TypeScript (admin, analytics, map). |
| `mobile/` | Ứng dụng React Native + Expo (6 tab, gồm Bản đồ). |
| `backend/` | REST API Express + PostgreSQL/Supabase. |
| `shared/` | Kiểu dữ liệu và dữ liệu demo dùng chung. |
| `docs/` | PRD, kế hoạch, báo cáo kiểm thử và bằng chứng QA. |

## Kiểm thử

```bash
cd backend && npm test && npm run build    # 45 test
cd web && npm test && npm run build        # 92 test
cd mobile && npm run typecheck && npm run lint
```

Mobile cần kiểm thử thêm trên máy thật theo
[checklist mobile](mobile/docs/MOBILE-TEST-CHECKLIST.md); các mục chưa có thiết
bị được ghi `Blocked`, không đánh pass giả.

## Tài liệu

- [PRD](docs/PRD.md) — yêu cầu, Phụ lục A và tiêu chí AC-19…AC-28.
- [Kế hoạch hoàn thiện](docs/TASKS.md) — trạng thái P0–P8.
- [Kế hoạch bổ sung](docs/KE-HOACH-ADMIN-MAP-THONG-KE.md) — thiết kế quản trị,
  thống kê và bản đồ.
- [Đồng bộ tài liệu P8-01](docs/qa/P8-01-docs-sync.md) — đối chiếu PRD/README/API.
- [Bằng chứng P8-02](docs/qa/P8-02-supplemental-evidence.md) — AC-19…AC-28, ảnh
  chụp web và các mục Blocked.
- [Báo cáo/vấn đáp](docs/BAO-CAO-DO-AN.md) — chuẩn bị bảo vệ đồ án, kịch bản demo.
- [Tổng hợp QA](docs/qa/README.md) — các báo cáo kiểm thử.
- [Hướng dẫn database](backend/src/db/README.md) — schema, seed, kiểm tra an toàn.

## Triển khai

- **Backend:** Render hoặc Railway, root directory `backend`; biến môi trường
  `DATABASE_URL`, `ADMIN_JWT_SECRET`, `CORS_ORIGINS`, `NODE_ENV=production` lấy từ
  secret store. Không dùng anon key ở server.
- **Web:** Vercel, root directory `web`; biến `VITE_API_URL`, `VITE_PUBLIC_URL`,
  `VITE_DEMO_MODE=false`.
- **Database:** Supabase non-production; chạy `npm run setup:supabase` một lần,
  sau đó gọi `/api/health` trước buổi demo.

## Ghi chú dữ liệu

8 hiện vật tham khảo chuyên mục “Hiện vật kể chuyện” của Bảo tàng Hồ Chí Minh.
Bản dịch là bản nháp cần hiệu đính; ảnh đang dùng placeholder. 30 ngày đầu của
biểu đồ analytics là dữ liệu seed. Trước khi công bố chính thức cần duyệt nội
dung và xác nhận quyền sử dụng ảnh.

## Sự cố thường gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| `database: unavailable` | Kiểm tra `DATABASE_URL` pooler/TLS trong `backend/.env` và project Supabase đã duyệt; nếu dùng fallback thì `podman start studyhub-postgres`. |
| Web báo lỗi tải dữ liệu | Kiểm tra `VITE_DEMO_MODE=false` và backend đang chạy ở `VITE_API_URL`. |
| `/admin/login` trả 401 | Đối chiếu `ADMIN_EMAIL`/`ADMIN_PASSWORD` từ secret store; chạy lại `npm run seed:admin` nếu chưa có tài khoản. |
| Điện thoại không gọi được API | Dùng IP LAN thay cho `localhost`, mở firewall cho cổng 3000. |
| Bản đồ mobile trống | Kiểm tra `EXPO_PUBLIC_DEMO_MODE=false` và `EXPO_PUBLIC_API_URL`; demo mode dùng dữ liệu cục bộ. |
| Không nghe tiếng | Kiểm tra âm lượng và gói voice của hệ điều hành; thử Chrome/Edge. |
