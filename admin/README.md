# Loom Admin

Trang quản trị riêng biệt cho Loom for Women - tách hoàn toàn khỏi frontend user.

## Cấu trúc

```
admin/
├── src/
│   ├── components/       # ProtectedRoute, Sidebar
│   ├── pages/           # Login, Dashboard, HeroManager, ProductManager...
│   ├── services/        # API helpers (heroApi, productApi, courseApi...)
│   ├── store/           # Zustand stores (authStore, heroStore, productStore...)
│   ├── utils/           # phone.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
│   └── logo.png
├── .env.development     # VITE_API_URL=http://localhost:3010/api
├── .env.production      # VITE_API_URL=https://api.your-domain.com/api
├── vercel.json          # SPA rewrites chống 404
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Dev

```bash
cd admin
npm install
npm run dev   # http://localhost:3013
```

## Build

```bash
npm run build
# dist/ → deploy lên Vercel
```

## Deploy Vercel

1. **Tạo project mới** trên Vercel → Import `admin/` folder (hoặc root + Root Directory = `admin`).
2. **Environment Variables** → thêm `VITE_API_URL` = URL backend production (VD: `https://api.loom.com/api`).
3. **Deploy** → Vercel tự detect Vite, build `npm run build`, serve `dist/`.
4. `vercel.json` đã có rewrites chống 404 SPA.

## Login

- **SĐT**: `0123456789` (hoặc admin khác đã tạo từ script `backend/scripts/create-admin.js`)
- **Mật khẩu**: `admin123` (hoặc để trống nếu chưa set)
- **Role**: phải `admin` trong MongoDB collection `users`

## Storage key

Admin dùng key `loom-admin-api-auth` → **không xung đột** với frontend user (`loom-auth`).

## API

Dùng chung backend (`backend/` folder) — các endpoint `/api/admin/*` yêu cầu JWT + role=admin.

## Tech stack

- React 18
- Vite 5
- React Router v7
- Zustand (state)
- Axios
- Tailwind CSS
- Vercel (deploy)
