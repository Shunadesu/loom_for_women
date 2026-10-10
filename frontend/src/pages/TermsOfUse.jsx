import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ShareIcon,
  CalendarIcon,
  FileTextIcon,
} from '../components/icons/index.jsx';
import { useNotification } from '../store/notificationStore.js';

const LAST_UPDATED = '01/10/2026';

const RELATED = [
  {
    to: '/chinh-sach-bao-mat',
    tag: 'Pháp lý',
    title: 'Chính sách bảo mật',
    desc: 'Cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn.',
  },
  {
    to: '/cam-ket-esg-2026',
    tag: 'ESG',
    title: 'Cam kết ESG 2026',
    desc: 'Lời hứa của chúng tôi về Môi trường – Xã hội – Quản trị.',
  },
];

export default function TermsOfUse() {
  const navigate = useNavigate();
  const { toast } = useNotification();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Điều khoản sử dụng – Loom for Women',
          text: 'Điều khoản sử dụng nền tảng Loom for Women.',
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
              <FileTextIcon className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="inline-block rounded-full bg-pink-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#E60067]">
                Pháp lý
              </span>
              <h1 className="mt-2 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
                Điều khoản sử dụng
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4" />
                  Có hiệu lực từ: {LAST_UPDATED}
                </span>
                <span>•</span>
                <span>Loom for Women</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <p className="text-[15px] leading-relaxed text-slate-700">
            Điều khoản sử dụng này là thoả thuận giữa bạn và{' '}
            <strong>Loom for Women</strong> (sau đây gọi tắt là
            <strong> "Loom"</strong>). Khi tạo tài khoản, đăng nhập hoặc sử
            dụng bất kỳ dịch vụ nào trên nền tảng, bạn xác nhận đã đọc, hiểu
            và đồng ý với toàn bộ điều khoản dưới đây.
          </p>

          <div className="my-5 h-px w-full bg-slate-200" />

          <div className="space-y-6 text-[15px] leading-relaxed text-slate-700">
            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                1. Chấp nhận điều khoản
              </h2>
              <p className="mt-2">
                Bằng việc sử dụng nền tảng, bạn xác nhận đã đủ 16 tuổi trở
                lên và có đủ năng lực hành vi dân sự theo quy định pháp luật
                Việt Nam. Nếu bạn sử dụng thay cho tổ chức/cơ quan, bạn cam
                kết được uỷ quyền hợp pháp để chấp nhận điều khoản này.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                2. Tài khoản &amp; trách nhiệm người dùng
              </h2>
              <ul className="mt-2 list-disc space-y-1.5 pl-6">
                <li>
                  Cung cấp thông tin đăng ký trung thực, chính xác và cập
                  nhật khi có thay đổi.
                </li>
                <li>
                  Bảo mật mật khẩu, mã OTP và mọi thiết bị đăng nhập. Mọi
                  hoạt động dưới tài khoản của bạn được coi là do bạn thực
                  hiện.
                </li>
                <li>
                  Thông báo ngay cho Loom khi phát hiện truy cập trái phép
                  hoặc nghi ngờ lộ mật khẩu.
                </li>
                <li>
                  Tự chịu trách nhiệm về nội dung bạn đăng tải (bình luận,
                  bài viết, hình ảnh, câu hỏi).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                3. Sử dụng dịch vụ được phép
              </h2>
              <p className="mt-2">
                Bạn được phép sử dụng nền tảng cho mục đích cá nhân, phi
                thương mại: học tập, tham gia cộng đồng, trao đổi thủ công,
                tích luỹ điểm thưởng. Mọi hành vi khai thác thương mại cần
                có văn bản đồng ý bằng văn bản từ Loom.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                4. Sở hữu trí tuệ &amp; bản quyền
              </h2>
              <p className="mt-2">
                Toàn bộ nội dung trên nền tảng – bao gồm nhưng không giới
                hạn ở văn bản, hình ảnh, video bài giảng, logo, thiết kế –
                thuộc quyền sở hữu của Loom hoặc đối tác được cấp phép. Bạn
                không được sao chép, phân phối, sửa đổi hoặc tái xuất bản
                khi chưa được phép.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                5. Hành vi bị nghiêm cấm
              </h2>
              <ul className="mt-2 list-disc space-y-1.5 pl-6">
                <li>
                  Đăng tải nội dung vi phạm pháp luật, xuyên tạc, kích động
                  thù ghét, bạo lực, khiêu dâm hoặc xâm phạm quyền của
                  người khác.
                </li>
                <li>
                  Spam, quảng cáo trái phép, lừa đảo, gian lận điểm thưởng
                  hoặc chứng chỉ.
                </li>
                <li>
                  Tấn công, phá hoại hệ thống, can thiệp vào mã nguồn hoặc
                  cơ sở dữ liệu của nền tảng.
                </li>
                <li>
                  Mạo danh Loom, nhân viên Loom hoặc người dùng khác dưới
                  bất kỳ hình thức nào.
                </li>
                <li>
                  Thu thập trái phép thông tin người dùng khác, kể cả thông
                  tin được hiển thị công khai.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                6. Giới hạn trách nhiệm của Loom
              </h2>
              <p className="mt-2">
                Nền tảng được cung cấp trên cơ sở <strong>“nguyên trạng”</strong>.
                Trong phạm vi pháp luật cho phép, Loom không chịu trách
                nhiệm về các thiệt hại gián tiếp, ngẫu nhiên hoặc hệ quả
                phát sinh từ việc bạn sử dụng hoặc không thể sử dụng dịch
                vụ. Nội dung bài học mang tính tham khảo, không thay thế
                tư vấn pháp lý, y tế hay tài chính chuyên nghiệp.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                7. Tạm ngưng / chấm dứt dịch vụ
              </h2>
              <p className="mt-2">
                Loom có thể tạm ngưng hoặc chấm dứt quyền truy cập của bạn
                nếu phát hiện vi phạm điều khoản, gian lận, hoặc theo yêu
                cầu của cơ quan có thẩm quyền. Bạn có thể chấm dứt tài khoản
                bất kỳ lúc nào trong phần cài đặt.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                8. Thay đổi điều khoản
              </h2>
              <p className="mt-2">
                Chúng tôi có thể cập nhật điều khoản để phản ánh tính năng
                mới hoặc thay đổi pháp luật. Khi có thay đổi quan trọng,
                Loom sẽ thông báo qua ứng dụng hoặc email đăng ký ít nhất{' '}
                <strong>7 ngày</strong> trước khi áp dụng. Việc bạn tiếp tục
                sử dụng dịch vụ đồng nghĩa với chấp nhận điều khoản mới.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                9. Luật áp dụng &amp; giải quyết tranh chấp
              </h2>
              <p className="mt-2">
                Điều khoản này được điều chỉnh theo pháp luật Việt Nam. Mọi
                tranh chấp phát sinh sẽ được ưu tiên giải quyết thông qua
                thương lượng. Nếu không đạt được thoả thuận, tranh chấp sẽ
                được đưa ra Toà án nhân dân có thẩm quyền tại Hà Nội.
              </p>
            </section>

            <div className="flex gap-3 rounded-2xl border border-pink-200 bg-pink-50/60 p-4 text-sm text-slate-800">
              <span className="mt-0.5 text-[#E60067]">💡</span>
              <p className="flex-1 leading-relaxed">
                Mọi thắc mắc về điều khoản vui lòng gửi về{' '}
                <a
                  href="mailto:hello@loomforwomen.vn"
                  className="font-semibold text-[#E60067] hover:underline"
                >
                  hello@loomforwomen.vn
                </a>{' '}
                hoặc gọi tổng đài <strong>1900 969 680</strong> trong giờ
                hành chính.
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
                    <FileTextIcon className="h-5 w-5" />
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
