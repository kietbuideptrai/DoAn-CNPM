# P8-02 — Bằng chứng bổ sung AC-19…AC-28 (2026-11-29)

Issue #29. Báo cáo này dùng Chromium headless chạy production build của web và
Express local trỏ tới project Supabase non-production đã cấu hình trong
`backend/.env`. Không đọc/ghi project khác, không reset schema. Script harness nằm
ngoài repo; credential được đọc lúc chạy và **không** ghi vào ảnh/JSON/báo cáo.

Dữ liệu thô: [P8-02-evidence.json](./evidence/P8-02/P8-02-evidence.json).

## Ảnh chụp

| Nhóm | Ảnh |
| --- | --- |
| Admin login/danh sách/form | [admin-login-1440.png](./evidence/P8-02/admin-login-1440.png), [admin-dashboard-1440.png](./evidence/P8-02/admin-dashboard-1440.png), [admin-form-1440.png](./evidence/P8-02/admin-form-1440.png), [admin-form-pin-1440.png](./evidence/P8-02/admin-form-pin-1440.png), [admin-form-delete-section-1440.png](./evidence/P8-02/admin-form-delete-section-1440.png) |
| Analytics | [admin-analytics-30-1440.png](./evidence/P8-02/admin-analytics-30-1440.png), [admin-analytics-7-1440.png](./evidence/P8-02/admin-analytics-7-1440.png) |
| Bản đồ web 320/375/390/768/1440 | [320](./evidence/P8-02/map-web-320.png), [375](./evidence/P8-02/map-web-375.png), [390](./evidence/P8-02/map-web-390.png), [768](./evidence/P8-02/map-web-768.png), [1440](./evidence/P8-02/map-web-1440.png) |
| Ghim vừa tạo | [map-web-created-pin-1440.png](./evidence/P8-02/map-web-created-pin-1440.png) |

Native `window.confirm` không nằm trong ảnh chụp; nội dung thông báo xóa được
lưu trong `checks.runtime.dialogs` của file JSON. Ảnh mobile không có vì môi
trường không có Android/iOS/emulator.

## Đối chiếu tiêu chí

| Tiêu chí | Kết quả | Bằng chứng |
| --- | --- | --- |
| AC-19 | **Pass** | Đăng nhập đúng chuyển tới `/admin` và lưu token; sai mật khẩu trả 401; token không hợp lệ trả 401; đăng xuất xóa `adminToken` và quay lại `/admin/login`. Ảnh login/dashboard. |
| AC-20 | **Pass** | Danh sách admin trả 8 hiện vật (cả ẩn nếu có); form có 5 tab bản dịch và chọn khu. Kịch bản API tạo hiện vật tạm + 5 lần `PUT translation` đều 204. Ảnh form. |
| AC-21 | **Pass** | Hộp thoại xác nhận xóa hiển thị đúng tên hiện vật và được bỏ chọn để không xóa dữ liệu thật. Kịch bản riêng tạo → xóa hiện vật tạm: `DELETE` 204, chi tiết sau đó 404 và ghim biến mất khỏi map. Ảnh phần xóa. |
| AC-22 | **Pass (web/API)** | Bấm vào sơ đồ form điền `x=142.9`, `y=106.1`; hiện vật tạm lưu `(210, 120)` tại khu đầu tiên và xuất hiện đúng trên `/api/museum/map`. Ảnh form-pin và map-created-pin. Chưa bấm thử trên điện thoại. |
| AC-23 | **Pass** | Một `POST /api/analytics/pageview` với `visitor_id`/`path` trả 204; payload không có IP/user-agent/cookie. Hook tracking web đã có unit test riêng. |
| AC-24 | **Pass** | Summary `days=30` và `days=7` đều 200, `daily.length` lần lượt 30/7, có `totals` và `top_artifacts`; ảnh chart 2 chế độ. |
| AC-25 | **Partial** | Web map 7 khu/8 ghim, bấm ghim mở slug đúng đã có unit test; mobile dùng chung API/demo data và đã typecheck/lint, nhưng chạm ghim trên thiết bị thật vẫn Blocked. |
| AC-26 | **Pass (web) / Blocked (đọc màn hình thật)** | Ảnh chụp ở 5 viewport; `scrollWidth === innerWidth` tại 320/375/390/768/1440; nhãn DOM và thứ tự focus được ghi trong JSON. NVDA/Orca/VoiceOver/TalkBack không có trong môi trường này. |
| AC-27 | **Pass** | 30 ngày đầu summary là dữ liệu seed; script `seed:analytics` bỏ qua khi bảng đã có dữ liệu, không nhân đôi. |
| AC-28 | **Pass** | API admin từ chối token sai (401); pageview chỉ nhận UUID ẩn danh và path; không lưu IP/user-agent. Test backend/web đã phủ các guard này. |

## Lỗi phát hiện và đã sửa

- **Tràn ngang 27 px ở 768 px**: cụm `.header-preferences` (language + cỡ chữ)
  rộng 354 px, đẩy `scrollWidth` lên 795. Đã thêm rule cho breakpoint
  `681–900 px` trong `web/src/styles.css` để header xuống dòng, và thêm assertion
  hồi quy trong `web/src/styles.responsive.test.ts`. Chạy lại: 768/768, không tràn.
- **Script nhận diện confirm sai**: thông báo dùng “xóa” thường, script tìm “Xóa”
  hoa. Đây là lỗi harness ngoài repo, đã sửa trước khi chạy bộ cuối; không ảnh
  hưởng code app.
- Console có 1 lỗi `404 /favicon.ico` ở `vite preview`; không phải lỗi API/UI và
  không làm hỏng luồng nào. Giữ lại trong báo cáo để không nói “zero console error”.

## Kết luận

Không có lỗi nghiêm trọng chưa ghi nhận trong phần chạy được bằng web/API. Các mục
cần thiết bị thật và screen reader thật được đánh rõ `Blocked`; không dùng ảnh web
để thay thế nghiệm thu mobile. UI admin/map/analytics đã có ảnh và JSON làm bằng
chứng cho AC-19…AC-28 theo mức độ nêu trên.
