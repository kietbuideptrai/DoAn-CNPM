# P2-05 — Đo thời gian tải nội dung

- **Ngày chạy:** 2026-11-17
- **Trạng thái:** **Một phần** — p95 468 ms trong mô phỏng, dưới mục tiêu
  3 000 ms; **chưa đo trên thiết bị/mạng di động thật**
- **Bằng chứng:** [`evidence/P2-05-performance.json`](./evidence/P2-05-performance.json)

## Điều kiện đo (bắt buộc ghi kèm)

| Thành phần | Giá trị |
| --- | --- |
| Thiết bị | **Không phải thiết bị thật** — Chromium headless trên Linux |
| CPU | Giới hạn 4× (`Emulation.setCPUThrottlingRate: 4`) |
| Mạng | CDP `cellular4g`: 9 Mbps xuống / 1,5 Mbps lên / RTT 40 ms |
| Viewport | 390×844 CSS px, DPR 3, mô phỏng mobile + touch |
| User agent | Android 13, Chrome 157 mobile |
| Web | production build + `vite preview` tại `127.0.0.1:5173` |
| API | backend local `127.0.0.1:3000`, không qua CDN |
| URL | `/artifacts/demo-trong-dong?lang=vi` |

Lưu ý: API và web đều chạy local, độ trễ mạng thật tới backend production/CDN
chưa được tính. Đây là **mô phỏng**, không phải phép đo nghiệm thu trên carrier.

## Cách đo

- Mốc bắt đầu: trước `page.goto(..., waitUntil: "commit")`.
- Mốc kết thúc: khi `.detail-content` có nội dung > 20 ký tự (nội dung chính đã
  hiển thị), polling 50 ms.
- Ghi thêm `domContentLoaded`, `loadEventEnd`, LCP qua `PerformanceObserver`,
  số resource và byte transfer.

## Kết quả — 7 lần có throttle

| Lần | Thời gian tới nội dung (ms) | LCP (ms) | DOMContentLoaded (ms) | Byte |
| --- | --- | --- | --- | --- |
| 1 | 468 | 304 | 208,5 | 89 638 |
| 2 | 466 | 448 | 216,4 | 89 338 |
| 3 | 468 | 304 | 221,0 | 89 338 |
| 4 | 417 | 304 | 215,4 | 89 338 |
| 5 | 458 | 428 | 213,2 | 89 338 |
| 6 | 462 | 440 | 210,6 | 89 338 |
| 7 | 415 | 292 | 213,0 | 89 338 |

| Chỉ số | Giá trị |
| --- | --- |
| Min | 415 ms |
| Median | 462 ms |
| **p95** | **468 ms** |
| Max | 468 ms |
| Mục tiêu | ≤ 3 000 ms |
| Kết luận mô phỏng | **Đạt** trong điều kiện mô phỏng |

Baseline không throttle: 187 ms và 191 ms.

## Diễn giải

Trong mô phỏng 4G + CPU 4×, nội dung chính hiển thị dưới 0,5 giây, cách mục
tiêu 3 giây khoảng 6 lần. Tuy nhiên:

- Web/API đều local; không có độ trễ WAN, TLS, CDN, cold start serverless.
- Ảnh hiện vật `demo-*` là URL placeholder, chưa phải ảnh bảo tàng thật.
- Chưa đo trên CPU/thiết bị di động thật, chưa đo mạng 3G yếu hoặc mạng rơi.

Vì vậy **không tuyên bố đạt NFR trên thiết bị nghiệm thu**. Cần đo lại trên
thiết bị + SIM/Wi-Fi thật với dữ liệu bảo tàng trước khi đóng task.
