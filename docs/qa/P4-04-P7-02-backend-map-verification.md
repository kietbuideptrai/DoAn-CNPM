# P4-04 / P7-02 — Backend map và seed bản đồ (2026-11-28)

## Phạm vi

Kiểm chứng API bản đồ công khai (#11) và seed 7 khu/vị trí 8 hiện vật (#15) sau
khi chuyển database chuẩn sang Supabase non-production. Không chạy lệnh ghi vào
project Supabase thật trong môi trường này.

## Đã kiểm tra

| Hạng mục | Kết quả |
| --- | --- |
| `npx tsx --test src/services/museum-map.service.test.ts src/db/seed-map.test.ts` | 4/4 test pass |
| `getMuseumZones` | Trả đúng thứ tự `sort_order`; tọa độ dạng number ngay cả khi driver trả chuỗi |
| `getMuseumMap("ja")` | Chia đúng placed/unplaced; cả 2 truy vấn hiện vật đều dùng `lang=ja`; SQL có `is_published = TRUE` |
| `seed-map.sql` | 7 khu khớp `shared/demoMap.ts` về tên, mã màu, hình học và thứ tự |
| 8 vị trí | Khớp `shared/demoMap.ts` và nằm bên trong khu tương ứng |
| Idempotency | `ON CONFLICT (id) DO UPDATE SET` cho 7 khu seed; vị trí hiện vật chỉ gán khi `map_x`/`map_y` còn trống |

## Lỗi phát hiện và đã sửa

- `seed-map.sql` trước đây dùng thứ tự `sort_order` và tên/mô tả khác
  `shared/demoMap.ts`, dễ làm web demo hiện sai thứ tự khu. Đã đồng bộ lại.
- `toZone` trong `museum-map.service.ts` chuyển số `x/y/width/height` nhưng bỏ
  sót `sort_order`; đã đổi sang `Number(row.sort_order)`.

## Giới hạn

Chưa chạy integration với project Supabase thật: không apply seed/kiểm tra
`GET /api/museum/zones` và `/api/museum/map` trên database thật trong môi trường
này. Cần chạy lại runbook Supabase trước nghiệm thu chính thức.
