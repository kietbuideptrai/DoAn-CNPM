# Kế hoạch hoàn thiện đồ án

Cập nhật 2026-11-29. Phạm vi MVP theo [PRD 1.1](./PRD.md), cộng với
[phạm vi bổ sung](./KE-HOACH-ADMIN-MAP-THONG-KE.md) (quản trị, thống kê truy cập,
bản đồ). Luồng chính vẫn là:
**QR → trang hiện vật → đổi ngôn ngữ → đọc/nghe thuyết minh**.

## 1. Trạng thái hiện tại

| Khu vực | Trạng thái |
| --- | --- |
| Database | **Supabase PostgreSQL non-production** là nguồn chuẩn, kết nối qua pooler/TLS bằng `DATABASE_URL`. Podman local chỉ là dự phòng. Không dán connection string hay project ref thật vào repo. |
| Backend | API MVP + admin/map/analytics đã có mã và test: `npm test` 45/45, `npm run build` đạt. Đã chạy `setup:supabase` và đối chiếu health/map/analytics trên project Supabase non-production đã duyệt. |
| Web | Sau khi gộp nhánh bổ sung: `npm test` 92/92, `npm run build` đạt; `.env.local` đặt `VITE_DEMO_MODE=false` và gọi API thật. |
| Mobile | Đã có tab **Bản đồ** thứ 6 dùng `/api/museum/map`; `npm run typecheck` và `npm run lint` đạt; API thật trả 7 khu/8 hiện vật và demo mode trả cùng dữ liệu web. Chưa kiểm thử trên thiết bị thật. |
| Quản trị | Web đã có UI đăng nhập/danh sách/form/ẩn/xóa; backend auth + CRUD chạy trên Supabase non-production. Bằng chứng UI/API tại [P8-02](./qa/P8-02-supplemental-evidence.md). |
| Thống kê | Đã có client/chart/tracking trên web, bảng `page_views` và API analytics trên Supabase; seed 30 ngày và đổi 7/30 ngày đã kiểm chứng. |
| Bản đồ | Web `/map` và tab mobile Bản đồ dùng chung dữ liệu demo `shared/demoMuseumMap.ts`; migration/seed và API công khai trên Supabase đã chốt. Chỉ còn kiểm thử trên thiết bị thật. |
| Tài liệu | `backend/README.md`, runbook DB, API samples, README gốc, PRD Phụ lục A, báo cáo/vấn đáp và checklist QA đã cập nhật theo phần bổ sung; xem [P8-01](./qa/P8-01-docs-sync.md). |

## 2. Task còn lại

### P0 — Chốt database thật

- [x] **P0-01** Dựng PostgreSQL local bằng Podman, tạo database `studyhub`.
- [x] **P0-02** Chạy `schema.sql` + `seed.sql`, xuất bản 8 hiện vật demo từ Supabase.
- [x] **P0-03** Trỏ `backend/.env` vào database local; `/api/health` trả HTTP 200.
- [x] **P0-04** Tắt demo mode ở web và mobile; cấu hình `.env.example` mặc định dùng API thật.
- [x] **P0-05** Kiểm tra CORS khi mở web bằng IP LAN (ví dụ `http://192.168.1.18:5173`).
  **Đạt khi:** thêm origin vào `CORS_ORIGINS`, gọi được `/api/artifacts` từ trình duyệt điện thoại.
  Đã kiểm tra: origin LAN trả 200, origin lạ trả 403.
- [x] **P0-06** Chuyển database chuẩn sang Supabase non-production.
  **Đạt khi:** `backend/.env` dùng connection string pooler có TLS, đã đối chiếu
  project ref/host với project được duyệt; schema + migration + seed chạy được
  trên Supabase; `/api/health` trả `database: ok`; không có secret nào bị commit.
  Xem [P4/P7 chốt Supabase](./qa/P4-P7-backend-supabase-final-verification.md).

### P1 — Dữ liệu và API

- [ ] **P1-01** Rà soát 40 bản dịch: chính tả, thuật ngữ lịch sử, tên riêng.
  **Đạt khi:** mỗi hiện vật có đủ `vi/en/zh/ja/ko`, không còn chỗ đánh dấu “cần sửa”.
- [ ] **P1-02** Thay ảnh `placehold.co` bằng ảnh có quyền sử dụng (nếu có).
  **Đạt khi:** `image_url` trỏ ảnh thật hoặc có xác nhận dùng placeholder cho buổi demo.
- [x] **P1-03** Chạy `verify-seed.sql` và `verify-demo-readiness.sql` trên database thật; lưu kết quả vào `docs/qa/`.
  **Đạt khi:** 8/8 hiện vật published, đủ 5 ngôn ngữ, kết quả được ghi lại.
  Kết quả: [P1-03/P1-04](./qa/P1-03-database-verification.md).
- [x] **P1-04** Smoke test API: 5 ngôn ngữ, tìm tiếng Việt/Anh khi đang xem ngôn ngữ khác, slug sai trả 404, thiếu bản dịch trả `translation: null`.
  **Đạt khi:** có log/ảnh chụp response cho từng nhánh.
  Đã chạy; riêng nhánh `translation: null` dùng unit test vì bộ dữ liệu hiện đủ 5 ngôn ngữ.

### P2 — Web và mobile dùng API thật

- [ ] **P2-01** Chạy web với `VITE_DEMO_MODE=false`, kiểm tra danh sách, tìm kiếm, chi tiết, đổi ngôn ngữ, TTS, fallback, mất mạng/thử lại.
  **Đạt khi:** các luồng chính chạy trên dữ liệu database, không có lỗi console.
  Đã xác minh danh sách 8 hiện vật và chi tiết `ja` trên API thật
  ([báo cáo](./qa/P2-01-web-real-api.md)); còn TTS/fallback/mất mạng.
- [ ] **P2-02** Chạy mobile qua Expo Go với `EXPO_PUBLIC_API_URL=http://<IP-LAN>:3000`; thực hiện 19 case trong [checklist mobile](../mobile/docs/MOBILE-TEST-CHECKLIST.md).
  **Đạt khi:** ghi Pass/Fail, model máy, phiên bản OS.
- [ ] **P2-03** Kiểm thử thiết bị thật: quyền camera, QR đúng/sai, TTS native, VoiceOver/TalkBack.
  **Đạt khi:** có ảnh/video và kết quả từng case. Cần điện thoại Android/iOS.
- [ ] **P2-04** Kiểm tra screen reader web bằng NVDA hoặc Orca.
  **Đạt khi:** đọc được heading, nhãn nút, dialog fallback và trạng thái TTS.
- [ ] **P2-05** Đo thời gian tải trên mạng di động thật (mục tiêu ≤ 3 giây).
  **Đạt khi:** ghi thiết bị, mạng, p95 và so với mục tiêu.

### P3 — Đóng gói và báo cáo

- [ ] **P3-01** Triển khai backend (Render/Railway) và web (Vercel) dùng Supabase non-production.
  **Đạt khi:** HTTPS hoạt động; `DATABASE_URL`, `ADMIN_JWT_SECRET` lấy từ secret
  store; `CORS_ORIGINS` đúng domain; `/api/health` trả `database: ok`. Không dùng
  anon key ở server.
- [ ] **P3-02** Tạo QR cho 8 hiện vật, trỏ domain web thật; thử mở và tải lại URL.
- [ ] **P3-03** Chạy lại E2E trên bản deploy; ghi bug và bằng chứng.
- [x] **P3-04** Cập nhật [báo cáo/vấn đáp](./BAO-CAO-DO-AN.md): 92 test web, 45 test backend, database Supabase non-production, ảnh placeholder. Đã cập nhật cả phần bổ sung tại mục 6.
- [ ] **P3-05** Commit phần dọn repo (đã bỏ theo dõi `node_modules`, `dist`, `.env.local`).

### P4 — Backend quản trị và dữ liệu mới

Thiết kế chi tiết: [kế hoạch bổ sung](./KE-HOACH-ADMIN-MAP-THONG-KE.md). Các task
này có thể làm song song với P1–P3; không thay thế các task cũ.

**Phân công nhanh** (A = Web, B = Backend, C = Mobile; đổi thành tên thật khi giao):

| Task | Người | Ước lượng | Phụ thuộc |
| --- | --- | ---: | --- |
| P4-01 Schema/migration/seed admin | B | 1 ngày | — |
| P4-02 Auth JWT | B | 1 ngày | P4-01 |
| P4-03 CRUD hiện vật/bản dịch | B | 1,5 ngày | P4-02 |
| P4-04 API bản đồ | B | 1 ngày | P4-01 |
| P4-05 API analytics | B | 1,5 ngày | P4-01 |
| P4-06 Test/tài liệu API | B | 0,5 ngày | P4-03, P4-04, P4-05 |
| P5-01 Nối admin UI | A | 1 ngày | P4-02, P4-03 |
| P5-02 Nút xóa | A | 0,5 ngày | P5-01 |
| P5-03 Chọn vị trí bản đồ | A | 1 ngày | P4-04 |
| P5-04 Trang thống kê + chart | A | 1,5 ngày | P4-05, P7-01 |
| P5-05 Trang `/map` | A | 1,5 ngày | P4-04, P7-02 |
| P5-06 Ghi nhận lượt xem | A | 0,5 ngày | P4-05 |
| P5-07 Test web | A | 0,5 ngày | P5-01…P5-06 |
| P6-01 API client map | C | 0,5 ngày | P4-04 |
| P6-02 Tab + màn hình map | C | 1,5 ngày | P6-01 |
| P6-03 Demo mode map | C | 0,5 ngày | P6-02, P7-02 |
| P6-04 Typecheck/lint/thiết bị | C | 0,5 ngày | P6-02 |
| P7-01 Seed 30 ngày | B | 0,5 ngày | P4-01 |
| P7-02 Seed khu/vị trí | B | 0,5 ngày | P4-01 |
| P7-03 Script setup/reset | B | 0,5 ngày | P4-01, P7-01, P7-02 |
| P8-01 Tài liệu | Cả nhóm | 0,5 ngày | P4…P7 |
| P8-02 QA/ảnh chụp | Cả nhóm | 0,5 ngày | P5, P6 |
| P8-03 Báo cáo/demo | Cả nhóm | 0,5 ngày | P8-02 |
| P8-04 Test cuối + commit | Cả nhóm | 0,5 ngày | P8-03 |

Tổng khoảng 19–20 ngày công; ba người làm song song khoảng 1,5–2 tuần.

- [x] **P4-01** Cập nhật schema + migration + seed admin trên Supabase non-production.
  **Đạt khi:** đã đối chiếu project ref/host pooler; `schema.sql` và các
  `migrate-*.sql` chạy được bằng SQL Editor/`psql "$DATABASE_URL"`; có bảng
  `museum_zones`, `page_views`; `artifacts` có `zone_id`, `map_x`, `map_y`; xóa
  hiện vật xóa bản dịch theo; `npm run seed:admin` tạo tài khoản từ secret store.
- [x] **P4-02** API đăng nhập admin + middleware JWT với `admin_users` trên Supabase.
  **Đạt khi:** đúng email/mật khẩu đã seed trả token; sai trả 401; thiếu/hết hạn
  token trả 401; `ADMIN_JWT_SECRET` nằm ở secret store; `npm test` có test hash/token.
- [x] **P4-03** API CRUD hiện vật và bản dịch trên Supabase.
  **Đạt khi:** danh sách gồm cả hiện vật ẩn; tạo/sửa/xóa được; slug trùng trả 409;
  upsert bản dịch 5 ngôn ngữ; xóa trả 204 nhờ FK `ON DELETE CASCADE`; không lộ
  lỗi SQL/connection string trong response.
- [x] **P4-04** API bản đồ công khai đọc từ `museum_zones` và vị trí trên Supabase.
  **Đạt khi:** `GET /api/museum/map?lang=vi` trả zones + hiện vật đã xuất bản kèm
  tọa độ; hiện vật ẩn/không có vị trí không xuất hiện trong danh sách chính; có
  fallback `vi`.
- [x] **P4-05** API analytics ghi bảng `page_views` trên Supabase.
  **Đạt khi:** `POST /api/analytics/pageview` trả 204, tách được `artifact_slug`,
  không lưu IP/user-agent; `GET /api/admin/analytics/summary?days=30` trả tổng,
  daily đủ 30 ngày theo `Asia/Ho_Chi_Minh` và top hiện vật.
- [x] **P4-06** Test backend + tài liệu API Supabase-first.
  **Đạt khi:** `npm test` và `npm run build` pass; `.env.example` có
  `DATABASE_URL` để trống kèm ghi chú pooler/TLS và `ADMIN_JWT_SECRET`;
  README/`src/db/README.md` có thứ tự schema → migration → seed và ví dụ API,
  không chứa credential thật.

### P5 — Web quản trị, thống kê và bản đồ

- [x] **P5-01** Nối UI admin hiện có với API thật; xử lý 401 và trạng thái lỗi.
  **Đạt khi:** đăng nhập, danh sách, thêm, sửa, ẩn/hiện chạy trên DB thật.
- [x] **P5-02** Thêm nút xóa hiện vật + xác nhận.
  **Đạt khi:** xóa xong quay về danh sách; hiện vật biến mất khỏi web/app/map;
  hủy xác nhận không xóa.
- [x] **P5-03** Chọn khu + tọa độ bản đồ trong form hiện vật.
  **Đạt khi:** chọn khu, bấm bản đồ đặt ghim, nhập tay tọa độ, lưu và mở lại thấy
  đúng vị trí.
- [x] **P5-04** Trang `/admin/analytics` + biểu đồ SVG.
  **Đạt khi:** hiện tổng lượt xem, khách duy nhất, hôm nay, top hiện vật; đổi
  7/30 ngày; có bảng số liệu dự phòng cho screen reader.
- [x] **P5-05** Trang `/map` công khai + link trên nav.
  **Đạt khi:** bản đồ hiện khu/ghim; bấm ghim mở đúng hiện vật; responsive
  320–1440px; có trạng thái tải/lỗi/thử lại.
- [x] **P5-06** Ghi nhận lượt xem web.
  **Đạt khi:** route công khai gửi 1 request/lần điều hướng; không gửi ở `/admin`;
  không gửi trùng do StrictMode; lỗi analytics không làm hỏng trang.
- [x] **P5-07** Test web + build.
  **Đạt khi:** `npm test` và `npm run build` pass; có test cho admin client, xóa,
  chart, map và tracking.

### P6 — Mobile bản đồ

- [x] **P6-01** Thêm kiểu dữ liệu map vào `shared/types.ts` + API client.
  **Đạt khi:** `getMuseumMap(language)` gọi được API thật, có abort signal.
  Đã kiểm chứng: live 7 khu/8 hiện vật, lỗi mạng thân thiện, demo và abort đều
  đúng; xem [báo cáo QA](./qa/P6-mobile-map-verification.md).
- [x] **P6-02** Thêm tab **Bản đồ** và màn hình map.
  **Đạt khi:** tab thứ 6 hiển thị; sơ đồ + ghim + danh sách hiện vật; bấm ghim mở
  `/artifacts/[slug]`; có tải/lỗi/thử lại. Dùng `View` tuyệt đối nên không thêm
  dependency SVG; chạy được trong Expo Go.
- [x] **P6-03** Demo mode cho bản đồ.
  **Đạt khi:** `EXPO_PUBLIC_DEMO_MODE=true` vẫn xem được bản đồ từ
  `shared/demoMuseumMap.ts`; dữ liệu khớp web demo. File mới là nguồn chuẩn;
  `shared/demoMap.ts` và `web/src/data/demoMap.ts` chỉ re-export.
- [x] **P6-04** Typecheck, lint và checklist thiết bị.
  **Đạt khi:** `npm run typecheck`, `npm run lint` pass; 6 tab không tràn trên
  màn hình hẹp; VoiceOver/TalkBack đọc được tên khu/ghim.
  Đã pass typecheck/lint và ghi checklist MOB-20…MOB-25; các mục cần thiết bị
  thật được đánh `Blocked` trong môi trường này, không có lỗi code chặn demo.

### P7 — Dữ liệu demo

- [x] **P7-01** Seed 30 ngày lượt truy cập vào `page_views` trên Supabase.
  **Đạt khi:** `npm run seed:analytics` tạo dữ liệu 30 ngày trên project đã duyệt,
  chạy lại không nhân đôi nếu không có `--force`; biểu đồ có số liệu ngay khi demo;
  không lưu IP/user-agent.
- [x] **P7-02** Seed khu vực + vị trí 8 hiện vật trên Supabase.
  **Đạt khi:** seed idempotent theo slug mới nhất; `GET /api/museum/map` trả đủ
  7 khu và 8 hiện vật có tọa độ từ Supabase.
- [x] **P7-03** Runbook setup/reset Supabase.
  **Đạt khi:** script kiểm tra project ref/host pooler, chạy schema/migration/seed/
  admin/analytics theo thứ tự; reset chỉ trên non-production và có xác nhận;
  `setup-local-db.sh` chỉ giữ làm fallback; README ghi rõ lệnh.

### P8 — Tài liệu và nghiệm thu

- [x] **P8-01** Cập nhật PRD Phụ lục A, TASKS, README, API samples.
  Đối chiếu xong; xem [P8-01 docs sync](./qa/P8-01-docs-sync.md).
- [x] **P8-02** QA: ảnh chụp admin/map/chart; responsive 320/375/390/768/1440;
  kiểm tra bàn phím và screen reader.
  Đã chụp 13 ảnh và ghi JSON bằng chứng tại [P8-02](./qa/P8-02-supplemental-evidence.md).
  Thiết bị thật và screen reader thật vẫn Blocked; không đánh pass giả.
- [x] **P8-03** Cập nhật báo cáo/vấn đáp và kịch bản demo.
  Xem mục 6 của [báo cáo](./BAO-CAO-DO-AN.md), kịch bản chạy 5–7 phút đã được
  kiểm chứng bằng [kịch bản QA](./qa/P8-02-supplemental-evidence.md).
- [x] **P8-04** Chạy lại toàn bộ test/build/typecheck; commit phần bổ sung.
  Kết quả tại [P8-04 chốt 29/11](./qa/P8-04-final-verification-2026-11-29.md);
  commit đã push trên nhánh `kietbuideptrai/backend-supabase`.

## 3. Thứ tự đề xuất

**MVP cũ (đang dở):**

1. P1-03, P1-04 — xác minh database và API thật.
2. P2-01 — web chạy đúng trên API thật.
3. P2-02, P2-03 — mobile trên máy thật.
4. P3-01, P3-02 — deploy và QR.
5. P3-04, P3-05 — báo cáo và dọn repo.

**Phần bổ sung (làm song song được):**

1. P4-01 — schema/migration/seed admin (chặn toàn bộ phần bổ sung).
2. P4-02, P4-03 — auth + CRUD; P5-01, P5-02 nối admin UI và nút xóa.
3. P4-04, P7-02 — API bản đồ + seed vị trí; P5-03, P5-05 và P6-01, P6-02 làm
   bản đồ web/mobile.
4. P4-05, P7-01 — analytics + seed 30 ngày; P5-04, P5-06 làm biểu đồ và tracking.
5. P6-03, P6-04 — demo mode và kiểm thử mobile.
6. P8-01…P8-04 — tài liệu, QA, báo cáo, commit.

## 4. Lệnh vận hành

Chuẩn là Supabase non-production. Trước khi chạy lệnh ghi, đối chiếu project
ref/host pooler trong `backend/.env` với project đã duyệt; không dán connection
string thật vào terminal/log được chia sẻ.

```bash
# 1. Schema + migration trên Supabase (SQL Editor hoặc psql "$DATABASE_URL")
cd backend
psql "$DATABASE_URL" -f src/db/schema.sql
# chạy các file migrate-*.sql theo thứ tự trong backend/README.md

# 2. Seed dữ liệu demo trên project đã duyệt
psql "$DATABASE_URL" -f src/db/seed.sql
psql "$DATABASE_URL" -f src/db/seed-map.sql
npm run seed:admin
npm run seed:analytics   # bỏ qua nếu bảng page_views đã có dữ liệu

# 3. Backend / Web / Mobile
cd backend && npm run dev
curl http://localhost:3000/api/health
cd ../web && npm run dev
cd ../mobile && npm start
```

Fallback local (không phải nguồn chuẩn):

```bash
podman start studyhub-postgres
podman exec studyhub-postgres pg_isready -U postgres -d studyhub
bash backend/scripts/setup-local-db.sh
```

Chi tiết xem [`backend/README.md`](../backend/README.md) và
[`backend/src/db/README.md`](../backend/src/db/README.md).

## 5. Ghi chú dữ liệu

8 hiện vật demo được xuất từ database Supabase ngày 2026-11-28.
Bản dịch là bản nháp cần hiệu đính; ảnh đang dùng placeholder. Trước khi công bố
chính thức cần duyệt nội dung và xác nhận quyền sử dụng ảnh.

## 6. Phạm vi

Từ 2026-11-27, các phần sau **đã chuyển vào phạm vi bổ sung** (xem
[kế hoạch](./KE-HOACH-ADMIN-MAP-THONG-KE.md) và PRD Phụ lục A):

- Giao diện quản trị, đăng nhập admin, CRUD hiện vật/bản dịch, xóa vĩnh viễn.
- Thống kê lượt truy cập web và biểu đồ.
- Bản đồ bảo tàng trên web và mobile, gán vị trí hiện vật.

Vẫn **ngoài phạm vi**: upload ảnh qua giao diện, lịch sử xem, điều chỉnh tốc độ
TTS, bản đồ nhiều tầng, GPS/beacon, deep link mở thẳng app, phân quyền nhiều vai
trò, real-time analytics, xuất Excel/CSV.
