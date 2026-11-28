# P4-06 — Tài liệu API backend Supabase-first

- **Ngày:** 2026-11-28
- **Phạm vi:** Chỉ cập nhật tài liệu cho backend issue #13; không đụng code
  `backend/src`, `backend/scripts`, `backend/package.json` hay `web/`.
- **Môi trường:** Không gọi API thật, không kết nối database; mọi ví dụ dùng
  `https://api.example.test` và placeholder.

## Đã làm

| Hạng mục | Kết quả |
| --- | --- |
| Giữ 3 mẫu cũ trong `docs/api-samples.json` | Đã giữ nguyên `artifactDetail`, `artifactWithoutTranslation`, `notFound` |
| Bổ sung mẫu request/response | `adminLogin`, `adminArtifactsList`, `adminArtifactUpdate`, `adminArtifactDelete`, `museumZones`, `museumMapVi`, `analyticsPageview`, `adminAnalyticsSummary30Days` |
| Ví dụ curl | Thêm `docs/api-samples.md`, có header `Authorization: Bearer <ADMIN_TOKEN>` cho endpoint admin |
| Shape summary | Đối chiếu bằng tay với `AdminAnalyticsSummary` trong `web/src/api/adminClient.ts`: `range`, `totals`, `daily`, `top_artifacts` |
| Kiểm tra JSON | `python3 -m json.tool docs/api-samples.json` hợp lệ |

## An toàn dữ liệu

- Không đọc/in/ghi connection string, project ref hay mật khẩu thật.
- Mẫu dùng `<ADMIN_TOKEN>`, `<ADMIN_PASSWORD_FROM_SECRET_STORE>` và
  `<VISITOR_UUID_VALID>`; slug/UUID còn lại là giá trị giả định.
- `docs/api-samples.md` nhắc đối chiếu project Supabase non-production trước
  khi chạy lệnh ghi và không dán token/connection string vào chat/log.

## Giới hạn

- Đây là kiểm tra tài liệu/tĩnh: **không chạy test, build, lint hay smoke test
  API**, không xác nhận route đang implement song song đã trả đúng shape.
- Không đóng issue #13; bản cập nhật contract này không thay thế việc chạy
  `npm test`/`npm run build` và kiểm thử integration khi route analytics xong.
