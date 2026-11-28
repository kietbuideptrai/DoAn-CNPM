# P2-01 — Web chạy với API/database thật

- **Ngày chạy:** 2026-11-25
- **Trạng thái:** **Một phần** — xác minh danh sách, chi tiết và ngôn ngữ trên
  API thật; TTS, fallback, mất mạng chưa chạy lại trong lần này.
- **Môi trường:** production build (`npm run build`) + `vite preview` tại
  `127.0.0.1:4173`; backend `127.0.0.1:3000`; PostgreSQL local 8 hiện vật;
  Helium headless (Chromium), `--virtual-time-budget=6000`.

## Cấu hình

`web/.env.local`:

```env
VITE_API_URL=http://localhost:3000
VITE_PUBLIC_URL=http://localhost:5173
VITE_DEMO_MODE=false
```

## Kết quả

| Case | Kết quả |
| --- | --- |
| `/artifacts` hiển thị danh sách | 8 link hiện vật, khớp 8 slug trong database |
| `/artifacts/a-1-skyraider?lang=ja` | `h1` = “A-1スカイレイダー攻撃機”, nội dung từ API thật |
| Thuộc tính ngôn ngữ vùng nội dung | `.detail-content[lang="ja"]` đúng |
| `html[lang]` | `vi` (khung giao diện tiếng Việt) |
| API health | `backend: ok`, `database: ok` |

## Còn lại

- TTS thật, fallback tiếng Anh, mất mạng/thử lại: chạy lại trên bộ dữ liệu mới.
- Kiểm tra trên điện thoại thật và mạng di động thật.
