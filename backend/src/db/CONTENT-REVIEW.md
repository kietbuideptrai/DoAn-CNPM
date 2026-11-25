# Nội dung mẫu: Bảo tàng Hồ Chí Minh

Đây là dữ liệu mẫu nháp được biên soạn lại từ các bài trong chuyên mục
[Hiện vật kể chuyện](https://baotanghochiminh.vn/hien-vat-ke-chuyen.htm). Các
mô tả không chép nguyên văn bài viết. Bản dịch tiếng Anh, Trung, Nhật và Hàn
cũng là bản nháp, chưa được biên tập viên/người có chuyên môn kiểm chứng; không
dùng làm nội dung chính thức hoặc xuất bản.

## Kiểm kê và nguồn tham khảo

Seed có 8 hiện vật, mỗi hiện vật có bản nháp `vi`, `en`, `zh`, `ja`, `ko`.
Thông tin lịch sử và tên hiện vật cần được đối chiếu với hồ sơ hiện vật và nội
dung do Bảo tàng Hồ Chí Minh phê duyệt trước khi duyệt bản dịch hoặc xuất bản.

| Slug | Nội dung cần kiểm chứng | Bài tham khảo |
| --- | --- | --- |
| `dong-hai-dong-1946` | Niên đại, mệnh giá, số lượng hiện vật và thông tin người hiến tặng. | [Đồng tiền Việt Nam Dân chủ Cộng hòa](https://baotanghochiminh.vn/hien-vat-ke-chuyen-dong-tien-nuoc-viet-nam-dan-chu-cong-hoa-in-hinh-chan-dung-chu-tich-ho-chi-minh.htm) |
| `me-con-ngay-gap-mat` | Tên tác phẩm, ngày và địa điểm chụp, danh tính nhân vật, bối cảnh trưng bày. | [Bức ảnh “Mẹ con ngày gặp mặt”](https://baotanghochiminh.vn/hien-vat-ke-chuyen-buc-anh-me-con-ngay-gap-mat.htm) |
| `tap-tho-trong-tuyen` | Tên tác giả, số lượng bài thơ, hoàn cảnh sáng tác và thời điểm tặng. | [Tập thơ Trọng Tuyển](https://baotanghochiminh.vn/hien-vat-ke-chuyen-tang-pham-tap-tho-trong-tuyen-kinh-tang-bac-ho.htm) |
| `bao-linh-kach-menh-so-2` | Tên báo, thời gian phát hành, cách in và vai trò lịch sử. | [Báo Lính kách mệnh số 2](https://baotanghochiminh.vn/hien-vat-ke-chuyen-bao-linh-kach-menh-so-2-thang-02-1927.htm) |
| `bo-do-an-chu-tich-ho-chi-minh` | Thành phần hiện vật, bối cảnh sử dụng và mô tả nếp sinh hoạt. | [Bộ đồ ăn của Chủ tịch Hồ Chí Minh](https://baotanghochiminh.vn/hien-vat-ke-chuyen-bo-do-an-cua-chu-tich-ho-chi-minh.htm) |
| `tui-dung-com-nuoc-ho-chi-minh` | Niên đại mua/sử dụng, chất liệu, kích thước và quá trình bàn giao. | [Túi đựng cơm và nước uống](https://baotanghochiminh.vn/hien-vat-ke-chuyen-tui-dung-com-va-nuoc-uong-cua-chu-tich-ho-chi-minh.htm) |
| `doi-guoc-go-ho-chi-minh` | Niên đại, chất liệu, kích thước và chi tiết cấu tạo. | [Đôi guốc gỗ mộc](https://baotanghochiminh.vn/hien-vat-ke-chuyen-doi-guoc-go-moc-cua-chu-tich-ho-chi-minh.htm) |
| `tranh-co-dong-cach-mang-thang-tam` | Tác giả, chất liệu, kích thước, nội dung hình ảnh và lịch sử hiến tặng. | [Tranh cổ động Cách mạng Tháng Tám và Quốc khánh 2/9](https://baotanghochiminh.vn/hien-vat-ke-chuyen-tranh-co-dong-tinh-than-cach-mang-thang-tam-va-quoc-khanh-2-9.htm) |

## Hình ảnh và trạng thái xuất bản

`seed.sql` tạo hiện vật mới ở trạng thái chưa xuất bản và không cập nhật bản ghi
đã có. `scripts/setup-local-db.sh` xuất bản 8 slug này cho môi trường demo local.
Ảnh gốc trên trang bảo tàng chưa được sử dụng vì chưa có xác nhận quyền sử dụng;
bộ dữ liệu dùng ảnh giữ chỗ trung tính. Trạng thái nguồn ảnh được ghi trong
[`image-sources.json`](./image-sources.json).

Trước khi xuất bản, cần xin phép sử dụng ảnh, rà soát nội dung tiếng Việt và
nhờ người có chuyên môn hiệu đính đủ năm ngôn ngữ. Việc bài viết/ảnh được đăng
công khai trên trang bảo tàng không tự nó xác nhận quyền tái sử dụng.
