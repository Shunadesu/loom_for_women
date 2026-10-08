# Chức năng Đăng bài Diễn đàn - Implementation Complete ✅

## Đã hoàn thành

### 1. Backend

#### Model
- ✅ `backend/src/models/ForumPost.js` - Schema với các trường:
  - title, content (HTML), category, author, status (pending/approved/rejected)
  - isQualityPost, voucherCode, likes, likedBy, commentsCount

#### Controllers
- ✅ `backend/src/controllers/forumPostController.js` - Public API:
  - `getForumPosts()` - Lấy bài đã duyệt, filter theo category
  - `getForumPostById()` - Chi tiết 1 bài
  - `createForumPost()` - Đăng bài mới (require auth, status = pending)
  - `toggleLikeForumPost()` - Like/unlike bài

- ✅ `backend/src/controllers/adminForumPostController.js` - Admin API:
  - `getAllForumPosts()` - Lấy tất cả bài, filter theo status
  - `approveForumPost()` - Duyệt bài
  - `rejectForumPost()` - Từ chối bài
  - `markQualityPost()` - Đánh dấu chất lượng + nhập voucher
  - `deleteForumPost()` - Xóa bài

#### Routes
- ✅ `backend/src/routes/forumPosts.js` - Public routes
- ✅ `backend/src/routes/adminForumPosts.js` - Admin routes (require auth + admin)
- ✅ Đăng ký routes trong `backend/src/app.js`

### 2. Frontend

#### Dependencies
- ✅ Đã cài đặt `react-quill` cho rich text editor

#### Services
- ✅ `frontend/src/services/forumPostApi.js` - Tất cả API calls:
  - Public: fetchForumPosts, createForumPost, likeForumPost
  - Admin: fetchForumPostsAdmin, approve, reject, markQuality, delete

#### Store
- ✅ `frontend/src/store/forumPostStore.js` - Zustand store:
  - State: posts, loading, selectedCategory
  - Actions: fetchPosts, createPost, likePost, setCategory

#### Components

**User-facing:**
- ✅ `frontend/src/components/forum/NewPostModal.jsx` - Modal đăng bài với:
  - Form: title, category select, content editor (React Quill)
  - Validation: title max 200 chars, content required, category required
  - Quill config: basic toolbar (bold, italic, underline, lists)
  - Submit success message: "Bài viết đã gửi! BQT sẽ duyệt trong vòng 24h."

- ✅ `frontend/src/components/forum/ForumModal.jsx` - Cập nhật:
  - Tích hợp API thay mock data
  - Button "Đăng bài" check auth → mở LoginDrawer nếu chưa login
  - Fetch posts khi mount và khi đổi category
  - Handle like với API call

- ✅ `frontend/src/components/forum/ForumPostCard.jsx` - Cập nhật:
  - Render content HTML với `dangerouslySetInnerHTML`
  - Update ID từ `post.id` → `post._id`
  - Safe check cho comments array

**Admin:**
- ✅ `frontend/src/pages/admin/ForumPostManager.jsx` - Admin page với:
  - 3 tabs: Pending (chờ duyệt), Approved (đã duyệt), Rejected (đã từ chối)
  - Table hiển thị: title, author (avatar + name), category, date, status
  - Actions:
    - Pending: Approve, Reject, Delete, Preview
    - Approved: Mark Quality (+ voucher), Delete, Preview
    - All: Preview content modal
  - Quality modal: nhập mã voucher, đánh dấu/bỏ đánh dấu
  - Preview modal: xem nội dung HTML đầy đủ

#### Routing
- ✅ Thêm import `ForumPostManager` vào `App.jsx`
- ✅ Đăng ký route `/admin/forum-posts`
- ✅ Thêm menu "Diễn đàn" (💬) vào `Sidebar.jsx`

#### Styling
- ✅ CSS cho Quill editor trong `NewPostModal.jsx` (inline styles)
- ✅ CSS cho forum post content trong `index.css`:
  - Style cho strong, em, u, ol, ul, li
  - Line-clamp-4 utility cho preview

## Testing Flow

### User Flow:
1. **Chưa đăng nhập:**
   - Click "Đăng bài" → Mở LoginDrawer
   - Đăng nhập thành công → Có thể đăng bài

2. **Đã đăng nhập:**
   - Click "Đăng bài" → Mở NewPostModal
   - Điền form: tiêu đề, chọn danh mục, soạn nội dung (bold, italic, list)
   - Submit → Status = "pending", hiển thị alert "Đợi duyệt 24h"
   - Bài không hiển thị trong danh sách public

3. **Like bài:**
   - Click nút Like → Gọi API
   - Số like tăng/giảm realtime

### Admin Flow:
1. **Vào `/admin/forum-posts`:**
   - Tab "Chờ duyệt" → Thấy bài status = pending
   
2. **Duyệt bài:**
   - Click Preview → Xem nội dung đầy đủ
   - Click Approve → Bài chuyển sang "Đã duyệt"
   - Bài hiển thị trong ForumModal public

3. **Đánh dấu chất lượng:**
   - Tab "Đã duyệt" → Click Award icon
   - Modal mở, nhập mã voucher (VD: VOUCHER-50K-COOP)
   - Submit → Bài hiển thị badge vàng và voucher code

4. **Từ chối/Xóa:**
   - Click Reject → Bài chuyển sang "Đã từ chối"
   - Click Delete → Bài bị xóa hoàn toàn

## API Endpoints

### Public
- `GET /api/forum-posts?category=` - Lấy bài đã duyệt
- `GET /api/forum-posts/:id` - Chi tiết 1 bài
- `POST /api/forum-posts` - Đăng bài (auth required)
- `POST /api/forum-posts/:id/like` - Like/unlike (auth required)

### Admin
- `GET /api/admin/forum-posts?status=` - Lấy tất cả bài
- `PATCH /api/admin/forum-posts/:id/approve` - Duyệt
- `PATCH /api/admin/forum-posts/:id/reject` - Từ chối
- `PATCH /api/admin/forum-posts/:id/quality` - Đánh dấu chất lượng
- `DELETE /api/admin/forum-posts/:id` - Xóa

## Notes

- Bài viết mặc định status = "pending" khi user đăng
- Chỉ bài "approved" mới hiển thị public
- Admin có thể đánh dấu chất lượng và nhập voucher thưởng
- Content được lưu dạng HTML từ Quill editor
- Validation: title max 200 chars, content max 10,000 chars
- Like tracking: mảng `likedBy` để tránh user like nhiều lần

## Files Created/Modified

**Created:**
- backend/src/models/ForumPost.js
- backend/src/controllers/forumPostController.js
- backend/src/controllers/adminForumPostController.js
- backend/src/routes/forumPosts.js
- backend/src/routes/adminForumPosts.js
- frontend/src/services/forumPostApi.js
- frontend/src/store/forumPostStore.js
- frontend/src/components/forum/NewPostModal.jsx
- frontend/src/pages/admin/ForumPostManager.jsx

**Modified:**
- backend/src/app.js (add routes)
- frontend/src/App.jsx (add route + import)
- frontend/src/components/admin/Sidebar.jsx (add menu item)
- frontend/src/components/forum/ForumModal.jsx (integrate API)
- frontend/src/components/forum/ForumPostCard.jsx (render HTML, fix IDs)
- frontend/src/index.css (add forum content styles)
- frontend/package.json (add react-quill dependency)

## Ready to Test! 🚀

Servers đang chạy:
- Backend: http://localhost:3010
- Frontend: http://localhost:3012

Hãy thử:
1. Mở ForumModal → Click "Đăng bài"
2. Đăng nhập nếu chưa
3. Điền form và submit
4. Vào `/admin/forum-posts` để duyệt bài
5. Quay lại ForumModal xem bài đã duyệt
