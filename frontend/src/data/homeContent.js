import {
  GraduationCapIcon,
  ShopIcon,
  HeartIcon,
  QuestionMarkIcon,
  Grid3x3Icon,
  FileTextIcon,
  ShareIcon,
  ListIcon,
  ShoppingBagIcon,
  BookmarkIcon,
  PercentIcon,
} from '../components/icons/index.jsx';

// ───────────────────────────────────────────────────────────────
// Hero banner — recap workshop
// ───────────────────────────────────────────────────────────────
export const HERO_IMAGE_URL =
  'https://drive.google.com/thumbnail?id=1ZoLA6CaIofkf-_SicwZfnBzb29bdGBXF&sz=w1200';
export const HERO_IMAGE_ALT =
  'Recap workshop - Nhận diện & phòng chống lừa đảo trực tuyến';

// ───────────────────────────────────────────────────────────────
// Quick actions (E-learning, Cửa hàng, Workshop, Hỗ trợ, Tất cả)
// ───────────────────────────────────────────────────────────────
export const QUICK_ACTIONS = [
  {
    id: 'khoa-hoc',
    label: 'E-learning',
    Icon: GraduationCapIcon,
    to: '/khoa-hoc',
  },
  {
    id: 'cua-hang',
    label: 'Cửa hàng',
    Icon: ShopIcon,
    to: '/cua-hang',
  },
  {
    id: 'workshop',
    // Workshop giữ class cursor-pointer như HTML gốc
    label: 'Workshop',
    Icon: HeartIcon,
    to: '/workshop',
    cursor: true,
  },
  {
    id: 'ho-tro',
    label: 'Hỗ trợ',
    Icon: QuestionMarkIcon,
    to: '/ho-tro',
  },
  {
    id: 'tat-ca',
    label: 'Tất cả',
    Icon: Grid3x3Icon,
    to: '/tat-ca',
  },
];

// ───────────────────────────────────────────────────────────────
// OA (Official Account) — Loom for Women
// ───────────────────────────────────────────────────────────────
export const OA_NAME = 'Loom for Women';
export const OA_DESCRIPTION =
  'Quan tâm OA để theo dõi các hoạt động sắp diễn ra và các khóa học hấp dẫn';
export const OA_LOGO_URL =
  'https://drive.google.com/thumbnail?id=1asdIo2tmk_ouFc-psQb51vzMoAFOPNXP&sz=w1000';

// ───────────────────────────────────────────────────────────────
// CategoryNav — "Học tập cùng Loom"
// ───────────────────────────────────────────────────────────────
export const CATEGORY_HOC_TAP = [
  { id: 'tai-lieu', label: 'Tài liệu', Icon: FileTextIcon, to: '/thu-vien' },
  { id: 'bai-hoc', label: 'Bài học', Icon: GraduationCapIcon, to: '/khoa-hoc' },
  {
    id: 'hoi-dap',
    label: 'Hỏi đáp',
    Icon: QuestionMarkIcon,
    to: '/hoi-chuyen-gia',
    ping: true,
  },
  { id: 'dien-dan', label: 'Diễn đàn', Icon: ShareIcon, to: '/dien-dan' },
];

// ───────────────────────────────────────────────────────────────
// CategoryNav — "Mua sắm cùng Loom"
// ───────────────────────────────────────────────────────────────
export const CATEGORY_MUA_SAM = [
  { id: 'danh-muc', label: 'Danh mục', Icon: ListIcon, to: '/cua-hang' },
  {
    id: 'gio-hang',
    label: 'Giỏ hàng',
    Icon: ShoppingBagIcon,
    to: '/gio-hang',
    badge: 1,
  },
  { id: 'ky-gui', label: 'Ký gửi', Icon: BookmarkIcon, to: '/ky-gui' },
  {
    id: 'khuyen-mai',
    label: 'Khuyến mãi',
    Icon: PercentIcon,
    to: '/khuyen-mai',
  },
];

// ───────────────────────────────────────────────────────────────
// Tin tức (news list)
// ───────────────────────────────────────────────────────────────
export const NEWS_ITEMS = [
  {
    id: 'che-do-thai-san',
    tag: 'Quyền lợi lao động',
    title: 'Chế độ thai sản trong doanh nghiệp',
    desc: 'Tại sao doanh nghiệp phải gánh chi phí cho chuyện sinh con của người lao động? Họ được hưởng những quyền lợi chính đáng nào...',
    image:
      'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=500',
    date: '22 Tháng 7, 2026',
  },
  {
    id: 'phuong-phap-rice',
    tag: 'Sức khỏe công nhân',
    title: 'Phương pháp RICE - Cứu cánh khi ngã hoặc bong gân',
    desc: 'Khi bị ngã hay bong gân, nhiều người có thói quen xoa dầu nóng ngay. Nhưng liệu cách này có đúng chuẩn y khoa?',
    image:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=500',
    date: '19 Tháng 7, 2026',
  },
];