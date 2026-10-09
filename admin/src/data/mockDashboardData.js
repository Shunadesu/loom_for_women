// Mock data cho Dashboard Showcase ESG/SROI

export const kpiMetrics = [
  {
    id: 'completion',
    label: 'Tỷ lệ hoàn thành khóa học',
    value: '88.4%',
    badge: 'Vượt KPI chỉ tiêu (>85%)',
    badgeColor: 'emerald',
    iconColor: 'emerald-600',
    iconType: 'award',
  },
  {
    id: 'income',
    label: 'Tăng thu nhập phụ TB',
    value: '+1.250k VND',
    subtitle: 'Mỗi nữ công nhân / tháng',
    iconColor: 'orange-500',
    iconType: 'trending-up',
  },
  {
    id: 'sroi',
    label: 'Tỷ số SROI (Xã hội)',
    value: '4.2 : 1',
    badge: '$1 tài trợ tạo $4.2 giá trị xã hội',
    badgeColor: 'pink',
    iconColor: '[#E60067]',
    iconType: 'sparkles',
  },
  {
    id: 'sus',
    label: 'Điểm SUS Khả dụng UX',
    value: '78.5 / 100',
    badge: 'Đạt tiêu chuẩn thử nghiệm thực địa',
    badgeColor: 'teal',
    iconColor: 'teal-600',
    iconType: 'shield-check',
  },
];

export const uxMetrics = [
  {
    label: 'Task Success (Bài học)',
    value: '89.2%',
    target: 'Mục tiêu: >85%',
    color: 'emerald',
  },
  {
    label: 'Task Success (Đăng bài)',
    value: '81.5%',
    target: 'Mục tiêu: >75%',
    color: 'emerald',
  },
  {
    label: 'Time on Task (Học)',
    value: '3 phút 30s',
    target: 'Mục tiêu: <4 phút',
    color: 'teal',
  },
  {
    label: 'Time on Task (Đăng bài)',
    value: '68 giây',
    target: 'Mục tiêu: <90 giây',
    color: 'teal',
  },
];

export const incomeGrowthData = [
  { month: 'T1', income: 750000 },
  { month: 'T2', income: 850000 },
  { month: 'T3', income: 950000 },
  { month: 'T4', income: 1050000 },
  { month: 'T5', income: 1150000 },
  { month: 'T6', income: 1250000 },
];

export const lessonDistributionData = [
  { name: 'Phòng chống lừa đảo', value: 42, color: '#0D9488' },
  { name: 'Quản lý tài chính', value: 33, color: '#E60067' },
  { name: 'Thủ công & Móc len', value: 25, color: '#3B82F6' },
];

export const courseCategories = [
  'Phòng chống lừa đảo',
  'Quản lý tài chính',
  'Kỹ năng thủ công',
  'Quyền lợi lao động',
  'Móc len & Handmade',
  'Kỹ năng phát triển bản thân',
  'Móc len cơ bản',
  'Quyền lợi Lao động',
];

export const mockCourses = [
  {
    id: 'c1',
    title: 'Nhận diện và phòng chống lừa đảo trực tuyến',
    category: 'Phòng chống lừa đảo',
    duration: '3 Tiếng 5 Phút',
    cover:
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=600',
    description:
      'Khóa học ngắn hướng dẫn công nhân nữ nhận diện các thủ đoạn lừa đảo tuyển dụng ảo, vay tín dụng đen qua ứng dụng, mạo danh cán bộ Zalo/Ngân hàng.',
    lessons: 3,
    rating: 4.2,
    firstLesson: {
      title: 'Bài 1: Nhận diện link độc và tin nhắn mạo danh',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      notes:
        'Tổng quan các hình thức lừa đảo phổ biến 2024-2025. Dấu hiệu nhận biết link lạ, app giả mạo. Quy trình xử lý khi bị nhắn tin mạo danh ngân hàng / cơ quan chức năng.',
    },
    quiz: {
      question: 'Khi nhận được link "tuyển dụng online lương cao" bạn nên làm gì?',
      options: {
        A: 'Click ngay để xem thông tin',
        B: 'Chuyển tiếp cho bạn bè cùng đăng ký',
        C: 'Bỏ qua và xác minh qua kênh chính thống',
        D: 'Trả lời hỏi thêm thông tin cá nhân',
      },
      correct: 'C',
    },
  },
  {
    id: 'c2',
    title: 'Quản lý tài chính',
    category: 'Kỹ năng phát triển bản thân',
    duration: '2 Tiếng 5 Phút',
    cover:
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600',
    description:
      'Phương pháp quản lý chi tiêu 6 hũ giản lược cho công nhân. Cách tích lũy quỹ dự phòng khẩn cấp và không rơi vào bẫy tiêu dùng trả góp.',
    lessons: 2,
    rating: 4.2,
    firstLesson: {
      title: 'Bài 1: Quy tắc 6 hũ chi tiêu cho công nhân',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=8jLOx1hD3_o',
      notes:
        'Phân bổ thu nhập theo 6 hũ: chi tiêu thiết yếu, tiết kiệm dài hạn, quỹ khẩn cấp, giáo dục, hưởng thụ, cho đi. Công thức tính nhanh theo tỷ lệ % cho thu nhập 6-10 triệu.',
    },
    quiz: {
      question: 'Theo quy tắc 6 hũ, nên dành bao nhiêu % cho hũ "Quỹ khẩn cấp"?',
      options: {
        A: '5%',
        B: '10%',
        C: '20%',
        D: '30%',
      },
      correct: 'B',
    },
  },
  {
    id: 'c3',
    title: 'Học cách móc len tại nhà',
    category: 'Móc len cơ bản',
    duration: '3 Tiếng 5 Phút',
    cover:
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=600',
    description:
      'Khóa sinh kế giúp nữ công nhân tự tay móc các sản phẩm handmade như hoa len, túi vải, móc khóa để gia tăng thu nhập phụ ngoài giờ làm ca.',
    lessons: 3,
    rating: 4.7,
    firstLesson: {
      title: 'Bài 1: Cầm kim móc đúng cách & mũi móc đơn',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=Eq0LBm6-mJw',
      notes:
        'Hướng dẫn chọn kim móc phù hợp (size 2.5-4mm), cầm kim, giữ sợi len. Thực hành mũi móc xích (chain) và mũi móc đơn (single crochet) - nền tảng cho mọi sản phẩm.',
    },
    quiz: {
      question: 'Mũi móc đơn (single crochet) tiếng Việt thường gọi là gì?',
      options: {
        A: 'Mũi móc xích',
        B: 'Mũi móc đơn',
        C: 'Mũi móc kép',
        D: 'Mũi móc trượt',
      },
      correct: 'B',
    },
  },
  {
    id: 'c4',
    title: 'Kế hoạch An sinh & Bảo hiểm Xã hội một lần',
    category: 'Quyền lợi Lao động',
    duration: '1 Tiếng 45 Phút',
    cover:
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=600',
    description:
      'Phân tích thiệt hơn giữa việc rút BHXH 1 lần và bảo lưu để hưởng lương hưu khi về già. Giúp nữ công nhân chủ động bảo vệ tuổi già an yên.',
    lessons: 1,
    rating: 4.9,
    firstLesson: {
      title: 'Bài 1: BHXH 1 lần vs bảo lưu - tính toán nào có lợi hơn?',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=inWWhr5tnEA',
      notes:
        'So sánh chi tiết số tiền nhận khi rút BHXH 1 lần vs giá trị lương hưu tích lũy. Các yếu tố cần cân nhắc: tuổi nghỉ việc, thời gian đóng, kế hoạch tài chính dài hạn.',
    },
    quiz: {
      question: 'Mức hưởng BHXH 1 lần hiện nay được tính theo công thức nào?',
      options: {
        A: '1.5 x mức lương bình quân cho mỗi năm đóng',
        B: 'Cố định 50 triệu cho mỗi năm',
        C: '2 x mức lương cho năm đầu, giảm dần các năm sau',
        D: 'Tùy quyết định của công ty',
      },
      correct: 'A',
    },
  },
  {
    id: 'c5',
    title: 'Tự tay làm trang sức hạt gốm & đá may mắn',
    category: 'Móc len & Handmade',
    duration: '2 Tiếng 15 Phút',
    cover:
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600',
    description:
      'Khóa học phối màu hạt xâu chuỗi, xỏ vòng tay hạt đá handmade bán đắt hàng tại khu nhà trọ.',
    lessons: 1,
    rating: 4.8,
    firstLesson: {
      title: 'Bài 1: Phối màu hạt gốm & xâu vòng tay may mắn',
      type: 'infographic',
      url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600',
      notes:
        'Nguyên tắc phối màu hạt gốm theo phong thuỷ & mệnh. Kỹ thuật xâu chuỗi bền đẹp, mẹo bán hàng tại khu nhà trọ công nhân với giá 50-150k/sản phẩm.',
    },
    quiz: {
      question: 'Nguyên tắc phối màu hạt gốm theo mệnh nào sau đây đúng?',
      options: {
        A: 'Mệnh Hỏa hợp màu xanh nước biển',
        B: 'Mệnh Mộc hợp màu đỏ',
        C: 'Mệnh Kim hợp màu vàng - trắng',
        D: 'Mệnh Thổ hợp màu đen',
      },
      correct: 'C',
    },
  },
];

export const dashboardTabs = [
  { id: 'overview', label: 'Tổng Quan & KPI', icon: '📊', active: true },
  { id: 'lessons', label: 'Nhập Bài Học', icon: '🎓', count: 5 },
  { id: 'workshops', label: 'Nhập Workshop', icon: '🏛️', count: 3 },
  { id: 'news', label: 'Nhập Tin Tức', icon: '📰', count: 2 },
  { id: 'vouchers', label: 'Thêm Voucher', icon: '🎁', count: 3 },
  { id: 'products', label: 'Duyệt Sản Phẩm', icon: '🔍', badge: 1 },
  { id: 'qa', label: 'Hỏi Đáp QA', icon: '💬', badge: 2, pulse: true },
  { id: 'forum', label: 'Diễn Đàn', icon: '🌐' },
  { id: 'gri', label: 'Tiêu Chuẩn GRI', icon: '📋' },
];
