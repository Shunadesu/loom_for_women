# Loom for Women — Backend

API server cho frontend (dev port 3012) và admin (dev port 3013).
Backend chạy ở port **3010**.

## Stack

- Node.js (>= 18) + Express 4
- MongoDB + Mongoose 8
- bcryptjs, jsonwebtoken
- helmet, cors, express-rate-limit
- node-cron 4

## Cài đặt

```bash
cd backend
npm install
cp .env.example .env
# Sửa MONGODB_URI và JWT_SECRET trong .env
```

`JWT_SECRET` bắt buộc **≥ 32 ký tự ngẫu nhiên**. Sinh bằng:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Chạy MongoDB

**Cách 1 — Local:** cài [MongoDB Community](https://www.mongodb.com/try/download/community) và chạy service.

**Cách 2 — Docker:**
```bash
docker run -d -p 27017:27017 --name loom-mongo mongo:7
```

**Cách 3 — MongoDB Atlas:** tạo cluster free, lấy connection string, dán vào `MONGODB_URI`.

## Chạy server

```bash
npm run dev      # watch (node --watch) — chỉ dùng ở local
npm start        # production
```

Server lắng nghe tại `http://localhost:3010`.

Health check: `GET /api/health` → `{ status: 'ok' }`. Endpoint này được miễn rate limit
để hệ thống giám sát (uptime check) không bị chặn.

## Triển khai production (pm2)

File `ecosystem.config.cjs` cấu hình sẵn cho pm2 trên VPS (aaPanel):

```bash
pm2 start ecosystem.config.cjs
pm2 reload ecosystem.config.cjs --update-env
pm2 logs loom-backend
```

Log ghi ra `/www/wwwlogs` (đổi qua biến môi trường `PM2_LOG_DIR`), **không** ghi vào thư mục
project — tránh watcher theo dõi log và restart liên tục.

Template cấu hình môi trường production: `.env.production.template` (đã được thêm vào
`.gitignore` vì chứa `JWT_SECRET` thật).

> `node-cron` đã được nâng lên v4. API dùng trong `src/jobs/cleanup.js`
> (`cron.validate`, `cron.schedule`, `task.stop()`) không đổi giữa v3 và v4.

## Seed config mặc định

```bash
npm run seed
```

Sẽ tạo / cập nhật bản ghi `Config` singleton với nội dung popup mặc định.

Các script seed khác: `npm run seed:courses`, `npm run seed:products`, `npm run seed:documents`.

## Tạo tài khoản admin

```bash
node scripts/create-default-admin.js <sdt> <mat-khau>
```

Mật khẩu bắt buộc **≥ 8 ký tự** (không còn mật khẩu mặc định).

## API Endpoints

### Public

| Method | Path | Mô tả |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/config` | Lấy config popup (text, theme color, primaryShade) |
| `POST` | `/api/auth/register` | Đăng ký: `{ phone, name?, password }` — `password` **bắt buộc** |
| `POST` | `/api/auth/login` | Đăng nhập: `{ phone, password }` — `password` **bắt buộc** |
| `POST` | `/api/events` | Track popup event: `{ eventType, popupId?, sessionId?, userId?, metadata? }` |
| `POST` | `/api/visits` | Ghi lượt truy cập (giới hạn riêng, xem mục Rate limit) |

### User (cần JWT)

| Method | Path | Mô tả |
|---|---|---|
| `GET` | `/api/auth/me` | Thông tin user hiện tại |

### Admin (cần JWT + role=admin)

| Method | Path | Mô tả |
|---|---|---|
| `GET` | `/api/admin/users` | Danh sách users (phân trang) |
| `GET` | `/api/admin/users/:id` | Chi tiết user |
| `DELETE` | `/api/admin/users/:id` | Xoá user |
| `GET` | `/api/admin/stats` | Thống kê popup (tổng events, theo loại, theo ngày) |
| `PUT` | `/api/admin/config` | Cập nhật config |

## Auth

- **Đăng ký bắt buộc mật khẩu** tối thiểu 6 ký tự. Trước đây cho phép đăng ký không mật khẩu
  ⇒ tài khoản "mở", và logic login bỏ qua kiểm tra mật khẩu khi `passwordHash` rỗng ⇒ ai cũng
  đăng nhập được. Đã sửa cả hai chiều.
- Tài khoản cũ **chưa có mật khẩu** sẽ không đăng nhập được. Server trả 401 với thông báo
  "Tài khoản chưa được đặt mật khẩu. Vui lòng liên hệ quản trị viên."
  Muốn mở lại thì đặt mật khẩu qua admin, hoặc chạy lại
  `node scripts/create-default-admin.js <sdt> <mat-khau>`.
- Header: `Authorization: Bearer <token>`
- Production nên bật OTP SMS để chặn đăng ký hàng loạt bằng SĐT ảo.

## CORS

Cấu hình qua biến `CORS_ORIGINS` trong `.env` — danh sách origin được phép gọi API,
phân cách dấu phẩy, **không** có dấu `/` cuối:

| Giá trị | Hành vi |
|:--|:--|
| `*` | Chấp nhận mọi origin, **nhưng `credentials` bị tắt** ⇒ header `Authorization` không được gửi |
| `a.com,b.com` | Chỉ cho phép origin nằm trong danh sách, giữ `credentials: true` |
| để trống | Chỉ cho phép origin nằm trong danh sách dev mặc định (xem bên dưới) |

Ở môi trường `NODE_ENV !== production`, các origin dev sau luôn được thêm vào whitelist:
`http://localhost:3000`, `http://localhost:3001`, `http://localhost:5173`.

> Trước đây dùng `origin: true` (phản chiếu **mọi** origin) kèm `credentials: true` trong khi
> biến `CORS_ORIGINS` thực tế không được dùng. Đã chuyển sang whitelist theo `CORS_ORIGINS`.
> Không dùng `*` ở production.

## Rate limit

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `RATE_LIMIT_WINDOW_MS` | `60000` | Cửa sổ tính rate limit (ms) |
| `RATE_LIMIT_MAX` | `120` | Số request tối đa mỗi cửa sổ cho toàn bộ `/api` |
| `VISIT_RATE_LIMIT_MAX` | `30` | Số request tối đa mỗi cửa sổ riêng cho `POST /api/visits` |

`/api/health` được miễn rate limit.

Endpoint ghi lượt truy cập có limiter riêng và được mount **sau** limiter chung. Trước đây nó
được mount trước ⇒ không bị chặn ⇒ collection `Visit` phình vô hạn.

## TTL dữ liệu lượt truy cập

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `VISIT_TTL_DAYS` | `0` | Số ngày giữ bản ghi `Visit`. `0` = không giới hạn |

Đặt `400` ở production để vẫn tra cứu được dữ liệu 1 năm mà collection không phình vô hạn.

## Cron

- `CLEANUP_CRON` (mặc định `0 2 * * *`): xoá `PopupEvent` cũ hơn 90 ngày.

## Cấu trúc

```
backend/
├── package.json
├── ecosystem.config.cjs      # cấu hình pm2 cho production
├── .env.example
├── .env.production.template   # template production (đã gitignore)
├── .htaccess
├── scripts/                  # seed + tạo admin + verify
├── uploads/                  # ảnh upload từ admin (heroes, products, courses)
└── src/
    ├── index.js              # khởi động server, xử lý signal & crash
    ├── app.js                # middleware, CORS, rate limit, mount routes
    ├── config/db.js
    ├── models/               # User, Course, Lesson, Product, Order, Visit, …
    ├── middleware/           # auth, error, upload (multer)
    ├── routes/               # auth, admin*, courses, products, visits, …
    ├── controllers/          # logic cho từng nhóm route
    ├── jobs/cleanup.js       # cron dọn PopupEvent cũ
    └── utils/                # jwt, points, income, certificate, slugify, …
```
