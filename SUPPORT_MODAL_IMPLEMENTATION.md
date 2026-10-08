# ✅ Hoàn thành: Modal "Hỗ trợ 24/7"

## Các file đã tạo mới

### 1. Store
- **File**: `frontend/src/store/supportStore.js`
- **State**: isOpen, messages
- **Actions**: openModal, closeModal, addMessage
- **Features**: 
  - 2 tin nhắn chào mặc định từ CSKH
  - Auto-reply sau 1.5 giây khi user gửi tin nhắn
  - Format timestamp theo giờ Việt Nam

### 2. Component
- **File**: `frontend/src/components/support/SupportModal.jsx`
- **Layout**: Single chat window (không có sidebar như ExpertQA)
- **Features**:
  - Header với logo Loom + badge "• Trực tuyến"
  - Info banner: "Hỗ trợ miễn phí cho công nhân 24/7"
  - Hotline button: "Gọi 1800-LOOM" (tel link)
  - Chat messages: user (phải, màu hồng) vs support (trái, trắng)
  - Input form với nút "Gửi"
  - Auto scroll to bottom khi có tin nhắn mới

## Các file đã cập nhật

### 1. App.jsx
- ✅ Import `SupportModal`
- ✅ Thêm `<SupportModal />` vào root
- ✅ Xóa route `/ho-tro`

### 2. NavBar.jsx
- ✅ Import `useSupportStore`
- ✅ Cập nhật config: `{ label: 'Hỗ trợ 24/7', modalType: 'support', isModal: true }`
- ✅ Thêm handler `openSupport()` trong UtilityItem

## UI/UX

### Màu sắc
- **Header**: Gradient `from-[#E60067] to-rose-600`
- **Logo**: Loom logo trắng với border trắng mờ
- **Badge online**: `bg-emerald-400 text-slate-950` (xanh lá sáng)
- **Info banner**: `bg-pink-50` với border `border-pink-100`
- **Hotline button**: Trắng với text hồng, border hồng
- **User message**: `bg-[#E60067] text-white` (hồng đậm)
- **Support message**: `bg-white text-slate-800 border-slate-200`

### Icons sử dụng
- ✅ **XMarkIcon** - Nút đóng modal
- ✅ **ShieldCheckIcon** - Icon "Hỗ trợ miễn phí"
- ✅ **PhoneCallIcon** - Icon hotline + nút navbar
- ✅ **SendIcon** - Nút gửi tin nhắn

### Responsive
- **Max width**: lg:max-w-3xl (responsive từ mobile đến desktop)
- **Height**: 80vh (không chiếm hết màn hình)
- **Padding**: p-3 (gọn gàng trên mobile)

## Mock Data

### Tin nhắn mặc định (2 messages)
1. **Message 1** (08:00):
   > "Chào chị Mai Hường! Em là CSKH Loom. Chị đang cần hỗ trợ về Khóa học, Hộ chiếu An toàn số hay đăng bán sản phẩm trên Chợ sinh kế ạ?"

2. **Message 2** (08:01):
   > "Chị cũng có thể bấm nút gọi đường dây nóng 1800-LOOM (Miễn phí cước) nếu cần hỗ trợ khẩn cấp nhé!"

### Auto-reply (sau 1.5s)
> "Cảm ơn chị đã gửi câu hỏi! Bộ phận CSKH sẽ phản hồi trong vòng 5-10 phút. Vui lòng giữ máy ạ! 😊"

## Cách test

### Bước 1: Mở modal
- Click nút "Hỗ trợ 24/7" ở NavBar (icon điện thoại màu emerald)
- Modal xuất hiện với animation scale + fade

### Bước 2: Xem tin nhắn mặc định
- 2 tin nhắn chào từ "Loom CSKH Hỗ Trợ Nhanh"
- Hiển thị ở bên trái (support side)
- Badge "• Trực tuyến" màu xanh lá

### Bước 3: Gửi tin nhắn
- Nhập text vào ô input
- Click "Gửi" hoặc Enter
- Tin nhắn user xuất hiện bên phải (màu hồng)
- Sau 1.5s, auto-reply từ CSKH xuất hiện

### Bước 4: Gọi hotline
- Click nút "Gọi 1800-LOOM" trên info banner
- Mở ứng dụng điện thoại (nếu trên mobile)

### Bước 5: Đóng modal
- Click backdrop (vùng tối bên ngoài)
- Click nút X ở góc trên phải
- Nhấn phím ESC

## Features hoạt động

✅ Modal animation smooth (framer-motion scale + fade)  
✅ Body scroll lock khi modal mở  
✅ ESC key để đóng  
✅ Backdrop click để đóng  
✅ Auto scroll to bottom khi có tin nhắn mới  
✅ Real-time message append (local state)  
✅ Auto-reply sau 1.5 giây  
✅ Disabled submit button khi input rỗng  
✅ Hotline tel link (click to call)  
✅ Badge "• Trực tuyến" động  
✅ Timestamp format giờ Việt Nam  

## So sánh với ExpertQA Modal

| Feature | ExpertQA Modal | Support Modal |
|---------|----------------|---------------|
| Layout | 2-column (list + thread) | Single chat window |
| Tabs | 2 tabs (Inbox + New) | Không có tabs |
| Messages | Multiple threads | 1 thread duy nhất |
| Sidebar | Question list | Không có |
| Auto-reply | Không | Có (1.5s delay) |
| Hotline | Không | Có (1800-LOOM) |
| Priority badges | Có | Không |
| Badge online | Không | Có (• Trực tuyến) |
| Info banner | Không | Có (miễn phí 24/7) |

## Không cần

❌ Backend API (dùng mock data + auto-reply)  
❌ Multiple threads/conversations  
❌ Priority system  
❌ Category filter  
❌ File upload  
❌ Image preview  
❌ Typing indicator  
❌ Read receipts  
❌ Admin panel  

## Lưu ý

- Tất cả messages lưu trong Zustand store (in-memory)
- Reload trang sẽ reset về 2 tin nhắn mặc định
- Auto-reply chỉ là mock (setTimeout 1.5s)
- Hotline 1800-LOOM là số giả (chỉnh trong store nếu cần)
- Khi cần integrate API thật, chỉ cần update `addMessage` action

## Next steps (nếu cần)

1. **Real API integration**: Thay auto-reply bằng WebSocket/polling
2. **Typing indicator**: Hiển thị "CSKH đang soạn tin..." khi đợi reply
3. **File upload**: Cho phép user gửi ảnh/file đính kèm
4. **Message history**: Load old messages từ server
5. **Notification sound**: Phát âm thanh khi có tin nhắn mới
6. **Unread count**: Badge số tin nhắn chưa đọc trên nút navbar
