import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ShareIcon,
  CalendarIcon,
  SparklesIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  HandIcon,
} from '../components/icons/index.jsx';

const LAST_UPDATED = '01/10/2026';

const RELATED = [
  {
    to: '/chinh-sach-bao-mat',
    tag: 'Pháp lý',
    title: 'Chính sách bảo mật',
    desc: 'Cách chúng tôi bảo vệ dữ liệu cá nhân của bạn.',
  },
  {
    to: '/dieu-khoan-su-dung',
    tag: 'Pháp lý',
    title: 'Điều khoản sử dụng',
    desc: 'Quy tắc chung khi sử dụng nền tảng Loom for Women.',
  },
];

const PILLARS = [
  {
    key: 'E',
    title: 'Môi trường (E)',
    accent: 'emerald',
    icon: 'sparkle',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    points: [
      'Sử dụng bao bì tái chế cho tất cả sản phẩm trên Cửa hàng Loom từ Q2/2026.',
      'Khuyến khích kỹ năng tiêu dùng xanh trong chuỗi bài học Sinh kế bền vững.',
      'Đo lường và công bố lượng CO₂ tiết kiệm theo từng quý.',
    ],
  },
  {
    key: 'S',
    title: 'Xã hội (S)',
    accent: 'pink',
    icon: 'shield',
    color: 'text-[#E60067]',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    points: [
      '100% khóa học về An toàn số, Tài chính thông minh, Sinh kế thủ công miễn phí.',
      'Cam kết 0% quấy rối – kênh báo cáo ẩn danh 24/7 qua Đường dây Loom.',
      'Ưu tiên tuyển dụng lao động nữ trong chuỗi cung ứng thủ công.',
    ],
  },
  {
    key: 'G',
    title: 'Quản trị (G)',
    accent: 'slate',
    icon: 'hand',
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    points: [
      'Minh bạch chính sách dữ liệu – mọi thay đổi đều công bố ít nhất 7 ngày.',
      'Đội ngũ vận hành đa dạng giới, có đại diện nữ công nhân trong hội đồng cố vấn.',
      'Đánh giá rủi ro ESG hằng quý do bên thứ ba độc lập thực hiện.',
    ],
  },
];

const TARGETS_2026 = [
  { value: '50.000+', label: 'lượt học miễn phí' },
  { value: '80%', label: 'sản phẩm đóng gói tái chế' },
  { value: '0', label: 'vụ quấy rối chưa xử lý' },
  { value: '2 lần/năm', label: 'báo cáo ESG công khai' },
];

function PillarIcon({ name, className }) {
  if (name === 'shield') return <ShieldCheckIcon className={className} />;
  if (name === 'hand') return <HandIcon className={className} />;
  if (name === 'sparkle') return <SparklesIcon className={className} />;
  return null;
}

export default function EsgCommitment() {
  const navigate = useNavigate();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cam kết ESG 2026 – Loom for Women',
          text: 'Lời hứa của Loom for Women về Môi trường – Xã hội – Quản trị.',
          url: window.location.href,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Đã sao chép liên kết!');
      } catch {
        alert('Không thể chia sẻ.');
      }
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-6 pb-20 sm:px-6 md:pb-6">
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xs transition-colors hover:border-pink-300 hover:text-[#E60067]"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Quay lại</span>
        </button>
        <button
          type="button"
          onClick={handleShare}
          title="Chia sẻ trang"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xs transition-colors hover:border-pink-300 hover:text-[#E60067]"
        >
          <ShareIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Chia sẻ</span>
        </button>
      </div>

      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs"
      >
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-emerald-50 via-white to-pink-50 p-6 sm:p-10">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
              <SparklesIcon className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                ESG 2026
              </span>
              <h1 className="mt-2 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
                Cam kết ESG 2026
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4" />
                  Cập nhật lần cuối: {LAST_UPDATED}
                </span>
                <span>•</span>
                <span>Loom for Women</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <p className="text-[15px] leading-relaxed text-slate-700">
            <strong>ESG</strong> (Environmental – Social – Governance) là kim
            chỉ nam cho mọi hoạt động của <strong>Loom for Women</strong>.
            Chúng tôi tin rằng một nền tảng phát triển bền vững phải đồng
            thời <em>bảo vệ môi trường</em>, <em>nâng cao phúc lợi xã hội</em>{' '}
            và <em>vận hành minh bạch</em>. Bản cam kết dưới đây ghi rõ những
            gì chúng tôi sẽ làm trong năm 2026.
          </p>

          <div className="my-5 h-px w-full bg-slate-200" />

          <div className="space-y-6 text-[15px] leading-relaxed text-slate-700">
            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                1. Tổng quan cam kết ESG
              </h2>
              <p className="mt-2">
                Cam kết ESG 2026 của Loom tập trung vào 3 trụ cột, mỗi trụ
                cột đi kèm mục tiêu đo đếm được và lộ trình thực hiện rõ
                ràng. Chúng tôi công bố tiến độ theo quý và chịu sự giám sát
                của hội đồng cố vấn độc lập.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                2. Ba trụ cột của chúng tôi
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {PILLARS.map((p) => (
                  <div
                    key={p.key}
                    className={`rounded-2xl border ${p.border} ${p.bg} p-4`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white ${p.color}`}
                      >
                        <PillarIcon name={p.icon} className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-extrabold text-slate-900">
                        {p.title}
                      </span>
                    </div>
                    <ul className="mt-3 space-y-1.5 text-[13px] text-slate-700">
                      {p.points.map((point, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className={`mt-0.5 ${p.color}`}>
                            <CheckCircleIcon className="h-3.5 w-3.5" />
                          </span>
                          <span className="flex-1">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                3. Mục tiêu 2026
              </h2>
              <p className="mt-2">
                Những con số này là cam kết của chúng tôi với cộng đồng. Báo
                cáo tiến độ sẽ được công bố mỗi quý.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {TARGETS_2026.map((t) => (
                  <div
                    key={t.label}
                    className="rounded-2xl border border-slate-200 bg-gradient-to-br from-pink-50/60 to-emerald-50/40 p-4 text-center"
                  >
                    <p className="text-2xl font-extrabold text-[#E60067] sm:text-3xl">
                      {t.value}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold text-slate-600">
                      {t.label}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                4. Báo cáo &amp; minh bạch
              </h2>
              <p className="mt-2">
                Chúng tôi công bố báo cáo ESG tổng hợp <strong>2 lần/năm</strong>{' '}
                trên trang này. Báo cáo gồm số liệu hoàn thành mục tiêu, vụ
                việc an toàn đã xử lý, và các sáng kiến mới. Mọi phản hồi
                của người dùng đều được ghi nhận và phản hồi trong vòng 7
                ngày làm việc.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                5. Đối tác đồng hành
              </h2>
              <ul className="mt-2 list-disc space-y-1.5 pl-6">
                <li>
                  <strong>Zalo</strong> – đối tác nền tảng Zalo Mini App.
                </li>
                <li>
                  <strong>Tổng đài 111</strong> – phối hợp bảo vệ phụ nữ &
                  trẻ em.
                </li>
                <li>
                  <strong>Hội đồng cố vấn ESG độc lập</strong> – gồm chuyên
                  gia môi trường, giới và lao động.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                6. Lời cam kết hành động
              </h2>
              <p className="mt-2">
                ESG không phải khẩu hiệu, mà là việc làm hằng ngày. Mỗi
                thành viên Loom – từ đội ngũ vận hành, đối tác, đến cộng
                đồng người dùng – đều là một mắt xích trong chuỗi trách
                nhiệm này. Cùng nhau, chúng ta biến năm 2026 thành năm bản
                lề cho một nền tảng an toàn, bền vững và thực sự thuộc về
                phụ nữ Việt.
              </p>
            </section>

            <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-slate-800">
              <span className="mt-0.5 text-emerald-600">🌱</span>
              <p className="flex-1 leading-relaxed">
                Bạn có thể đóng góp ý tưởng ESG bằng cách gửi thư về{' '}
                <a
                  href="mailto:esg@loomforwomen.vn"
                  className="font-semibold text-emerald-700 hover:underline"
                >
                  esg@loomforwomen.vn
                </a>
                . Mỗi góp ý đều được hội đồng cố vấn xem xét.
              </p>
            </div>
          </div>

          {/* Related */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="mb-3 text-sm font-extrabold text-slate-900">
              Trang liên quan
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {RELATED.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="group flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 transition-all hover:border-pink-200 hover:shadow-sm"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-[#E60067]">
                    <SparklesIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="rounded-md bg-pink-50 px-1.5 py-0.5 text-[9px] font-semibold text-[#E60067]">
                      {n.tag}
                    </span>
                    <h4 className="mt-1 line-clamp-2 text-xs font-bold text-slate-900 group-hover:text-[#E60067]">
                      {n.title}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-[10px] text-slate-400">
                      {n.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.article>
    </main>
  );
}
