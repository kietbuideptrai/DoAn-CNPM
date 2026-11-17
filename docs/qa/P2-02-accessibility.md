# P2-02 — Kiểm thử accessibility web

- **Ngày chạy:** 2026-11-17
- **Trạng thái:** **Một phần** — axe 0 vi phạm, bàn phím/dialog/zoom/tap target
  đạt; **chưa kiểm tra screen reader thật**
- **Bằng chứng:** [`evidence/P2-02-accessibility.json`](./evidence/P2-02-accessibility.json)

## Môi trường

| Thành phần | Giá trị |
| --- | --- |
| Trình duyệt | Chromium 157.0.8103.78, headless |
| Công cụ | axe-core 4.10.3, `playwright-core` 1.65.1 |
| Viewport | 390×844 và 1440×900 CSS px |
| Web | production build + `vite preview` |
| Screen reader | **Không có** VoiceOver/TalkBack/NVDA/Orca trong môi trường |

Các trang được quét axe: home, danh sách, chi tiết, trạng thái thiếu bản dịch,
popup fallback — mỗi trang ở 2 viewport = **10 tổ hợp**.

## Kết quả

### 1. axe-core (WCAG 2.0/2.1 A + AA)

| Trang | 390 | 1440 |
| --- | --- | --- |
| Home | 0 vi phạm | 0 vi phạm |
| Danh sách | 0 vi phạm | 0 vi phạm |
| Chi tiết | 0 vi phạm | 0 vi phạm |
| Thiếu bản dịch | 0 vi phạm | 0 vi phạm |
| Popup fallback | 0 vi phạm | 0 vi phạm |

- `color-contrast` còn ở trạng thái **incomplete** trên home/list. Đã kiểm tra
  thủ công: phần tử bị đánh dấu là mũi tên trang trí
  `<span aria-hidden="true">→</span>` — không phải văn bản thật. Không có text
  nào bị lỗi tương phản.
- Sau khi thêm `role="group"` cho `.available-languages`, cảnh báo
  `aria-prohibited-attr` ở trạng thái thiếu bản dịch đã hết.

### 2. Cấu trúc ngữ nghĩa

| Hạng mục | Kết quả |
| --- | --- |
| `html[lang]` | `vi` đúng |
| Một `h1` mỗi trang | Đúng (home, danh sách, chi tiết) |
| Thứ bậc heading | `h1` → `h2`, không nhảy cấp |
| Landmark | 1 `header`, 1 `nav`, 1 `main`, 1 `footer` |
| Ảnh thiếu `alt` | 0 |
| Ảnh `alt=""` | 0 |
| `lang` của nội dung chi tiết | `vi`/`en`/`ja` đổi đúng theo ngôn ngữ hiển thị |

### 3. Bàn phím và focus

- Tab qua 14 điểm dừng trên trang danh sách: brand → Trang chủ → Hiện vật →
  select ngôn ngữ → select cỡ chữ → ô tìm kiếm → 8 thẻ hiện vật.
- 6 điểm dừng đầu (link/select/input) có outline `solid 3px rgb(0,95,204)`,
  tương phản rõ.
- 8 thẻ hiện vật là link bọc ảnh + tiêu đề; focus được vẽ bằng
  `box-shadow` inset `0 0 0 3px rgb(0,95,204)` cộng vòng trắng 6 px (outline
  `none`), vẫn nhìn thấy rõ.
- Đổi ngôn ngữ hoàn toàn bằng bàn phím: focus select → `ArrowDown` → `Enter`,
  URL thành `lang=en`, select thành `en`.

### 4. Popup fallback

| Kiểm tra | Kết quả |
| --- | --- |
| `role="dialog"` | Có |
| `aria-modal="true"` | Có |
| `aria-labelledby` | `english-fallback-title` |
| `aria-describedby` | `english-fallback-description` |
| Focus ban đầu | Nút **Hủy**, nằm trong dialog |
| Tab / Tab / Shift+Tab | Luân chuyển trong 2 nút, không thoát ra ngoài |
| `Escape` | Đóng dialog, hiện trạng thái thiếu bản dịch |

### 5. Zoom 200 %

Mô phỏng tương đương 200 % bằng viewport 320×450 + `Emulation.setPageScaleFactor: 2`
(visual viewport scale = 2):

- `scrollWidth = clientWidth = 320` — không cuộn ngang.
- Select ngôn ngữ, nút TTS và nội dung chính vẫn hiển thị.
- Kích hoạt TTS bằng bàn phím vẫn chạy, thông báo trạng thái hiển thị.

### 6. Cỡ chữ và vùng chạm

| Phần tử | 390 px | 1440 px | Ngưỡng |
| --- | --- | --- | --- |
| Nội dung chính `.detail-content p` | 17 px | 17 px | ≥16 px — đạt |
| Tóm tắt `.detail-summary` | 17 px | 17 px | ≥16 px — đạt |
| Nút chính “Nghe thuyết minh” | 189×44 | 189×48 | ≥44×44 — đạt |
| Select ngôn ngữ/cỡ chữ | cao 38 px | cao 38 px | không phải nút chính; WCAG 2.1 AA không bắt buộc 44 px |

Line-height nội dung 32,3 px (tỉ lệ ~1,9), tóm tắt 28,05 px.

## Lỗi phát hiện và đã sửa

**`aria-label` trên `div` không có role** — `web/src/App.tsx`.
`.available-languages` dùng `aria-label="Ngôn ngữ có sẵn"` nhưng là `div` không
có role hợp lệ, khiến axe báo `aria-prohibited-attr` (incomplete) và nhãn có thể
không được công bố. Đã thêm `role="group"`; quét lại 10 tổ hợp không còn cảnh
báo này.

## Chưa kiểm tra / giới hạn

- **Chưa có screen reader thật**: chưa xác nhận thứ tự đọc, announcement khi đổi
  ngôn ngữ, trạng thái TTS, thông báo lỗi và dialog bằng VoiceOver/TalkBack/
  NVDA/Orca. Đây là lý do task chỉ đạt **một phần**.
- Chưa kiểm tra Firefox/Safari và zoom trình duyệt desktop thật (chỉ mô phỏng
  page scale trên Chromium).
- Contrast được đánh giá qua axe + kiểm tra phần tử incomplete, chưa đo thủ công
  toàn bộ tổ hợp màu.
- Dữ liệu là `demo-*`, chưa phải nội dung nghiệm thu bảo tàng.
