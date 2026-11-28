# P8-04 — Kiểm tra chốt phần bổ sung (2026-11-29)

Issue #31. Báo cáo này thay thế phần “chưa có mã” của
[P8-04 ngày 28/11](./P8-04-final-verification.md); báo cáo cũ giữ lại làm lịch sử.
Không chạy `--reset`, không tạo/xóa schema, không ghi vào project khác ngoài
project Supabase non-production đã cấu hình trong `backend/.env`. Không lưu
connection string, project ref hay secret vào file.

## Lệnh đã chạy

| Lệnh | Kết quả |
| --- | --- |
| `cd backend && npm test && npm run build` | **Đạt** — 45 test / 14 suite, `tsc` không lỗi |
| `cd web && npm test && npm run build` | **Đạt** — 92 test / 16 file, build Vite thành công |
| `cd mobile && npm run typecheck && npm run lint` | **Đạt** — không lỗi |

Node v22.23.1, npm 10.9.8. Lần chạy này thực hiện sau khi sửa CSS breakpoint
681–900 px và thêm test hồi quy.

## Demo phần bổ sung trên database đã setup

Không tạo database sạch mới trong lần này. Môi trường là project non-production
đã chạy `setup:supabase` ở các bước trước; kịch bản dùng **một hiện vật tạm** duy
nhất và xóa ở cuối. Kết quả chi tiết nằm trong
[P8-02-evidence.json](./evidence/P8-02/P8-02-evidence.json).

| Bước | Kết quả |
| --- | --- |
| `GET /api/health`, đăng nhập admin qua UI | 200; token được lưu, 401 cho sai mật khẩu/token |
| `POST /api/admin/artifacts` + 5 bản dịch | 201, 5/5 `PUT translations` trả 204 |
| Mở map công khai | Ghim tạm xuất hiện đúng khu và tọa độ đã lưu; 7 khu/8+1 hiện vật trong lần chạy |
| `POST /api/analytics/pageview` | 204; chỉ gửi `visitor_id` và `path` |
| `GET /api/admin/analytics/summary?days=7|30` | 200; `daily.length` = 7/30 |
| `DELETE /api/admin/artifacts/:id` | 204; chi tiết sau đó 404, ghim biến mất khỏi map |
| Đăng xuất | Token bị xóa, quay lại `/admin/login` |
| Responsive map 320/375/390/768/1440 | `scrollWidth === innerWidth` ở cả 5 mức; 7 khu/8 ghim |

Hiện vật tạm được xóa trong `finally` của harness. Nếu bước xóa chính thất bại,
script vẫn gọi dọn trước khi kết thúc; lần này không cần dọn bổ sung.

## Lỗi phát hiện trong QA và đã sửa

- Tràn 27 px ở 768 px do `.header-preferences`; đã thêm rule cho 681–900 px trong
  `web/src/styles.css` và assertion trong `web/src/styles.responsive.test.ts`.
- `404 /favicon.ico` trong `vite preview` là lỗi tài nguyên tĩnh, không ảnh hưởng
  API/UI; ghi nhận trong báo cáo P8-02 thay vì bỏ qua.

## Giới hạn chưa chuyển thành Pass

- Không có Android/iOS thật: MOB-20…MOB-25 và AC-25/AC-26 trên mobile vẫn
  `Blocked` (xem [checklist](../../mobile/docs/MOBILE-TEST-CHECKLIST.md)).
- Không có NVDA/Orca/VoiceOver/TalkBack thật; chỉ kiểm chứng nhãn DOM và focus
  bằng bàn phím.
- 30 ngày đầu analytics là seed, không phải truy cập thật.
- Chưa triển khai bản production riêng; conclusion chỉ áp dụng cho non-production.

## Kết luận

Các lệnh chốt của #31 đều đạt. Kịch bản admin → ghim → analytics → map web →
xóa chạy ổn trên môi trường non-production. Cùng với #28/#29/#30 hoàn tất, epic
#7 có thể đóng; phần thiết bị thật vẫn là công việc xác minh riêng, không phải lỗi
code chặn demo.

Toàn bộ thay đổi được commit và push trên nhánh `kietbuideptrai/backend-supabase`; xem `git log -1` để lấy hash cụ thể.
