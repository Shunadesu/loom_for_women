import { useNavigate } from 'react-router-dom';
import { GraduationCapIcon, QuestionMarkIcon } from '../icons/index.jsx';
import { useExpertQAStore } from '../../store/expertQAStore.js';

/**
 * MyCourseCards — cặp thẻ nổi bật ngay dưới thanh Quick Actions.
 *
 * Thẻ 1: Khóa học E-learning (nền hồng thương hiệu) → dẫn tới trang khoá học.
 * Thẻ 2: Hỏi Chuyên gia & SOS 24/7 (nền trắng) → mở modal hỏi đáp chuyên gia.
 */
export default function MyCourseCards() {
  const navigate = useNavigate();
  const openExpertQA = useExpertQAStore((s) => s.openModal);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Thẻ 1: Khóa học E-learning — nền hồng */}
      <button
        type="button"
        onClick={() => navigate('/khoa-hoc')}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#E60067] p-5 text-left text-white shadow-sm transition-all hover:bg-[#c90059]"
      >
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
          <GraduationCapIcon
            aria-hidden="true"
            className="h-6 w-6 text-white"
          />
        </div>
        <h3 className="text-sm font-bold leading-tight sm:text-base">
          Khóa học E-learning
        </h3>
        <p className="mt-1 text-xs text-pink-100 opacity-90">
          Phòng chống lừa đảo trực tuyến &amp; An sinh xã hội cho lao động nữ
        </p>
      </button>

      {/* Thẻ 2: Hỏi Chuyên gia & SOS 24/7 — nền trắng + badge */}
      <button
        type="button"
        onClick={openExpertQA}
        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 text-left text-slate-800 shadow-xs transition-all hover:bg-pink-50/50"
      >
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-[#E60067]">
          <QuestionMarkIcon aria-hidden="true" className="h-6 w-6" />
        </div>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold leading-tight sm:text-base">
            Hỏi Chuyên gia &amp; SOS 24/7
          </h3>
          <span className="shrink-0 rounded-full bg-pink-100 px-2.5 py-0.5 text-[10px] font-bold text-[#E60067]">
            Miễn phí
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Tư vấn pháp lý, tâm lý, giải đáp khó khăn cho nữ công nhân
        </p>
      </button>
    </div>
  );
}
