# P2-03 — Kiểm thử luồng mobile trên thiết bị thật

- **Ngày kiểm tra môi trường:** 2026-11-17
- **Trạng thái:** **Chặn (blocked)** — môi trường không có thiết bị Android/iOS,
  emulator hay công cụ điều khiển thiết bị
- **Kết quả:** **Không chạy được case nào** trong danh sách yêu cầu

## Vì sao chặn

Đã kiểm tra trực tiếp môi trường:

| Công cụ | Kết quả |
| --- | --- |
| `adb` | Không có trong `PATH` |
| `emulator` (Android SDK) | Không có |
| `xcrun` / Xcode (iOS) | Không có |
| `~/.android/avd` | Không tồn tại AVD nào |
| Thiết bị USB/kết nối mạng | Không có thiết bị nào được cung cấp |

Không thể thay thế bằng trình duyệt desktop thu nhỏ: các mục dưới đây phụ thuộc
vào quyền camera, TTS engine của hệ điều hành và screen reader của thiết bị.

## Các case **chưa** kiểm thử

Tất cả đều **chưa có kết quả**, không được đánh dấu Pass:

1. Quyền camera: cấp quyền thành công.
2. Quyền camera: từ chối quyền, app hiển thị hướng dẫn phù hợp.
3. Quét QR đúng → mở đúng trang hiện vật và ngôn ngữ.
4. Quét QR sai/không phải URL hiện vật → xử lý lỗi.
5. Slug không tồn tại → trạng thái 404 thân thiện.
6. Mất mạng → thông báo lỗi và nút **Thử lại** hoạt động.
7. Đổi ngôn ngữ khi TTS đang chạy → dừng voice/hàng đợi, đổi nội dung đúng.
8. Rời màn hình khi đang đọc → dừng voice.
9. Thiếu voice → hiển thị chính xác “Hiện giờ chưa có voice”, giữ văn bản.
10. VoiceOver (iOS) / TalkBack (Android): điều hướng, announcement, focus.

## Đã làm được (không thay thế kiểm thử thiết bị)

- `cd mobile && npm run typecheck` — **đạt**.
- `cd mobile && npm run lint` — **đạt**.
- Web E2E (P3-01) đã kiểm tra các nhánh logic tương ứng ở tầng web: QR URL →
  chi tiết, đổi ngôn ngữ khi đang đọc, rời trang khi đang đọc, thiếu voice,
  fallback tiếng Anh, 404, mất mạng/retry. Các kết quả này chứng minh logic dùng
  chung, **không** chứng minh hành vi native/permission/TTS engine trên máy thật.

## Cần gì để hoàn thành

- Thiết bị Android mục tiêu (kèm `adb`) **hoặc** iPhone mục tiêu (kèm macOS/Xcode
  và cáp), cài bản build thử nghiệm.
- Ghi lại: model, phiên bản OS, phiên bản app, ngôn ngữ hệ thống, TTS engine.
- Chạy 10 case trên, lưu ảnh/quay màn hình và Pass/Fail cho từng case.

Cho đến khi có các điều kiện trên, P2-03 giữ trạng thái **Chặn**, và P1-07/P1-08
vẫn ở trạng thái “chờ kiểm thử thiết bị”.
