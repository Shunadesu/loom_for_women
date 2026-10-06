# Safety Passport Backend - Hướng dẫn test

## Các API endpoints đã tạo

### 1. GET /api/me/passport
Lấy thông tin hộ chiếu an toàn của user hiện tại

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "profile": {
    "_id": "...",
    "name": "Nguyễn Thị Mai",
    "phone": "0987654321",
    "avatar": "...",
    "location": "KCN PouYuen",
    "zaloVerified": true,
    "passportSerial": "LP-1234"
  },
  "stats": {
    "completedCourses": 3,
    "postedProducts": 5,
    "sideIncome": 1850000
  },
  "badges": ["Học viên xuất sắc", "Người bán tích cực"],
  "qrPayload": "http://localhost:3012/verify/LP-1234",
  "progressList": [...]
}
```

### 2. GET /api/me/products/me
Lấy danh sách sản phẩm user đã đăng

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "...",
    "title": "Túi vải handmade",
    "price": 80000,
    "stock": 5,
    "imageUrl": "...",
    ...
  }
]
```

### 3. GET /api/me/orders
Lấy danh sách đơn hàng từ khách (user là seller)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "...",
    "orderCode": "#ORD-2026-001",
    "buyerName": "Chị Mai Anh",
    "buyerPhone": "0901234567",
    "productTitle": "Túi vải handmade",
    "quantity": 2,
    "totalPrice": 160000,
    "status": "pending",
    "createdAt": "2026-10-05T10:30:00.000Z"
  }
]
```

### 4. GET /api/me/messages
Lấy danh sách tin nhắn từ khách hàng

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "...",
    "from": "Chị Lan",
    "fromPhone": "0934567890",
    "avatar": "...",
    "lastMessage": "Chị ơi, túi vải có màu xanh không ạ?",
    "time": "2 giờ trước",
    "unread": 1
  }
]
```

## Cách test

### 1. Seed dữ liệu mẫu

```bash
# Từ thư mục backend
cd backend

# Tạo dữ liệu orders và messages
node scripts/seed-orders-messages.js
```

### 2. Test bằng curl hoặc Postman

**Lấy token:**
```bash
# Login
curl -X POST http://localhost:5003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"0987654321","password":"123456"}'

# Copy token từ response
```

**Test passport endpoint:**
```bash
curl http://localhost:5003/api/me/passport \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Test products endpoint:**
```bash
curl http://localhost:5003/api/me/products/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Test orders endpoint:**
```bash
curl http://localhost:5003/api/me/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Test messages endpoint:**
```bash
curl http://localhost:5003/api/me/messages \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Test trên frontend

1. Chạy backend: `cd backend && npm run dev`
2. Chạy frontend: `cd frontend && npm run dev`
3. Đăng nhập với: `0987654321` / `123456`
4. Vào trang "Hộ chiếu của tôi" để xem dữ liệu

## Models đã tạo

### Order Model (`backend/src/models/Order.js`)
- Quản lý đơn hàng từ khách mua
- Statuses: pending, confirmed, shipped, delivered, cancelled, done
- Auto-generate order code: #ORD-YYYY-0001

### Message Model (`backend/src/models/Message.js`)
- Quản lý conversation giữa seller và buyer
- Track unread count, last message, last message time
- Support product context (optional)

## Utils đã tạo

### Income Calculator (`backend/src/utils/income.js`)
- `calculateSideIncome(progressList)`: Tính thu nhập phụ dự kiến
- Công thức: Tổng progressPct × 18,500 VND
- Ví dụ: 100% tiến độ = 1,850,000 VND/tháng

## Các bước tiếp theo

- [ ] Tạo API để update order status
- [ ] Tạo API để gửi/nhận messages realtime
- [ ] Tạo API để verify passport QR code
- [ ] Thêm notification khi có đơn hàng mới
- [ ] Thêm analytics dashboard cho seller
