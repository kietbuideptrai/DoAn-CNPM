# Kế hoạch hoàn thiện đồ án

Cập nhật 2026-11-25. Phạm vi MVP theo [PRD 1.1](./PRD.md); luồng chính:
**QR → trang hiện vật → đổi ngôn ngữ → đọc/nghe thuyết minh**.

## 1. Trạng thái hiện tại

| Khu vực | Trạng thái |
| --- | --- |
| Database | PostgreSQL 16 chạy local bằng Podman; 8 hiện vật đã xuất bản, 40 bản dịch (8 × 5 ngôn ngữ). |
| Backend | `npm run build` và `npm test` (14/14) đạt; `/api/health` trả `backend: ok`, `database: ok`. |
| Web | `npm test` 55/55, `npm run build` đạt; `.env.local` đặt `VITE_DEMO_MODE=false` và gọi API thật. |
| Mobile | `npm run typecheck` và `npm run lint` đạt; `EXPO_PUBLIC_DEMO_MODE=false`, trỏ API qua IP LAN. Chưa kiểm thử trên thiết bị thật. |
| Tài liệu | Đã xóa file trùng lặp, gộp các ghi chú rải rác về một mục. |

## 2. Task còn lại

### P0 — Chốt database thật

- [x] **P0-01** Dựng PostgreSQL local bằng Podman, tạo database `studyhub`.
- [x] **P0-02** Chạy `schema.sql` + `seed.sql`, xuất bản 8 hiện vật bảo tàng.
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

## 3. Thứ tự đề xuất

1. P1-03, P1-04 — xác minh database và API thật.
2. P2-01 — web chạy đúng trên API thật.
3. P2-02, P2-03 — mobile trên máy thật.
4. P3-01, P3-02 — deploy và QR.
5. P3-04, P3-05 — báo cáo và dọn repo.

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
```

Khi cần chuyển sang Supabase: tạo project non-production, đổi `DATABASE_URL`
trong `backend/.env`, chạy `schema.sql` + `seed.sql`, rồi kiểm tra lại
`/api/health` trước khi seed.

## 5. Ghi chú dữ liệu

8 hiện vật tham khảo chuyên mục “Hiện vật kể chuyện” của Bảo tàng Hồ Chí Minh.
Bản dịch là bản nháp cần hiệu đính; ảnh đang dùng placeholder. Trước khi công bố
chính thức cần duyệt nội dung và xác nhận quyền sử dụng ảnh.

## 6. Ngoài phạm vi MVP

CMS/giao diện quản trị, upload ảnh qua CMS, lịch sử xem, điều chỉnh tốc độ TTS,
deep link mở thẳng app. Code liên quan đang có được giữ nguyên, không mở rộng.
