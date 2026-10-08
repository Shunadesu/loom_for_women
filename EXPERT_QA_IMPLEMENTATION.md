# ✅ Hoàn thành: Modal "Hỏi chuyên gia"

## Các file đã tạo mới

### 1. Icons mới
- **File**: `frontend/src/components/icons/index.jsx`
- **Thêm**: MessageSquareIcon, SendIcon, ShieldAlertIcon, TriangleAlertIcon

### 2. Mock Data
- **File**: `frontend/src/data/mockExpertQA.js`
- **Nội dung**: 5 câu hỏi mẫu với đầy đủ messages, categories, priorities
- **Helper functions**: getPriorityBadge(), formatRelativeTime()

### 3. Store
- **File**: `frontend/src/store/expertQAStore.js`
- **State**: isOpen, activeTab, questions, selectedQuestionId
- **Actions**: openModal, closeModal, setActiveTab, selectQuestion, addQuestion, addReply

### 4. Components
- **File**: `frontend/src/components/expert/ExpertQAModal.jsx`
  - Modal chính với framer-motion animation
  - 2 tabs: Inbox và Đặt câu hỏi mới
  
- **File**: `frontend/src/components/expert/QuestionList.jsx`
  - Danh sách câu hỏi với priority badges
  - Click để chọn câu hỏi
  
- **File**: `frontend/src/components/expert/ThreadView.jsx`
  - Hiển thị chi tiết thread
  - Form reply ở dưới
  
- **File**: `frontend/src/components/expert/NewQuestionForm.jsx`
  - Form đặt câu hỏi mới
  - Validation cho title (min 10 ký tự) và content (min 20 ký tự)

## Các file đã cập nhật

### 1. App.jsx
- ✅ Import `ExpertQAModal`
- ✅ Thêm `<ExpertQAModal />` vào root
- ✅ Xóa route `/hoi-chuyen-gia`

### 2. NavBar.jsx
- ✅ Import `useExpertQAStore`
- ✅ Thay NavLink thành button cho "Hỏi chuyên gia"
- ✅ Gọi `openModal()` khi click

## Cách test

### Bước 1: Mở modal
- Truy cập http://localhost:3012
- Click nút "Hỏi chuyên gia" ở NavBar (màu amber)
- Modal sẽ slide in từ giữa màn hình

### Bước 2: Xem inbox
- Tab "💬 Inbox Chuyên gia" hiển thị 5 câu hỏi mẫu
- Click vào từng câu hỏi để xem thread chi tiết
- Priority badges: Khẩn cấp (đỏ), Gấp (vàng), Bình thường (xanh)
- Messages hiển thị 2 bên: user (phải, màu hồng) và expert (trái, trắng)

### Bước 3: Reply
- Nhập text vào ô "Đặt câu hỏi phụ cho chuyên gia..."
- Click nút "Gửi"
- Tin nhắn mới xuất hiện ở dưới cùng thread

### Bước 4: Đặt câu hỏi mới
- Click tab "✍️ Đặt Câu Hỏi Mới"
- Chọn chủ đề (dropdown 7 categories)
- Chọn mức độ ưu tiên (3 radio buttons)
- Nhập tiêu đề (min 10 ký tự)
- Nhập nội dung (min 20 ký tự)
- Click "Gửi câu hỏi"
- Modal tự động switch về tab Inbox và highlight câu hỏi mới

### Bước 5: Đóng modal
- Click backdrop (vùng tối bên ngoài)
- Click nút X ở góc trên phải
- Nhấn phím ESC

## Responsive
- **Desktop**: Layout 2 cột (danh sách trái, thread phải)
- **Mobile**: Layout stacked (danh sách trên, thread dưới)
- **Max height**: 90vh để không bị tràn màn hình

## Features hoạt động
✅ Modal animation smooth (framer-motion)
✅ Body scroll lock khi modal mở
✅ ESC key để đóng
✅ Backdrop click để đóng
✅ Switch tabs (Inbox ↔ New Question)
✅ Select question từ list
✅ Add reply vào thread (local state)
✅ Submit câu hỏi mới (local state)
✅ Form validation với error messages
✅ Priority badges với đúng màu sắc
✅ Responsive mobile/tablet
✅ Unread count badge (mock: 3)

## Mock data
- 5 câu hỏi covering các chủ đề:
  1. Lừa đảo trực tuyến (urgent) - 3 messages
  2. Tài chính gia đình (normal) - 3 messages
  3. Kỹ năng thủ công (high) - 1 message (pending)
  4. Sức khỏe lao động (normal) - 3 messages
  5. Quyền lợi lao động (urgent) - 3 messages

## Không cần
❌ Backend API (dùng mock data)
❌ Admin panel để quản lý câu hỏi
❌ Real-time notification
❌ File upload
❌ Image preview

## Lưu ý
- Tất cả data lưu trong Zustand store (in-memory)
- Reload trang sẽ reset về mock data ban đầu
- Khi cần integrate API, chỉ cần update store actions
