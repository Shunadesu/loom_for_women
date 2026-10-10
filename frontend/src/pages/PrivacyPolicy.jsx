import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ShareIcon,
  CalendarIcon,
  ShieldCheckIcon,
} from '../components/icons/index.jsx';
import { useNotification } from '../store/notificationStore.js';

const LAST_UPDATED = '01/10/2026';

const RELATED = [
  {
    to: '/dieu-khoan-su-dung',
    tag: 'Pháp lý',
    title: 'Điều khoản sử dụng',
    desc: 'Quy tắc chung khi sử dụng nền tảng Loom for Women.',
  },
  {
    to: '/cam-ket-esg-2026',
    tag: 'ESG',
    title: 'Cam kết ESG 2026',
    desc: 'Lời hứa của chúng tôi về Môi trường – Xã hội – Quản trị.',
  },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const { toast } = useNotification();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Chính sách bảo mật – Loom for Women',
          text: 'Tìm hiểu cách Loom for Women bảo vệ dữ liệu của bạn.',
          url: window.location.href,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({ type: 'success', message: 'Đã sao chép liên kết!' });
      } catch {
        toast({ type: 'error', message: 'Không thể chia sẻ.' });
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
        <div className="relative bg-gradient-to-br from-pink-50 via-white to-emerald-50 p-6 sm:p-10">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E60067] text-white shadow-sm">
              <ShieldCheckIcon className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="inline-block rounded-full bg-pink-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#E60067]">
                Pháp lý
              </span>
              <h1 className="mt-2 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
                Chính sách bảo mật
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
            Tại <strong>Loom for Women</strong>, chúng tôi coi trọng quyền
            riêng tư và sự an toàn dữ liệu của từng người dùng – đặc biệt là
            nữ công nhân và người lao động trong các môi trường nhạy cảm.
            Chính sách bảo mật này giải thích rõ chúng tôi thu thập, sử dụng
            và bảo vệ thông tin của bạn như thế nào.
          </p>

          <div className="my-5 h-px w-full bg-slate-200" />

          <div className="space-y-6 text-[15px] leading-relaxed text-slate-700">
            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                1. Giới thiệu &amp; phạm vi áp dụng
              </h2>
              <p className="mt-2">
                Chính sách này áp dụng cho mọi tương tác của bạn với nền tảng
                <strong> Loom for Women</strong> trên web tại{' '}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-[13px]">
                  loomforwomen.vn
                </code>{' '}
                và Zalo Mini App cùng tên. Bằng việc tiếp tục sử dụng dịch vụ,
                bạn đồng ý với các điều khoản được mô tả dưới đây.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                2. Thông tin chúng tôi thu thập
              </h2>
              <ul className="mt-2 list-disc space-y-1.5 pl-6">
                <li>
                  <strong>Thông tin tài khoản:</strong> số điện thoại, họ tên
                  (nếu cung cấp), ảnh đại diện.
                </li>
                <li>
                  <strong>Thông tin học tập:</strong> tiến độ khóa học, bài
                  học đã hoàn thành, chứng chỉ nhận được.
                </li>
                <li>
                  <strong>Tương tác trên nền tảng:</strong> bài viết, bình
                  luận, lượt thích, điểm tích lũy, lịch sử đổi quà.
                </li>
                <li>
                  <strong>Dữ liệu thiết bị &amp; kỹ thuật:</strong> loại
                  thiết bị, hệ điều hành, trình duyệt, địa chỉ IP rút gọn.
                </li>
                <li>
                  <strong>Dữ liệu hỗ trợ khẩn cấp (tuỳ chọn):</strong> thông
                  tin bạn gửi qua Đường dây tư vấn tâm lý &amp; pháp lý.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                3. Mục đích sử dụng
              </h2>
              <ul className="mt-2 list-disc space-y-1.5 pl-6">
                <li>Vận hành, duy trì và cải thiện chất lượng nền tảng.</li>
                <li>
                  Cá nhân hoá nội dung học tập và lộ trình an toàn phù hợp
                  với bạn.
                </li>
                <li>
                  Hỗ trợ kỹ thuật, chăm sóc khách hàng và xử lý yêu cầu đổi
                  quà.
                </li>
                <li>
                  Phát hiện, ngăn chặn hành vi gian lận, lạm dụng, vi phạm
                  pháp luật.
                </li>
                <li>
                  Gửi thông báo quan trọng về bảo mật, cập nhật chính sách,
                  khóa học mới (nếu bạn đồng ý nhận).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                4. Chia sẻ thông tin với bên thứ ba
              </h2>
              <p className="mt-2">
                Chúng tôi <strong>không bán</strong> dữ liệu cá nhân của bạn.
                Dữ liệu chỉ được chia sẻ trong các trường hợp sau:
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-6">
                <li>
                  Với <strong>Zalo</strong> khi bạn đăng nhập qua Zalo Mini
                  App, tuân theo chính sách riêng của Zalo.
                </li>
                <li>
                  Với cơ quan nhà nước có thẩm quyền khi có yêu cầu hợp pháp
                  (theo quy định pháp luật Việt Nam).
                </li>
                <li>
                  Với đối tác cung cấp dịch vụ lưu trữ, gửi SMS, xử lý
                  thanh toán – trong phạm vi cần thiết và có hợp đồng bảo
                  mật kèm theo.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                5. Bảo mật &amp; lưu trữ dữ liệu
              </h2>
              <p className="mt-2">
                Dữ liệu được mã hoá khi truyền (HTTPS) và khi lưu trữ trên
                máy chủ đạt chuẩn an toàn tối thiểu ISO/IEC 27001. Quyền truy
                cập vào hệ thống được giới hạn ở nhân sự được uỷ quyền và có
                ghi nhật ký. Chúng tôi lưu trữ dữ liệu trong thời gian tài
                khoản còn hoạt động hoặc theo yêu cầu pháp luật.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                6. Quyền của người dùng
              </h2>
              <p className="mt-2">Bạn có quyền:</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-6">
                <li>Truy cập, xem lại dữ liệu cá nhân của bạn.</li>
                <li>
                  Yêu cầu chỉnh sửa thông tin sai hoặc không còn chính xác.
                </li>
                <li>
                  Yêu cầu xoá tài khoản và toàn bộ dữ liệu liên quan (trừ
                  phần buộc lưu trữ theo luật).
                </li>
                <li>
                  Rút lại sự đồng thuận về nhận thông báo quảng cáo/tiếp thị
                  bất kỳ lúc nào.
                </li>
                <li>
                  Khiếu nại tới cơ quan quản lý nhà nước nếu quyền riêng tư
                  bị xâm phạm.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                7. Cookie &amp; công nghệ tương tự
              </h2>
              <p className="mt-2">
                Chúng tôi sử dụng cookie cần thiết để duy trì phiên đăng
                nhập, ghi nhớ tuỳ chọn ngôn ngữ và đo lường lưu lượng truy
                cập ẩn danh. Bạn có thể tắt cookie trong trình duyệt, nhưng
                một số tính năng có thể không hoạt động đầy đủ.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                8. Thay đổi chính sách
              </h2>
              <p className="mt-2">
                Chính sách bảo mật có thể được cập nhật khi chúng tôi bổ
                sung tính năng hoặc theo thay đổi pháp luật. Mọi thay đổi
                quan trọng sẽ được thông báo trước ít nhất 7 ngày qua thông
                báo trong ứng dụng hoặc email (nếu có).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                9. Liên hệ
              </h2>
              <p className="mt-2">
                Nếu có câu hỏi về chính sách bảo mật, vui lòng liên hệ:
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-6">
                <li>
                  Email:{' '}
                  <a
                    href="mailto:privacy@loomforwomen.vn"
                    className="font-semibold text-[#E60067] hover:underline"
                  >
                    privacy@loomforwomen.vn
                  </a>
                </li>
                <li>
                  Hotline tư vấn:{' '}
                  <strong className="text-[#E60067]">1900 969 680</strong>
                </li>
                <li>
                  Địa chỉ: Toà nhà Loom, Số 1 đường Bưởi, Quận Ba Đình, Hà
                  Nội.
                </li>
              </ul>
            </section>

            <div className="flex gap-3 rounded-2xl border border-pink-200 bg-pink-50/60 p-4 text-sm text-slate-800">
              <span className="mt-0.5 text-[#E60067]">💡</span>
              <p className="flex-1 leading-relaxed">
                Bạn có thể thay đổi quyền riêng tư và xoá tài khoản bất kỳ
                lúc nào trong mục <strong>Cài đặt → Quyền riêng tư</strong>{' '}
                trên ứng dụng.
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
                    <ShieldCheckIcon className="h-5 w-5" />
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
