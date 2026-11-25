# Kết quả kiểm thử — 2026-11-17

> Báo cáo dưới đây chạy ngày 2026-11-17 với dữ liệu `demo-*`. Từ 2026-11-25,
> database local đã chuyển sang 8 hiện vật bảo tàng và web/mobile tắt demo mode;
> các số liệu E2E/responsive/accessibility bên dưới vẫn là bằng chứng lịch sử,
> cần chạy lại trên bộ dữ liệu mới trước khi kết luận nghiệm thu.

Thư mục này ghi lại các công việc kiểm thử trong `docs/TASKS.md` đã thực hiện
trên môi trường local. Kết quả chỉ áp dụng cho cấu hình đã ghi trong từng báo
cáo; không thay thế kiểm thử trên thiết bị thật hoặc nghiệm thu dữ liệu bảo tàng.

## Môi trường chung

| Thành phần | Cấu hình |
| --- | --- |
| Ngày chạy | 2026-11-17 |
| Trình duyệt | Chromium 157.0.8103.78, chế độ headless |
| Hệ điều hành | Linux (Arch Linux) |
| Web | Production build (`npm run build`) chạy bằng `vite preview` tại `127.0.0.1:5173` |
| Backend | Express local tại `127.0.0.1:3000`, kết nối PostgreSQL/Supabase non-production hiện có |
| Dữ liệu | 8 hiện vật `demo-*` trong database; **không phải** dữ liệu nghiệm thu bảo tàng |
| Công cụ | `playwright-core` 1.65.1, `axe-core` 4.10.3, đặt ngoài repo tại `/tmp/opencode/qa-harness` |
| Ghi dữ liệu | Không chạy schema/seed; các kiểm tra database và API chỉ đọc |

## Tổng hợp

| Task | Kết quả | Báo cáo |
| --- | --- | --- |
| P1-03 — Database thật | **Đạt**: 8 hiện vật published, 40 bản dịch, health 200 | [P1-03-database-verification.md](./P1-03-database-verification.md) |
| P2-01 — Web với API thật | **Một phần**: danh sách 8 hiện vật, chi tiết `ja` đúng; còn TTS/fallback/mất mạng | [P2-01-web-real-api.md](./P2-01-web-real-api.md) |
| P2-01 — Responsive web | **Đạt 20/20 case** tại 320/375/390/768/1440 CSS px | [P2-01-responsive.md](./P2-01-responsive.md) |
| P2-02 — Accessibility web | **Một phần**: axe 0 vi phạm, keyboard/zoom/tap target đạt; chưa có screen reader thật | [P2-02-accessibility.md](./P2-02-accessibility.md) |
| P2-03 — Mobile trên thiết bị thật | **Chặn**: môi trường không có thiết bị/emulator Android/iOS | [P2-03-mobile-device.md](./P2-03-mobile-device.md) |
| P2-05 — Thời gian tải nội dung | **Một phần**: p95 468 ms trong mô phỏng 4G/CPU 4x; cần đo lại trên thiết bị/mạng thật | [P2-05-performance.md](./P2-05-performance.md) |
| P3-01 — Kiểm thử nghiệm thu xuyên suốt | **Một phần**: web E2E đạt 16/16; mobile chưa kiểm thử | [P3-01-e2e.md](./P3-01-e2e.md) |

## Lỗi phát hiện và đã sửa

1. **320 CSS px: cụm chọn ngôn ngữ/cỡ chữ bị cắt bên trái** — `web/src/styles.css`.
   Cụm `.header-preferences` rộng hơn vùng chứa 31 px, làm select ngôn ngữ có
   `left: -11 px`. Đã ẩn nhãn trực quan trên mobile, giảm gap và cho phép xuống
   dòng; kiểm tra lại ở cỡ chữ lớn nhất cũng không còn cắt.
2. **Nhãn `aria-label` trên `div` không có role** — `web/src/App.tsx`.
   `.available-languages` dùng `aria-label` nhưng là `div` không role. Đã thêm
   `role="group"` để nhãn được công bố đúng.

## Bằng chứng

- `evidence/P2-01-responsive.json`: 20 case, chi tiết layout/control.
- `evidence/P2-01/*.png`: ảnh chụp 20 trạng thái (5 viewport × 4 trang/thái).
- `evidence/P2-02-accessibility.json`: axe, bàn phím, dialog, zoom, typography.
- `evidence/P2-05-performance.json`: 7 lần đo có throttle + 2 lần baseline.
- `evidence/P3-01-e2e.json`: 16 case E2E web.

## Giới hạn

- Các báo cáo ngày 17/11 dùng dữ liệu `demo-*`; từ 25/11 database local dùng 8
  hiện vật bảo tàng (xem [P1-03](./P1-03-database-verification.md)). Cần chạy
  lại responsive/accessibility/E2E trên bộ dữ liệu mới trước khi kết luận.
- Chưa kiểm tra Firefox/Safari, thiết bị Android/iOS thật, mạng di động thật,
  VoiceOver/TalkBack/NVDA/Orca.
- P2-05 dùng mô phỏng mạng/CPU của DevTools, không phải phép đo trên carrier
  thật; không dùng kết quả này để tuyên bố đạt NFR trên thiết bị nghiệm thu.
- Các script harness nằm ngoài repo; báo cáo ghi lại lệnh và tham số để có thể
  chạy lại. Không thêm dependency kiểm thử vào `package.json` của dự án.
