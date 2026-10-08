# Triển khai tính năng Sản phẩm Ký gửi (Consignment Products)

## Tổng quan
Cho phép người dùng đăng ký bán sản phẩm handmade của mình trên nền tảng. Admin duyệt/từ chối, sản phẩm được approved sẽ hiển thị công khai.

## Backend đã triển khai

### 1. Model
**File:** `backend/src/models/ConsignmentProduct.js`
- Lưu thông tin sản phẩm ký gửi
- Trạng thái: `pending`, `approved`, `rejected`
- Thông tin người bán: tên, SĐT, Zalo
- Giá, stock, category, thumbnail
- Lý do từ chối (nếu có)

### 2. Controllers

#### User Controller (`backend/src/controllers/consignmentProductController.js`)
- `listConsignmentProducts` - Liệt kê sản phẩm đã duyệt (public)
- `createConsignmentProduct` - Tạo sản phẩm ký gửi mới (auth)
- `getMyConsignmentProducts` - Xem sản phẩm của tôi (auth)
- `getConsignmentProductById` - Chi tiết sản phẩm (public)

#### Admin Controller (`backend/src/controllers/adminConsignmentProductController.js`)
- `listAllConsignmentProducts` - Xem tất cả (filter theo status)
- `approveConsignmentProduct` - Duyệt sản phẩm
- `rejectConsignmentProduct` - Từ chối + lý do
- `deleteConsignmentProduct` - Xóa sản phẩm
- `getConsignmentStats` - Thống kê (pending/approved/rejected count)

### 3. Routes

#### User Routes (`backend/src/routes/consignmentProducts.js`)
```
GET    /api/consignment-products          - List approved (public)
GET    /api/consignment-products/:id      - Detail (public)
POST   /api/consignment-products          - Create (auth)
GET    /api/consignment-products/my/list  - My products (auth)
```

#### Admin Routes (`backend/src/routes/adminConsignmentProducts.js`)
```
GET    /api/admin/consignment-products           - List all
GET    /api/admin/consignment-products/stats     - Stats
PUT    /api/admin/consignment-products/:id/approve - Approve
PUT    /api/admin/consignment-products/:id/reject  - Reject
DELETE /api/admin/consignment-products/:id         - Delete
```

### 4. Đã mount trong app.js
```javascript
app.use('/api/consignment-products', consignmentProductRoutes);
app.use('/api/admin/consignment-products', adminConsignmentProductRoutes);
```

## Frontend đã triển khai

### 1. API Service
**File:** `frontend/src/services/consignmentApi.js`
- `fetchConsignmentProducts()` - List public
- `fetchMyConsignmentProducts()` - My list
- `createConsignmentProduct()` - Create new
- `fetchConsignmentProductById()` - Detail

### 2. Store (Zustand)
**File:** `frontend/src/store/consignmentStore.js`
- State: `products`, `myProducts`, `loading`, `error`
- Actions:
  - `list()` - Load approved products
  - `listMy()` - Load my products
  - `create()` - Create new product
  - `clearError()` - Clear error
- Fallback mock data nếu backend chưa kết nối

### 3. Mock Data
**File:** `frontend/src/data/mockConsignmentProducts.js`
- `MOCK_CONSIGNMENT_PRODUCTS` - 5 sản phẩm mẫu đã approved
- `MOCK_MY_CONSIGNMENT_PRODUCTS` - 3 sản phẩm với mixed status (approved/pending/rejected)

## Bugfixes đã thực hiện

### 1. Lỗi encoding UTF-8 trong Library
**Vấn đề:** Text tiếng Việt hiển thị sai ký tự (B?ng t�nh d?nh gi�...)

**Nguyên nhân:** Database đã được seed với encoding sai lần trước

**Giải pháp:**
- Re-seed database với command: `npm run seed:documents`
- Verify encoding trong DB và API response
- Text hiện đã hiển thị đúng: "Bảng tính định giá bán sản phẩm thủ công (Tính chi phí len & công móc)"

### 2. Lỗi import middleware auth
**Vấn đề:** Backend crash khi start
```
SyntaxError: The requested module '../middleware/auth.js' does not provide an export named 'authenticate'
```

**Giải pháp:** 
- Sửa import trong `routes/consignmentProducts.js`: `authenticate` → `requireAuth`
- Sửa import trong `routes/adminConsignmentProducts.js`: `authenticate` → `requireAuth`

## Các component cần triển khai tiếp (Frontend UI)

### 1. Trang Ký gửi (/ky-gui)
- Hiển thị danh sách sản phẩm ký gửi đã approved
- Filter theo category
- Card hiển thị: hình, tên, giá, discount, seller info
- Button liên hệ Zalo

### 2. Modal tạo sản phẩm ký gửi
- Form nhập: title, description, price, originalPrice, stock, category
- Upload thumbnail
- Seller info: name, phone, zaloUrl
- Submit → tạo sản phẩm với status=pending

### 3. Trang "Sản phẩm của tôi" (/ky-gui/cua-toi)
- List my consignment products
- Badge hiển thị status: pending (vàng), approved (xanh), rejected (đỏ)
- Hiển thị rejection reason nếu bị từ chối

### 4. Admin - Quản lý Ký gửi
- Table list all products với filter status
- Actions: Approve / Reject (+ nhập lý do) / Delete
- Stats hiển thị pending/approved/rejected count

## Testing

### Backend
1. Start backend: `cd backend && npm start`
2. Test API với Postman hoặc curl
3. Verify UTF-8 encoding đúng

### Frontend
1. Start frontend: `cd frontend && npm run dev`
2. Navigate to http://localhost:5173/thu-vien
3. Verify text tiếng Việt hiển thị đúng
4. Test consignment store với mock data

## Trạng thái hiện tại
✅ Backend API hoàn chỉnh
✅ Frontend store + services đã sẵn sàng
✅ Mock data để test
✅ Sửa lỗi encoding UTF-8
✅ Sửa lỗi import middleware
⏳ Cần triển khai UI components (pages, modals, cards)

## Next Steps
1. Tạo ConsignmentProductCard component
2. Tạo trang /ky-gui với list approved products
3. Tạo modal "Đăng ký ký gửi"
4. Tạo trang "Sản phẩm của tôi"
5. Admin: trang quản lý ký gửi
