# Kịch bản báo cáo đồ án Công nghệ phần mềm

## 1. Thông tin cần điền trước khi báo cáo

- **Tên đề tài:** Hệ thống thuyết minh hiện vật đa ngôn ngữ qua mã QR.
- **Tên sinh viên / nhóm:** …
- **Vai trò từng thành viên:** … (Web / Mobile / Backend / dữ liệu, kiểm thử, tích hợp).
- **Giảng viên hướng dẫn:** …
- **Bản demo sẽ trình bày:** Web / Mobile / cả hai; chế độ dữ liệu demo cục bộ hay backend.
- **Thiết bị và ngày kiểm thử mobile:** … (nếu chưa kiểm thử, nói rõ là chưa).

> Các tài liệu trong repository chưa ghi tên thành viên, phân công thật, lịch sử các mốc phát triển hay giảng viên. Hãy điền các mục trên theo thực tế, đừng tự suy đoán.

## 2. Bài nói mở đầu (có thể dùng trực tiếp)

“Đồ án của nhóm em là **Hệ thống thuyết minh hiện vật đa ngôn ngữ qua mã QR**. Hệ thống hướng đến khách tham quan bảo tàng: khách quét mã QR trên hiện vật để mở nội dung tương ứng, chọn một trong năm ngôn ngữ Việt, Anh, Trung, Nhật, Hàn, sau đó đọc hoặc nghe thuyết minh bằng chức năng chuyển văn bản thành giọng nói. Đồ án gồm website, ứng dụng di động và backend dùng chung. Trong phần trình bày, em sẽ giới thiệu bài toán và yêu cầu, thiết kế hệ thống, cách triển khai, kết quả kiểm thử và các giới hạn còn lại.”

## 3. Thứ tự trình bày đề xuất

### Slide 1 — Đề tài và thành viên

- Tên đề tài, thành viên, vai trò từng người.
- Một câu giới thiệu sản phẩm và người dùng chính: khách tham quan bảo tàng.

### Slide 2 — Bài toán và mục tiêu

- Khách tham quan có thể không có hướng dẫn viên riêng; khách quốc tế gặp rào cản ngôn ngữ; một số người thuận tiện nghe hơn đọc.
- Mục tiêu: truy cập nhanh bằng QR, cung cấp nội dung đa ngôn ngữ, hỗ trợ đọc/nghe, dễ dùng trên điện thoại.
- Luồng cốt lõi: **QR → trang hiện vật → chọn ngôn ngữ → đọc/nghe**.

### Slide 3 — Đối tượng, phạm vi và yêu cầu

- Tác nhân MVP là **Visitor / khách tham quan**.
- Chức năng chính: danh sách và tìm kiếm, trang chi tiết theo slug, chọn/lưu ngôn ngữ, TTS, xử lý trạng thái tải/lỗi/không tìm thấy, fallback tiếng Anh có xác nhận khi thiếu bản dịch.
- Tìm kiếm theo tên tiếng Việt gốc hoặc tiêu đề tiếng Anh, không phân biệt hoa thường và không phụ thuộc ngôn ngữ đang xem.
- NFR: giao diện mobile-first, thao tác bàn phím/screen reader, phản hồi lỗi rõ ràng.
- CMS, upload ảnh qua giao diện và chức năng quản trị nội dung không thuộc phạm vi nghiệm thu MVP theo PRD 1.1. Code quản trị còn trong repository nhưng không nên trình bày là chức năng MVP đã hoàn thiện.

### Slide 4 — Use case và luồng chính

Trình bày sơ đồ Use Case (nếu có trong slide tự chuẩn bị) với tác nhân Khách tham quan và các ca sử dụng: xem/tìm hiện vật, quét QR, chọn ngôn ngữ, đọc nội dung, nghe/dừng TTS, thêm yêu thích nếu demo phần Should.

Giải thích hai kiểu vào trang hiện vật:

1. **Website:** QR in tại bảo tàng chứa URL web `/artifacts/<slug>`; camera điện thoại mở trang web trực tiếp.
2. **Ứng dụng:** người dùng mở tab Quét QR trong app; app kiểm tra URL HTTP(S) có đường dẫn `/artifacts/<slug>` rồi điều hướng đến chi tiết. Deep link mở thẳng app từ camera ngoài chưa nằm trong MVP.

### Slide 5 — Kiến trúc hệ thống

Mô tả sơ đồ ba tầng:

```text
Website React + Vite ─┐
                      ├── REST/JSON API (Express + TypeScript) ── PostgreSQL/Supabase
Mobile React Native ──┘
```

- Web và mobile dùng chung hợp đồng dữ liệu TypeScript trong `shared/types.ts`.
- API cung cấp danh sách, chi tiết hiện vật, danh sách ngôn ngữ và health check.
- Database có các bảng chính `artifacts`, `artifact_translations`; schema cũng có `admin_users`.
- Với demo cục bộ, web/mobile có thể dùng dữ liệu mẫu nhúng; vì vậy cần phân biệt rõ đang demo local hay đang gọi API/database.

### Slide 6 — Công nghệ và lý do chọn

| Phần | Công nghệ | Cách giải thích |
| --- | --- | --- |
| Web | React, Vite, TypeScript | Xây giao diện theo component, phát triển và build gọn. |
| Mobile | React Native, Expo, TypeScript | Dùng chung hệ sinh thái React, tích hợp camera/QR và chạy thử với Expo Go. |
| Backend | Node.js, Express, TypeScript | Cung cấp REST API cho hai client. |
| Cơ sở dữ liệu | PostgreSQL/Supabase | Lưu hiện vật và các bản dịch theo ngôn ngữ. |
| TTS | Web Speech API và `expo-speech` | Dùng giọng đọc có sẵn trên trình duyệt/thiết bị, không cần máy chủ tạo audio; voice tùy nền tảng. |

Nêu đây là lựa chọn phù hợp phạm vi đồ án; không cần microservices, Kubernetes hay dịch thuật AI cho MVP.

### Slide 7 — Thiết kế dữ liệu và API

- `artifacts`: slug duy nhất, tên gốc, ảnh, danh mục, trạng thái xuất bản.
- `artifact_translations`: khóa ngoại tới hiện vật, mã ngôn ngữ giới hạn `vi/en/zh/ja/ko`, tiêu đề, tóm tắt, nội dung; mỗi hiện vật chỉ có một bản dịch cho mỗi ngôn ngữ.
- `GET /api/languages`: trả các ngôn ngữ hỗ trợ.
- `GET /api/artifacts?lang=vi&q=...`: danh sách theo ngôn ngữ, tùy chọn tìm kiếm; chỉ hiện vật đã xuất bản.
- `GET /api/artifacts/:slug?lang=vi`: chi tiết, bản dịch yêu cầu (có thể rỗng), và các ngôn ngữ sẵn có.
- `GET /api/health`: kiểm tra trạng thái backend và database riêng; trả 200 khi cả hai sẵn sàng, 503 khi database không truy cập được, không trả thông tin kết nối.
- Có thể mở `docs/api-samples.json` để minh họa cấu trúc response.

### Slide 8 — Các quyết định xử lý tình huống

- Thiếu bản dịch đã chọn nhưng có tiếng Anh: hỏi khách trước khi tải tiếng Anh; ghi rõ nội dung đang hiển thị là tiếng Anh; không đổi lựa chọn ngôn ngữ đã lưu.
- Thiếu cả bản dịch và tiếng Anh: báo nội dung chưa khả dụng, không để màn hình trắng.
- TTS chỉ chạy khi người dùng bấm; dừng khi đổi ngôn ngữ hoặc rời trang; không để nhiều lượt đọc chồng nhau.
- Nếu thiết bị không có voice tương ứng: giữ nội dung văn bản và báo **“Hiện giờ chưa có voice”**, không tự đổi sang giọng/ngôn ngữ khác.
- Lỗi mạng có trạng thái dễ hiểu và nút thử lại; slug không tồn tại có trạng thái 404 thân thiện.

### Slide 9 — Quy trình phát triển và phối hợp

Tài liệu backlog ghi nhận nhóm chia phần theo Web, Mobile, Backend và Nội dung/QA. Trình bày đúng quy trình nhóm thực sự đã làm; repository không mô tả đủ lịch sử sprint hay lịch họp để khẳng định một mô hình Agile/Scrum cụ thể.

- Nêu cách phân chia đầu việc, cách tích hợp và công cụ nhóm thực sự dùng (Git, issue board, chat, review…).
- Dùng `docs/TASKS.md` để chỉ ra cách theo dõi yêu cầu theo mã, ưu tiên, tiêu chí hoàn thành và trạng thái.
- Nhấn mạnh task chỉ coi là xong khi có tiêu chí/kết quả kiểm thử tương ứng; phần bị chặn vẫn ghi rõ.
- Điền ví dụ khó khăn thật của nhóm và cách xử lý: …

### Slide 10 — Demo sản phẩm

Chọn một luồng ngắn, có chuẩn bị trước:

1. Mở danh sách hiện vật và tìm một hiện vật.
2. Mở chi tiết bằng QR hoặc URL có slug.
3. Đổi sang tiếng Anh hoặc một ngôn ngữ khác, chỉ ra nội dung và URL/nhãn ngôn ngữ cập nhật.
4. Bấm nghe, tạm dừng/tiếp tục, rồi đổi ngôn ngữ để minh họa TTS dừng.
5. Nếu có dữ liệu thiếu bản dịch trong môi trường demo, minh họa hộp thoại fallback; nếu không có, trình bày bằng ảnh/chạy kịch bản đã chuẩn bị và nói rõ đây là nhánh mô phỏng.

**Chuẩn bị:** mở sẵn app/trang, kiểm tra mạng và backend, làm nóng API bằng `/api/health`, chuẩn bị QR và dữ liệu. Có phương án video/ảnh chụp hoặc demo local nếu dịch vụ triển khai không sẵn sàng. Không đọc hoặc chiếu secret trong `.env`.

### Slide 11 — Kiểm thử và kết quả

Nêu kết quả đúng theo báo cáo QA hiện có (ngày 17/11/2026):

- **Web unit/component:** 52/52 test đạt; production build thành công.
- **Backend:** 14/14 test đạt; build thành công.
- **Mobile:** typecheck và lint đạt; chưa có automated test suite riêng.
- **Web responsive:** 20/20 case đạt ở viewport 320, 375, 390, 768, 1440 px.
- **Web accessibility:** axe không phát hiện vi phạm trên 10 tổ hợp trang/viewport; bàn phím, dialog, mô phỏng zoom 200% và tap target chính đạt. Chưa kiểm tra screen reader thật, nên kết quả chỉ một phần.
- **Web E2E:** 16/16 case đạt, gồm URL QR, đổi ngôn ngữ, TTS (mock), fallback, 404, mất mạng/thử lại và tìm kiếm.
- **Hiệu năng mô phỏng:** p95 468 ms tới khi nội dung hiện trong mô phỏng 4G + CPU 4×; web/API chạy local, chưa phải phép đo trên thiết bị/mạng thật.
- **Mobile thiết bị thật:** chưa kiểm thử do môi trường không có thiết bị/emulator; camera, quyền, TTS native và VoiceOver/TalkBack còn cần xác minh.

> Bộ test E2E chạy với `VITE_DEMO_MODE=false` và gọi API/database non-production, nhưng dữ liệu là 8 hiện vật `demo-*` hư cấu. Không dùng kết quả đó để nói rằng nội dung bảo tàng đã được nghiệm thu.

### Slide 12 — Dữ liệu, giới hạn và hướng phát triển

- Bộ seed tham khảo 8 hiện vật trong chuyên mục “Hiện vật kể chuyện” của Bảo tàng Hồ Chí Minh, có bản nháp 5 ngôn ngữ; bản dịch chưa được chuyên gia/bảo tàng duyệt.
- Ảnh hiện tại là ảnh giữ chỗ; quyền sử dụng ảnh hiện vật chưa được xác nhận.
- Chưa xác minh/seed dữ liệu thật trên Supabase trong lần rà soát; backlog ghi P1-02/P1-06 còn chặn do duyệt nội dung và xác nhận project ref non-production.
- Hướng phát triển: kiểm duyệt nội dung/bản dịch và bản quyền ảnh; hoàn tất kiểm thử app trên thiết bị Android/iOS; kiểm tra screen reader thật; đo hiệu năng trên mạng/thiết bị thật; triển khai bản demo ổn định; cân nhắc CMS sau MVP.
- Kết luận: sản phẩm đã hiện thực hóa luồng cốt lõi ở web và có mã mobile, backend; nêu rõ phạm vi đã xác minh và công việc còn lại.

## 4. Câu hỏi có thể được hỏi và câu trả lời gợi ý

### Vì sao nhóm chọn đề tài này?

“Nhóm chọn bài toán hỗ trợ khách tham quan tiếp cận thông tin hiện vật nhanh hơn, đặc biệt khi không có hướng dẫn viên hoặc có khác biệt ngôn ngữ. QR giúp mở đúng nội dung, còn đa ngôn ngữ và TTS hỗ trợ các nhu cầu tiếp nhận thông tin khác nhau.”

### Vì sao cần cả website và ứng dụng di động?

“Website cho phép khách quét QR bằng camera mặc định và mở nội dung mà không cần cài ứng dụng. Ứng dụng bổ sung trải nghiệm riêng như danh sách hiện vật, quét QR trong app, yêu thích và cài đặt cá nhân. Hai nền tảng gọi cùng API và dùng cùng mô hình dữ liệu.”

### Tại sao QR mở website mà không deep link vào ứng dụng?

“MVP ưu tiên URL web ổn định để khách không cần cài app. QR ngoài app mở trình duyệt; người dùng cũng có thể quét QR trong ứng dụng, app lấy slug từ URL và mở màn chi tiết. Deep link mở app trực tiếp chưa thuộc phạm vi MVP.”

### Vì sao dùng năm ngôn ngữ, và bản dịch được tạo thế nào?

“Hệ thống hỗ trợ `vi`, `en`, `zh`, `ja`, `ko`. Mỗi ngôn ngữ là một bản dịch lưu riêng trong database, thay vì dịch tức thời bằng AI mỗi lần truy cập. Dữ liệu hiện tại là bản nháp; cần người có chuyên môn hiệu đính trước khi xuất bản.”

### Nếu không có bản dịch thì hệ thống làm gì?

“Ứng dụng không tự ý đổi ngôn ngữ. Nếu có bản tiếng Anh, hệ thống hỏi người dùng có muốn xem không; lựa chọn ngôn ngữ ban đầu vẫn được giữ. Nếu không có tiếng Anh, ứng dụng báo nội dung chưa khả dụng.”

### TTS hoạt động ra sao? Có cần internet không?

“Web dùng Speech Synthesis của trình duyệt, mobile dùng thư viện TTS của Expo/React Native; giọng đọc dựa trên voice có sẵn của thiết bị. Vì vậy chất lượng và khả năng hỗ trợ ngôn ngữ phụ thuộc trình duyệt, hệ điều hành và gói voice cài đặt. Nội dung chữ vẫn có khi voice không khả dụng. Không tự phát âm thanh khi mở trang.”

### Vì sao không dùng dịch máy trực tiếp hoặc audio thu sẵn?

“Dịch trực tiếp có thể tăng độ trễ, chi phí và rủi ro sai thuật ngữ lịch sử. TTS thiết bị giúp MVP không cần máy chủ sinh audio. Nếu yêu cầu chất lượng giọng cao hơn, có thể đánh giá audio thu sẵn hoặc dịch vụ TTS sau khi có ngân sách và nội dung được duyệt.”

### Tại sao chọn React Native/Expo và TypeScript?

“React Native/Expo hỗ trợ xây app đa nền tảng theo hệ sinh thái React và có tích hợp camera; phù hợp thời gian, nguồn lực đồ án. TypeScript giúp chia sẻ kiểu dữ liệu giữa web, mobile, backend và giảm lỗi do cấu trúc response không đồng nhất.”

### Tại sao chọn PostgreSQL/Supabase?

“Dữ liệu có quan hệ rõ giữa hiện vật và các bản dịch, nên mô hình quan hệ phù hợp. PostgreSQL hỗ trợ khóa ngoại, ràng buộc duy nhất và truy vấn tìm kiếm. Supabase cung cấp PostgreSQL được quản lý; backend kết nối qua pool và không để lộ connection string cho client.”

### Tìm kiếm hoạt động thế nào?

“Backend tìm chuỗi con không phân biệt hoa thường trong tên tiếng Việt gốc hoặc tiêu đề tiếng Anh, độc lập với ngôn ngữ hiển thị. Từ khóa được truyền bằng tham số truy vấn SQL, không ghép trực tiếp vào câu SQL. Không cam kết tìm tiếng Việt không dấu hay tên Trung/Nhật/Hàn.”

### API xử lý lỗi database thế nào?

“Health endpoint tách tình trạng backend và database. Khi database lỗi, API báo 503 cùng trạng thái database không khả dụng nhưng không trả thông tin kết nối. Ở phía giao diện, các luồng tải có thông báo lỗi và thao tác thử lại.”

### Nhóm đã kiểm thử những gì?

“Web có 52 unit/component test; backend có 14 test. Responsive web đạt 20/20 case; web E2E đạt 16/16 với dữ liệu demo; axe không tìm thấy vi phạm trên 10 tổ hợp trang và viewport. Mobile mới typecheck/lint, chưa chạy trên thiết bị thật. Hiệu năng 468 ms p95 là số đo mô phỏng local, chưa phải kết quả production.”

### Đồ án đã hoàn thành hoàn toàn chưa?

“Luồng web và phần lớn mã nguồn mobile/backend đã được triển khai. Tuy nhiên chưa thể nói nghiệm thu hoàn toàn: mobile chưa được kiểm thử trên thiết bị thật; screen reader thật chưa kiểm tra; nội dung và bản dịch bảo tàng chưa được chuyên gia duyệt; ảnh giữ chỗ và quyền ảnh chưa chốt; hiệu năng chưa đo trên mạng/thiết bị thật; dữ liệu nghiệm thu thật chưa được xác minh trên Supabase.”

### Hạn chế lớn nhất hiện tại là gì?

“Hạn chế chính nằm ở xác minh ngoài môi trường phát triển: cần thiết bị thật để kiểm tra camera/TTS/quyền truy cập, và cần đơn vị chuyên môn duyệt nội dung cùng ảnh. Các kết quả web hiện có chủ yếu xác minh trên Chromium và bộ dữ liệu demo.”

### Nếu có thêm thời gian, nhóm sẽ làm gì trước?

“Ưu tiên kiểm duyệt nội dung và bản dịch, xác nhận quyền ảnh, kiểm thử luồng app trên thiết bị Android/iOS, kiểm tra VoiceOver/TalkBack, rồi triển khai và đo lại trên thiết bị/mạng thật. Sau khi quy trình biên tập nội dung ổn định mới cân nhắc CMS.”

## 5. Những điểm cần tránh nói quá

- Không nói “mobile đã kiểm thử đầy đủ”; hiện chưa có kiểm thử thiết bị thật.
- Không nói “đạt accessibility hoàn toàn”; chưa kiểm tra screen reader thật và một số phép đo contrast/zoom còn giới hạn.
- Không nói “đạt mục tiêu hiệu năng production”; 468 ms là kết quả mô phỏng, web/API local.
- Không gọi 8 bản dịch/ảnh demo là nội dung bảo tàng chính thức; dữ liệu đang là bản nháp/placeholder.
- Không nói database Supabase đã sẵn sàng cho nghiệm thu nội dung thật; tài liệu ghi chưa xác minh project ref và chưa seed dữ liệu nghiệm thu.
- Không trình bày CMS, lịch sử xem, dịch câu hoặc yêu thích là tiêu chí Must của MVP. Một số code phụ đang tồn tại, nhưng phạm vi PRD có loại trừ hoặc xếp Should.
- Không khẳng định nhóm dùng Scrum/Agile, ai phụ trách phần nào, hay mốc thời gian nào nếu không đúng với thực tế nhóm.

## 6. Tài liệu nên mở khi cần dẫn chứng

- [PRD và yêu cầu sản phẩm](PRD.md)
- [Backlog và trạng thái công việc](TASKS.md)
- [Checklist kiểm thử mobile](MOBILE-TEST-CHECKLIST.md)
- [Tổng hợp QA](qa/README.md)
- [Responsive web](qa/P2-01-responsive.md)
- [Accessibility web](qa/P2-02-accessibility.md)
- [Kiểm thử mobile trên thiết bị](qa/P2-03-mobile-device.md)
- [Đo hiệu năng](qa/P2-05-performance.md)
- [E2E web](qa/P3-01-e2e.md)
- [Rà soát nội dung mẫu](../backend/src/db/CONTENT-REVIEW.md)