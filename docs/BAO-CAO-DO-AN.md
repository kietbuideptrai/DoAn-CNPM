# Bộ vấn đáp chuyên sâu — đồ án Công nghệ phần mềm

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

## 3. Giới thiệu ngắn trước khi vào vấn đáp

Nếu giảng viên yêu cầu tự giới thiệu đồ án, dùng phần 2 trong khoảng một phút, sau đó chuyển ngay sang kiến trúc, luồng xử lý và phần nhóm đã làm. Phần dưới đây vẫn có thể dùng như sơ đồ tư duy khi trả lời.

## 4. Bản đồ kiến thức cần nắm

### Đề tài và thành viên

- Tên đề tài, thành viên, vai trò từng người.
- Một câu giới thiệu sản phẩm và người dùng chính: khách tham quan bảo tàng.

### Bài toán và mục tiêu

- Khách tham quan có thể không có hướng dẫn viên riêng; khách quốc tế gặp rào cản ngôn ngữ; một số người thuận tiện nghe hơn đọc.
- Mục tiêu: truy cập nhanh bằng QR, cung cấp nội dung đa ngôn ngữ, hỗ trợ đọc/nghe, dễ dùng trên điện thoại.
- Luồng cốt lõi: **QR → trang hiện vật → chọn ngôn ngữ → đọc/nghe**.

### Đối tượng, phạm vi và yêu cầu

- Tác nhân MVP là **Visitor / khách tham quan**.
- Chức năng chính: danh sách và tìm kiếm, trang chi tiết theo slug, chọn/lưu ngôn ngữ, TTS, xử lý trạng thái tải/lỗi/không tìm thấy, fallback tiếng Anh có xác nhận khi thiếu bản dịch.
- Tìm kiếm theo tên tiếng Việt gốc hoặc tiêu đề tiếng Anh, không phân biệt hoa thường và không phụ thuộc ngôn ngữ đang xem.
- NFR: giao diện mobile-first, thao tác bàn phím/screen reader, phản hồi lỗi rõ ràng.
- CMS, upload ảnh qua giao diện và chức năng quản trị nội dung không thuộc phạm vi nghiệm thu MVP theo PRD 1.1. Code quản trị còn trong repository nhưng không nên trình bày là chức năng MVP đã hoàn thiện.
- Phần bổ sung 2026-11-27 (quản trị, thống kê, bản đồ) nằm ở Phụ lục A của PRD, mới dừng ở mức thiết kế và backlog. Tính đến 28/11/2026, backend chưa có API admin/analytics/map nên khi trình bày phải tách bạch **luồng MVP đã chạy được** với **kịch bản dự kiến**.

### Use case và luồng chính

Trình bày sơ đồ Use Case (nếu có trong slide tự chuẩn bị) với tác nhân Khách tham quan và các ca sử dụng: xem/tìm hiện vật, quét QR, chọn ngôn ngữ, đọc nội dung, nghe/dừng TTS, thêm yêu thích nếu demo phần Should.

Giải thích hai kiểu vào trang hiện vật:

1. **Website:** QR in tại bảo tàng chứa URL web `/artifacts/<slug>`; camera điện thoại mở trang web trực tiếp.
2. **Ứng dụng:** người dùng mở tab Quét QR trong app; app kiểm tra URL HTTP(S) có đường dẫn `/artifacts/<slug>` rồi điều hướng đến chi tiết. Deep link mở thẳng app từ camera ngoài chưa nằm trong MVP.

### Kiến trúc hệ thống

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

### Công nghệ và lý do chọn

| Phần | Công nghệ | Cách giải thích |
| --- | --- | --- |
| Web | React, Vite, TypeScript | Xây giao diện theo component, phát triển và build gọn. |
| Mobile | React Native, Expo, TypeScript | Dùng chung hệ sinh thái React, tích hợp camera/QR và chạy thử với Expo Go. |
| Backend | Node.js, Express, TypeScript | Cung cấp REST API cho hai client. |
| Cơ sở dữ liệu | PostgreSQL/Supabase | Lưu hiện vật và các bản dịch theo ngôn ngữ. |
| TTS | Web Speech API và `expo-speech` | Dùng giọng đọc có sẵn trên trình duyệt/thiết bị, không cần máy chủ tạo audio; voice tùy nền tảng. |

Nêu đây là lựa chọn phù hợp phạm vi đồ án; không cần microservices, Kubernetes hay dịch thuật AI cho MVP.

### Thiết kế dữ liệu và API

- `artifacts`: slug duy nhất, tên gốc, ảnh, danh mục, trạng thái xuất bản.
- `artifact_translations`: khóa ngoại tới hiện vật, mã ngôn ngữ giới hạn `vi/en/zh/ja/ko`, tiêu đề, tóm tắt, nội dung; mỗi hiện vật chỉ có một bản dịch cho mỗi ngôn ngữ.
- `GET /api/languages`: trả các ngôn ngữ hỗ trợ.
- `GET /api/artifacts?lang=vi&q=...`: danh sách theo ngôn ngữ, tùy chọn tìm kiếm; chỉ hiện vật đã xuất bản.
- `GET /api/artifacts/:slug?lang=vi`: chi tiết, bản dịch yêu cầu (có thể rỗng), và các ngôn ngữ sẵn có.
- `GET /api/health`: kiểm tra trạng thái backend và database riêng; trả 200 khi cả hai sẵn sàng, 503 khi database không truy cập được, không trả thông tin kết nối.
- Có thể mở `docs/api-samples.json` để minh họa cấu trúc response.

### Các quyết định xử lý tình huống

- Thiếu bản dịch đã chọn nhưng có tiếng Anh: hỏi khách trước khi tải tiếng Anh; ghi rõ nội dung đang hiển thị là tiếng Anh; không đổi lựa chọn ngôn ngữ đã lưu.
- Thiếu cả bản dịch và tiếng Anh: báo nội dung chưa khả dụng, không để màn hình trắng.
- TTS chỉ chạy khi người dùng bấm; dừng khi đổi ngôn ngữ hoặc rời trang; không để nhiều lượt đọc chồng nhau.
- Nếu thiết bị không có voice tương ứng: giữ nội dung văn bản và báo **“Hiện giờ chưa có voice”**, không tự đổi sang giọng/ngôn ngữ khác.
- Lỗi mạng có trạng thái dễ hiểu và nút thử lại; slug không tồn tại có trạng thái 404 thân thiện.

### Quy trình phát triển và phối hợp

Tài liệu backlog ghi nhận nhóm chia phần theo Web, Mobile, Backend và Nội dung/QA. Trình bày đúng quy trình nhóm thực sự đã làm; repository không mô tả đủ lịch sử sprint hay lịch họp để khẳng định một mô hình Agile/Scrum cụ thể.

- Nêu cách phân chia đầu việc, cách tích hợp và công cụ nhóm thực sự dùng (Git, issue board, chat, review…).
- Dùng `docs/TASKS.md` để chỉ ra cách theo dõi yêu cầu theo mã, ưu tiên, tiêu chí hoàn thành và trạng thái.
- Nhấn mạnh task chỉ coi là xong khi có tiêu chí/kết quả kiểm thử tương ứng; phần bị chặn vẫn ghi rõ.
- Điền ví dụ khó khăn thật của nhóm và cách xử lý: …

### Demo sản phẩm

Chọn một luồng ngắn, có chuẩn bị trước:

1. Mở danh sách hiện vật và tìm một hiện vật.
2. Mở chi tiết bằng QR hoặc URL có slug.
3. Đổi sang tiếng Anh hoặc một ngôn ngữ khác, chỉ ra nội dung và URL/nhãn ngôn ngữ cập nhật.
4. Bấm nghe, tạm dừng/tiếp tục, rồi đổi ngôn ngữ để minh họa TTS dừng.
5. Nếu có dữ liệu thiếu bản dịch trong môi trường demo, minh họa hộp thoại fallback; nếu không có, trình bày bằng ảnh/chạy kịch bản đã chuẩn bị và nói rõ đây là nhánh mô phỏng.

**Chuẩn bị:** mở sẵn app/trang, kiểm tra mạng và backend, làm nóng API bằng `/api/health`, chuẩn bị QR và dữ liệu. Có phương án video/ảnh chụp hoặc demo local nếu dịch vụ triển khai không sẵn sàng. Không đọc hoặc chiếu secret trong `.env`.

#### Kịch bản demo mở rộng (dự kiến — 5 đến 7 phút)

Dùng cho phần bổ sung Phụ lục A. **Trạng thái: chưa chạy được.** Các task P4–P7 chưa triển khai, backend hiện chỉ có `/api/artifacts`, `/api/languages`, `/api/health`; `/api/admin/auth/login`, `/api/admin/analytics/summary` và `/api/museum/map` trả 404. Phân bổ thời gian dưới đây là dự kiến, chưa được đo bằng lần chạy thật (xem `qa/P8-04-final-verification.md`).

| Thời điểm | Thao tác | Điểm cần nói |
| --- | --- | --- |
| 0:00–0:30 | Gọi `/api/health`, mở `/admin/login`, đăng nhập tài khoản demo | Phiên JWT, API công khai không cần token |
| 0:30–2:00 | Tạo một hiện vật, nhập 5 bản dịch, chọn khu và bấm đặt ghim, xuất bản | Khu + tọa độ lưu cùng hiện vật |
| 2:00–2:45 | Mở trang công khai của hiện vật vừa tạo, đổi ngôn ngữ, bấm nghe, tải QR | Luồng khách tham quan không đổi |
| 2:45–3:45 | Mở `/admin/analytics`, đổi 7/30 ngày, chỉ tổng lượt xem và top hiện vật | **30 ngày đầu là dữ liệu seed**, không phải truy cập thật |
| 3:45–4:45 | Mở `/map`, bấm vào ghim vừa tạo | Cùng tọa độ với form admin |
| 4:45–5:45 | Mở app, vào tab **Bản đồ**, bấm cùng ghim để vào chi tiết | Web và mobile dùng chung dữ liệu bản đồ |
| 5:45–6:30 | Quay lại admin, xóa hiện vật vừa tạo và xác nhận | Xóa vĩnh viễn có hộp thoại xác nhận; kiểm tra biến mất khỏi web/app/map |

Nếu chưa có mã bổ sung, chỉ trình bày kịch bản này như **plan demo** có slide/ảnh minh họa; đừng gọi đây là kết quả đã chạy. Luồng demo chạy được hiện tại là 5 bước ở trên (QR → chi tiết → ngôn ngữ → TTS → fallback).

### Kiểm thử và kết quả

Nêu kết quả đúng theo báo cáo QA hiện có (ngày 17/11/2026):

- **Web unit/component:** 55/55 test đạt; production build thành công.
- **Backend:** 14/14 test đạt; build thành công.
- **Mobile:** typecheck và lint đạt; chưa có automated test suite riêng.
- **Web responsive:** 20/20 case đạt ở viewport 320, 375, 390, 768, 1440 px.
- **Web accessibility:** axe không phát hiện vi phạm trên 10 tổ hợp trang/viewport; bàn phím, dialog, mô phỏng zoom 200% và tap target chính đạt. Chưa kiểm tra screen reader thật, nên kết quả chỉ một phần.
- **Web E2E:** 16/16 case đạt, gồm URL QR, đổi ngôn ngữ, TTS (mock), fallback, 404, mất mạng/thử lại và tìm kiếm.
- **Hiệu năng mô phỏng:** p95 468 ms tới khi nội dung hiện trong mô phỏng 4G + CPU 4×; web/API chạy local, chưa phải phép đo trên thiết bị/mạng thật.
- **Mobile thiết bị thật:** chưa kiểm thử do môi trường không có thiết bị/emulator; camera, quyền, TTS native và VoiceOver/TalkBack còn cần xác minh.

> Bộ test E2E chạy với `VITE_DEMO_MODE=false` và gọi API/database non-production, nhưng dữ liệu là 8 hiện vật `demo-*` hư cấu. Không dùng kết quả đó để nói rằng nội dung bảo tàng đã được nghiệm thu.

### Dữ liệu, giới hạn và hướng phát triển

- Bộ seed tham khảo 8 hiện vật trong chuyên mục “Hiện vật kể chuyện” của Bảo tàng Hồ Chí Minh, có bản nháp 5 ngôn ngữ; bản dịch chưa được chuyên gia/bảo tàng duyệt.
- Ảnh hiện tại là ảnh giữ chỗ; quyền sử dụng ảnh hiện vật chưa được xác nhận.
- Database thật hiện chạy PostgreSQL local bằng Podman: 8 hiện vật đã xuất bản, 40 bản dịch, `/api/health` trả 200; web/mobile đã tắt demo mode. Chưa triển khai Supabase cloud.
- Ở phần bổ sung, **30 ngày đầu tiên trên biểu đồ là dữ liệu seed** do script `seed:analytics` dự kiến tạo ra, không phải lượt truy cập thật; kể từ lúc bật ghi nhận thì số liệu mới là thật. Khi demo phải nói rõ ranh giới này.
- Phần bổ sung (admin, analytics, map web/mobile) mới có thiết kế trong `KE-HOACH-ADMIN-MAP-THONG-KE.md` và issue tương ứng; chưa có API/UI để nghiệm thu. Không dùng kịch bản mở rộng làm bằng chứng chạy thật.
- Hướng phát triển: kiểm duyệt nội dung/bản dịch và bản quyền ảnh; hoàn tất kiểm thử app trên thiết bị Android/iOS; kiểm tra screen reader thật; đo hiệu năng trên mạng/thiết bị thật; triển khai bản demo ổn định; cân nhắc CMS sau MVP.
- Kết luận: sản phẩm đã hiện thực hóa luồng cốt lõi ở web và có mã mobile, backend; nêu rõ phạm vi đã xác minh và công việc còn lại.

## 5. Câu hỏi nền tảng và câu trả lời gợi ý

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

“Web có 55 unit/component test; backend có 14 test. Responsive web đạt 20/20 case; web E2E đạt 16/16 với dữ liệu demo; axe không tìm thấy vi phạm trên 10 tổ hợp trang và viewport. Mobile mới typecheck/lint, chưa chạy trên thiết bị thật. Hiệu năng 468 ms p95 là số đo mô phỏng local, chưa phải kết quả production.”

### Đồ án đã hoàn thành hoàn toàn chưa?

“Luồng web và phần lớn mã nguồn mobile/backend đã được triển khai, database thật đã chạy local với 8 hiện vật và 40 bản dịch. Tuy nhiên chưa thể nói nghiệm thu hoàn toàn: mobile chưa được kiểm thử trên thiết bị thật; screen reader thật chưa kiểm tra; nội dung và bản dịch bảo tàng chưa được chuyên gia duyệt; ảnh giữ chỗ và quyền ảnh chưa chốt; hiệu năng chưa đo trên mạng/thiết bị thật; chưa triển khai Supabase cloud.”

### Hạn chế lớn nhất hiện tại là gì?

“Hạn chế chính nằm ở xác minh ngoài môi trường phát triển: cần thiết bị thật để kiểm tra camera/TTS/quyền truy cập, và cần đơn vị chuyên môn duyệt nội dung cùng ảnh. Các kết quả web hiện có chủ yếu xác minh trên Chromium và bộ dữ liệu demo.”

### Nếu có thêm thời gian, nhóm sẽ làm gì trước?

“Ưu tiên kiểm duyệt nội dung và bản dịch, xác nhận quyền ảnh, kiểm thử luồng app trên thiết bị Android/iOS, kiểm tra VoiceOver/TalkBack, rồi triển khai và đo lại trên thiết bị/mạng thật. Sau khi quy trình biên tập nội dung ổn định mới cân nhắc CMS.”

## 6. Câu hỏi vấn đáp sâu về phần đã làm

### Hãy mô tả luồng từ QR đến khi người dùng nghe thuyết minh.

“QR ngoài thực tế chứa URL web có dạng `/artifacts/<slug>`. Trình duyệt vào route React tương ứng; trang lấy `slug` và `lang`, gọi API chi tiết hoặc dùng demo data tùy cấu hình. API truy vấn hiện vật đã công bố và bản dịch theo ngôn ngữ. Client hiển thị tiêu đề, tóm tắt, nội dung. Khi người dùng bấm nút nghe, hook TTS chọn voice đúng mã ngôn ngữ và tạo lượt đọc. Nếu đổi ngôn ngữ hoặc rời trang, hook hủy lượt đọc và hàng đợi.”

### `slug` có vai trò gì? Vì sao không dùng UUID trên URL?

“`slug` là định danh duy nhất, dễ đọc và phù hợp in trong URL/QR, ví dụ `demo-trong-dong`. UUID vẫn là khóa chính nội bộ của bảng. Khi đổi tiêu đề, slug nên được quản lý cẩn thận để QR cũ không hỏng; phương án tốt về sau là giữ slug cũ hoặc có bảng redirect.”

### Thiết kế database này có chuẩn hóa không?

“Có thể xem là chuẩn hóa theo quan hệ một-nhiều: một `artifacts` có nhiều `artifact_translations`. Các thuộc tính chung như ảnh, danh mục, trạng thái xuất bản nằm ở `artifacts`; các thuộc tính phụ thuộc vào ngôn ngữ nằm ở bảng dịch. Ràng buộc duy nhất `(artifact_id, language_code)` ngăn một hiện vật có hai bản dịch cùng ngôn ngữ. Nhờ vậy không lặp cột `title_vi`, `title_en`… và dễ thêm dữ liệu dịch.”

### Vì sao `artifact_translations` dùng UUID riêng nếu đã có khóa ghép?

“UUID là khóa chính thuận tiện cho tham chiếu hay thao tác quản trị sau này. Khóa ghép vẫn được giữ dưới dạng unique constraint để bảo vệ quy tắc nghiệp vụ: một hiện vật chỉ có một bản dịch của một ngôn ngữ.”

### Hệ thống lọc hiện vật chưa công bố ở đâu?

“Tại backend, cả truy vấn danh sách lẫn truy vấn chi tiết đều có điều kiện `artifacts.is_published = TRUE`. Đặt quy tắc này ở server giúp client không thể chỉ thay đổi giao diện để thấy dữ liệu chưa công bố.”

### Nếu bản dịch được yêu cầu không tồn tại, API có trả 404 không?

“Không. Nếu `slug` có hiện vật đã công bố, API trả chi tiết với `translation: null` và `available_languages`. Client dùng thông tin đó để hỏi có xem tiếng Anh không hoặc báo chưa có nội dung. Chỉ khi không tồn tại hiện vật đã công bố mới trả 404.”

### Vì sao fallback luôn là tiếng Anh, không phải tiếng Việt?

“Đó là quyết định nghiệp vụ đã ghi trong PRD: tiếng Anh được chọn làm fallback chung cho khách quốc tế. Fallback không tự động, vì hệ thống phải tôn trọng lựa chọn ngôn ngữ của người dùng. Nếu thay đổi yêu cầu, fallback nên được cấu hình thay vì hard-code.”

### Tìm kiếm hiện tại có các hạn chế gì?

“Truy vấn dùng `LOWER` và `POSITION` để tìm chuỗi con trong tên tiếng Việt gốc và tiêu đề tiếng Anh. Nó chưa hỗ trợ tiếng Việt không dấu, xếp hạng kết quả, sửa lỗi chính tả hoặc tìm Trung/Nhật/Hàn. Với dữ liệu lớn, cần index phù hợp hoặc full-text/trigram search vì hàm `LOWER` và tìm chuỗi con có thể không tận dụng index B-tree thông thường.”

### Có nguy cơ SQL injection không?

“Giá trị `lang` và từ khóa tìm kiếm được truyền bằng placeholder `$1`, `$2`, không nối thẳng dữ liệu người dùng vào SQL. `lang` còn được kiểm tra trong tập năm mã cho phép trước khi gọi service. Cần tiếp tục giữ nguyên nguyên tắc parameterized query khi thêm filter hoặc sort.”

### Vì sao API dùng REST thay vì GraphQL?

“Số tài nguyên và luồng đọc đơn giản: ngôn ngữ, danh sách, chi tiết, health. REST/JSON dễ triển khai, dễ gọi từ web/mobile và đủ cho MVP. GraphQL sẽ tăng chi phí thiết kế schema, resolver, phân quyền và vận hành trong khi chưa giải quyết nhu cầu cấp thiết nào của phạm vi này.”

### Health check kiểm tra gì và vì sao trả 503?

“Health check chạy kiểm tra database riêng. Nếu backend chạy nhưng không kết nối được database, nó trả HTTP 503 để load balancer hay người vận hành biết dịch vụ chưa sẵn sàng phục vụ dữ liệu. Response chỉ nêu database unavailable, không lộ `DATABASE_URL` hay lỗi kết nối chi tiết.”

### CORS được xử lý để làm gì?

“Trình duyệt chỉ cho web origin được backend cho phép gọi API. Cấu hình dùng danh sách exact origin qua `CORS_ORIGINS`; không nên mở `*` khi có endpoint nhạy cảm hoặc xác thực. Mobile native không bị CORS như trình duyệt, nhưng vẫn cần HTTPS, xác thực và kiểm soát API ở server.”

### Hệ thống bảo mật ra sao? Có điểm nào chưa hoàn chỉnh?

“Phần public API hiện là đọc dữ liệu đã công bố. Kết nối database nằm ở backend qua biến môi trường, không ở web/mobile; tài liệu yêu cầu không commit `.env`. Schema có bảng `admin_users`, và web có code quản trị, nhưng CMS/xác thực quản trị không nằm trong MVP và không được xem là hoàn thiện. Nếu mở quản trị, cần hash mật khẩu mạnh, session/token an toàn, phân quyền, validation server-side, rate limit, audit log và upload ảnh an toàn.”

### Tại sao app không tự lấy URL QR bất kỳ và điều hướng?

“Hàm parse QR chỉ chấp nhận `http`/`https`, kiểm tra đường dẫn kết thúc bằng `/artifacts/<slug>` và kiểm tra slug bằng biểu thức hợp lệ. Mục tiêu là tránh xem dữ liệu QR tùy ý như slug hợp lệ hoặc mở route không mong muốn. Hiện tại nó chưa giới hạn hostname; nếu app triển khai chính thức, nên kiểm tra domain tin cậy hoặc ký QR để chống QR giả mạo.”

### Làm sao đảm bảo TTS không đọc hai lần cùng lúc?

“TTS chỉ được khởi động qua thao tác bấm. Khi đổi ngôn ngữ, rời trang hoặc chọn phát lại, hook phải hủy lượt đọc/hàng đợi cũ trước khi tạo lượt mới. Trạng thái phát, tạm dừng, tiếp tục được quản lý để UI không báo sai. Test web đã kiểm tra các nhánh hủy khi đổi ngôn ngữ và unmount; engine thật trên mobile vẫn cần kiểm tra thiết bị.”

### Vì sao phải cắt đoạn dài theo câu khi đọc TTS?

“Một số engine trình duyệt hoặc thiết bị không ổn định với utterance quá dài, có thể ngắt giữa chừng. Chia theo câu cho phép xếp hàng các đoạn ngắn và kiểm soát chuyển đoạn tốt hơn. Điểm cần xử lý kỹ là dấu câu, chữ viết tắt, ký tự đa ngôn ngữ và hủy hàng đợi khi người dùng đổi trang.”

### TTS có dùng đúng ngôn ngữ không?

“Ứng dụng ánh xạ mã dữ liệu sang locale TTS: `vi-VN`, `en-US`, `zh-CN`, `ja-JP`, `ko-KR`. Khi fallback hiển thị tiếng Anh, TTS phải dùng bản dịch thực tế đang hiện và `en-US`, không dùng lựa chọn gốc của người dùng. Nếu không tìm thấy voice phù hợp, UI báo đúng trạng thái thay vì tự đọc bằng ngôn ngữ khác.”

### State ngôn ngữ được lưu thế nào?

“Ngôn ngữ là state dùng chung thông qua context. Web hỗ trợ query `?lang=` và ghi nhớ lựa chọn; mobile ghi nhớ trên thiết bị. Khi URL có `lang`, client kiểm tra giá trị hợp lệ rồi tải nội dung tương ứng. Điều này giúp URL QR có thể mở sẵn ngôn ngữ, đồng thời người dùng vẫn có thể thay đổi.”

### Vì sao dùng Context thay vì Redux/Zustand?

“State dùng chung trong MVP tương đối nhỏ: ngôn ngữ, cỡ chữ, xác thực cũ và dữ liệu local. React Context đủ đơn giản và giảm dependency. Nếu state phức tạp hơn, cập nhật tần suất cao hoặc cần devtools/middleware, nhóm có thể cân nhắc store chuyên dụng.”

### Client xử lý loading, error và retry thế nào?

“Các hook API quản lý trạng thái loading/success/error và cung cấp `retry`. UI không để màn hình trắng: lúc tải có trạng thái chờ, lỗi mạng có thông báo cùng nút thử lại, slug sai có trang không tìm thấy. Cách này tách logic lấy dữ liệu khỏi component hiển thị.”

### Web và mobile tái sử dụng được gì?

“Hai client tái sử dụng hợp đồng dữ liệu trong `shared/types.ts` và cùng tuân thủ các quy tắc nghiệp vụ: năm ngôn ngữ, tìm kiếm, fallback, TTS, trạng thái lỗi. UI, camera và engine TTS khác nền tảng nên triển khai riêng. Demo data có bản sao theo môi trường, vì vậy cần quản lý cẩn thận để không lệch dữ liệu.”

### Test unit, integration và E2E khác nhau thế nào trong đồ án này?

“Unit/component test kiểm tra phần nhỏ như hook, context, component và query builder. Test backend kiểm tra health, seed an toàn, điều kiện search. E2E chạy luồng người dùng trên web build: URL QR, đổi ngôn ngữ, TTS mock, fallback, 404 và retry. Các loại test bổ sung nhau; E2E không thay thế kiểm thử camera, permission và native TTS thật trên điện thoại.”

### Vì sao TTS trong E2E phải mock, và điều đó hạn chế gì?

“Môi trường Chromium headless không phải voice engine thật ổn định, nên mock giúp kiểm tra việc gọi play/pause/resume/cancel và locale được truyền. Nó không chứng minh giọng đọc có thật, chất lượng phát âm hay xử lý permission/voice package của Android/iOS. Vì vậy mobile device test vẫn là công việc còn lại.”

### Nhóm đã phát hiện và sửa lỗi nào qua kiểm thử?

“QA responsive phát hiện ở viewport 320 px, cụm điều khiển header bị tràn sang trái, nhất là khi cỡ chữ rất lớn. Nhóm đã ẩn nhãn hiển thị nhưng vẫn giữ nhãn cho screen reader, giảm khoảng cách và cho phép wrap. Chạy lại đạt 20/20 case. QA accessibility cũng phát hiện `aria-label` đặt trên `div` không có role; nhóm thêm `role=group`, sau đó axe không còn cảnh báo này.”

### Tại sao 468 ms chưa đủ để nói hệ thống nhanh trong thực tế?

“Số đó là p95 của 7 lượt mô phỏng 4G với CPU 4×, nhưng web và API cùng chạy local. Nó chưa có độ trễ WAN, TLS, cold start backend miễn phí, ảnh thật hay năng lực điện thoại. Kết luận đúng là đạt trong điều kiện mô phỏng, và cần đo lại trên thiết bị/mạng thật.”

### Nếu backend free tier ngủ, demo bị ảnh hưởng thế nào?

“Request đầu có thể chậm do cold start. Trước buổi vấn đáp nên gọi `/api/health` sớm, xác nhận HTTP 200 và hai check đều `ok`; giữ demo local làm phương án dự phòng. Không nên cố che lỗi bằng cách nói backend đã sẵn sàng nếu health trả 503.”

### Nếu triển khai thật, nhóm sẽ tối ưu database thế nào?

“Bước đầu là đo query thực tế. Có thể bổ sung index cho `artifacts.slug`, trạng thái xuất bản và khóa ngoại `artifact_translations.artifact_id`; unique constraint đã tạo index cho cặp artifact-language. Với tìm kiếm chuỗi con, cân nhắc `pg_trgm` và GIN/GiST index, hoặc full-text search theo yêu cầu. Cần dùng `EXPLAIN ANALYZE` và dữ liệu đủ lớn trước khi quyết định.”

### Nếu thêm ngôn ngữ thứ sáu cần sửa gì?

“Hiện mã ngôn ngữ bị giới hạn tại schema, backend type guard, danh sách API, map TTS, shared type, UI picker, demo/seed data và test. Cần cập nhật đồng bộ tất cả, thêm bản dịch, kiểm tra voice. Đây cũng là lý do sau MVP nên đưa ngôn ngữ vào bảng/configuration thay vì hard-code nếu sản phẩm mở rộng thường xuyên.”

### Hãy nêu một trade-off quan trọng của đồ án.

“Nhóm chọn TTS có sẵn trên thiết bị để giảm chi phí và không cần hạ tầng audio, đổi lại chất lượng/voice phụ thuộc nền tảng và cần kiểm thử thiết bị thật. Nhóm cũng chọn QR mở website để giảm rào cản cài app, đổi lại không có trải nghiệm deep link vào app trong MVP.”

### Nếu giảng viên yêu cầu giải thích phần bạn phụ trách?

Hãy trả lời theo mẫu: “Em phụ trách **[phần thật]**. Đầu vào của phần này là **[…]**, đầu ra là **[…]**. Em triển khai chính ở **[file/module]**, xử lý các nhánh **[…]**, và kiểm chứng bằng **[test/demo]**. Khó khăn là **[…]**, em giải quyết bằng **[…]**. Phần còn giới hạn là **[…]**.” Chỉ thay nội dung bằng việc bạn thực sự làm.

### Câu trả lời cho phần bổ sung (thiết kế đã chốt, chưa triển khai)

> Bốn câu dưới đây phản ánh **quyết định thiết kế** trong `KE-HOACH-ADMIN-MAP-THONG-KE.md`. Vì code chưa có, hãy nói rõ “đây là phương án nhóm đã chốt, hiện mới dừng ở thiết kế”, không nói như đã chạy.

**Vì sao dùng JWT cho admin, luồng đăng nhập dự kiến ra sao?**

“Đăng nhập dùng email/mật khẩu được seed trong database, mật khẩu lưu dạng băm bcrypt. Sau khi xác thực đúng, API trả JWT có hạn; mọi API ghi/quản trị đều yêu cầu `Authorization: Bearer`, trong khi API đọc công khai chỉ trả hiện vật đã xuất bản và không cần token. Secret nằm trong `.env`, không commit. JWT giúp backend stateless, web và mobile cùng dùng một hợp đồng. Điểm cần nói thêm là đăng xuất chỉ xóa token ở client; muốn thu hồi ngay phía server thì cần thêm deny-list, hiện ngoài phạm vi. Phần này mới là thiết kế, backend hiện chưa có endpoint đăng nhập.”

**Vì sao chọn xóa vĩnh viễn (hard delete) thay vì ẩn hiện vật?**

“Nhóm chốt hard delete kèm hộp thoại xác nhận vì như vậy danh sách admin không lẫn dữ liệu đã bỏ, và khóa ngoại `ON DELETE CASCADE` dọn luôn bản dịch, tránh bản dịch mồ côi. Đổi lại là không khôi phục được, nên UI phải bắt xác nhận rõ ràng và chỉ admin đã đăng nhập mới gọi được API. Dữ liệu lịch sử `page_views.artifact_slug` vẫn giữ lại để biểu đồ không mất số liệu cũ. Hiện đây là quyết định thiết kế; API xóa chưa tồn tại.”

**Thống kê có lưu thông tin cá nhân không, dữ liệu 30 ngày có thật không?**

“Không lưu IP, user-agent hay cookie. Client tạo một `visitor_id` UUID ngẫ nhiên lưu trong **localStorage** và gửi kèm mỗi lượt xem; server chỉ dùng mã đó để đếm khách duy nhất theo ngày và tự tách `artifact_slug` từ path. Nhánh `/admin` không được ghi nhận. Hạn chế là người dùng xóa storage thì thành khách mới, nên con số khách duy nhất là ước lượng ẩn danh, không phải danh tính thật. **30 ngày đầu biểu đồ là dữ liệu seed** tạo bằng script có seed cố định, chỉ để demo; sau khi bật ghi nhận thì mới là lượt truy cập thật. Phần ghi nhận và seed hiện chưa triển khai.”

**Tọa độ bản đồ lưu thế nào, có dùng GPS không?**

“Không dùng GPS hay beacon. Bản đồ là sơ đồ một tầng tự vẽ bằng SVG với `viewBox` cố định `1000 × 600`, gốc ở góc trên trái. Admin chọn một trong 7 khu rồi bấm đặt ghim; tọa độ `map_x`, `map_y` lưu thẳng trong database nên không đổi theo kích thước màn hình. Ghim là phần tử phủ lên SVG theo phần trăm để dễ chạm và hỗ trợ bàn phím. Hiện vật không có tọa độ thì không hiện trên bản đồ. Web `/map` và tab Bản đồ của app dùng chung nguồn dữ liệu. Đây là thiết kế; hai màn hình map hiện chưa có.”

## 7. Những điểm cần tránh nói quá

- Không nói “mobile đã kiểm thử đầy đủ”; hiện chưa có kiểm thử thiết bị thật.
- Không nói “đạt accessibility hoàn toàn”; chưa kiểm tra screen reader thật và một số phép đo contrast/zoom còn giới hạn.
- Không nói “đạt mục tiêu hiệu năng production”; 468 ms là kết quả mô phỏng, web/API local.
- Không gọi 8 bản dịch/ảnh demo là nội dung bảo tàng chính thức; dữ liệu đang là bản nháp/placeholder.
- Không nói Supabase cloud đã sẵn sàng cho nghiệm thu nội dung thật; hiện database thật chạy local, chưa triển khai cloud.
- Không trình bày CMS, lịch sử xem, dịch câu hoặc yêu thích là tiêu chí Must của MVP. Một số code phụ đang tồn tại, nhưng phạm vi PRD có loại trừ hoặc xếp Should.
- Không khẳng định nhóm dùng Scrum/Agile, ai phụ trách phần nào, hay mốc thời gian nào nếu không đúng với thực tế nhóm.
- Không nói admin/analytics/map đã chạy được: hiện mới có thiết kế, API và UI chưa triển khai. Kịch bản 5–7 phút ở phần Demo là dự kiến, chưa đo thời gian thật.
- Không gọi 30 ngày đầu của biểu đồ là lượt truy cập thật; đó là dữ liệu seed.

## 8. Tài liệu nên mở khi cần dẫn chứng

- [PRD và yêu cầu sản phẩm](PRD.md)
- [Backlog và trạng thái công việc](TASKS.md)
- [Checklist kiểm thử mobile](../mobile/docs/MOBILE-TEST-CHECKLIST.md)
- [Tổng hợp QA](qa/README.md)
- [Responsive web](qa/P2-01-responsive.md)
- [Accessibility web](qa/P2-02-accessibility.md)
- [Kiểm thử mobile trên thiết bị](qa/P2-03-mobile-device.md)
- [Đo hiệu năng](qa/P2-05-performance.md)
- [E2E web](qa/P3-01-e2e.md)
- [Kiểm tra chốt P8-04](qa/P8-04-final-verification.md)
- [Thiết kế phần bổ sung](KE-HOACH-ADMIN-MAP-THONG-KE.md)
- [Rà soát nội dung mẫu](../backend/src/db/CONTENT-REVIEW.md)
