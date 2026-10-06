# 📋 Tổng kết: Tách trang Admin

## ✅ Đã hoàn thành

Đã tách thành công trang admin thành **ứng dụng React độc lập** tại folder `admin/`.

### Cấu trúc dự án hiện tại

```
Loom_for_woman/
├── backend/           # Node.js + Express + MongoDB (cổng 3010)
├── frontend/          # React app cho user (cổng 3012)
├── admin/            # React app cho admin (cổng 3013) ← MỚI
└── README.md
```

---

## 🎯 Điểm khác biệt chính

### 1. **Tách biệt hoàn toàn**

| Khía cạnh | Frontend (User) | Admin |
|-----------|----------------|-------|
| Folder | `frontend/` | `admin/` |
| Dev server | `localhost:3012` | `localhost:3013` |
| Storage key | `loom-auth` | `loom-admin-api-auth` |
| Routes | `/`, `/khoa-hoc`, `/cua-hang`... | `/login`, `/`, `/heroes`, `/products`... |
| Deploy | Vercel (domain chính) | Vercel (subdomain `admin.`) |

### 2. **Axios config riêng**

- `admin/src/services/api.js` dùng storage key `loom-admin-api-auth`
- Interceptor 401 tự động redirect về `/login` (không ảnh hưởng frontend user)

### 3. **Auth flow độc lập**

- Admin login qua `/login` → POST `/api/auth/login` → kiểm tra `role === 'admin'`
- Lưu token riêng → không xung đột với user đã đăng nhập ở frontend

---

## 📦 Files đã tạo

### Config & setup (8 files)
```
admin/
├── package.json          # Dependencies riêng
├── vite.config.js        # Port 3013
├── tailwind.config.js    # Palette giống frontend
├── postcss.config.js
├── vercel.json           # SPA rewrites chống 404
├── .env.development      # API dev: localhost:3010
├── .env.production       # API prod: your-domain.com
├── .gitignore
├── index.html
├── README.md
└── DEPLOY.md
```

### Source code (20 files)
```
src/
├── App.jsx               # Router chính
├── main.jsx              # Entry point
├── index.css             # Tailwind directives
├── components/
│   ├── ProtectedRoute.jsx  # Auth guard
│   └── Sidebar.jsx         # Nav menu
├── pages/
│   ├── Login.jsx           # Trang đăng nhập
│   ├── Layout.jsx          # Header + Sidebar wrapper
│   ├── Dashboard.jsx       # Trang chủ admin
│   ├── HeroManager.jsx     # Quản lý hero banner
│   ├── ProductManager.jsx  # Quản lý sản phẩm
│   └── ProductCategoryManager.jsx
├── services/
│   ├── api.js              # Axios instance (storage key riêng)
│   ├── heroApi.js          # API calls cho hero
│   ├── productApi.js       # API calls cho product + category
│   └── courseApi.js        # API calls cho course + lesson
├── store/
│   ├── authStore.js        # Zustand: login/logout (key riêng)
│   ├── heroStore.js        # State hero
│   ├── productStore.js     # State product + category
│   └── courseStore.js      # State course + lesson
└── utils/
    └── phone.js            # normalizePhoneVN helper
```

---

## 🚀 Cách sử dụng

### Dev local

```bash
# Terminal 1: Backend
cd backend
npm run dev              # → localhost:3010

# Terminal 2: Frontend user (nếu cần)
cd frontend
npm run dev              # → localhost:3012

# Terminal 3: Admin
cd admin
npm install              # lần đầu
npm run dev              # → localhost:3013
```

**Login admin:**
- URL: http://localhost:3013/login
- SĐT: `0123456789`
- Mật khẩu: `admin123`

### Deploy production

#### Backend (Render/Railway/VPS)
```bash
cd backend
# Deploy theo hướng dẫn của hosting
# Lấy URL: https://api.your-domain.com
```

#### Admin (Vercel)
```bash
cd admin
npm run build            # test build trước
vercel                   # deploy
```

**Cấu hình Vercel:**
1. Settings → Environment Variables
2. Thêm `VITE_API_URL` = `https://api.your-domain.com/api`
3. Redeploy

Chi tiết: xem `admin/DEPLOY.md`

---

## 🔐 Bảo mật

### Storage isolation
- User token: `localStorage['loom-auth']`
- Admin token: `localStorage['loom-admin-api-auth']`
- ✅ Không xung đột khi cùng đăng nhập user + admin trên 1 trình duyệt

### API protection
- Backend đã có middleware kiểm tra `role === 'admin'` cho các route `/api/admin/*`
- 401 → admin tự logout + redirect `/login`

### CORS
Đảm bảo backend whitelist domain admin trong `backend/src/app.js`:
```js
origin: [
  'http://localhost:3013',
  'https://admin.your-domain.com',
  // ...
]
```

---

## 📊 Thống kê

| Metric | Giá trị |
|--------|---------|
| Files tạo mới | 28 |
| Dependencies | react, react-router-dom, zustand, axios, tailwindcss |
| Build size | ~257 KB (main JS) + 14 KB (CSS) |
| Dev server | ✅ Chạy thành công `localhost:3013` |
| Production build | ✅ Build thành công `dist/` |
| Vercel ready | ✅ `vercel.json` + env config sẵn sàng |

---

## 🎨 UI/UX

Admin giữ nguyên design system của frontend:
- Màu chủ đạo: `#E60067` (pink)
- Typography: Inter
- Component style: rounded-lg, slate palette, shadow-sm
- Responsive: mobile-first (Tailwind)

---

## 🔄 Next steps (tùy chọn)

1. **Bổ sung pages đầy đủ** — copy từ `frontend/src/pages/admin/` sang `admin/src/pages/` nếu cần CategoryManager, CourseManager, LessonManager đầy đủ với modal CRUD.

2. **Thêm icon library** — hiện tại dùng emoji, có thể thêm `lucide-react` hoặc `heroicons`.

3. **Deploy Vercel** — theo hướng dẫn `admin/DEPLOY.md`.

4. **Custom domain** — cấu hình `admin.loom.com` trỏ về Vercel.

5. **Gỡ code admin khỏi frontend** — xóa `frontend/src/pages/admin/`, `frontend/src/components/admin/` để tránh trùng lặp (tùy chọn, không bắt buộc vì không ảnh hưởng runtime).

---

## 📝 Lưu ý

- **Backend chung**: Admin và frontend user dùng chung 1 backend API.
- **Token key riêng**: Không xung đột khi dev cả 2 app cùng lúc.
- **Vercel SPA rewrites**: `vercel.json` đã xử lý `/heroes`, `/products` không bị 404 khi reload.
- **Env variables**: `.env.production` cần update `VITE_API_URL` trước khi deploy.

---

✅ **Admin app đã sẵn sàng dev local + deploy production!**
