# Loom for Woman — Frontend

Trang người dùng. Chạy ở port **3012**.

## Stack
- Vite + React 18
- Tailwind CSS (primary palette)
- Zustand (popup, auth, config store)
- Framer Motion (animations)

## Cài đặt
```bash
cd frontend
npm install
npm run dev
```

Mở trình duyệt: http://localhost:3012

## Luồng khi vào trang
1. Vào thẳng Landing — không còn popup chào mừng / popup đăng ký tài khoản.
2. Đăng nhập / đăng ký thực hiện qua **LoginDrawer** (mở từ header, icon tài khoản).

## Cấu trúc
```
src/
├── components/
│   ├── layout/          # Header, Footer
│   ├── landing/         # Hero, AboutSection, CTABanner
│   └── ui/              # (reserved)
├── pages/Home.jsx
├── store/               # authStore, configStore
├── services/api.js      # axios → http://localhost:3010/api
└── App.jsx
```