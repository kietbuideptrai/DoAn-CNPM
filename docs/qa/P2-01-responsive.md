# P2-01 — Kiểm thử responsive web

- **Ngày chạy:** 2026-11-17
- **Trạng thái:** **Đạt 20/20 case** (sau khi sửa 1 lỗi layout)
- **Phạm vi:** web production build, 5 viewport × 4 trang/thái
- **Bằng chứng:** [`evidence/P2-01-responsive.json`](./evidence/P2-01-responsive.json),
  [`evidence/P2-01/`](./evidence/P2-01/) (20 ảnh chụp)

## Môi trường

| Thành phần | Giá trị |
| --- | --- |
| Trình duyệt | Chromium 157.0.8103.78, headless |
| Hệ điều hành | Linux (Arch Linux) |
| Web | `npm run build` + `vite preview` tại `127.0.0.1:5173` |
| Backend | Express local `127.0.0.1:3000`, database non-production |
| Thiết bị | **Không dùng thiết bị thật** — mô phỏng viewport bằng DevTools |
| Dữ liệu | `demo-trong-dong` và 8 hiện vật `demo-*` |

Viewport: 320×800, 375×812, 390×844, 768×1024, 1440×900 CSS px.

## Cách đo

Mỗi case chạy trên một context riêng, `networkidle`, sau đó cuộn hết trang để
ảnh lazy-load và chờ `document.images` hoàn tất. Với mỗi trang, script kiểm tra:

- `scrollWidth` so với `clientWidth` (cuộn ngang ngoài ý muốn).
- Mọi phần tử `body *` có `getBoundingClientRect()` vượt viewport (trừ phần tử
  `position: fixed`), ngưỡng sai số 1 px.
- Chồng lấn giữa các phần tử con trực tiếp của `.site-header`.
- Ảnh: `complete`, `naturalWidth`, `object-fit`, tỉ lệ méo > 2 %.
- Điều khiển: `#language-select`, `#font-size-select`, `.primary-nav a`,
  `.button`, `.artifact-card-link` — nằm trong viewport và không bị phần tử
  khác che tại tâm (`document.elementFromPoint`).

Trang/thái được kiểm tra:

1. **Home** `/`
2. **Danh sách** `/artifacts`
3. **Chi tiết** `/artifacts/demo-trong-dong`
4. **Popup fallback** — chặn response API để trả `translation: null`,
   `available_languages: ["vi","en"]`, mở với `?lang=ja`

Case chi tiết còn kiểm tra đổi ngôn ngữ sang `en`: URL có `lang=en`, select đổi,
`.detail-content[lang]` đổi. Case popup kiểm tra focus vào trong dialog, 2 nút
nằm trong viewport, và sau khi **Hủy** thì dialog biến mất, trạng thái thiếu bản
dịch hiện ra, ngôn ngữ vẫn là `ja`.

## Kết quả

| Viewport | Home | Danh sách | Chi tiết | Popup | Tổng |
| --- | --- | --- | --- | --- | --- |
| 320 | Pass | Pass | Pass | Pass | 4/4 |
| 375 | Pass | Pass | Pass | Pass | 4/4 |
| 390 | Pass | Pass | Pass | Pass | 4/4 |
| 768 | Pass | Pass | Pass | Pass | 4/4 |
| 1440 | Pass | Pass | Pass | Pass | 4/4 |
| **Tổng** | | | | | **20/20** |

- Không case nào có cuộn ngang, phần tử tràn viewport, header chồng lấn, ảnh lỗi
  hoặc ảnh méo.
- Ảnh danh sách: 8/8 ảnh tải xong ở mọi viewport.
- Ảnh chi tiết: 1/1 ảnh tải xong, `object-fit: cover`.
- Không có `pageerror` hay `console.error` ngoài 404 favicon.

## Lỗi phát hiện và đã sửa

### 1. Cụm điều khiển header bị cắt ở 320 CSS px

**Trước sửa (4 case fail: home/list/detail/popup @320):**

- `.language-picker` và `#language-select` có `left: -11 px`, rộng 126 px
  trong khi `.header-preferences` chỉ rộng 280 px.
- Select ngôn ngữ vượt ra ngoài viewport bên trái; ở cỡ chữ “Rất lớn” mức tràn
  tăng lên `left: -43 px`, chiều rộng 157 px.

**Sửa trong `web/src/styles.css` (media query mobile):**

- Ẩn nhãn trực quan của `.font-size-picker` (vẫn còn cho screen reader bằng kỹ
  thuật visually-hidden, không dùng `display: none`).
- Giảm `gap` của `.header-preferences` từ 14 px xuống 8 px.
- Thêm `flex-wrap: wrap` để cụm điều khiển xuống dòng khi cỡ chữ lớn thay vì
  tràn sang trái.

**Sau sửa:**

- 320 px: `.header-preferences` rộng 280 px, `#language-select` từ `left: 143`
  đến `right: 300`.
- Cỡ chữ “Rất lớn” (`--font-scale: 1.5`) tại 320 px trên cả home/list/detail:
  `scrollWidth = 320`, select vẫn nằm trong `20…300`.
- Chạy lại toàn bộ 20 case: **20/20 Pass**.

## Giới hạn

- Đây là mô phỏng viewport trên Chromium headless, **không phải** thiết bị thật.
  Chưa kiểm tra Safari/iOS và Firefox.
- Chưa đo với dữ liệu nghiệm thu bảo tàng; tiêu đề/nội dung dài thật có thể dài
  hơn dữ liệu `demo-*`.
- P2-03 (thiết bị thật) vẫn là điều kiện riêng, không được thay thế bởi báo cáo
  này.
