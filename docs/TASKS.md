# Backlog MVP — Thuyết minh đa ngôn ngữ

Backlog này phản ánh PRD 1.1 và hiện trạng code đã rà soát ngày 2026-11-02, cập nhật kiểm tra ngày 2026-11-16. Ưu tiên luồng QR → nội dung hiện vật → đổi ngôn ngữ → nghe thuyết minh. CMS, lịch sử xem và tốc độ TTS không phải mục tiêu MVP; code liên quan đang có được giữ nguyên, không mở rộng hoặc xóa trong các task này.

## Hiện trạng đã kiểm tra (2026-11-16)

| Khu vực | Trạng thái hiện tại |
| --- | --- |
| Web | Có trang chủ, danh sách, chi tiết, chọn ngôn ngữ, fallback tiếng Anh có xác nhận, TTS và demo data; `npm run build` đạt; `npm test` đạt **52/52** với cấu hình test độc lập `.env.local`. Tìm kiếm demo đã khớp tên Việt/Anh độc lập ngôn ngữ hiển thị. |
| Mobile | Có danh sách, tìm kiếm, quét QR, quyền camera, chi tiết, TTS, fallback tiếng Anh có xác nhận và lưu ngôn ngữ; `npm run typecheck` và `npm run lint` đạt. Chưa có automated test suite riêng; cần kiểm thử trên thiết bị thật theo `docs/MOBILE-TEST-CHECKLIST.md`. |
| Backend | Có API đọc hiện vật/ngôn ngữ và PostgreSQL pool; `GET /api/health` kiểm tra backend và database riêng biệt. `npm run build` đạt; `npm test` đạt **14/14**. |
| Dữ liệu | `seed.sql` và web/mobile demo có 8 hiện vật tham khảo chuyên mục “Hiện vật kể chuyện” của Bảo tàng Hồ Chí Minh, mỗi hiện vật có bản nháp 5 ngôn ngữ và ảnh giữ chỗ. `backend/data/noi-dung-bao-tang.csv` đọc được UTF-8 với 40 dòng (8 slug × 5 ngôn ngữ). Đã thêm `backend/src/db/seed-demo.sql` cho database tượng trưng: 8 hiện vật hư cấu đã công bố, đủ 5 ngôn ngữ, slug `demo-`, ảnh `placehold.co`; có test an toàn và script kiểm tra riêng. Nội dung/bản dịch thật vẫn chưa được chuyên gia duyệt; chưa xác minh dữ liệu thực trên Supabase trong lần rà soát này. |
| Phạm vi cũ | `docs/TASKS.md` trước đây còn giao CMS, upload ảnh và lịch sử xem như việc cần làm; các mục này không còn là tiêu chí MVP theo PRD 1.1. |

## P0 — Chặn build/test và tích hợp

| ID | Task | Trạng thái | Phụ trách đề xuất | Tiêu chí hoàn thành |
| --- | --- | --- | --- | --- |
| P0-01 | Làm cho web tests độc lập với `.env.local` | Hoàn thành — 52/52 test qua ngày 2026-11-16 | Web | `cd web && npm test` chạy ổn định với cấu hình demo local; test không phụ thuộc URL hoặc secret của môi trường cá nhân. |
| P0-02 | Giải quyết mismatch cấu hình TypeScript backend | Hoàn thành — `npm run build` đạt ngày 2026-11-16 | Backend | `backend/tsconfig.json` dùng `ignoreDeprecations: "5.0"` tương thích TypeScript đang cài; build không còn lỗi. |

## P1 — Hoàn thành yêu cầu MVP cốt lõi

| ID | Task | Trạng thái | Phụ trách đề xuất | Tiêu chí hoàn thành |
| --- | --- | --- | --- | --- |
| P1-01 | Sửa tìm kiếm backend theo tên Việt và Anh | Hoàn thành | Backend | `q` tìm trong `artifacts.name` và title bản dịch `en`, không phân biệt hoa/thường, khớp một phần; kết quả không phụ thuộc `lang` đang hiển thị. Bổ sung test cho tìm Việt/Anh khi chọn `vi`, `en` và một ngôn ngữ khác; giữ lọc hiện vật đã xuất bản. |
| P1-02 | Hoàn thiện bộ dữ liệu nghiệm thu | Chặn — nội dung và bản dịch cần duyệt; project ref trong cấu hình chưa khớp | Backend + Nội dung | Có ít nhất 3 hiện vật với đủ 5 bản dịch `vi/en/zh/ja/ko`, dữ liệu được người phụ trách rà soát. CSV UTF-8 chứa 8 hiện vật tham khảo Bảo tàng Hồ Chí Minh; seed dùng ảnh giữ chỗ vì chưa xác nhận quyền sử dụng ảnh gốc. Cần duyệt nội dung, xác nhận project ref non-production khớp cấu hình, sau đó import/seed có kiểm soát và xác nhận API; không ghi đè dữ liệu hiện có ngoài dự kiến. Chưa chạy database/API. Đã có `seed-demo.sql` cho demo tượng trưng trên project riêng, nhưng không thay thế dữ liệu nghiệm thu thật. |
| P1-03 | Bổ sung fallback tiếng Anh có xác nhận trên web | Hoàn thành | Web | Khi thiếu bản dịch đã chọn nhưng có `en`, hiện đúng popup theo PRD. “Xem tiếng Anh” tải nội dung tiếng Anh, ghi nhãn rõ tiếng Anh nhưng không đổi lựa chọn/ngôn ngữ URL đã lưu; “Hủy” không tự đổi ngôn ngữ. Nếu thiếu cả `en`, hiện trạng thái không có nội dung. Đặt thuộc tính `lang` theo nội dung thực tế; TTS không tự phát. Có test cho đủ các nhánh. |
| P1-04 | Đưa TTS web về đúng trạng thái và thông báo PRD | Hoàn thành | Web | Đổi ngôn ngữ/rời trang dừng voice và hàng đợi; không có nhiều lượt đọc chồng; không hiện “đang phát” trước khi engine bắt đầu; thiếu voice hoặc lỗi do thiếu voice hiển thị chính xác “Hiện giờ chưa có voice”, vẫn giữ văn bản. Có thể thử phát lại và kiểm tra voice lại. Bổ sung test cho đổi ngôn ngữ, unmount, thiếu voice và lỗi phát. |
| P1-05 | Bổ sung trạng thái readiness backend/database | Hoàn thành | Backend | `/api/health` kiểm tra backend và database riêng biệt, trả trạng thái có ý nghĩa khi DB không kết nối được và không làm lộ connection string/chi tiết bí mật. Có test cho DB thành công/thất bại; tài liệu hướng dẫn dùng endpoint trước demo được cập nhật. |
| P1-06 | Chốt vận hành dữ liệu và kiểm tra Supabase | Chặn — cần xác nhận project ref và chạy seed có kiểm soát | Backend | Schema `artifacts`, `artifact_translations`, `admin_users` đã tạo trên non-production. CSV `backend/data/noi-dung-bao-tang.csv` hiện đọc được UTF-8 (40 dòng, 8 slug × 5 ngôn ngữ). Còn lại: đối chiếu `DATABASE_URL` với project ref non-production, duyệt nội dung/ảnh, chạy seed và xác nhận API. Không chạy schema/seed trên database chưa xác nhận. |
| P1-07 | Bổ sung fallback tiếng Anh có xác nhận trên mobile | Đã code — chờ kiểm thử thiết bị (P2-03) | Mobile | Khi thiếu bản dịch đã chọn nhưng có `en`, app hiện hộp thoại đúng nội dung PRD; “Xem tiếng Anh” tải nội dung tiếng Anh và ghi rõ đang hiển thị tiếng Anh nhưng không đổi ngôn ngữ đã chọn; “Hủy” không tự chuyển ngôn ngữ; TTS dùng đúng ngôn ngữ nội dung và không tự phát. |
| P1-08 | Đưa thông báo thiếu voice trên mobile về đúng PRD | Đã code — chờ kiểm thử thiết bị (P2-03) | Mobile | Khi thiếu voice, app hiển thị chính xác “Hiện giờ chưa có voice”, giữ nguyên văn bản và có nút kiểm tra lại giọng đọc; không tự dùng voice ngôn ngữ khác. |

## P2 — Nghiệm thu trải nghiệm web/mobile

| ID | Task | Trạng thái | Phụ trách đề xuất | Tiêu chí hoàn thành |
| --- | --- | --- | --- | --- |
| P2-01 | Kiểm thử responsive mobile-first trên web | Chưa làm | Web | Kiểm tra viewport 320, 375, 390, 768 và 1440 CSS px; không cuộn ngang ngoài ý muốn, cắt/chồng nội dung; ảnh không méo; popup, ngôn ngữ và điều khiển TTS dùng được. Lưu kết quả Pass/Fail và thiết bị/trình duyệt. |
| P2-02 | Kiểm thử accessibility web | Chưa làm | Web | Hoàn thành luồng chính bằng bàn phím; focus nhìn thấy, popup quản lý/trả focus; zoom 200% không mất chức năng; chữ chính ≥16 CSS px, tương phản văn bản thường ≥4.5:1, nút chính có vùng chạm ≥44×44 CSS px; kiểm tra screen reader, heading, alt text và `lang`. Ghi lại kết quả, sửa lỗi phát hiện. |
| P2-03 | Kiểm thử luồng mobile trên thiết bị thật | Chưa làm | Mobile | Trên Android/iOS mục tiêu, kiểm tra quyền camera (cho phép/từ chối), QR đúng/sai, slug không tồn tại, mất mạng/thử lại, đổi ngôn ngữ khi TTS đang chạy, rời màn hình khi đang đọc, thiếu voice và VoiceOver/TalkBack. Ghi thiết bị/OS và kết quả. |
| P2-04 | Đồng bộ tài liệu checklist mobile với phạm vi MVP | Hoàn thành ngày 2026-11-16 | Mobile + QA | `docs/MOBILE-TEST-CHECKLIST.md` tách rõ case bắt buộc, case Should và mục ngoài MVP; có tìm tiếng Việt/Anh độc lập ngôn ngữ, fallback có xác nhận, TTS dừng đúng lúc, thiếu voice và accessibility; có cột trạng thái cùng phần ghi thiết bị/OS. |
| P2-05 | Đo mục tiêu tải nội dung trong điều kiện xác định | Chưa làm | Cả nhóm | Chọn và ghi thiết bị, trình duyệt, mạng di động; đo từ lúc mở URL hiện vật đến khi nội dung chính hiển thị. Báo kết quả so với mục tiêu ≤3 giây, không tuyên bố đạt nếu chưa đo. |

## P3 — Đóng gói demo và bàn giao

| ID | Task | Trạng thái | Phụ trách đề xuất | Tiêu chí hoàn thành |
| --- | --- | --- | --- | --- |
| P3-01 | Chạy kiểm thử nghiệm thu xuyên suốt | Chưa làm | Cả nhóm | Kiểm tra QR → trang hiện vật → đổi ngôn ngữ → TTS trên web và app, cùng các nhánh lỗi trong AC của PRD. Ghi bug, kết quả và bằng chứng; không dùng chế độ demo để tuyên bố database đã kết nối. |
| P3-02 | Chuẩn bị bản demo triển khai và QR | Chưa làm | Web + Backend + Mobile | Cấu hình URL HTTPS, CORS và môi trường không chứa secret trong repo; mở trực tiếp/tải lại URL QR thành công; app trên điện thoại truy cập được backend. Có cách dự phòng local khi dịch vụ demo không sẵn sàng. |
| P3-03 | Hoàn thiện hướng dẫn chạy và bàn giao | Hoàn thành ngày 2026-11-16 | Cả nhóm | `README.md` ở thư mục gốc hướng dẫn web demo/API thật, backend + Supabase, mobile Expo Go, biến môi trường, kiểm thử/build và các lưu ý dữ liệu; liên kết tới README từng phần và checklist mobile. Đã thêm `backend/.env.example` chỉ chứa placeholder, không có secret. Đã chạy lại `web npm test` (52/52) và `npm run build`, `backend npm test` (14/14) và `npm run build`, `mobile npm run typecheck` và `npm run lint` — tất cả đạt. |

## Không nằm trong backlog MVP

- Không triển khai hoặc mở rộng CMS, đăng nhập quản trị, CRUD qua giao diện, upload ảnh qua CMS.
- Không mở rộng lịch sử xem hoặc điều chỉnh tốc độ TTS.
- Không xóa các phần CMS/lịch sử đã có nếu chưa đánh giá phụ thuộc và chưa có yêu cầu riêng.
- Yêu thích và chỉnh cỡ chữ mobile là Should; chỉ làm sau P0/P1 và các kiểm thử nghiệm thu bắt buộc.

## Thứ tự đề xuất

1. P0-02 để backend build được; P0-01 để suite web ổn định.
2. P1-01, P1-02 để chốt tìm kiếm và nội dung mẫu.
3. P1-03, P1-04 để hoàn thiện fallback và TTS web theo PRD.
4. P1-05, P1-06 và P2-01–P2-05 để xác minh database, responsive và accessibility.
5. P3-01–P3-03 trước buổi demo/nghiệm thu.

Task không được đánh dấu hoàn thành chỉ vì code đã tồn tại; cần đạt tiêu chí và có kết quả kiểm thử tương ứng.
