# Activity Diagram — Luồng thuyết minh hiện vật

Lược đồ mô tả luồng chính của khách tham quan theo [PRD](./PRD.md): mở hiện vật bằng QR hoặc tìm trong ứng dụng, chọn ngôn ngữ, đọc nội dung và tùy chọn nghe thuyết minh.

```mermaid
flowchart TD
    start([Bắt đầu]) --> entry{Cách mở hiện vật?}

    entry -->|Quét QR trên hiện vật| camera[Camera điện thoại quét QR]
    entry -->|Trong ứng dụng| permission{Đã cấp quyền camera?}
    permission -->|Chưa| askPermission[Yêu cầu quyền camera]
    askPermission --> permissionResult{Người dùng cho phép?}
    permissionResult -->|Không| cameraDenied["Thông báo cần quyền camera<br/>hoặc quay lại"]
    cameraDenied --> finish([Kết thúc])
    permissionResult -->|Có| inAppScan[Quét QR trong ứng dụng]
    permission -->|Rồi| inAppScan

    camera --> openUrl[Mở URL hiện vật trên website]
    inAppScan --> parseQr[Đọc URL và lấy slug hiện vật]
    parseQr --> validQr{QR chứa URL/slug hợp lệ?}
    validQr -->|Không| invalidQr[Thông báo QR không hợp lệ]
    invalidQr --> entry
    validQr -->|Có| loadArtifact
    openUrl --> loadArtifact[Tải thông tin hiện vật]

    loadArtifact --> loaded{Tải thành công?}
    loaded -->|Không, lỗi mạng/server| loadError["Hiển thị lỗi và nút thử lại"]
    loadError --> retry{Thử lại?}
    retry -->|Có| loadArtifact
    retry -->|Không| finish
    loaded -->|Có| exists{Hiện vật tồn tại?}
    exists -->|Không| notFound[Hiển thị không tìm thấy hiện vật]
    notFound --> finish
    exists -->|Có| chooseLanguage["Chọn ngôn ngữ<br/>(hoặc dùng ngôn ngữ đã lưu / URL)"]

    chooseLanguage --> translation{Có bản dịch ngôn ngữ đã chọn?}
    translation -->|Có| showContent[Hiển thị nội dung hiện vật]
    translation -->|Không| hasEnglish{Có bản dịch tiếng Anh?}
    hasEnglish -->|Có| askFallback["Hỏi có muốn xem nội dung tiếng Anh không"]
    askFallback --> fallbackChoice{Lựa chọn}
    fallbackChoice -->|Xem tiếng Anh| showEnglish["Hiển thị nội dung tiếng Anh<br/>và ghi rõ ngôn ngữ nội dung"]
    fallbackChoice -->|Hủy| showUnavailable["Giữ lựa chọn ngôn ngữ<br/>và báo chưa có nội dung phù hợp"]
    hasEnglish -->|Không| showUnavailable
    showEnglish --> showContent
    showUnavailable --> languageDecision{Đổi ngôn ngữ hoặc rời trang?}
    languageDecision -->|Đổi ngôn ngữ| chooseLanguage
    languageDecision -->|Rời trang| finish

    showContent --> listen{Muốn nghe thuyết minh?}
    listen -->|Không| contentDecision{Đổi ngôn ngữ hoặc rời trang?}
    contentDecision -->|Đổi ngôn ngữ| stopOnChange[Dừng TTS nếu đang đọc]
    stopOnChange --> chooseLanguage
    contentDecision -->|Rời trang| stopOnLeave[Dừng TTS và xóa nội dung đọc chờ]
    stopOnLeave --> finish
    listen -->|Có| voice{Có voice phù hợp?}
    voice -->|Không| noVoice["Thông báo “Hiện giờ chưa có voice”<br/>và giữ nội dung chữ"]
    noVoice --> contentDecision
    voice -->|Có| speak[Bắt đầu đọc nội dung bằng TTS]
    speak --> playback{Điều khiển phát}
    playback -->|Tạm dừng| pause[Tạm dừng]
    pause --> playback
    playback -->|Tiếp tục| resume[Tiếp tục đọc]
    resume --> playback
    playback -->|Phát lại| replay[Phát lại từ đầu]
    replay --> playback
    playback -->|Dừng| stop[Ngừng đọc]
    stop --> listen
    playback -->|Đổi ngôn ngữ| stopOnChange
    playback -->|Rời trang| stopOnLeave
    playback -->|Đọc xong| contentDecision
```

**Quy tắc thể hiện trong lược đồ:** QR in tại hiện vật mở URL web; trong ứng dụng, QR URL được phân tích để lấy slug. Nội dung tiếng Anh dự phòng chỉ hiển thị sau khi người dùng xác nhận và không tự đổi ngôn ngữ đã chọn. TTS chỉ phát theo thao tác chủ động; khi đổi ngôn ngữ hoặc rời trang, TTS đang phát phải dừng.
