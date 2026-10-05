# Loom for Women — Backend

API server cho frontend (port 3012) và admin (port 3011).
Chạy ở port **3010**.

## Stack

- Node.js (>= 18) + Express
- MongoDB + Mongoose
- bcryptjs, jsonwebtoken
- helmet, cors, express-rate-limit
- node-cron

## Cài đặt

```bash
cd backend
npm install
cp .env.example .env
# Sửa MONGODB_URI và JWT_SECRET trong .env
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
npm run dev      # nodemon-style watch
npm start        # production
```

Server lắng nghe tại `http://localhost:3010`.

Health check: `GET /api/health` → `{ status: 'ok' }`.

## Seed config mặc định

```bash
npm run seed
```

Sẽ tạo / cập nhật bản ghi `Config` singleton với nội dung popup mặc định.

## API Endpoints

### Public

| Method | Path | Mô tả |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/config` | Lấy config popup (text, theme color, primaryShade) |
| `POST` | `/api/auth/register` | Đăng ký: `{ phone, password? }` |
| `POST` | `/api/auth/login` | Đăng nhập: `{ phone, password? }` |
| `POST` | `/api/events` | Track popup event: `{ eventType, popupId?, sessionId?, userId?, metadata? }` |

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

- Mặc định `password` không bắt buộc (cho MVP). Sau khi đăng ký, server trả JWT.
- Production nên bật OTP SMS hoặc bắt buộc password.
- Header: `Authorization: Bearer <token>`

## CORS

Cấu hình qua biến `CORS_ORIGINS` trong `.env`:

| Giá trị | Hành vi |
|:--|:--|
| `*` hoặc để trống | Chấp nhận **mọi origin** (echo lại origin để vẫn tương thích `credentials: true`) |
| `a.com,b.com` | Chỉ cho phép origin nằm trong danh sách |

Lưu ý: server luôn echo lại origin cụ thể (không gửi `Access-Control-Allow-Origin: *`) để browser chấp nhận cookie/Authorization header khi `credentials: true`.
- Header: `Authorization: Bearer <token>`

## Cron

- `CLEANUP_CRON` (mặc định `0 2 * * *`): xoá `PopupEvent` cũ hơn 90 ngày.

## Cấu trúc

```
backend/
├── package.json
├── .env.example
├── scripts/
│   └── seed.js
└── src/
    ├── index.js
    ├── app.js
    ├── config/db.js
    ├── models/{User,Config,PopupEvent}.js
    ├── middleware/{auth,error}.js
    ├── routes/{auth,config,events,admin}.js
    ├── controllers/{auth,config,event,admin}Controller.js
    ├── jobs/cleanup.js
    └── utils/jwt.js
```