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
1. Check `sessionStorage.popup_completed`.
2. Chưa có → hiện **Welcome popup** → click "Bắt Đầu" → hiện **Register popup**.
3. Đóng Register (Để sau / Đăng ký thành công) → set sessionStorage → vào Landing.

## Cấu trúc
```
src/
├── components/
│   ├── popups/          # WelcomePopup, RegisterPopup, PopupContainer
│   ├── layout/          # Header, Footer
│   ├── landing/         # Hero, AboutSection, CTABanner
│   └── ui/              # (reserved)
├── pages/Home.jsx
├── store/               # popupStore, authStore, configStore
├── services/api.js      # axios → http://localhost:3010/api
└── App.jsx
```