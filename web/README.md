# Web

Website React + Vite + TypeScript. URL `/artifacts/<slug>` do React Router xử lý;
`vercel.json` rewrite mọi đường dẫn về `index.html` để mở trực tiếp hoặc tải lại
không bị 404.

## Cài đặt

```bash
npm install
cp .env.example .env.local
npm run dev
```

Mặc định mở `http://localhost:5173`.

## Biến môi trường

| Biến | Mô tả | Ví dụ |
| --- | --- | --- |
| `VITE_API_URL` | URL gốc của backend | `http://localhost:3000` |
| `VITE_PUBLIC_URL` | URL công khai của web, dùng tạo link và QR | `http://localhost:5173` |
| `VITE_DEMO_MODE` | `false` để dùng API/database thật; `true` chỉ để demo offline | `false` |

Không thêm dấu `/` ở cuối URL. Đổi biến trong `.env.local` thì khởi động lại Vite.

## Kiểm thử và build

```bash
npm test          # chạy toàn bộ test
npm run build     # build vào dist/
```

## Triển khai Vercel

1. Import repository, đặt **Root Directory** là `web`.
2. Framework preset **Vite**; build `npm run build`, output `dist`.
3. Thêm `VITE_API_URL`, `VITE_PUBLIC_URL`, `VITE_DEMO_MODE=false`.
4. Mở thử một URL `/artifacts/<slug>` để xác nhận rewrite hoạt động.
