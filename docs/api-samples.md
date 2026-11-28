# Ví dụ curl cho API backend (Supabase-first)

Các lệnh dưới đây dùng host giả `https://api.example.test` và placeholder.
Đây là ví dụ tài liệu, **không phải dữ liệu nghiệm thu** và không chứa
connection string, project ref hay credential thật. Các ví dụ request/response
tương ứng nằm trong [api-samples.json](./api-samples.json).

## Quy tắc trước khi chạy

- Chỉ thay host bằng API trỏ tới **project Supabase non-production** đã được
  đối chiếu. Xác nhận lại môi trường trước mọi lệnh ghi (`POST`/`PATCH`/`DELETE`).
- Lấy token admin từ đăng nhập hoặc secret store; giữ trong biến môi trường
  của shell, không dán token vào chat, log, file diff hay commit.
- Không dán connection string/project ref/mật khẩu thật vào chat hoặc log.
- Thay `<VISITOR_UUID_VALID>` bằng UUID v4 do client tạo; `<ADMIN_TOKEN>` là
  JWT nhận được từ `POST /api/admin/auth/login`.

```bash
export API_BASE_URL="https://api.example.test"
export ADMIN_TOKEN="<ADMIN_TOKEN>"
export VISITOR_UUID="<VISITOR_UUID_VALID>"
```

## Đăng nhập admin

```bash
curl -sS -X POST "$API_BASE_URL/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.test","password":"<ADMIN_PASSWORD_FROM_SECRET_STORE>"}'
# 200 {"token":"<ADMIN_TOKEN>"}
```

## Quản trị hiện vật

Tất cả endpoint admin đều cần header:

```http
Authorization: Bearer <ADMIN_TOKEN>
```

Danh sách, gồm cả hiện vật ẩn:

```bash
curl -sS "$API_BASE_URL/api/admin/artifacts" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

Sửa hiện vật (có thể chỉ gửi trường cần đổi, ví dụ `is_published`):

```bash
curl -sS -X PATCH "$API_BASE_URL/api/admin/artifacts/11111111-1111-4111-8111-111111111111" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
        "name": "Máy bay cường kích A-1 Skyraider",
        "slug": "a-1-skyraider",
        "category": "Phương tiện",
        "image_url": "https://example.test/a-1-skyraider.jpg",
        "zone_id": "phong-1",
        "map_x": 120,
        "map_y": 130
      }'
# 204 (không có body)
```

Xóa hiện vật (lệnh ghi, thay đổi database non-production):

```bash
curl -sS -o /dev/null -w '%{http_code}\n' \
  -X DELETE "$API_BASE_URL/api/admin/artifacts/11111111-1111-4111-8111-111111111111" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
# 204
```

## Bản đồ công khai

```bash
curl -sS "$API_BASE_URL/api/museum/zones"
curl -sS "$API_BASE_URL/api/museum/map?lang=vi"
```

`GET /api/museum/map?lang=vi` trả `{ "zones": [...], "artifacts": [...] }`
và có thể có `unplaced_artifacts`. Chỉ hiện vật đã xuất bản và có tọa độ mới
nằm trong `artifacts`; thiếu bản dịch thì fallback `vi`.

## Analytics

Ghi một lượt xem công khai (lệnh ghi; path `/admin` bị từ chối):

```bash
curl -sS -o /dev/null -w '%{http_code}\n' \
  -X POST "$API_BASE_URL/api/analytics/pageview" \
  -H "Content-Type: application/json" \
  -d "{\"visitor_id\":\"$VISITOR_UUID\",\"path\":\"/artifacts/a-1-skyraider\"}"
# 204
```

Tổng hợp cho admin (chỉ đọc):

```bash
curl -sS "$API_BASE_URL/api/admin/analytics/summary?days=30" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

Response phải đúng shape mà `web/src/api/adminClient.ts` kỳ vọng:

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
    { "slug": "a-1-skyraider", "title": "Máy bay cường kích A-1 Skyraider", "views": 120 }
  ]
}
```

`daily` ở ví dụ trên chỉ rút gọn; thực tế phải đủ `days` ngày theo múi giờ
`Asia/Ho_Chi_Minh`, ngày không có dữ liệu trả `0`. `days` nhận `7` hoặc `30`,
mặc định `30`; `peak_day` có thể là `null`.
