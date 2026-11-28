# P8-01 — Đồng bộ tài liệu phần bổ sung (2026-11-29)

Issue #28. Phạm vi: PRD Phụ lục A, `docs/TASKS.md`, README gốc và ví dụ API.
Không ghi connection string, project ref, token hay mật khẩu thật vào tài liệu.

| Việc cần làm | Kết quả | Vị trí |
| --- | --- | --- |
| Kiểm tra PRD Phụ lục A khớp code | **Đạt** | `docs/PRD.md`: A.1 làm rõ bản đồ không dùng thư viện/GPS; thêm A.6 nêu trạng thái đã triển khai và dẫn tới bằng chứng P8-02. AC-19…AC-28 giữ nguyên để đối chiếu. |
| Cập nhật `docs/TASKS.md` trạng thái P4–P8 | **Đạt** | P4–P7 đã tick từ trước; P8-01…P8-04 được tick kèm link báo cáo. P0-06 và P3-04 cũng được sửa theo Supabase/test counts hiện tại. |
| Cập nhật README: tính năng mới, lệnh seed, tài khoản demo | **Đạt** | `README.md` dùng Supabase non-production làm luồng chính; có `npm run setup:supabase`, `seed:admin`, `seed:analytics`, fallback Podman, tab Bản đồ, demo mode và hướng dẫn đăng nhập admin. Tài khoản demo chỉ mô tả nguồn từ `backend/.env`, không nêu giá trị. |
| Cập nhật API samples | **Đạt** | `docs/api-samples.md` ghi rõ response map đã đối chiếu live 7 khu/8 hiện vật và mobile parse cùng shape; `docs/api-samples.json` bổ sung ghi chú tương tự. |
| Cập nhật số lượng test thực tế | **Đạt** | README và `docs/TASKS.md` dùng 45 test backend, 92 test web; mobile typecheck/lint. Báo cáo QA có bảng riêng tại P8-04 chốt 29/11. |

## Kiểm tra từ khóa

- Cụm “ngoài MVP” trong PRD chỉ còn ở ngữ cảnh MVP gốc (CMS/upload/tốc độ TTS)
  hoặc danh sách **ngoài phạm vi bổ sung** (upload ảnh, GPS, nhiều tầng…). Không
  còn câu nào nói admin/analytics/map là ngoài MVP.
- `README.md` không chứa connection string, project ref, anon key,
  `ADMIN_JWT_SECRET` hay mật khẩu admin; chỉ tên biến môi trường.
- `docs/api-samples.json` vẫn parse được bằng `python3 -m json.tool` sau chỉnh sửa.

## Kết luận

Issue #28 đạt phần tài liệu. Phần QA/ảnh và báo cáo demo nằm ở #29/#30; kết quả
test chốt ở #31.
