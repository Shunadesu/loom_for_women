# Hướng dẫn deploy Admin lên Vercel

## Bước 1: Chuẩn bị backend production

Trước khi deploy admin, đảm bảo backend đã deploy và có URL công khai (VD: `https://loom-backend.onrender.com`).

## Bước 2: Deploy lên Vercel

### Cách 1: Vercel CLI (khuyến nghị)

```bash
cd admin
npm install -g vercel    # nếu chưa có
vercel login            # đăng nhập
vercel                  # deploy
```

Vercel sẽ hỏi:
- **Set up and deploy**: Yes
- **Which scope**: chọn account của bạn
- **Link to existing project**: No (lần đầu)
- **Project name**: `loom-admin` (hoặc tên khác)
- **Directory**: `.` (vì bạn đã cd vào admin/)
- **Override settings**: No

Sau khi deploy xong, vào dashboard Vercel:
1. Settings → Environment Variables
2. Thêm `VITE_API_URL` = `https://loom-backend.onrender.com/api` (thay bằng URL backend thật của bạn)
3. Redeploy (Production tab → ... → Redeploy)

### Cách 2: Vercel Dashboard (Web UI)

1. Vào https://vercel.com/new
2. Import Git repository (push code lên GitHub trước)
3. **Root Directory**: chọn `admin`
4. **Framework Preset**: Vite
5. **Environment Variables**:
   - Key: `VITE_API_URL`
   - Value: `https://loom-backend.onrender.com/api`
6. Deploy

## Bước 3: Kiểm tra

1. Mở URL Vercel (VD: `https://loom-admin.vercel.app`)
2. Đăng nhập với admin account (`0123456789` / `admin123`)
3. Kiểm tra các trang: Dashboard, Heroes, Products...

## Lưu ý

- `vercel.json` đã cấu hình rewrites chống 404 khi reload trang.
- Storage key `loom-admin-api-auth` không xung đột với frontend user.
- Nếu backend chưa bật CORS cho domain Vercel, thêm domain vào whitelist trong `backend/src/app.js`:

```js
const corsOptions = {
  origin: [
    'http://localhost:3012',
    'http://localhost:3013',
    'https://loom-admin.vercel.app',  // ← thêm dòng này
    // ... các domain khác
  ],
  credentials: true,
};
```

## Custom domain (tùy chọn)

Vercel Dashboard → Settings → Domains → Add `admin.your-domain.com` → cập nhật DNS theo hướng dẫn.
