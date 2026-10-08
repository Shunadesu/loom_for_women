// Mock data cho Diễn đàn cộng đồng
// Không cần backend, data hardcoded

export const FORUM_CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'income-tips', label: 'Mẹo thu nhập phụ' },
  { id: 'scam-warning', label: 'Cảnh báo lừa đảo' },
  { id: 'learning-tips', label: 'Kinh nghiệm học tập' },
];

export const MOCK_FORUM_POSTS = [
  {
    id: 'post-1',
    author: {
      name: 'Chị Mai Hường (Méo Meo)',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      workplace: 'Công nhân may',
      location: 'KCN Tân Bình',
    },
    category: 'income-tips',
    categoryLabel: 'Mẹo thu nhập phụ',
    title: 'Kinh nghiệm kiếm thêm 1.800.000đ/tháng từ móc hoa len sau giờ ca',
    content:
      'Chào các chị em! Trước đây xong ca làm về em hay bấm điện thoại lãng phí thời gian. Từ ngày học móc hoa len trên Loom, mỗi tối em tranh thủ móc 2-3 cành tulip. Cuối tuần đăng lên Chợ sinh kế Loom là có đồng nghiệp và công ty đặt mua liền! Chị em nào mới học nhớ chú ý nhồi bông gòn đều tay nhé.',
    isQualityPost: true,
    voucherCode: 'VOUCHER-50K-COOP',
    likes: 142,
    isLiked: true,
    commentsCount: 28,
    comments: [
      {
        id: 'c1',
        author: 'Chị Nguyễn Thị Lan',
        content:
          'Bài chia sẻ hay quá chị Hường ơi! Chúc mừng chị được BQT tặng ngay Voucher 50k nhé! Em cũng vừa bắt đầu học bài móc tulip số 1.',
        timestamp: '21:00',
      },
    ],
    timestamp: 'Hôm qua, 20:15',
    timeAgo: '1 ngày trước',
  },
  {
    id: 'post-2',
    author: {
      name: 'Chị Phạm Thu Hà',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      workplace: 'Công nhân giầy da',
      location: 'KCN Sóng Thần',
    },
    category: 'scam-warning',
    categoryLabel: 'Cảnh báo lừa đảo',
    title:
      'Cảnh báo chiêu trò mạo danh Hội Công đoàn chuyển cọc quà Trung thu',
    content:
      'Các chị em cảnh giác nha! Nay có số lạ gọi cho xóm trọ em bảo là bên Công đoàn hỗ trợ quà Trung thu 500k, yêu cầu chuyển 50k phí ship trước qua tài khoản cá nhân. Em gọi xác minh lại với Công đoàn công ty thì biết là lừa đảo 100%! Không bao giờ chuyển cọc trước nha mọi người!',
    isQualityPost: true,
    voucherCode: 'VOUCHER-30K-BIGC',
    likes: 215,
    isLiked: false,
    commentsCount: 43,
    comments: [
      {
        id: 'c2',
        author: 'Chị Trần Thị Oanh',
        content:
          'May mà có chị Hà cảnh báo! Hôm trước bạn cùng chuyền em cũng nhận được cuộc gọi y chang luôn.',
        timestamp: 'Hôm qua',
      },
    ],
    timestamp: '2 ngày trước',
    timeAgo: '2 ngày trước',
  },
  {
    id: 'post-3',
    author: {
      name: 'Chị Đỗ Lan Hương',
      avatar:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      workplace: 'Công nhân bao bì',
      location: 'KCN Linh Trung',
    },
    category: 'learning-tips',
    categoryLabel: 'Kinh nghiệm học tập',
    title: 'Mẹo luộc khoai và chuẩn bị hộp cơm ca 15.000đ đủ dinh dưỡng',
    content:
      'Chia sẻ với chị em thực đơn hộp cơm trưa mang đi làm vừa sạch vừa rẻ: trứng luộc dầm nước mắm, rau muống luộc và đĩa đậu phụ sốt cà chua. Chia nhỏ đi chợ đầu mối cuối tuần giúp em tiết kiệm được gần 800k tiền ăn mỗi tháng!',
    isQualityPost: false,
    voucherCode: null,
    likes: 88,
    isLiked: false,
    commentsCount: 15,
    comments: [],
    timestamp: '3 giờ trước',
    timeAgo: '3 giờ trước',
  },
  {
    id: 'post-4',
    author: {
      name: 'Chị Lê Thị Bích',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
      workplace: 'Công nhân điện tử',
      location: 'KCN Vĩnh Lộc',
    },
    category: 'income-tips',
    categoryLabel: 'Mẹo thu nhập phụ',
    title: 'Bán cơm hộp cuối tuần kiếm thêm 2 triệu/tháng',
    content:
      'Hai ngày cuối tuần em nấu cơm hộp bán cho chị em trong xóm trọ. Mỗi hộp 25k, trung bình bán được 40 hộp/tuần. Trừ vốn còn lãi khoảng 500k/tuần, tháng được gần 2 triệu. Các chị em có thể thử nhé!',
    isQualityPost: false,
    voucherCode: null,
    likes: 67,
    isLiked: false,
    commentsCount: 12,
    comments: [
      {
        id: 'c4',
        author: 'Chị Ngọc Anh',
        content:
          'Hay quá chị! Em cũng đang muốn tìm thêm thu nhập. Cho em hỏi chị nấu mấy giờ vậy ạ?',
        timestamp: '2 giờ trước',
      },
    ],
    timestamp: '5 giờ trước',
    timeAgo: '5 giờ trước',
  },
  {
    id: 'post-5',
    author: {
      name: 'Chị Trương Mỹ Linh',
      avatar:
        'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&auto=format&fit=crop&q=80',
      workplace: 'Công nhân dệt may',
      location: 'KCN Tân Tạo',
    },
    category: 'scam-warning',
    categoryLabel: 'Cảnh báo lừa đảo',
    title: 'Lừa đảo qua tin nhắn "trúng thưởng" từ số lạ',
    content:
      'Cảnh báo chị em nhé! Có tin nhắn báo trúng giải 50 triệu đồng từ một cuộc thi mà em chưa từng tham gia. Họ yêu cầu cung cấp CMND và số tài khoản. Em gọi hotline tra cứu thì không có cuộc thi nào như vậy. Đừng tin nhé!',
    isQualityPost: true,
    voucherCode: 'VOUCHER-40K-SAFE',
    likes: 156,
    isLiked: false,
    commentsCount: 31,
    comments: [
      {
        id: 'c5',
        author: 'Chị Hồng Nhung',
        content:
          'Cảm ơn chị đã chia sẻ! Em cũng nhận được tin tương tự tuần trước.',
        timestamp: '1 giờ trước',
      },
    ],
    timestamp: '1 ngày trước',
    timeAgo: '1 ngày trước',
  },
  {
    id: 'post-6',
    author: {
      name: 'Chị Võ Thị Hạnh',
      avatar:
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      workplace: 'Công nhân nhựa',
      location: 'KCN Hiệp Phước',
    },
    category: 'learning-tips',
    categoryLabel: 'Kinh nghiệm học tập',
    title: 'Học tiếng Anh giao tiếp qua app miễn phí hiệu quả',
    content:
      'Em muốn chia sẻ kinh nghiệm học tiếng Anh giao tiếp cơ bản qua app Duolingo. Mỗi ngày học 15-20 phút trên xe bus đi làm về, sau 3 tháng em đã có thể nói chuyện đơn giản với khách nước ngoài. Hoàn toàn miễn phí!',
    isQualityPost: false,
    voucherCode: null,
    likes: 103,
    isLiked: false,
    commentsCount: 19,
    comments: [],
    timestamp: '6 giờ trước',
    timeAgo: '6 giờ trước',
  },
];
