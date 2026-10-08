import {
  GraduationCapIcon,
  ShopIcon,
  HeartIcon,
  QuestionMarkIcon,
  ShieldCheckIcon,
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
    id: 'thu-vien',
    label: 'Thư viện',
    Icon: FileTextIcon,
    to: '/thu-vien',
  },
  {
    id: 'workshop',
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
    id: 'ho-chieu',
    label: 'Hộ Chiếu',
    Icon: ShieldCheckIcon,
    to: '/he-chieu',
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
  { id: 'dien-dan', label: 'Diễn đàn', Icon: ShareIcon, to: '/dien-dan', action: 'forum' },
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
    action: 'cart',
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
    slug: 'che-do-thai-san-trong-doanh-nghiep',
    tag: 'Quyền lợi lao động',
    title: 'Chế độ thai sản trong doanh nghiệp',
    desc: 'Tại sao doanh nghiệp phải gánh chi phí cho chuyện sinh con của người lao động? Họ được hưởng những quyền lợi chính đáng nào...',
    image:
      'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=500',
    date: '22 Tháng 7, 2026',
    author: 'Ban biên tập Loom for Women',
    readTime: '5 phút đọc',
    content: [
      {
        type: 'paragraph',
        text: 'Chế độ thai sản là một trong những quyền lợi cơ bản và quan trọng nhất của người lao động nữ, được quy định rõ trong Bộ luật Lao động 2019 và Luật Bảo hiểm xã hội. Đây là phúc lợi giúp đảm bảo sức khỏe, thu nhập và vị trí việc làm cho nữ công nhân trong suốt thai kỳ và thời gian nuôi con nhỏ.',
      },
      {
        type: 'heading',
        text: '1. Quyền được nghỉ trước và sau khi sinh',
      },
      {
        type: 'paragraph',
        text: 'Lao động nữ được nghỉ trước khi sinh tối đa 02 tháng, sau khi sinh tối đa 06 tháng. Trong trường hợp sinh đôi trở lên, thời gian nghỉ sinh được cộng thêm tương ứng với số con. Thời gian nghỉ này được tính vào thời gian làm việc tại doanh nghiệp và vẫn được hưởng trợ cấp thai sản từ Quỹ Bảo hiểm xã hội.',
      },
      {
        type: 'heading',
        text: '2. Mức hưởng trợ cấp thai sản',
      },
      {
        type: 'paragraph',
        text: 'Mức trợ cấp thai sản bằng 100% tiền lương cơ sở đóng bảo hiểm trong 06 tháng liền kề trước khi nghỉ thai sản. Ngoài ra, lao động nữ còn được hưởng trợ cấp một lần khi sinh con, mức hưởng phụ thuộc vào số con và điều kiện cụ thể.',
      },
      {
        type: 'heading',
        text: '3. Vì sao doanh nghiệp "gánh" chi phí?',
      },
      {
        type: 'paragraph',
        text: 'Nhiều doanh nghiệp cho rằng mình phải bỏ thêm chi phí khi lao động nữ nghỉ thai sản. Tuy nhiên, khoản này phần lớn do Quỹ Bảo hiểm xã hội chi trả, không phải do doanh nghiệp. Doanh nghiệp chỉ cần đóng bảo hiểm xã hội hàng tháng cho người lao động (trong đó có phần trợ cấp thai sản). Đổi lại, doanh nghiệp nhận được lực lượng lao động trung thành, ổn định và có động lực làm việc lâu dài.',
      },
      {
        type: 'heading',
        text: '4. Quyền được bảo lưu việc làm',
      },
      {
        type: 'paragraph',
        text: 'Khi hết thời gian nghỉ thai sản, người lao động nữ được quyền trở lại làm việc tại vị trí cũ hoặc vị trí khác với mức lương không thấp hơn trước khi nghỉ. Doanh nghiệp không được sa thải hoặc đơn phương chấm dứt hợp đồng lao động với lý do mang thai, sinh con hoặc nuôi con nhỏ.',
      },
      {
        type: 'callout',
        text: 'Nếu bạn là lao động nữ và đang gặp khó khăn trong việc thực hiện quyền thai sản, hãy liên hệ với bộ phận Nhân sự hoặc tổ chức Công đoàn tại doanh nghiệp. Bạn cũng có thể gọi đường dây nóng Bộ Lao động - Thương binh và Xã hội để được tư vấn miễn phí.',
      },
    ],
  },
  {
    id: 'phuong-phap-rice',
    slug: 'phuong-phap-rice-cuu-canh-khi-bong-gan',
    tag: 'Sức khỏe công nhân',
    title: 'Phương pháp RICE - Cứu cánh khi ngã hoặc bong gân',
    desc: 'Khi bị ngã hay bong gân, nhiều người có thói quen xoa dầu nóng ngay. Nhưng liệu cách này có đúng chuẩn y khoa?',
    image:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=500',
    date: '19 Tháng 7, 2026',
    author: 'BS. Nguyễn Minh Anh',
    readTime: '4 phút đọc',
    content: [
      {
        type: 'paragraph',
        text: 'Trong môi trường làm việc công nghiệp, ngã và bong gân là những tai nạn phổ biến. Theo thống kê, có tới 30% tai nạn lao động liên quan đến té ngã và các chấn thương mô mềm. Phương pháp RICE là chuẩn mực y khoa được khuyến cáo để sơ cứu ban đầu các chấn thương này.',
      },
      {
        type: 'heading',
        text: 'RICE là gì?',
      },
      {
        type: 'paragraph',
        text: 'RICE là viết tắt của 4 bước: Rest (Nghỉ ngơi), Ice (Chườm đá), Compression (Băng ép), Elevation (Nâng cao). Đây là phương pháp sơ cứu chuẩn quốc tế giúp giảm sưng, giảm đau và hạn chế tổn thương lan rộng trong 24-72 giờ đầu tiên sau chấn thương.',
      },
      {
        type: 'heading',
        text: '1. Rest - Nghỉ ngơi',
      },
      {
        type: 'paragraph',
        text: 'Dừng ngay hoạt động đang làm, không cố gắng vận động vùng bị chấn thương. Nghỉ ngơi tại chỗ trong ít nhất 24-48 giờ đầu tiên để các mô tổn thương bắt đầu phục hồi. Tránh các tư thế gây áp lực lên vùng bị thương.',
      },
      {
        type: 'heading',
        text: '2. Ice - Chườm đá',
      },
      {
        type: 'paragraph',
        text: 'Chườm đá là bước quan trọng nhất. Dùng túi đá hoặc khăn bọc đá, chườm lên vùng tổn thương trong 15-20 phút mỗi lần, cách nhau 1-2 giờ. Lưu ý không chườm đá trực tiếp lên da để tránh bỏng lạnh. Không nên xoa dầu nóng ngay sau chấn thương vì sẽ làm tăng sưng và viêm.',
      },
      {
        type: 'heading',
        text: '3. Compression - Băng ép',
      },
      {
        type: 'paragraph',
        text: 'Dùng băng thun (elastic bandage) quấn nhẹ quanh vùng bị thương để tạo áp lực, giúp giảm sưng. Lưu ý không quấn quá chặt vì sẽ cản trở lưu thông máu. Nếu thấy đầu ngón tay/chân tím tái hoặc tê thì phải nới lỏng băng ngay.',
      },
      {
        type: 'heading',
        text: '4. Elevation - Nâng cao',
      },
      {
        type: 'paragraph',
        text: 'Nâng vùng bị thương cao hơn mức tim (khoảng 15-20cm) để máu và dịch thoát về, giúp giảm sưng hiệu quả. Có thể kê gối dưới tay hoặc chân khi nằm nghỉ.',
      },
      {
        type: 'callout',
        text: 'Nếu sau 48-72 giờ chấn thương không giảm, hoặc có dấu hiệu gãy xương (đau dữ dội, biến dạng, mất vận động), hãy đến ngay cơ sở y tế để được khám và điều trị kịp thời.',
      },
    ],
  },
];