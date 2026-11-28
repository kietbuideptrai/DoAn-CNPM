# Mobile Test Checklist — MVP

Chạy các bước dưới đây trên **thiết bị Android hoặc iOS thật** trước buổi demo.
Điền `Pass`, `Fail` hoặc `Blocked` vào cột kết quả; ghi rõ thiết bị, phiên bản OS,
chế độ dữ liệu (demo hoặc backend thật) và ảnh/video làm bằng chứng khi cần.

## Thiết bị kiểm thử

| Thông tin | Giá trị |
| --- | --- |
| Thiết bị / model | |
| Phiên bản OS | |
| Expo Go / development build | |
| Chế độ dữ liệu (`EXPO_PUBLIC_DEMO_MODE`) | |
| Backend URL (nếu dùng API thật) | |
| Người kiểm thử / ngày | |

## Luồng bắt buộc (MVP)

| ID | Steps | Expected result | Status / notes |
| --- | --- | --- | --- |
| MOB-01 | Mở app trong Expo Go, vào tab Hiện vật. | Danh sách hiện vật đã xuất bản hiển thị đúng tiêu đề, tóm tắt và ảnh; trạng thái tải rõ ràng. | |
| MOB-02 | Tìm một hiện vật bằng tên tiếng Việt khi đang chọn ngôn ngữ Nhật/Hàn; sau đó tìm bằng tên tiếng Anh khi đang chọn tiếng Việt. | Kết quả khớp tên Việt hoặc Anh, không phân biệt hoa/thường, khớp một phần và **không phụ thuộc ngôn ngữ nội dung đang chọn**. | |
| MOB-03 | Tìm một cụm từ không tồn tại. | Hiện thông báo không có kết quả dễ hiểu, không màn hình trắng. | |
| MOB-04 | Mở một hiện vật từ danh sách. | Mở đúng trang chi tiết, nội dung theo ngôn ngữ đã chọn. | |
| MOB-05 | Quét mã QR hợp lệ chứa `/artifacts/<slug>`. | Mở đúng trang chi tiết hiện vật tương ứng. | |
| MOB-06 | Quét QR sai định dạng (không phải URL HTTP(S) đến `/artifacts/<slug>`). | Báo QR không hợp lệ và cho phép quét lại. | |
| MOB-07 | Quét URL đúng định dạng nhưng slug không tồn tại. | Hiện thông báo không tìm thấy hiện vật, không crash. | |
| MOB-08 | Từ chối quyền camera, sau đó cấp lại; lặp lại với trường hợp bị từ chối vĩnh viễn. | App giải thích quyền camera và đưa ra nút yêu cầu quyền hoặc mở cài đặt thiết bị phù hợp. | |
| MOB-09 | Tắt mạng, mở danh sách/chi tiết, bật mạng lại rồi bấm Thử lại. | Hiện lỗi mạng dễ hiểu kèm nút Thử lại; thử lại thành công sau khi có mạng. | |
| MOB-10 | Đổi ngôn ngữ trên trang chi tiết, gồm cả ngôn ngữ chưa có bản dịch. | Nội dung đổi đúng; vùng nội dung dùng đúng ngôn ngữ; nếu thiếu bản dịch, hiện hộp thoại **“Chưa có bản dịch”** khi có tiếng Anh. | |
| MOB-11 | Trong hộp thoại thiếu bản dịch, bấm **“Xem tiếng Anh”**. | Tải nội dung tiếng Anh, ghi rõ đang hiển thị tiếng Anh; lựa chọn ngôn ngữ của người dùng **không đổi**; TTS không tự phát. | |
| MOB-12 | Lặp lại MOB-10 và bấm **“Hủy”**. | Hộp thoại đóng, không tự chuyển sang tiếng Anh, không màn hình trắng; có thông báo nội dung chưa khả dụng hoặc danh sách ngôn ngữ hiện có. | |
| MOB-13 | Khởi động lại app sau khi chọn ngôn ngữ. | Ngôn ngữ đã chọn vẫn được ghi nhớ. | |
| MOB-14 | Phát, tạm dừng, tiếp tục và dừng thuyết minh. | Trạng thái nút phản ánh đúng; không có hai luồng đọc chồng nhau. | |
| MOB-15 | Đang phát thuyết minh, đổi ngôn ngữ; sau đó lặp lại và rời màn hình chi tiết. | Âm thanh và hàng đợi dừng ngay; ngôn ngữ mới không tự phát; văn bản vẫn hiển thị. | |
| MOB-16 | Chọn ngôn ngữ không có voice trên thiết bị và bấm nghe. | Hiện chính xác **“Hiện giờ chưa có voice”**, giữ nội dung văn bản và không tự dùng voice ngôn ngữ khác; nút kiểm tra lại hoạt động khi đã cài voice. | |
| MOB-17 | Bật VoiceOver (iOS) hoặc TalkBack (Android), đi qua danh sách và chi tiết. | Tab/nút có nhãn đọc được, tiêu đề có heading hợp lý, ảnh có nhãn thay thế, trạng thái lỗi/TTS được đọc và không lặp liên tục. | |
| MOB-18 | Đổi cỡ chữ Nhỏ/Vừa/Lớn rồi mở lại chi tiết và khởi động lại app. | Tiêu đề, tóm tắt và nội dung đổi theo cỡ chữ; lựa chọn được ghi nhớ; không cắt nội dung. | |
| MOB-19 | Mở hiện vật có ảnh lỗi hoặc thiếu ảnh. | Ảnh thay thế/khung giữ chỗ không làm hỏng trang; nhãn ảnh vẫn phù hợp. | |

## Bổ sung bản đồ (P6)

| ID | Steps | Expected result | Status / notes |
| --- | --- | --- | --- |
| MOB-20 | Mở tab **Bản đồ** (tab thứ 6), đợi dữ liệu tải. | Hiện 7 khu và 8 ghim; tiêu đề/mô tả theo ngôn ngữ đang chọn. | Blocked — chưa có thiết bị; API thật trả 7 khu/8 hiện vật và typecheck/lint đạt. |
| MOB-21 | Chạm một ghim trên sơ đồ. | Mở đúng `/artifacts/<slug>` của hiện vật đó. | Blocked — cần thiết bị; client dùng route động `/artifacts/[slug]`. |
| MOB-22 | Chạm một tên hiện vật trong danh sách nhóm theo khu. | Mở đúng chi tiết; nhóm khu và số thứ tự khớp ghim. | Blocked — cần thiết bị; nhóm được chia sẻ với web qua `shared/mapGroups.ts`. |
| MOB-23 | Tắt mạng, mở tab Bản đồ, bật mạng rồi bấm **Thử lại**. | Lỗi mạng dễ hiểu, có nút Thử lại và tải lại thành công. | Một phần — client đã kiểm chứng lỗi mạng/abort bằng script; cần thử trên thiết bị. |
| MOB-24 | Đặt `EXPO_PUBLIC_DEMO_MODE=true`, khởi động lại app rồi mở bản đồ. | Vẫn hiện 7 khu/8 hiện vật, khớp web demo; bật lại `false` dùng API thật. | Pass (dữ liệu)/Blocked (Expo Go) — script demo mode trả 7/8; chưa chạy trên điện thoại. |
| MOB-25 | Mở app ở màn hình hẹp (~320 px), sau đó bật TalkBack/VoiceOver và đi qua tab/ghim/khu. | 6 tab không tràn; trình đọc nói tên tab, tên khu và nhãn ghim. | Blocked — cần thiết bị; code đã dùng `flex: 1`, nhãn 9 px và `accessibilityLabel` cho khu/ghim. |

Kết quả kiểm chứng không cần thiết bị (2026-11-29): xem
[docs/qa/P6-mobile-map-verification.md](../../docs/qa/P6-mobile-map-verification.md).

## Should — chỉ kiểm tra nếu đã làm

| ID | Steps | Expected result | Status / notes |
| --- | --- | --- | --- |
| MOB-S1 | Thêm một hiện vật vào Yêu thích, mở tab Yêu thích, khởi động lại app rồi xóa. | Yêu thích hiển thị, được ghi nhớ qua lần khởi động lại, mở đúng chi tiết và xóa được. | |

## Ngoài phạm vi MVP — không dùng làm điều kiện nghiệm thu

- Lịch sử xem và giới hạn 20 mục (code hiện có được giữ nguyên, không mở rộng).
- Điều chỉnh tốc độ đọc TTS.
- Deep link mở thẳng app từ QR bên ngoài.

## Ghi chú

- Xoay màn hình, chế độ tối và mạng chậm chỉ cần ghi nhận nếu phát hiện lỗi nghiêm trọng.
- Với TTS, kiểm tra đủ 5 ngôn ngữ `vi/en/zh/ja/ko` trên thiết bị mục tiêu; voice phụ thuộc gói giọng nói đã cài.
- Khi dùng backend thật, gọi `/api/health` trước khi kiểm tra để xác nhận backend và database cùng sẵn sàng.
