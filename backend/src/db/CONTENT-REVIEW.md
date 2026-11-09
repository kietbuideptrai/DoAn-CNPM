# Nội dung mẫu: checklist rà soát

Đây là bản nháp kỹ thuật, chưa được người phụ trách nội dung hoặc biên dịch viên
duyệt. Không dùng làm nội dung chính thức. Người duyệt cần đối chiếu với hồ sơ
hiện vật và thuyết minh được Bảo tàng Chứng tích Chiến tranh phê duyệt.

## Kiểm kê

Seed có 8 hiện vật; mỗi hiện vật có bản nháp `vi`, `en`, `zh`, `ja`, `ko`.
Đối chiếu sơ bộ cho thấy các bản dịch thường giữ cùng chủ đề và các ý chính,
nhưng đây không phải hiệu đính chuyên môn bởi người thông thạo từng ngôn ngữ.

### Điểm không nhất quán cần xử lý

- `phao-155mm`: tiếng Việt chỉ ghi “Pháo 155 mm”; tiếng Anh, Trung, Nhật và Hàn
  gọi cụ thể là howitzer/lựu pháo. Cần xác minh biến thể hiện vật với bảo tàng
  trước khi thống nhất thuật ngữ ở cả năm ngôn ngữ.

| Slug | Các chi tiết cần xác minh với hồ sơ bảo tàng |
| --- | --- |
| `uh-1-huey` | Vai trò/nhiệm vụ được gán cho hiện vật; vị trí trưng bày ngoài trời; tên chính thức ở cả 5 ngôn ngữ. |
| `f-5a` | Biến thể F-5A, mô tả siêu âm/hạng nhẹ, các lực lượng được nêu và tên chính thức. |
| `m48-patton` | Biến thể xe, pháo 90 mm, lực lượng sử dụng và cách gọi chính trị-lịch sử tương ứng giữa các bản dịch. |
| `a-1-skyraider` | Vai trò cường kích/yểm trợ, thời kỳ sử dụng và tên chính thức ở cả 5 ngôn ngữ. |
| `may-chem` | Niên đại, bối cảnh sử dụng và câu khẳng định về những người bị hành quyết; cần xác nhận trực tiếp từ hồ sơ/thuyết minh chính thức. |
| `chuong-cop-con-dao` | Tên gọi “chuồng cọp”, điều kiện giam giữ, mô hình cụ thể và sắc thái thuật ngữ ở các ngôn ngữ. |
| `blu-82` | Khối lượng xấp xỉ, cách gọi “bom 7 tấn”, phương thức triển khai và mục đích sử dụng. |
| `phao-155mm` | Loại pháo/biến thể (xem điểm không nhất quán bên trên), lực lượng sử dụng, vai trò và vị trí trưng bày. |

## Trạng thái duyệt

- Nội dung tiếng Việt: bản nháp, chờ người phụ trách nội dung duyệt.
- Tiếng Anh: bản nháp, chờ người hiệu đính tiếng Anh duyệt.
- Tiếng Trung: bản nháp, chờ người hiệu đính tiếng Trung duyệt.
- Tiếng Nhật: bản nháp, chờ người hiệu đính tiếng Nhật duyệt.
- Tiếng Hàn: bản nháp, chờ người hiệu đính tiếng Hàn duyệt.
- Các chi tiết lịch sử trong bảng cần được xác minh bằng hồ sơ bảo tàng trước
  khi duyệt bản dịch.

## Hình ảnh

Seed chỉ dùng URL `placehold.co` để phát triển; ảnh này không đại diện cho hiện
vật và không được xem là ảnh được cấp quyền. Trạng thái nguồn và giấy phép của
từng ảnh được ghi trong [`image-sources.json`](./image-sources.json). URL trang
chủ bảo tàng được cung cấp làm nguồn tham khảo chung, không xác nhận nguồn gốc
hay quyền sử dụng của một ảnh cụ thể.

Chỉ thay placeholder và xuất bản hiện vật sau khi có URL ảnh cụ thể, nguồn,
giấy phép hoặc xác nhận cho phép sử dụng, cùng người duyệt. Không đưa ảnh lấy
từ website vào ứng dụng chỉ dựa trên việc dự án là đồ án cá nhân.
