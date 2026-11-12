import { QrCodeIcon } from '../icons/index.jsx';
import { usePassportStore } from '../../store/passportStore.js';
import { useAuthStore } from '../../store/authStore.js';

function shortSerial(serial) {
  const digits = String(serial || '').replace(/\D/g, '');
  if (digits.length >= 4) return digits.slice(-4);
  return serial || '8892';
}

function badgeLabel(badge) {
  if (!badge) return '';
  if (typeof badge === 'string') return badge;
  return badge.label || badge.name || '';
}

export default function PassportCard() {
  const passport = usePassportStore((s) => s.passport);
  const points = useAuthStore((s) => s.points);

  const profile = passport?.profile || {};
  const stats = passport?.stats || {};
  const badges = passport?.badges?.length ? passport.badges : useAuthStore.getState().profile?.badges || [];

  const completedCourses = stats.completedCourses ?? 0;
  const workshopJoined = 0;
  const totalPoints = Number(points || 0);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl border border-pink-300/40 bg-gradient-to-br from-[#E60067] via-[#f72585] to-rose-600 p-5 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <span className="rounded-full border border-white/30 bg-white/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white">
              LOOM PASSPORT #{shortSerial(profile.passportSerial)}
            </span>
            <h3 className="mt-2 text-base font-black text-white">HỘ CHIẾU AN TOÀN SỐ</h3>
            <p className="mt-0.5 text-[11px] text-pink-100">
              Dành cho Lao Động Nữ tại các Khu Công Nghiệp
            </p>
          </div>
          <div className="rounded-xl bg-white p-1.5 shadow-md">
            <QrCodeIcon aria-hidden="true" className="h-10 w-10 text-[#E60067]" />
          </div>
        </div>

        <div className="my-4 grid grid-cols-3 gap-2 rounded-2xl border border-white/20 bg-white/15 p-3 text-center">
          <div>
            <p className="text-[10px] text-pink-100">Khóa học hoàn thành</p>
            <p className="mt-0.5 text-base font-extrabold text-white">
              {completedCourses} Khóa
            </p>
          </div>
          <div>
            <p className="text-[10px] text-pink-100">Workshop tham gia</p>
            <p className="mt-0.5 text-base font-extrabold text-white">
              {workshopJoined} Buổi
            </p>
          </div>
          <div>
            <p className="text-[10px] text-pink-100">Điểm tích lũy</p>
            <p className="mt-0.5 text-base font-extrabold text-yellow-300">
              {totalPoints.toLocaleString('vi-VN')} Đ
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-bold text-pink-100">
            Huy hiệu năng lực đã đạt được:
          </p>
          <div className="flex flex-wrap gap-2">
            {badges && badges.length > 0 ? (
              <>
                {badges.slice(0, 3).map((b, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 rounded-full border border-pink-100 bg-white px-3 py-1 text-[11px] font-bold text-[#E60067] shadow-xs"
                  >
                    <span>{badgeLabel(b)}</span>
                  </span>
                ))}
                <span className="rounded-full border border-white/30 bg-white/20 px-3 py-1 text-[11px] font-semibold text-white">
                  + 2 Huy hiệu đang mở khóa
                </span>
              </>
            ) : (
              <span className="text-[11px] italic text-pink-100">
                Chưa có huy hiệu. Học thêm để nhận!
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-900">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[#E60067]" aria-hidden="true">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          </svg>
          <span>Chứng nhận Cấp độ An toàn Lao động Nữ</span>
        </h4>
        <p className="text-[11px] leading-relaxed text-slate-600">
          Hộ chiếu an toàn số xác nhận bạn đã hoàn thành các khóa tập huấn cơ bản về:
          <strong> Phòng chống lừa đảo trực tuyến</strong>,{' '}
          <strong>Kế hoạch an sinh &amp; BHXH</strong>, và{' '}
          <strong>Quản lý chi tiêu gia đình</strong>. Dữ liệu được bảo trợ theo
          tiêu chuẩn ESG (Xã hội) của Dự án Loom for Women.
        </p>
      </div>
    </div>
  );
}
