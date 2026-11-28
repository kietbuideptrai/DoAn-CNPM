# Mobile

Ứng dụng Expo/React Native: danh sách, tìm kiếm, quét QR, chi tiết hiện vật,
nghe thuyết minh, yêu thích, cỡ chữ và tab **Bản đồ** (7 khu/8 ghim). Giao diện
đổi theo ngôn ngữ đã chọn (vi/en/zh/ja/ko).

## Cài đặt

```bash
npm install
cp .env.example .env.local
npm start
```

Quét QR của Expo bằng **Expo Go** trên điện thoại.

## Biến môi trường

| Biến | Mô tả |
| --- | --- |
| `EXPO_PUBLIC_DEMO_MODE` | `false` để dùng backend thật; `true` để dùng dữ liệu mẫu. |
| `EXPO_PUBLIC_API_URL` | URL backend. Điện thoại thật dùng IP LAN, ví dụ `http://192.168.1.18:3000`. |

Điện thoại và máy tính phải cùng mạng; `localhost` không dùng được từ điện thoại.
Sau khi đổi biến, khởi động lại Expo.

## Bản đồ

Tab thứ 6 gọi `GET /api/museum/map?lang=<ngôn ngữ>` và vẽ sơ đồ bằng `View`
tuyệt đối (không cần dependency SVG). Nhấn ghim hoặc tên hiện vật trong danh
sách theo khu để mở thuyết minh. Khi `EXPO_PUBLIC_DEMO_MODE=true`, app dùng
`shared/demoMuseumMap.ts` — cùng nguồn dữ liệu với web demo.

## Kiểm tra

```bash
npm run typecheck
npm run lint
```

Kiểm thử trên máy thật theo
[checklist mobile](docs/MOBILE-TEST-CHECKLIST.md): quyền camera, QR
đúng/sai, TTS native, VoiceOver/TalkBack và 6 tab trên màn hình hẹp. Voice
phụ thuộc gói giọng nói của hệ điều hành; app không tải sẵn audio. Kết quả
kiểm chứng bản đồ trong môi trường không có thiết bị được ghi tại
[docs/qa/P6-mobile-map-verification.md](../docs/qa/P6-mobile-map-verification.md).

## Ghi chú

- Tab Cá nhân chứa ngôn ngữ, cỡ chữ và giao diện sáng/tối.
- Yêu thích, lịch sử dịch câu và cỡ chữ lưu trên thiết bị.
- Lịch sử xem và điều chỉnh tốc độ TTS ngoài phạm vi MVP.
