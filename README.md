# Thuyết minh hiện vật đa ngôn ngữ

Đây là ứng dụng giới thiệu hiện vật bảo tàng bằng mã QR. Người tham quan có thể mở trang hiện vật, chọn ngôn ngữ, đọc nội dung hoặc nghe thuyết minh bằng giọng nói.

Ứng dụng hỗ trợ năm ngôn ngữ: Tiếng Việt, English, 中文, 日本語 và 한국어.

## Dành cho người xem demo

Cách đơn giản nhất là chạy **website demo**. Website dùng sẵn dữ liệu mẫu trong máy, nên không cần cài database, tạo tài khoản Supabase hay chạy backend.

Bạn cần có:

- Máy tính cài Node.js bản LTS. Kiểm tra bằng lệnh `node --version` trong Terminal hoặc Command Prompt.
- Trình duyệt hiện đại như Chrome, Edge, Firefox hoặc Safari.

### Mở website demo

1. Mở Terminal trong thư mục dự án này.
2. Chạy lần lượt các lệnh sau:

   ```bash
   cd web
   npm install
   cp .env.example .env.local
   npm run dev
   ```

   Trên Windows Command Prompt, thay lệnh `cp .env.example .env.local` bằng:

   ```bat
   copy .env.example .env.local
   ```

3. Terminal sẽ hiện một địa chỉ tương tự `http://localhost:5173/`.
4. Giữ Terminal đang chạy, mở địa chỉ đó bằng trình duyệt.
5. Khi muốn dừng demo, quay lại Terminal và bấm `Ctrl + C`.

> Nếu chỉ cần trình bày đồ án, bạn chỉ cần chạy phần `web/`. Cấu hình mẫu đã bật `VITE_DEMO_MODE=true` nên không cần backend.

### Cách dùng website

1. Ở trang chủ, chọn **Khám phá hiện vật** hoặc mở mục **Hiện vật**.
2. Gõ tên hiện vật vào ô tìm kiếm. Có thể tìm bằng tên tiếng Việt hoặc tên tiếng Anh, không phân biệt chữ hoa/chữ thường.
3. Bấm vào một thẻ hiện vật để xem chi tiết.
4. Chọn ngôn ngữ ở đầu trang. Lựa chọn này được ghi nhớ cho lần mở tiếp theo.
5. Bấm **Nghe thuyết minh** để nghe nội dung. Bạn có thể tạm dừng, tiếp tục hoặc dừng.
6. Nếu thiết bị không có giọng đọc phù hợp, trang vẫn hiển thị nội dung chữ và báo **“Hiện giờ chưa có voice”**.

Để mở trực tiếp một hiện vật, dùng địa chỉ có dạng:

```text
http://localhost:5173/artifacts/<slug>
```

Ví dụ, `http://localhost:5173/artifacts/demo-trong-dong?lang=en` sẽ mở hiện vật mẫu với nội dung tiếng Anh.

### Lưu ý khi nghe thuyết minh

- Âm thanh chỉ bắt đầu sau khi bạn bấm nút nghe.
- Kiểm tra âm lượng máy tính và tab trình duyệt trước khi demo.
- Voice phụ thuộc vào hệ điều hành và các gói ngôn ngữ đã cài. Tiếng Việt/Anh thường có sẵn hơn Trung, Nhật, Hàn.
- Khi đổi ngôn ngữ hoặc rời trang hiện vật, phần đọc đang chạy sẽ dừng để không đọc chồng nội dung.

### Nếu website không mở được

| Hiện tượng | Cách xử lý |
| --- | --- |
| Báo `npm` hoặc `node` không tồn tại | Cài Node.js LTS, đóng và mở lại Terminal. |
| Cổng 5173 đang được dùng | Dừng tiến trình web cũ bằng `Ctrl + C`, hoặc chạy `npm run dev -- --port 5174` rồi mở địa chỉ Terminal in ra. |
| Trang trống hoặc lỗi tải dữ liệu | Dừng server, kiểm tra `web/.env.local` có `VITE_DEMO_MODE=true`, rồi chạy lại `npm run dev`. |
| Không nghe tiếng | Bấm nút nghe một lần nữa, kiểm tra âm lượng/voice của hệ điều hành và thử bằng Chrome hoặc Edge. |

## Demo ứng dụng trên điện thoại

Ứng dụng mobile có danh sách hiện vật, tìm kiếm, quét QR, yêu thích, tùy chọn cỡ chữ và nghe thuyết minh. Demo mobile cũng dùng dữ liệu mẫu cục bộ, không cần backend.

Bạn cần điện thoại Android hoặc iPhone, cài **Expo Go**, cùng Wi-Fi với máy tính.

1. Mở Terminal trong thư mục dự án và chạy:

   ```bash
   cd mobile
   npm install
   cp .env.example .env.local
   npm start
   ```

   Trên Windows Command Prompt, dùng `copy .env.example .env.local`.

2. Chờ Terminal hiện QR do Expo tạo.
3. Mở Expo Go trên điện thoại và quét QR đó.
4. Vào tab **Hiện vật** để duyệt nội dung, hoặc tab **QR** để quét QR của một URL hiện vật.
5. Khi ứng dụng hỏi quyền camera, chọn cho phép nếu muốn dùng chức năng quét.

> `localhost` chỉ dùng được trên chính máy tính. Nếu sau này chạy mobile với backend local, điện thoại cần dùng IP mạng LAN của máy tính, ví dụ `http://192.168.1.10:3000`.

## Điều đang được demo

| Có thể trải nghiệm | Ý nghĩa |
| --- | --- |
| Danh sách và tìm kiếm | Tìm theo tên tiếng Việt hoặc tiêu đề tiếng Anh. |
| Chi tiết hiện vật | Mở theo đường dẫn `/artifacts/<slug>`. |
| Đa ngôn ngữ | Chuyển giữa năm ngôn ngữ được hỗ trợ. |
| Giọng nói | Đọc nội dung bằng voice sẵn có của trình duyệt hoặc điện thoại. |
| Xử lý thiếu bản dịch | Hỏi người dùng trước khi dùng tiếng Anh thay thế. |
| Trạng thái lỗi | Hiển thị tải dữ liệu, không tìm thấy hiện vật và lỗi mạng có nút thử lại. |

## Lưu ý về dữ liệu demo

- Dữ liệu hiện vật và năm bản dịch là **nội dung mẫu nháp**; chưa phải nội dung được bảo tàng/chuyên gia xác nhận để công bố.
- Ảnh là ảnh giữ chỗ cho mục đích demo; chưa được xác nhận quyền sử dụng ảnh hiện vật thật.
- Chế độ demo web/mobile chạy không cần database. Vì vậy, nó không chứng minh một Supabase hoặc backend triển khai bên ngoài đang hoạt động.

## Dành cho người phát triển hoặc tích hợp API

Repository gồm các phần sau:

| Thư mục | Vai trò |
| --- | --- |
| `web/` | Website React + Vite. |
| `mobile/` | Ứng dụng React Native + Expo. |
| `backend/` | REST API Express + PostgreSQL/Supabase. |
| `shared/` | Kiểu dữ liệu dùng chung và dữ liệu demo. |
| `docs/` | Yêu cầu, backlog, checklist và báo cáo kiểm thử. |

### Chạy backend với database thật

Chỉ thực hiện khi bạn có một database Supabase/PostgreSQL **phi production đã được xác nhận**. Không dán `DATABASE_URL` vào chat, ảnh chụp hay commit vào Git.

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Trước khi seed hoặc tạo schema, đọc kỹ [hướng dẫn an toàn database](backend/src/db/README.md). Sau khi chạy API, mở `http://localhost:3000/api/health`; chỉ khi HTTP 200 và cả `backend`, `database` đều là `ok` thì API mới sẵn sàng.

Để web dùng API thay cho demo data, đặt trong `web/.env.local`:

```env
VITE_DEMO_MODE=false
VITE_API_URL=http://localhost:3000
```

Khởi động lại web sau khi sửa `.env.local`.

### Kiểm tra mã nguồn

```bash
cd web
npm test
npm run build

cd ../backend
npm test
npm run build

cd ../mobile
npm run typecheck
npm run lint
```

Mobile cần kiểm thử thêm trên điện thoại thật theo [checklist mobile](docs/MOBILE-TEST-CHECKLIST.md). Xem [PRD](docs/PRD.md), [backlog](docs/TASKS.md) và [bộ câu hỏi vấn đáp](docs/BAO-CAO-DO-AN.md) để hiểu phạm vi, tiến độ và giới hạn hiện tại.
