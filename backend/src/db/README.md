# Database: schema, seed và kiểm tra

Backend kết nối PostgreSQL qua `DATABASE_URL`. Không dán connection string vào
chat, log, ảnh chụp hoặc commit.

## Môi trường local

```bash
bash backend/scripts/setup-local-db.sh
```

Script dựng container `studyhub-postgres`, tạo schema nếu chưa có, nạp
`seed.sql` (chỉ thêm bản ghi còn thiếu) và xuất bản 8 hiện vật bảo tàng.

## Supabase hoặc PostgreSQL khác

1. Xác nhận project là **non-production** và so project ref với host trong
   `DATABASE_URL`. Nếu không khớp, dừng lại.
2. Chỉ chạy `schema.sql` trên database trống. Nếu bảng đã tồn tại, xem lại kế
   hoạch migration thay vì chạy lại.
3. Chạy `seed.sql`. Script không ghi đè tên, ảnh, trạng thái xuất bản hay bản
   dịch đã có.
4. Xuất bản các hiện vật đã duyệt bằng `UPDATE artifacts SET is_published = TRUE`
   cho đúng slug; không xuất bản hàng loạt dữ liệu chưa rà soát.
5. Kiểm tra bằng `verify-seed.sql` và `verify-demo-readiness.sql` (chỉ đọc).
6. Gọi `/api/health`, `/api/languages` và `/api/artifacts?lang=vi|en|zh|ja|ko`.

## Kiểm tra nhanh

```sql
SELECT COUNT(*) AS artifacts, COUNT(*) FILTER (WHERE is_published) AS published
FROM artifacts;

SELECT language_code, COUNT(*)
FROM artifact_translations
GROUP BY language_code
ORDER BY language_code;
```

Mục tiêu tối thiểu: 3 hiện vật đã xuất bản, mỗi hiện vật đủ 5 ngôn ngữ. Bộ dữ
liệu hiện tại có 8 hiện vật và 40 bản dịch.

Nội dung và nguồn ảnh: [`CONTENT-REVIEW.md`](./CONTENT-REVIEW.md) và
[`image-sources.json`](./image-sources.json).
