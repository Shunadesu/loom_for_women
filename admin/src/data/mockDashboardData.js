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
