# P6 — Kiểm chứng bản đồ mobile (2026-11-29)

## Phạm vi

Báo cáo này phản hồi issue #24–#27: API client bản đồ, tab/màn hình Bản đồ,
demo mode dùng chung và chất lượng mobile. Không có thao tác ghi vào Supabase;
backend chỉ chạy local để đọc `/api/museum/map`. Không ghi connection string,
project ref hay secret vào báo cáo.

## Môi trường

| Thành phần | Giá trị |
| --- | --- |
| Ngày chạy | 2026-11-29 |
| Mobile | Expo SDK 58 (`expo ~58.0.19`), React Native 0.88 |
| Backend | Express local `127.0.0.1:3000`, đọc project Supabase non-production đã cấu hình |
| Kiểm tra tĩnh | `npm run typecheck`, `npm run lint` trong `mobile/` |
| Thiết bị | Không có Android/iOS thật hoặc emulator trong môi trường này |

## Kết quả

| Hạng mục | Kết quả | Bằng chứng |
| --- | --- | --- |
| `getMuseumMap(language, signal)` | **Đạt** | Gọi live `GET /api/museum/map?lang=vi` trả 7 zones, 8 artifacts, 0 unplaced; từng phần tử có đủ khóa của `MuseumZone`/`MuseumMapArtifact`. |
| Lỗi mạng / abort | **Đạt** | Script client với `EXPO_PUBLIC_API_URL` trỏ cổng đóng trả `ApiRequestError` có thông điệp tiếng Việt; `AbortSignal` đã hủy bị reject đúng. |
| Demo mode | **Đạt (dữ liệu)** | `EXPO_PUBLIC_DEMO_MODE=true` trả cùng 7 khu/8 hiện vật; nguồn là `shared/demoMuseumMap.ts`, web re-export cùng file. Chưa chạy trên Expo Go. |
| Tab và màn hình | **Đạt (code)** | `mobile/src/app/(tabs)/map.tsx` có sơ đồ `View` tuyệt đối, 8 ghim `Pressable` 40 px, danh sách nhóm theo khu, trạng thái tải/lỗi/thử lại và điều hướng `/artifacts/[slug]`. |
| Typecheck / lint | **Đạt** | `npm run typecheck` và `npm run lint` đều exit 0; lint không còn lỗi `set-state-in-effect` nhờ hook dùng request key như `useArtifacts`. |
| Backend sau đổi nguồn demo | **Đạt** | `npm test` 45/45, gồm 2 test seed-map đọc `shared/demoMuseumMap.ts` và đối chiếu 7 khu/8 tọa độ. |
| Web sau đổi nguồn demo | **Đạt** | `npm test -- --run` 92/92; web demo vẫn dùng file dùng chung. |
| Thiết bị thật / 6 tab / TalkBack / VoiceOver | **Blocked** | Xem các dòng MOB-20…MOB-25 trong [checklist mobile](../../mobile/docs/MOBILE-TEST-CHECKLIST.md). Code đã gắn `accessibilityLabel` cho khu và ghim, `flex: 1` + nhãn 9 px cho 6 tab; cần xác nhận trực quan trên thiết bị. |

## Lệnh đã chạy

```bash
cd mobile && npm run typecheck && npm run lint
cd backend && npm test
cd web && npm test -- --run
```

Ngoài ra, backend được khởi động tạm thời bằng `npm run dev` rồi tắt sau khi
đối chiếu response. Script kiểm chứng client nằm ngoài repo tại
`/tmp/opencode/mobile-api-check.ts`, dùng biến môi trường truyền vào lúc chạy và
không lưu giá trị cấu hình vào file.

## Kết luận

Không có lỗi code chặn demo bản đồ trên web/mobile. Các kiểm tra tự động và
đối chiếu API thật đã đạt. Phần còn lại là nghiệm thu trên thiết bị thật
(MOB-20…MOB-25), phải do người có điện thoại Android/iOS thực hiện trước khi
đánh dấu issue #27 là pass về mặt thiết bị.
