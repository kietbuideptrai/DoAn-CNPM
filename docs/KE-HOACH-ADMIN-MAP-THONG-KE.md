# Kế hoạch bổ sung — Quản trị, thống kê truy cập, bản đồ bảo tàng

Cập nhật: 2026-11-27. Đây là phạm vi **bổ sung sau MVP**, không thay thế luồng
khách tham quan hiện có (QR → chi tiết → đổi ngôn ngữ → nghe thuyết minh).

Tài liệu liên quan:

- [PRD — Phụ lục A](./PRD.md#phụ-lục-a--phạm-vi-bổ-sung-2026-11-27)
- [Danh sách task P4–P8](./TASKS.md)
- [README](../README.md)

---

## 0. Quyết định đã chốt

| # | Vấn đề | Quyết định |
| --- | --- | --- |
| 1 | Đăng nhập quản trị | Email/mật khẩu seed trong DB, băm bcrypt, API trả JWT |
| 2 | Xóa hiện vật | Xóa vĩnh viễn, có hộp thoại xác nhận; bản dịch xóa theo |
| 3 | Admin trên mobile | Không; admin chỉ làm trên web |
| 4 | Đếm truy cập | Khách duy nhất/ngày (mã ẩn danh) + tổng lượt xem trang; không lưu IP |
| 5 | Dữ liệu biểu đồ | Seed 30 ngày dữ liệu giả, sau đó ghi nhận truy cập thật |
| 6 | Bản đồ | Sơ đồ 1 tầng tự vẽ bằng SVG, chia khu |
| 7 | Vị trí hiện vật | Admin chọn khu + đặt ghim (tọa độ) trong form hiện vật |
| 8 | Bản đồ trên app | Thêm tab **Bản đồ** thứ 6 |
| 9 | Biểu đồ | SVG tự viết, không thêm thư viện chart |
| 10 | Ảnh hiện vật | Chỉ nhập URL (giữ như hiện tại) |
| 11 | Ngôn ngữ bản đồ | Nhãn khu bằng tiếng Việt; tên hiện vật theo ngôn ngữ đang chọn |
| 12 | Database | Được sửa `schema.sql`, thêm migration, seed lại DB local |
| 13 | Cách làm | Lập task cho nhóm; gộp vào `docs/TASKS.md` |

### Không làm trong đợt này

Upload ảnh qua giao diện, bản đồ nhiều tầng, GPS/beacon, nhiều vai trò admin,
phân quyền chi tiết, real-time analytics, xuất Excel/CSV, chỉnh sửa khu vực bản
đồ bằng kéo thả (khu vực cố định trong seed).

---

## 1. Hiện trạng và khoảng trống

| Khu vực | Đã có | Còn thiếu |
| --- | --- | --- |
| Web admin | UI đăng nhập, danh sách, form thêm/sửa, ẩn/hiện, xem trước QR, `AuthContext`, `adminClient` | Backend API admin; nút xóa; chọn vị trí bản đồ; trang thống kê |
| Backend | API đọc hiện vật, health, languages | Auth, CRUD admin, analytics, map API |
| Database | `artifacts`, `artifact_translations`, `admin_users` (rỗng) | Tài khoản admin seed; bảng `museum_zones`, `page_views`; cột vị trí |
| Web công khai | Trang chủ, danh sách, chi tiết, tìm kiếm, TTS, QR | Trang bản đồ, ghi nhận lượt truy cập |
| Mobile | 5 tab, danh sách, chi tiết, quét QR, TTS, yêu thích | Tab bản đồ, API map, dữ liệu demo map |
| Tài liệu | PRD, TASKS, báo cáo, QA | Phụ lục phạm vi mới, API contract, kịch bản demo mới |

> Điểm thuận lợi: phần lớn giao diện admin đã viết xong. Công việc web chủ yếu là
> nối API, thêm xóa, thêm bản đồ chọn vị trí, trang thống kê và trang bản đồ.

---

## 2. Kiến trúc tổng thể

```text
┌──────────────────┐        GET công khai        ┌─────────────────────┐
│  Web công khai   │ ──────────────────────────► │                     │
│  React + Vite    │ ◄────────────────────────── │  Express + TS API   │
└────────┬─────────┘                             │                     │
         │ POST /api/analytics/pageview          │  ┌───────────────┐  │
         ▼                                       │  │  PostgreSQL   │  │
┌──────────────────┐        JWT admin            │  │  artifacts    │  │
│  Web admin       │ ──────────────────────────► │  │  zones        │  │
│  /admin/*        │ ◄────────────────────────── │  │  page_views   │  │
└──────────────────┘                             │  │  admin_users  │  │
                                                 │  └───────────────┘  │
┌──────────────────┐        GET công khai        │                     │
│  Mobile Expo     │ ──────────────────────────► │                     │
│  tab Bản đồ      │ ◄────────────────────────── └─────────────────────┘
└──────────────────┘
```

Nguyên tắc:

- Web và mobile dùng **cùng API map**, cùng dữ liệu khu vực/vị trí.
- Admin web dùng **JWT**; API đọc công khai không cần đăng nhập.
- Analytics chỉ ghi từ web công khai; không ghi từ app, không ghi từ `/admin`.
- Dữ liệu giả nằm trong seed; không hard-code trong component.

---

## 3. Database

### 3.1. Bảng và cột mới

```sql
-- Khu vực trên sơ đồ bảo tàng (1 tầng, hệ tọa độ 1000 x 600)
CREATE TABLE IF NOT EXISTS museum_zones (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  short_name  TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  kind        TEXT NOT NULL DEFAULT 'gallery'
              CHECK (kind IN ('gallery', 'lobby', 'walkway', 'service')),
  x           NUMERIC(7,2) NOT NULL CHECK (x >= 0 AND x <= 1000),
  y           NUMERIC(7,2) NOT NULL CHECK (y >= 0 AND y <= 600),
  width       NUMERIC(7,2) NOT NULL CHECK (width > 0 AND width <= 1000),
  height      NUMERIC(7,2) NOT NULL CHECK (height > 0 AND height <= 600),
  color       TEXT NOT NULL DEFAULT '#EAF2EC',
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- Vị trí hiện vật trên sơ đồ
ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS zone_id TEXT;
ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS map_x NUMERIC(7,2);
ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS map_y NUMERIC(7,2);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'artifacts_zone_id_fkey'
  ) THEN
    ALTER TABLE artifacts
      ADD CONSTRAINT artifacts_zone_id_fkey
      FOREIGN KEY (zone_id) REFERENCES museum_zones(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'artifacts_map_position_check'
  ) THEN
    ALTER TABLE artifacts
      ADD CONSTRAINT artifacts_map_position_check
      CHECK (
        (map_x IS NULL AND map_y IS NULL)
        OR (map_x BETWEEN 0 AND 1000 AND map_y BETWEEN 0 AND 600)
      );
  END IF;
END $$;

-- Xóa hiện vật phải xóa bản dịch theo
ALTER TABLE artifact_translations
  DROP CONSTRAINT IF EXISTS artifact_translations_artifact_id_fkey;
ALTER TABLE artifact_translations
  ADD CONSTRAINT artifact_translations_artifact_id_fkey
  FOREIGN KEY (artifact_id) REFERENCES artifacts(id) ON DELETE CASCADE;

-- Lượt truy cập web
CREATE TABLE IF NOT EXISTS page_views (
  id           BIGSERIAL PRIMARY KEY,
  visitor_id   UUID NOT NULL,
  path         TEXT NOT NULL,
  artifact_slug TEXT,
  viewed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS page_views_viewed_at_idx
  ON page_views (viewed_at);
CREATE INDEX IF NOT EXISTS page_views_visitor_idx
  ON page_views (visitor_id, viewed_at);
CREATE INDEX IF NOT EXISTS page_views_artifact_idx
  ON page_views (artifact_slug)
  WHERE artifact_slug IS NOT NULL;
```

`admin_users` giữ nguyên. Có thể bổ sung `last_login_at TIMESTAMPTZ` nếu cần,
không bắt buộc.

### 3.2. Quy ước tọa độ bản đồ

- Hệ tọa độ cố định `viewBox="0 0 1000 600"`, gốc `(0,0)` ở góc trên trái.
- `x` tăng sang phải, `y` tăng xuống dưới.
- Khu vực là hình chữ nhật `x, y, width, height`.
- Hiện vật là một điểm `map_x, map_y`; nếu null thì không hiện trên bản đồ.
- Toạ độ lưu trong DB, không phụ thuộc kích thước màn hình.
- Trên web/mobile, ghim hiện vật nên là **phần tử HTML/RN phủ lên bản đồ**
  (absolute, kích thước 32–44px) để dễ chạm; SVG chỉ vẽ nền, tường và khu vực.

### 3.3. Dữ liệu seed bản đồ

Khu vực (sơ đồ 1 tầng, 5 phòng + sảnh + hành lang):

| id | Tên | Tên ngắn | kind | x | y | w | h | Màu |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- |
| `sanh` | Sảnh chính | Sảnh | lobby | 390 | 460 | 220 | 120 | `#E6F0EE` |
| `phong-1` | Phòng Kháng chiến và Độc lập | Kháng chiến | gallery | 60 | 60 | 280 | 180 | `#EAF2EC` |
| `phong-2` | Phòng Đời sống Chủ tịch | Đời sống | gallery | 360 | 60 | 280 | 180 | `#F3EFE3` |
| `phong-3` | Phòng Ký ức và Hội ngộ | Ký ức | gallery | 660 | 60 | 280 | 180 | `#E8EEF7` |
| `phong-4` | Phòng Nghệ thuật và Báo chí | Nghệ thuật | gallery | 60 | 270 | 280 | 150 | `#F6E9E4` |
| `hanh-lang` | Hành lang trung tâm | Hành lang | walkway | 360 | 270 | 280 | 150 | `#F7F8F4` |
| `phong-5` | Khu trải nghiệm số | Trải nghiệm | gallery | 660 | 270 | 280 | 150 | `#EDEAF4` |

Sơ đồ minh hoạ:

```text
┌──────────────────────────── Bảo tàng ────────────────────────────┐
│  [Kháng chiến]      [Đời sống]        [Ký ức]                   │
│                                                                  │
│  [Nghệ thuật]       [Hành lang]       [Trải nghiệm]              │
│                                                                  │
│                      [Sảnh chính]                                │
│                         ↑ cửa vào                                │
└──────────────────────────────────────────────────────────────────┘
```

Vị trí 8 hiện vật hiện có:

| slug | Khu | x | y |
| --- | --- | ---: | ---: |
| `a-1-skyraider` | `phong-1` | 120 | 130 |
| `f-5a` | `phong-1` | 260 | 130 |
| `m48-patton` | `phong-2` | 430 | 125 |
| `may-chem` | `phong-2` | 570 | 125 |
| `phao-155mm` | `phong-2` | 500 | 195 |
| `blu-82` | `phong-3` | 730 | 125 |
| `chuong-cop-con-dao` | `phong-3` | 870 | 125 |
| `uh-1-huey` | `phong-4` | 200 | 345 |

### 3.4. Seed 30 ngày truy cập

Script `backend/scripts/seed-analytics.ts`:

- Sinh 30 ngày gần nhất, mỗi ngày 20–80 lượt xem, 10–40 khách duy nhất.
- Dùng bộ 120 `visitor_id` UUID tái sử dụng giữa các ngày để số liệu tự nhiên.
- Tỉ lệ path: `/` 25%, `/artifacts` 20%, `/artifacts/<slug>` 50%, `/map` 5%.
- Dùng PRNG có seed cố định để chạy lại cho kết quả giống nhau.
- Chỉ seed khi bảng `page_views` rỗng, trừ khi chạy `--force`.
- Có thể thêm script xóa dữ liệu cũ hơn 180 ngày (tùy chọn).

### 3.5. Migration và reset local

- Chuyển nội dung mục 3.1 vào `backend/src/db/schema.sql` theo hướng
  **idempotent** (`IF NOT EXISTS`, `DO $$` cho constraint).
- Thêm `backend/src/db/migrate-2026-11-27.sql` cho DB đang có dữ liệu.
- Sửa `backend/scripts/setup-local-db.sh` để **luôn chạy schema/migration**,
  không chỉ khi bảng `artifacts` chưa tồn tại.
- Thêm script tạo admin: `backend/scripts/seed-admin.ts`.
- Thêm script seed demo: `backend/scripts/seed-analytics.ts`.
- Thêm npm script gợi ý:

```json
{
  "scripts": {
    "seed:admin": "tsx scripts/seed-admin.ts",
    "seed:analytics": "tsx scripts/seed-analytics.ts",
    "seed:demo": "npm run seed:admin && npm run seed:analytics"
  }
}
```

- Tài khoản demo gợi ý: `admin@disan.local` / `Admin@12345`.
  Không commit mật khẩu thật; đọc từ `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- Thêm `ADMIN_JWT_SECRET` vào `backend/.env.example`.
- Nếu cần reset sạch:

```bash
podman exec -i studyhub-postgres psql -U postgres -d studyhub \
  -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'
bash backend/scripts/setup-local-db.sh
```

---

## 4. API contract

### 4.1. Quy ước chung

- JSON, tiếng Việt trong thông báo lỗi.
- Lỗi dạng `{ "message": "..." }`.
- Admin dùng header `Authorization: Bearer <token>`.
- Token hết hạn sau 8 giờ.
- `401` khi thiếu/sai token; `404` khi không tìm thấy; `409` khi trùng slug;
  `400` khi dữ liệu không hợp lệ.

### 4.2. Đăng nhập admin

```http
POST /api/admin/auth/login
Content-Type: application/json

{ "email": "admin@disan.local", "password": "Admin@12345" }
```

```json
200 OK
{
  "token": "eyJhbGciOi...",
  "admin": { "id": "uuid", "email": "admin@disan.local" }
}
```

Sai thông tin: `401 { "message": "Email hoặc mật khẩu không chính xác." }`.

### 4.3. Admin — hiện vật

```http
GET    /api/admin/artifacts
GET    /api/admin/artifacts/:id
POST   /api/admin/artifacts
PATCH  /api/admin/artifacts/:id
DELETE /api/admin/artifacts/:id
PUT    /api/admin/artifacts/:id/translations/:language
DELETE /api/admin/artifacts/:id/translations/:language   (tùy chọn)
```

Danh sách trả cả hiện vật đang ẩn:

```json
{
  "artifacts": [
    {
      "id": "uuid",
      "name": "Máy bay cường kích A-1 Skyraider",
      "slug": "a-1-skyraider",
      "category": "Tiền tệ",
      "image_url": "https://...",
      "is_published": true,
      "zone_id": "phong-1",
      "map_x": 120,
      "map_y": 130,
      "updated_at": "2026-11-27T08:00:00.000Z"
    }
  ]
}
```

Chi tiết kèm bản dịch:

```json
{
  "id": "uuid",
  "name": "Máy bay cường kích A-1 Skyraider",
  "slug": "a-1-skyraider",
  "category": "Tiền tệ",
  "image_url": "https://...",
  "is_published": true,
  "zone_id": "phong-1",
  "map_x": 120,
  "map_y": 130,
  "translations": [
    {
      "language_code": "vi",
      "title": "Máy bay cường kích A-1 Skyraider",
      "summary": "...",
      "content": "..."
    }
  ]
}
```

Tạo mới:

```json
POST /api/admin/artifacts
{
  "name": "Tên hiện vật",
  "slug": "ten-hien-vat",
  "category": "Danh mục",
  "image_url": "https://...",
  "zone_id": "phong-1",
  "map_x": 200,
  "map_y": 150
}
→ 201 { "id": "uuid" }
```

Cập nhật một phần (`PATCH`) nhận bất kỳ trường nào ở trên, gồm
`is_published`, `zone_id`, `map_x`, `map_y`. Trả `200` kèm hiện vật đã cập nhật.

Lưu bản dịch (upsert):

```http
PUT /api/admin/artifacts/:id/translations/vi
{ "title": "...", "summary": "...", "content": "..." }
→ 200/204
```

Xóa:

```http
DELETE /api/admin/artifacts/:id
→ 204
```

Xóa hiện vật sẽ xóa toàn bộ bản dịch nhờ `ON DELETE CASCADE`. Dữ liệu
`page_views.artifact_slug` được giữ lại để thống kê lịch sử không bị mất.

### 4.4. Analytics

Ghi lượt xem (công khai, gọi từ web):

```http
POST /api/analytics/pageview
{ "visitor_id": "uuid", "path": "/artifacts/a-1-skyraider" }
→ 204
```

Quy tắc:

- `visitor_id` phải là UUID hợp lệ.
- `path` dài 1–300 ký tự, bắt đầu bằng `/`.
- Từ chối path bắt đầu bằng `/admin`.
- Server tự tách `artifact_slug` nếu path khớp `^/artifacts/([a-z0-9-]+)`.
- Không lưu IP, user-agent, cookie hay thông tin cá nhân.
- Có thể giới hạn tần suất đơn giản theo IP trong bộ nhớ nếu cần.

Tổng hợp cho admin:

```http
GET /api/admin/analytics/summary?days=30
Authorization: Bearer ...
```

```json
{
  "range": { "days": 30, "from": "2026-10-29", "to": "2026-11-27" },
  "totals": {
    "pageviews": 1820,
    "unique_visitors": 640,
    "today_pageviews": 54,
    "today_unique_visitors": 31,
    "peak_day": { "date": "2026-11-15", "pageviews": 92 }
  },
  "daily": [
    { "date": "2026-10-29", "pageviews": 41, "unique_visitors": 22 }
  ],
  "top_artifacts": [
    { "slug": "phao-155mm", "title": "Pháo 155 mm", "views": 120 }
  ]
}
```

- `days` chỉ nhận `7`, `30` (mặc định `30`); có thể mở `90` nếu seed đủ.
- Nhóm ngày theo múi giờ `Asia/Ho_Chi_Minh`.
- Ngày không có dữ liệu trả `0`, không bỏ trống.
- `top_artifacts` lấy tên theo `lang` (mặc định `vi`), fallback `vi`.

### 4.5. Bản đồ công khai

```http
GET /api/museum/map?lang=vi
GET /api/museum/zones
```

```json
{
  "zones": [
    {
      "id": "phong-1",
      "name": "Phòng Kháng chiến và Độc lập",
      "short_name": "Kháng chiến",
      "description": "...",
      "kind": "gallery",
      "x": 60, "y": 60, "width": 280, "height": 180,
      "color": "#EAF2EC",
      "sort_order": 2
    }
  ],
  "artifacts": [
    {
      "slug": "a-1-skyraider",
      "title": "Máy bay cường kích A-1 Skyraider",
      "summary": "...",
      "image_url": "https://...",
      "zone_id": "phong-1",
      "x": 120,
      "y": 130
    }
  ]
}
```

- Chỉ trả hiện vật đã xuất bản.
- Hiện vật chưa có `zone_id`/tọa độ: trả trong danh sách riêng
  `unplaced_artifacts` hoặc bỏ khỏi `artifacts` và ghi chú ở UI.
- `lang` đổi tiêu đề/mô tả; nếu thiếu bản dịch thì fallback `vi`.
- `zones` trả cả `walkway`/`lobby` để vẽ nền; UI bỏ qua chúng khi liệt kê khu
  trưng bày.

---

## 5. Web

### 5.1. Route và điều hướng

| Route | Mục đích |
| --- | --- |
| `/map` | Bản đồ công khai |
| `/admin` | Dashboard + danh sách hiện vật (đã có) |
| `/admin/analytics` | Biểu đồ truy cập + top hiện vật |
| `/admin/artifacts/new` | Thêm hiện vật (đã có) |
| `/admin/artifacts/:id/edit` | Sửa hiện vật + chọn vị trí bản đồ |

Thêm link **Bản đồ** vào nav công khai cạnh **Hiện vật**. Trong admin, thêm link
**Thống kê** và **Xem bản đồ**.

### 5.2. Nối UI admin với API

- Giữ nguyên `AuthContext`, `ProtectedRoute`, `AdminDashboard`,
  `AdminArtifactForm`.
- Backend phải trả đúng shape mà `adminClient` đang chờ; nếu đổi shape thì sửa
  client và test.
- Xử lý `401` bằng sự kiện `admin:unauthorized` (đã có) để đăng xuất.
- Khi lưu hiện vật, gửi thêm `zone_id`, `map_x`, `map_y`.
- Mở rộng type:

```ts
interface AdminArtifactInput {
  name: string;
  slug: string;
  category: string;
  image_url: string;
  zone_id?: string | null;
  map_x?: number | null;
  map_y?: number | null;
}
```

### 5.3. Xóa hiện vật

- Thêm nút **Xóa hiện vật** ở cuối trang sửa (kiểu nguy hiểm, tách khỏi nút Lưu).
- Bấm sẽ hiện `window.confirm` (hoặc dialog riêng) với tên hiện vật.
- Gọi `DELETE /api/admin/artifacts/:id`, thành công quay về `/admin` kèm thông
  báo "Đã xóa hiện vật".
- Nếu lỗi, hiện thông báo tại chỗ, không rời trang.
- Không cho xóa khi đang có thay đổi chưa lưu? Có thể cảnh báo riêng; tối thiểu
  phải xác nhận.

### 5.4. Chọn vị trí bản đồ trong form

- Thêm mục **Vị trí trên bản đồ** trong form hiện vật:
  - Select khu vực (lấy từ `/api/museum/zones`, bỏ `walkway`/`lobby`).
  - Bản đồ nhỏ SVG, bấm vào để đặt ghim.
  - Hiển thị `map_x`, `map_y` dạng số để nhập tay (hỗ trợ bàn phím).
  - Nút **Về giữa khu**.
- Khi chọn khu mà chưa có tọa độ, tự đặt ghim vào tâm khu.
- Khi đổi khu, hỏi hoặc tự chuyển ghim về tâm khu mới; tránh để ghim nằm ngoài
  khu vực.
- Component dùng chung `MuseumMap` với prop `editable`.

### 5.5. Trang thống kê

- `AdminAnalyticsPage` gọi `/api/admin/analytics/summary?days=30`.
- Thẻ tổng quan: tổng lượt xem, khách duy nhất, hôm nay, ngày cao nhất.
- Bộ chọn 7 / 30 ngày.
- Biểu đồ SVG tự viết:
  - Cột: lượt xem/ngày.
  - Đường: khách duy nhất/ngày.
  - Trục tung có lưới, trục hoành hiện ngày cách khoảng.
  - Hover/focus hiện tooltip; hỗ trợ bàn phím.
  - Có `<details>` chứa bảng số liệu để screen reader đọc.
- Bảng **Top hiện vật được xem** (tên, lượt xem).
- Ghi chú rõ: "Số liệu 30 ngày đầu là dữ liệu demo; từ ngày bật ghi nhận là số
  liệu thật."

### 5.6. Trang bản đồ công khai

- `MuseumMapPage` gọi `/api/museum/map?lang=...`.
- Khung bản đồ tỉ lệ 5:3, tối đa ~900px; SVG vẽ tường, khu, hành lang, cửa vào.
- Ghim hiện vật phủ lên bằng HTML button/Link, kích thước 32–40px.
- Bấm ghim hoặc tên trong danh sách → `/artifacts/<slug>`.
- Dưới bản đồ: danh sách hiện vật nhóm theo khu, có số thứ tự khớp ghim.
- Khu `walkway`/`lobby` không nằm trong danh sách khu trưng bày.
- Trạng thái tải/lỗi/thử lại giống các trang hiện có.
- Responsive 320–1440px; không cuộn ngang; nhãn khu dùng `short_name` để không
  tràn.
- Tiếp cận: `<svg role="img" aria-label>`, mỗi ghim có `aria-label`, danh sách
  bên dưới là đường dẫn dự phòng cho screen reader.

### 5.7. Ghi nhận lượt truy cập web

Tạo `web/src/api/analyticsClient.ts`:

```ts
const VISITOR_KEY = "museumVisitorId";

export function getVisitorId(): string {
  // crypto.randomUUID() nếu có; fallback UUID v4; lưu localStorage
}

export function trackPageView(pathname: string): void {
  if (import.meta.env.VITE_DEMO_MODE === "true") return;
  if (pathname.startsWith("/admin")) return;
  fetch(`${API_BASE_URL}/api/analytics/pageview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitor_id: getVisitorId(), path: pathname }),
    keepalive: true,
  }).catch(() => {
    // Không làm hỏng trải nghiệm người dùng nếu analytics lỗi.
  });
}
```

Hook trong `AppLayout` (chỉ route công khai):

```ts
const location = useLocation();
useEffect(() => {
  trackNavigation(location.key, location.pathname);
}, [location.key, location.pathname]);
```

`trackNavigation` giữ biến module `lastKey` để tránh gửi 2 lần do React
StrictMode. Mỗi lần điều hướng mới có `location.key` mới nên vẫn đếm đúng.

Không gửi query string để tránh phân mảnh thống kê; nếu cần phân tích ngôn ngữ
thì mở rộng sau.

### 5.8. File dự kiến

Thêm:

- `web/src/api/analyticsClient.ts`
- `web/src/api/museumClient.ts`
- `web/src/hooks/usePageViewTracking.ts`
- `web/src/components/VisitorChart.tsx`
- `web/src/components/AdminAnalyticsPage.tsx`
- `web/src/components/MuseumMap.tsx`
- `web/src/components/AdminMapPicker.tsx`
- `web/src/components/MuseumMapPage.tsx`

Sửa:

- `web/src/App.tsx` (route `/map`, `/admin/analytics`, nav, tracking)
- `web/src/api/adminClient.ts` (type + delete)
- `web/src/components/AdminPages.tsx` (link thống kê, nút xóa nếu đặt ở list)
- `web/src/components/AdminArtifactForm.tsx` (vị trí bản đồ, nút xóa)
- `web/src/styles.css` (map, chart, admin stats)
- Test tương ứng.

---

## 6. Mobile

### 6.1. Tab bản đồ

- Thêm `mobile/src/app/(tabs)/map.tsx`.
- Thêm vào `(tabs)/_layout.tsx`:
  ```ts
  <Tabs.Screen name="map" options={{ title: t("map") }} />
  ```
- Thêm symbol vào `tabSymbols`: `map: "⌖"` (hoặc biểu tượng phù hợp).
- Thứ tự tab: Trang chủ – Hiện vật – Quét QR – **Bản đồ** – Yêu thích – Cá nhân.
- Kiểm tra 6 tab trên màn hình hẹp; nếu nhãn bị chật, giảm font hoặc rút ngắn
  nhãn. Không để tab bar tràn.

### 6.2. Màn hình bản đồ

- `MapScreen` dùng `useMuseumMap(language)` gọi API map.
- Hiển thị:
  - Tiêu đề + mô tả ngắn.
  - Sơ đồ trong card, tỉ lệ 5:3.
  - Ghim hiện vật là `Pressable` phủ lên, kích thước tối thiểu 40px.
  - Danh sách hiện vật nhóm theo khu; bấm dòng hoặc ghim mở
    `/artifacts/[slug]`.
- Trạng thái tải/lỗi/thử lại giống `artifacts.tsx`.
- Nếu hiện vật chưa có vị trí, hiển thị mục "Chưa xác định vị trí" hoặc ẩn.
- Dùng `react-native-svg` để vẽ nền/khu (cài bằng
  `npx expo install react-native-svg`; kiểm tra docs Expo SDK 58 trước khi dùng),
  hoặc dùng `View` absolute nếu muốn zero dependency.
- Nhãn khu dùng `short_name`; chữ nhỏ nhưng không tràn. Có thể bỏ nhãn trên màn
  hình rất hẹp và dựa vào danh sách bên dưới.

### 6.3. API client và demo mode

- Thêm `getMuseumMap(language, signal)` vào `mobile/src/api/client.ts` hoặc file
  `mobile/src/api/museum.ts`.
- Kiểu dữ liệu đặt trong `shared/types.ts`:
  `MuseumZone`, `MuseumMapArtifact`, `MuseumMapData`.
- Demo mode: thêm `shared/demoMuseumMap.ts` chứa zones + vị trí 8 hiện vật; client
  trả dữ liệu này khi `EXPO_PUBLIC_DEMO_MODE=true`.
- Web demo mode cũng dùng `shared/demoMuseumMap.ts` để hai nền tảng khớp nhau.

### 6.4. File dự kiến

Thêm:

- `mobile/src/app/(tabs)/map.tsx`
- `mobile/src/hooks/useMuseumMap.ts`
- `mobile/src/components/MuseumMap.tsx`
- `shared/demoMuseumMap.ts`

Sửa:

- `mobile/src/app/(tabs)/_layout.tsx`
- `mobile/src/api/client.ts`
- `mobile/src/utils/i18n.ts` (nhãn `map`)
- `shared/types.ts`

---

## 7. Bảo mật và quyền riêng tư

- `ADMIN_JWT_SECRET` bắt buộc trong production; không commit `.env`.
- Mật khẩu admin băm bcrypt (cost 10–12); không lưu plain text.
- Tất cả API ghi/quản trị yêu cầu JWT; API đọc công khai chỉ trả hiện vật đã
  xuất bản.
- Xóa vĩnh viễn chỉ qua admin đã đăng nhập + xác nhận ở UI.
- Analytics không lưu IP, không lưu user-agent, không dùng cookie quảng cáo.
- `visitor_id` là UUID ngẫu nhiên lưu localStorage; người dùng xóa storage thì
  được coi là khách mới.
- Giới hạn kích thước body mặc định của Express (100kb) là đủ; validate độ dài
  `path`, `visitor_id`.
- Có thể thêm giới hạn tần suất login và pageview nếu thời gian cho phép; không
  bắt buộc cho đồ án.

---

## 8. Kiểm thử và tiêu chí nghiệm thu

### 8.1. Backend

- Unit test: băm/kiểm tra mật khẩu, ký/verify JWT, validate slug/ngôn ngữ/tọa độ,
  builder query analytics.
- Integration test (nếu có DB test): login, CRUD, xóa cascade, 401/404/409,
  map API, analytics summary.
- `npm test` và `npm run build` phải pass.

### 8.2. Web

- Test `adminClient` (login, list, create, update, delete, lỗi 401).
- Test form validation và nút xóa (mock confirm).
- Test `VisitorChart` render đúng số liệu, có bảng fallback.
- Test `MuseumMap` render đủ ghim, bấm ghim điều hướng đúng.
- Test tracking: không gửi ở `/admin`, không gửi trùng trong StrictMode, có gửi
  ở route công khai.
- `npm test`, `npm run build` pass; kiểm tra 320/375/390/768/1440px.

### 8.3. Mobile

- `npm run typecheck`, `npm run lint` pass.
- Checklist thiết bị: mở tab Bản đồ, tải dữ liệu, bấm ghim, mở chi tiết, mất
  mạng + thử lại, 6 tab không tràn, VoiceOver/TalkBack đọc được tên khu/ghim.

### 8.4. Tiêu chí nghiệm thu bổ sung

| ID | Tiêu chí |
| --- | --- |
| AC-19 | Đăng nhập admin đúng/sai hoạt động; token hết hạn bị chặn; đăng xuất xóa phiên |
| AC-20 | Admin xem được cả hiện vật ẩn; thêm/sửa hiện vật và 5 bản dịch |
| AC-21 | Xóa hiện vật có xác nhận; hiện vật và bản dịch biến mất khỏi web/app/map |
| AC-22 | Admin gán khu + tọa độ; ghim hiện trên bản đồ đúng vị trí |
| AC-23 | Web ghi nhận lượt xem công khai, không ghi `/admin`, không ghi trùng một lần điều hướng |
| AC-24 | Biểu đồ hiển thị 7/30 ngày, có tổng lượt xem, khách duy nhất, top hiện vật |
| AC-25 | Bản đồ web và mobile dùng cùng dữ liệu; bấm ghim mở đúng hiện vật |
| AC-26 | Bản đồ responsive 320–1440px, dùng được bằng bàn phím và screen reader |
| AC-27 | Dữ liệu seed 30 ngày hiển thị trước khi có truy cập thật |
| AC-28 | Không lưu IP/cookie cá nhân; API admin yêu cầu JWT |

---

## 9. Phân công và thứ tự đề xuất

Ước lượng thô: backend 5–6 ngày, web 5–6 ngày, mobile 2–3 ngày, tài liệu/QA 1
ngày. Ba người làm song song khoảng 1,5–2 tuần.

> Ghi chú: A/B/C là vai trò theo PRD; khi giao việc, thay bằng tên thành viên
> thực tế và tick vào `docs/TASKS.md`.

| Giai đoạn | Backend (B) | Web (A) | Mobile (C) |
| --- | --- | --- | --- |
| 1. Nền dữ liệu | Schema/migration, seed admin, auth API | Chờ API; dựng trang map bằng demo data | Dựng tab map bằng demo data |
| 2. CRUD | Admin artifacts API, map API | Nối admin UI, nút xóa | Nối API map |
| 3. Thống kê | Analytics API, seed 30 ngày | Trang `/admin/analytics`, chart SVG | Polish map, trạng thái lỗi |
| 4. Tích hợp | Test backend, docs API | Trang `/map`, tracking | Checklist thiết bị |
| 5. Nghiệm thu | Hỗ trợ test | QA responsive/a11y | QA mobile |

Task chi tiết có checkbox ở [`docs/TASKS.md`](./TASKS.md) mục **P4–P8**.

---

## 10. Rủi ro và cách xử lý

| Rủi ro | Cách xử lý |
| --- | --- |
| 6 tab làm chật thanh điều hướng mobile | Kiểm tra sớm trên 320px; rút ngắn nhãn hoặc chuyển bản đồ thành thẻ ở Trang chủ nếu cần |
| Xóa vĩnh viễn không hoàn tác | Hộp thoại xác nhận rõ ràng; chỉ admin; có thể chụp màn hình trước khi demo |
| Tọa độ lệch khi màn hình đổi kích thước | Lưu tọa độ theo viewBox cố định; ghim phủ bằng %; test nhiều viewport |
| `react-native-svg` không có trong Expo Go | Kiểm tra docs SDK 58; nếu không ổn, dùng `View` absolute |
| Analytics bị chặn bởi trình duyệt/adblock | Chấp nhận cho đồ án; ghi chú trong báo cáo; không dùng số liệu để kết luận học thuật |
| DB cũ không được migrate | `schema.sql` idempotent + file migration + sửa setup script |
| Demo mode và API thật lệch dữ liệu map | Dùng chung `shared/demoMuseumMap.ts`; test cả hai chế độ |
| Lộ JWT secret/mật khẩu admin | Chỉ để trong `.env`; `.env.example` dùng placeholder; không commit |

---

## 11. Kịch bản demo gợi ý

1. Chạy DB, backend, web, mobile; mở `/api/health` xác nhận `ok`.
2. Mở `/admin/login`, đăng nhập bằng tài khoản demo.
3. Tạo một hiện vật mới, nhập 5 bản dịch, chọn khu và đặt ghim trên bản đồ,
   xuất bản.
4. Mở trang công khai của hiện vật, đổi ngôn ngữ, phát thuyết minh, tải QR.
5. Mở `/admin/analytics`, chọn 7/30 ngày, chỉ ra biểu đồ và top hiện vật; giải
   thích 30 ngày đầu là seed, sau đó là dữ liệu thật.
6. Mở `/map`, bấm ghim hiện vật vừa tạo.
7. Mở app, vào tab **Bản đồ**, bấm cùng ghim, mở chi tiết.
8. Quay lại admin, xóa hiện vật vừa tạo; xác nhận nó biến mất khỏi danh sách,
   bản đồ web và app.

---

## 12. Việc cần chốt thêm (nếu có)

- Tên hiển thị chính thức của bảo tàng trên bản đồ (đang dùng "Di sản kể chuyện").
- Tài khoản admin demo có dùng `admin@disan.local` / `Admin@12345` không.
- Có cần seed 90 ngày thay vì 30 để biểu đồ dài hơn không.
- Có cần xuất CSV thống kê không (hiện ngoài phạm vi).
- Có cần upload ảnh không (hiện chỉ nhập URL).
