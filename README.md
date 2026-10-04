<div align="center">

# 🩷 Loom for Women

**Hộ Chiếu An Toàn — Vì phụ nữ, vì tương lai.**

<sub>Monorepo gồm 3 SPA: người dùng · quản trị · API server</sub>

<br>

<img src="https://img.shields.io/badge/Frontend-Vite_5-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite"/>
<img src="https://img.shields.io/badge/Backend-Node_18-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node"/>
<img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB"/>
<img src="https://img.shields.io/badge/UI-React_18-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React"/>
<img src="https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel"/>
<img src="https://img.shields.io/badge/Theme-#E60067-E60067?style=flat-square" alt="Theme"/>

</div>

---

## 🩷 Tổng quan

Nền tảng "Hộ Chiếu An Toàn" cho phụ nữ Việt — lưu giữ chứng chỉ khoa học, quà tặng và hành trang số an toàn.

| Module | Port | Stack | Trạng thái |
|:--|:--:|:--|:--:|
| 🩷 **Frontend** | `3012` | Vite · React 18 · Tailwind · Zustand · Framer Motion | ✅ Hoàn thành UI |
| ⚙️ **Backend** | `3010` | Node.js · Express · Mongoose · JWT · helmet | ✅ Sẵn sàng |
| 🛠️ **Admin** | `3011` | Vite · React · Tailwind · Recharts · React Router | 🚧 Khung + Vercel ready |

## 📁 Cấu trúc

```
Loom_for_woman/
├── frontend/     # SPA người dùng   → Vite, React 18, Tailwind
│   └── vercel.json
├── admin/        # SPA quản trị     → Vite, React, Recharts
│   └── vercel.json
├── backend/      # REST API          → Express, MongoDB, JWT
└── README.md
```

## 🚀 Quick start

### 1️⃣ Backend
```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev      # http://localhost:3010
```

### 2️⃣ Frontend
```bash
cd frontend
npm install
npm run dev      # http://localhost:3012
```

### 3️⃣ Admin (khi triển khai)
```bash
cd admin
npm install
npm run dev      # http://localhost:3011
```

## 🩷 Luồng người dùng

```
Vào trang → check sessionStorage.popup_completed
  ├─ Chưa có  → Welcome popup → "Bắt Đầu" → Register popup
  │                                              ├─ Đăng ký  → setStorage → Landing
  │                                              └─ "Để sau" → setStorage → Landing
  └─ Có rồi   → Landing (Hero · About · CTA)
```

## 🎨 Theme

| Token | Giá trị | Dùng cho |
|:--|:--|:--|
| `primary` | `#E60067` | nền chính, nút, heading |
| `primary-50` | `#fff0f7` | nền phụ, banner nhẹ |
| `primary-100` | `#ffd9eb` | ring, hover, viền nhạt |
| `primary-600` | `#c50058` | hover, text mạnh |

Class hay dùng: `bg-primary` · `text-primary-600` · `border-primary-100` · `ring-primary-100`.

## 📡 API (rút gọn)

Chi tiết ở [`backend/README.md`](./backend/README.md).

| Method | Path | Auth | Mô tả |
|:--|:--|:--:|:--|
| `GET` | `/api/health` | – | Health check |
| `GET` | `/api/config` | – | Lấy text popup |
| `POST` | `/api/auth/register` | – | Đăng ký SĐT |
| `POST` | `/api/auth/login` | – | Đăng nhập |
| `POST` | `/api/events` | – | Track popup event |
| `GET` | `/api/admin/stats` | 🔒 | Thống kê (admin) |
| `PUT` | `/api/admin/config` | 🔒 | Sửa config (admin) |

## ☁️ Deploy Vercel

Mỗi SPA có sẵn `vercel.json` với **rewrite rule chống 404 khi refresh**:

```jsonc
"rewrites": [
  { "source": "/((?!api/|assets/|.*\\..*).*)", "destination": "/index.html" }
]
```

Trên Vercel:
1. **Add New Project** → chọn repo.
2. Mỗi SPA là 1 project riêng, chỉ định **Root Directory** = `frontend` (hoặc `admin`).
3. Vercel tự detect Vite → không cần override build.
4. Set env `VITE_API_URL` trỏ tới backend (Render / Railway / Fly).

## 🛣️ Lộ trình

- [x] **GĐ 1** — Frontend: UI + popup + landing
- [x] **GĐ 2** — Backend: API + MongoDB + JWT
- [ ] **GĐ 3** — Kết nối Frontend ↔ Backend (thay mock)
- [ ] **GĐ 4** — Admin: login, dashboard, popup editor
- [ ] **GĐ 5** — Hoàn thiện & validate

## 🤝 Đóng góp

Mở issue hoặc PR. Branch convention: `feat/...` · `fix/...` · `docs/...`.

---

<sub align="center">Built with 🩷 by Loom for Women team · © 2026</sub>
