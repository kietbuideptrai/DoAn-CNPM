# P7-03 — Setup/reset Supabase (2026-11-28)

## Phạm vi

Kiểm chứng script setup/reset demo trên Supabase non-production (#16) bằng test
tĩnh và guard, không chạy lệnh ghi vào project thật.

## Kết quả

| Hạng mục | Kết quả |
| --- | --- |
| `npx tsx --test src/db/setup-supabase.test.ts` | 4/4 test pass |
| Đối chiếu mục tiêu | Bắt buộc `SUPABASE_PROJECT_REF`; từ chối nếu `DATABASE_URL` không khớp ref/host Supabase hoặc `NODE_ENV=production` |
| Thứ tự chạy | `schema.sql` → các `migrate-*.sql` → `seed.sql` → `seed-map.sql` → `seed:admin` → `seed:analytics` |
| Reset | Chỉ chạy với `--reset`, từ chối nếu thiếu `CONFIRM_RESET=supabase-non-production`; không thể dùng cùng `--seed-only` |
| Che giấu secret | Output lọc connection string và mật khẩu thành placeholder |

## Giới hạn

Chưa chạy script trên project Supabase thật; cần đối chiếu project ref và chạy
runbook trên project non-production đã duyệt trước nghiệm thu. Reset là thao tác
phá hủy và không được chạy trong kiểm thử tự động.
