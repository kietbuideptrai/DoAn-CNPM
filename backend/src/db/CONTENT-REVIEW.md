# Nội dung mẫu: bộ dữ liệu demo Supabase

Bộ seed hiện tại được xuất từ database demo Supabase ngày 2026-11-28. Dữ liệu
gồm 8 hiện vật, mỗi hiện vật có bản nháp `vi`, `en`, `zh`, `ja`, `ko`. Các bản
dịch chưa được biên tập viên hoặc người có chuyên môn kiểm chứng; không dùng làm
nội dung chính thức hoặc xuất bản.

## Kiểm kê nội dung cần đối chiếu

| Slug | Tên hiện vật | Nội dung cần kiểm chứng |
| --- | --- | --- |
| `a-1-skyraider` | Máy bay cường kích A-1 Skyraider | Niên đại, vai trò và thông số kỹ thuật. |
| `blu-82` | Bom BLU-82 (bom 7 tấn) | Thông số, mục đích sử dụng và bối cảnh lịch sử. |
| `chuong-cop-con-dao` | Mô hình chuồng cọp Côn Đảo | Bối cảnh lịch sử và cách hiển thị nội dung nhạy cảm. |
| `f-5a` | Máy bay chiến đấu F-5A | Niên đại, vai trò và thông số kỹ thuật. |
| `m48-patton` | Xe tăng M48 Patton | Niên đại, thông số và nguồn gốc hiện vật. |
| `may-chem` | Máy chém thời Pháp thuộc và chính quyền Ngô Đình Diệm | Niên đại, bối cảnh và cách trình bày nội dung nhạy cảm. |
| `phao-155mm` | Pháo 155 mm | Niên đại, thông số và nguồn gốc hiện vật. |
| `uh-1-huey` | Máy bay trực thăng UH-1 Huey | Niên đại, vai trò và thông số kỹ thuật. |

## Hình ảnh và trạng thái xuất bản

`seed.sql` tạo hiện vật mới ở trạng thái chưa xuất bản và không cập nhật bản ghi
đã có. `scripts/setup-local-db.sh` xuất bản 8 slug này cho môi trường demo local.
Ảnh hiện tại là ảnh giữ chỗ; quyền sử dụng ảnh thật chưa được xác nhận. Trạng
thái nguồn ảnh được ghi trong [`image-sources.json`](./image-sources.json).
