# Web

Ứng dụng web dùng React, Vite và TypeScript. Các URL hiện vật dạng
`/artifacts/<slug>` được phục vụ bởi React Router; `vercel.json` rewrite các
đường dẫn về `index.html` để truy cập trực tiếp hoặc tải lại trang không trả 404.

## Yêu cầu

- Node.js phiên bản LTS
- npm

## Cài đặt

Từ thư mục `web/`:

```bash
npm install
cp .env.example .env.local
```

## Biến môi trường

| Biến | Mô tả | Ví dụ local |
| --- | --- | --- |
| `VITE_API_URL` | URL gốc của backend API | `http://localhost:3000` |
| `VITE_PUBLIC_URL` | URL gốc công khai của web, dùng để tạo liên kết hiện vật và mã QR | `http://localhost:5173` |
| `VITE_DEMO_MODE` | Dùng dữ liệu demo cục bộ thay cho API thật (`true` hoặc `false`) | `true` |

Đặt các URL gốc, không thêm dấu `/` ở cuối. Với môi trường triển khai, dùng URL
HTTPS thực tế của backend và domain Vercel tương ứng.

Khi `VITE_DEMO_MODE=true`, web dùng bộ dữ liệu 8 hiện vật trong
`shared/demoArtifacts.ts`, tham khảo chuyên mục [Hiện vật kể chuyện của Bảo tàng
Hồ Chí Minh](https://baotanghochiminh.vn/hien-vat-ke-chuyen.htm). Nội dung
tiếng Việt và các bản dịch tiếng Anh, Trung, Nhật, Hàn đều là bản nháp cần được
chuyên gia/bảo tàng kiểm chứng. Ảnh dùng hình giữ chỗ cho tới khi có xác nhận
quyền sử dụng ảnh hiện vật. Không cần backend hoặc database để chạy luồng tham
quan. Chế độ này chỉ thay API đọc công khai; đăng nhập và các thao tác quản trị
vẫn cần các endpoint backend tương ứng. Đặt thành `false` khi tích hợp backend
thật.

## Chạy local

```bash
npm run dev
```

Mở URL được Vite hiển thị (mặc định `http://localhost:5173`). Nếu thay đổi
`VITE_DEMO_MODE` trong `.env.local`, khởi động lại Vite để nạp cấu hình mới.
Khi `VITE_DEMO_MODE=false`, đảm bảo backend đang chạy tại URL cấu hình trong
`VITE_API_URL`.

## Kiểm thử

```bash
npm test
```

Vitest dùng cấu hình local cố định cho API/demo và không cần đọc URL hoặc secret
từ `.env.local`.

Thuyết minh chỉ bắt đầu sau thao tác bấm của người dùng. Khi đổi ngôn ngữ hoặc
rời trang hiện vật, giọng đọc và hàng đợi được dừng; nếu thiết bị thiếu voice
phù hợp, web giữ nguyên văn bản và hiển thị `Hiện giờ chưa có voice`. Nút kiểm
tra lại voice cho phép thử phát lại sau khi thiết bị tải/cài voice.

## Build production

```bash
npm run build
```

Build được tạo trong `dist/`.

## Triển khai lên Vercel

1. Import repository vào Vercel.
2. Đặt **Root Directory** là `web`.
3. Dùng framework preset **Vite**; build command là `npm run build`, output
   directory là `dist`.
4. Trong **Project Settings → Environment Variables**, cấu hình:
   - `VITE_API_URL`: URL HTTPS của backend đã triển khai.
   - `VITE_PUBLIC_URL`: domain công khai của web, ví dụ
     `https://studyhub.example.com` (không có dấu `/` cuối).
   - `VITE_DEMO_MODE=false` để dùng backend đã triển khai thay vì dữ liệu demo.
5. Triển khai lại sau khi thay đổi biến môi trường. Kiểm tra mở trực tiếp và tải
   lại một URL `/artifacts/<slug>` để xác nhận rewrite hoạt động.
