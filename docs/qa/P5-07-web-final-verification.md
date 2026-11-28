# P5-07 — Test và build web (2026-11-28)

## Phạm vi

Issue #23 chốt chất lượng phần web sau khi các nhánh phụ thuộc #17, #18, #19,
#20, #21 và #22 được gộp vào `kietbuideptrai/issue23`. Các test dưới đây được
chạy trên mã đã gộp, không chạy riêng từng nhánh.

Môi trường: Node v22.23.1, npm 10.9.8, `node_modules` có sẵn.

## Lệnh đã chạy

| Lệnh | Kết quả |
| --- | --- |
| `cd web && npm test` | Đạt — 92 test / 16 file, 0 lỗi |
| `cd web && npm run build` | Đạt — `tsc -b` và Vite build thành công |
| `cd backend && npm test` | Đạt — 23 test / 7 suite, 0 lỗi |
| `cd backend && npm run build` | Đạt — `tsc` không lỗi |

## Độ phủ theo yêu cầu của issue

| Khu vực | File test | Số test |
| --- | --- | ---: |
| Admin client (đăng nhập, CRUD, xuất bản, 401) | `web/src/api/adminClient.test.ts` | 11 |
| Xóa hiện vật có xác nhận | `web/src/components/AdminArtifactForm.test.tsx` | 7 |
| Biểu đồ SVG + bảng dữ liệu | `web/src/components/VisitorChart.test.tsx` | 3 |
| Trang thống kê `/admin/analytics` | `web/src/components/AdminAnalyticsPage.test.tsx` | 3 |
| API/client bản đồ | `web/src/api/museumClient.test.ts` | 3 |
| Trang `/map`, ghim, danh sách, retry | `web/src/components/MuseumMapPage.test.tsx` | 5 |
| Ghi nhận lượt xem | `web/src/api/analyticsClient.test.ts`, `web/src/hooks/usePageViewTracking.test.tsx` | 10 |
| Responsive guard (CSS) | `web/src/styles.responsive.test.ts` | 2 |
| Các test nền (demo, speech, history, auth, App) | nhiều file | 48 |

## Kiểm tra viewport

| Viewport | Nhóm rule CSS áp dụng | Kết quả |
| --- | --- | --- |
| 320, 375, 390px | `@media (max-width: 400px)` và `@media (max-width: 680px)` | Không phát hiện lỗi nghiêm trọng |
| 768px | `@media (min-width: 681px) and (max-width: 900px)` | Không phát hiện lỗi nghiêm trọng |
| 1440px | rule mặc định | Không phát hiện lỗi nghiêm trọng |

Các điểm đã rà soát bằng test `styles.responsive.test.ts` và đọc CSS:

- `.map-frame`, `.museum-map-svg`, `.visitor-chart-svg` dùng `width: 100%`;
  khung bản đồ có `max-width: 900px` và `overflow: hidden`.
- Ghim bản đồ thu nhỏ từ 38px xuống 32px ở màn hình ≤ 680px; danh sách hiện
  vật theo khu chuyển sang 1 cột.
- `.analytics-summary` chuyển 4 → 2 → 1 cột tại 680px và 400px.
- Bảng dữ liệu biểu đồ được bọc trong vùng `overflow-x: auto`; bảng hiện vật
  hàng đầu dùng `.admin-artifact-table-wrapper` cũng cuộn ngang nội bộ.
- Header đã có rule gộp dòng từ đợt QA P2-01; không thấy rule nào ép chiều rộng
  cố định trên map/chart.

Phương pháp: kiểm tra rule CSS bằng test tự động và đối chiếu với bằng chứng
ảnh chụp P2-01. Môi trường này không có Chromium/Playwright để chụp lại ảnh mới,
nên cần chạy lại trên trình duyệt thật trước khi nghiệm thu chính thức.

## Bàn phím và screen reader

| Thành phần | Kết quả kiểm tra |
| --- | --- |
| Biểu đồ (`VisitorChart`) | Mỗi ngày có một vùng `role="img"` với `aria-label` đầy đủ ngày/lượt xem/khách duy nhất, `tabIndex=0`. Focus hiện tooltip và cập nhật vùng `role="status"`; ArrowLeft/ArrowRight/Home/End di chuyển giữa các ngày. Có `<details>` chứa bảng số liệu. Đã có test trong `VisitorChart.test.tsx`. |
| Bản đồ (`MuseumMap`) | 8 ghim là phần tử `<a>` thật, có `aria-label` "Ghim N: tên hiện vật tại khu", nhận focus tự nhiên và kích hoạt bằng Enter như liên kết thường. Số thứ tự trên ghim khớp với danh sách nhóm theo khu; test mới kiểm tra cùng `href`, cùng tên và khả năng focus. Hiện vật chưa có vị trí được thông báo qua `role="status"`. |
| Giới hạn | Chưa chạy VoiceOver/NVDA/Orca thật; kết quả dựa trên vai trò/nhãn ARIA và thao tác bàn phím trong jsdom. |

## Lỗi phát hiện và đã sửa

1. **Bảng số liệu biểu đồ có `min-width: 480px`** gây nguy cơ cuộn ngang toàn
   trang ở 320px khi mở `<details>`. Đã thêm `overflow-x: auto` cho
   `.visitor-chart-data` và thêm test CSS guard.
2. **Dữ liệu demo bản đồ lệch slug sau khi gộp #19.** `shared/demoMap.ts` dùng
   bộ slug cũ; đã cập nhật 8 vị trí sang bộ hiện vật mới
   (`a-1-skyraider`, `blu-82`, …) và cập nhật kỳ vọng test tiếng Nhật.
3. **Gộp nhánh gây xung đột CSS/import.** Đã giữ lại đồng thời rule map,
   analytics, admin-delete và admin-map; build/typecheck xác nhận không còn
   rule bị cụt.

## Kết luận

- `npm test` và `npm run build` của web đều đạt; backend cũng đạt sau khi gộp.
- Không phát hiện lỗi layout nghiêm trọng ở 320/375/390/768/1440 qua kiểm tra
  rule CSS và bằng chứng P2-01.
- Bàn phím và cấu trúc screen reader cho map/chart đã có test bảo vệ.
- Cần chạy lại trên trình duyệt thật + screen reader thật trước buổi nghiệm thu.
