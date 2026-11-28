# Kế hoạch hoàn thiện đồ án

Cập nhật 2026-11-27. Phạm vi MVP theo [PRD 1.1](./PRD.md), cộng với
[phạm vi bổ sung](./KE-HOACH-ADMIN-MAP-THONG-KE.md) (quản trị, thống kê truy cập,
bản đồ). Luồng chính vẫn là:
**QR → trang hiện vật → đổi ngôn ngữ → đọc/nghe thuyết minh**.

## 1. Trạng thái hiện tại

| Khu vực | Trạng thái |
| --- | --- |
| Database | PostgreSQL 16 chạy local bằng Podman; 8 hiện vật đã xuất bản, 40 bản dịch (8 × 5 ngôn ngữ). |
| Backend | `npm run build` và `npm test` (14/14) đạt; `/api/health` trả `backend: ok`, `database: ok`. |
| Web | `npm test` 55/55, `npm run build` đạt; `.env.local` đặt `VITE_DEMO_MODE=false` và gọi API thật. |
| Mobile | `npm run typecheck` và `npm run lint` đạt; `EXPO_PUBLIC_DEMO_MODE=false`, trỏ API qua IP LAN. Chưa kiểm thử trên thiết bị thật. |
| Quản trị | Web đã có UI đăng nhập/danh sách/form/ẩn hiện; backend API admin chưa có, chưa seed tài khoản admin. |
| Thống kê | Chưa có bảng `page_views`, chưa có API và biểu đồ lượt truy cập. |
| Bản đồ | Chưa có bảng khu vực/vị trí; web và mobile chưa có màn hình bản đồ. |
| Tài liệu | Đã xóa file trùng lặp, gộp các ghi chú rải rác về một mục. |

## 2. Task còn lại

### P0 — Chốt database thật

- [x] **P0-01** Dựng PostgreSQL local bằng Podman, tạo database `studyhub`.
- [x] **P0-02** Chạy `schema.sql` + `seed.sql`, xuất bản 8 hiện vật demo từ Supabase.
- [x] **P0-03** Trỏ `backend/.env` vào database local; `/api/health` trả HTTP 200.
- [x] **P0-04** Tắt demo mode ở web và mobile; cấu hình `.env.example` mặc định dùng API thật.
- [x] **P0-05** Kiểm tra CORS khi mở web bằng IP LAN (ví dụ `http://192.168.1.18:5173`).
  **Đạt khi:** thêm origin vào `CORS_ORIGINS`, gọi được `/api/artifacts` từ trình duyệt điện thoại.
  Đã kiểm tra: origin LAN trả 200, origin lạ trả 403.

### P1 — Dữ liệu và API

- [ ] **P1-01** Rà soát 40 bản dịch: chính tả, thuật ngữ lịch sử, tên riêng.
  **Đạt khi:** mỗi hiện vật có đủ `vi/en/zh/ja/ko`, không còn chỗ đánh dấu “cần sửa”.
- [ ] **P1-02** Thay ảnh `placehold.co` bằng ảnh có quyền sử dụng (nếu có).
  **Đạt khi:** `image_url` trỏ ảnh thật hoặc có xác nhận dùng placeholder cho buổi demo.
- [x] **P1-03** Chạy `verify-seed.sql` và `verify-demo-readiness.sql` trên database thật; lưu kết quả vào `docs/qa/`.
  **Đạt khi:** 8/8 hiện vật published, đủ 5 ngôn ngữ, kết quả được ghi lại.
  Kết quả: [P1-03/P1-04](./qa/P1-03-database-verification.md).
- [x] **P1-04** Smoke test API: 5 ngôn ngữ, tìm tiếng Việt/Anh khi đang xem ngôn ngữ khác, slug sai trả 404, thiếu bản dịch trả `translation: null`.
  **Đạt khi:** có log/ảnh chụp response cho từng nhánh.
  Đã chạy; riêng nhánh `translation: null` dùng unit test vì bộ dữ liệu hiện đủ 5 ngôn ngữ.

### P2 — Web và mobile dùng API thật

- [ ] **P2-01** Chạy web với `VITE_DEMO_MODE=false`, kiểm tra danh sách, tìm kiếm, chi tiết, đổi ngôn ngữ, TTS, fallback, mất mạng/thử lại.
  **Đạt khi:** các luồng chính chạy trên dữ liệu database, không có lỗi console.
  Đã xác minh danh sách 8 hiện vật và chi tiết `ja` trên API thật
  ([báo cáo](./qa/P2-01-web-real-api.md)); còn TTS/fallback/mất mạng.
- [ ] **P2-02** Chạy mobile qua Expo Go với `EXPO_PUBLIC_API_URL=http://<IP-LAN>:3000`; thực hiện 19 case trong [checklist mobile](../mobile/docs/MOBILE-TEST-CHECKLIST.md).
  **Đạt khi:** ghi Pass/Fail, model máy, phiên bản OS.
- [ ] **P2-03** Kiểm thử thiết bị thật: quyền camera, QR đúng/sai, TTS native, VoiceOver/TalkBack.
  **Đạt khi:** có ảnh/video và kết quả từng case. Cần điện thoại Android/iOS.
- [ ] **P2-04** Kiểm tra screen reader web bằng NVDA hoặc Orca.
  **Đạt khi:** đọc được heading, nhãn nút, dialog fallback và trạng thái TTS.
- [ ] **P2-05** Đo thời gian tải trên mạng di động thật (mục tiêu ≤ 3 giây).
  **Đạt khi:** ghi thiết bị, mạng, p95 và so với mục tiêu.

### P3 — Đóng gói và báo cáo

- [ ] **P3-01** Triển khai backend (Render/Railway) và web (Vercel) với Supabase non-production.
  **Đạt khi:** HTTPS hoạt động, `CORS_ORIGINS` đúng domain, `/api/health` trả 200.
- [ ] **P3-02** Tạo QR cho 8 hiện vật, trỏ domain web thật; thử mở và tải lại URL.
- [ ] **P3-03** Chạy lại E2E trên bản deploy; ghi bug và bằng chứng.
- [ ] **P3-04** Cập nhật [báo cáo/vấn đáp](./BAO-CAO-DO-AN.md): 55 test web, 14 test backend, database thật, ảnh placeholder.
- [ ] **P3-05** Commit phần dọn repo (đã bỏ theo dõi `node_modules`, `dist`, `.env.local`).

### P4 — Backend quản trị và dữ liệu mới

Thiết kế chi tiết: [kế hoạch bổ sung](./KE-HOACH-ADMIN-MAP-THONG-KE.md). Các task
này có thể làm song song với P1–P3; không thay thế các task cũ.

**Phân công nhanh** (A = Web, B = Backend, C = Mobile; đổi thành tên thật khi giao):

| Task | Người | Ước lượng | Phụ thuộc |
| --- | --- | ---: | --- |
| P4-01 Schema/migration/seed admin | B | 1 ngày | — |
| P4-02 Auth JWT | B | 1 ngày | P4-01 |
| P4-03 CRUD hiện vật/bản dịch | B | 1,5 ngày | P4-02 |
| P4-04 API bản đồ | B | 1 ngày | P4-01 |
| P4-05 API analytics | B | 1,5 ngày | P4-01 |
| P4-06 Test/tài liệu API | B | 0,5 ngày | P4-03, P4-04, P4-05 |
| P5-01 Nối admin UI | A | 1 ngày | P4-02, P4-03 |
| P5-02 Nút xóa | A | 0,5 ngày | P5-01 |
| P5-03 Chọn vị trí bản đồ | A | 1 ngày | P4-04 |
| P5-04 Trang thống kê + chart | A | 1,5 ngày | P4-05, P7-01 |
| P5-05 Trang `/map` | A | 1,5 ngày | P4-04, P7-02 |
| P5-06 Ghi nhận lượt xem | A | 0,5 ngày | P4-05 |
| P5-07 Test web | A | 0,5 ngày | P5-01…P5-06 |
| P6-01 API client map | C | 0,5 ngày | P4-04 |
| P6-02 Tab + màn hình map | C | 1,5 ngày | P6-01 |
| P6-03 Demo mode map | C | 0,5 ngày | P6-02, P7-02 |
| P6-04 Typecheck/lint/thiết bị | C | 0,5 ngày | P6-02 |
| P7-01 Seed 30 ngày | B | 0,5 ngày | P4-01 |
| P7-02 Seed khu/vị trí | B | 0,5 ngày | P4-01 |
| P7-03 Script setup/reset | B | 0,5 ngày | P4-01, P7-01, P7-02 |
| P8-01 Tài liệu | Cả nhóm | 0,5 ngày | P4…P7 |
| P8-02 QA/ảnh chụp | Cả nhóm | 0,5 ngày | P5, P6 |
| P8-03 Báo cáo/demo | Cả nhóm | 0,5 ngày | P8-02 |
| P8-04 Test cuối + commit | Cả nhóm | 0,5 ngày | P8-03 |

Tổng khoảng 19–20 ngày công; ba người làm song song khoảng 1,5–2 tuần.

- [ ] **P4-01** Cập nhật schema + migration + seed admin.
  **Đạt khi:** `schema.sql` chạy lại an toàn; có bảng `museum_zones`, `page_views`;
  `artifacts` có `zone_id`, `map_x`, `map_y`; xóa hiện vật xóa bản dịch theo;
  `npm run seed:admin` tạo được tài khoản.
- [ ] **P4-02** API đăng nhập admin + middleware JWT.
  **Đạt khi:** đúng email/mật khẩu trả token; sai trả 401; thiếu/hết hạn token
  trả 401; `npm test` có test cho hash và token.
- [ ] **P4-03** API CRUD hiện vật và bản dịch.
  **Đạt khi:** danh sách gồm cả hiện vật ẩn; tạo/sửa/xóa được; slug trùng trả 409;
  upsert bản dịch 5 ngôn ngữ; xóa trả 204.
- [ ] **P4-04** API bản đồ công khai.
  **Đạt khi:** `GET /api/museum/map?lang=vi` trả zones + hiện vật đã xuất bản kèm
  tọa độ; hiện vật ẩn/không có vị trí không xuất hiện trong danh sách chính.
- [ ] **P4-05** API analytics.
  **Đạt khi:** `POST /api/analytics/pageview` trả 204 và tách được `artifact_slug`;
  `GET /api/admin/analytics/summary?days=30` trả tổng, daily đủ 30 ngày và top
  hiện vật.
- [ ] **P4-06** Test backend + tài liệu API.
  **Đạt khi:** `npm test` và `npm run build` pass; `.env.example` có
  `ADMIN_JWT_SECRET`; README/API samples có ví dụ.

### P5 — Web quản trị, thống kê và bản đồ

- [ ] **P5-01** Nối UI admin hiện có với API thật; xử lý 401 và trạng thái lỗi.
  **Đạt khi:** đăng nhập, danh sách, thêm, sửa, ẩn/hiện chạy trên DB thật.
- [ ] **P5-02** Thêm nút xóa hiện vật + xác nhận.
  **Đạt khi:** xóa xong quay về danh sách; hiện vật biến mất khỏi web/app/map;
  hủy xác nhận không xóa.
- [ ] **P5-03** Chọn khu + tọa độ bản đồ trong form hiện vật.
  **Đạt khi:** chọn khu, bấm bản đồ đặt ghim, nhập tay tọa độ, lưu và mở lại thấy
  đúng vị trí.
- [ ] **P5-04** Trang `/admin/analytics` + biểu đồ SVG.
  **Đạt khi:** hiện tổng lượt xem, khách duy nhất, hôm nay, top hiện vật; đổi
  7/30 ngày; có bảng số liệu dự phòng cho screen reader.
- [ ] **P5-05** Trang `/map` công khai + link trên nav.
  **Đạt khi:** bản đồ hiện khu/ghim; bấm ghim mở đúng hiện vật; responsive
  320–1440px; có trạng thái tải/lỗi/thử lại.
- [ ] **P5-06** Ghi nhận lượt xem web.
  **Đạt khi:** route công khai gửi 1 request/lần điều hướng; không gửi ở `/admin`;
  không gửi trùng do StrictMode; lỗi analytics không làm hỏng trang.
- [ ] **P5-07** Test web + build.
  **Đạt khi:** `npm test` và `npm run build` pass; có test cho admin client, xóa,
  chart, map và tracking.

### P6 — Mobile bản đồ

- [ ] **P6-01** Thêm kiểu dữ liệu map vào `shared/types.ts` + API client.
  **Đạt khi:** `getMuseumMap(language)` gọi được API thật, có abort signal.
- [ ] **P6-02** Thêm tab **Bản đồ** và màn hình map.
  **Đạt khi:** tab thứ 6 hiển thị; sơ đồ + ghim + danh sách hiện vật; bấm ghim mở
  `/artifacts/[slug]`; có tải/lỗi/thử lại.
- [ ] **P6-03** Demo mode cho bản đồ.
  **Đạt khi:** `EXPO_PUBLIC_DEMO_MODE=true` vẫn xem được bản đồ từ
  `shared/demoMuseumMap.ts`; dữ liệu khớp web demo.
- [ ] **P6-04** Typecheck, lint và checklist thiết bị.
  **Đạt khi:** `npm run typecheck`, `npm run lint` pass; 6 tab không tràn trên
  màn hình hẹp; VoiceOver/TalkBack đọc được tên khu/ghim.

### P7 — Dữ liệu demo

- [ ] **P7-01** Seed 30 ngày lượt truy cập.
  **Đạt khi:** `npm run seed:analytics` tạo dữ liệu 30 ngày, chạy lại không nhân
  đôi nếu không có `--force`; biểu đồ có số liệu ngay khi demo.
- [ ] **P7-02** Seed khu vực + vị trí 8 hiện vật.
  **Đạt khi:** `GET /api/museum/map` trả đủ 7 khu và 8 hiện vật có tọa độ.
- [ ] **P7-03** Script setup/reset tiện dụng.
  **Đạt khi:** `setup-local-db.sh` chạy schema/migration/seed/admin/analytics;
  README ghi rõ lệnh.

### P8 — Tài liệu và nghiệm thu

- [ ] **P8-01** Cập nhật PRD Phụ lục A, TASKS, README, API samples.
- [ ] **P8-02** QA: ảnh chụp admin/map/chart; responsive 320/375/390/768/1440;
  kiểm tra bàn phím và screen reader.
- [ ] **P8-03** Cập nhật báo cáo/vấn đáp và kịch bản demo.
- [ ] **P8-04** Chạy lại toàn bộ test/build/typecheck; commit phần bổ sung.

## 3. Thứ tự đề xuất

**MVP cũ (đang dở):**

1. P1-03, P1-04 — xác minh database và API thật.
2. P2-01 — web chạy đúng trên API thật.
3. P2-02, P2-03 — mobile trên máy thật.
4. P3-01, P3-02 — deploy và QR.
5. P3-04, P3-05 — báo cáo và dọn repo.

**Phần bổ sung (làm song song được):**

1. P4-01 — schema/migration/seed admin (chặn toàn bộ phần bổ sung).
2. P4-02, P4-03 — auth + CRUD; P5-01, P5-02 nối admin UI và nút xóa.
3. P4-04, P7-02 — API bản đồ + seed vị trí; P5-03, P5-05 và P6-01, P6-02 làm
   bản đồ web/mobile.
4. P4-05, P7-01 — analytics + seed 30 ngày; P5-04, P5-06 làm biểu đồ và tracking.
5. P6-03, P6-04 — demo mode và kiểm thử mobile.
6. P8-01…P8-04 — tài liệu, QA, báo cáo, commit.

## 4. Lệnh vận hành

```bash
# Database local (Podman)
podman start studyhub-postgres
podman exec studyhub-postgres pg_isready -U postgres -d studyhub

# Backend
cd backend && npm run dev
curl http://localhost:3000/api/health

# Web
cd web && npm run dev

# Mobile
cd mobile && npm start

# Seed phần bổ sung (sau khi làm P4/P7)
cd backend && npm run seed:demo
```

Khi cần chuyển sang Supabase: tạo project non-production, đổi `DATABASE_URL`
trong `backend/.env`, chạy `schema.sql` + migration + `seed.sql`, rồi kiểm tra lại
`/api/health` trước khi seed.

## 5. Ghi chú dữ liệu

8 hiện vật demo được xuất từ database Supabase ngày 2026-11-28.
Bản dịch là bản nháp cần hiệu đính; ảnh đang dùng placeholder. Trước khi công bố
chính thức cần duyệt nội dung và xác nhận quyền sử dụng ảnh.

## 6. Phạm vi

Từ 2026-11-27, các phần sau **đã chuyển vào phạm vi bổ sung** (xem
[kế hoạch](./KE-HOACH-ADMIN-MAP-THONG-KE.md) và PRD Phụ lục A):

- Giao diện quản trị, đăng nhập admin, CRUD hiện vật/bản dịch, xóa vĩnh viễn.
- Thống kê lượt truy cập web và biểu đồ.
- Bản đồ bảo tàng trên web và mobile, gán vị trí hiện vật.

Vẫn **ngoài phạm vi**: upload ảnh qua giao diện, lịch sử xem, điều chỉnh tốc độ
TTS, bản đồ nhiều tầng, GPS/beacon, deep link mở thẳng app, phân quyền nhiều vai
trò, real-time analytics, xuất Excel/CSV.
