import { useNavigate } from 'react-router-dom';
import { GraduationCapIcon, CalendarIcon, QuestionMarkIcon } from '../icons/index.jsx';
import { usePassportStore } from '../../store/passportStore.js';
import { useProgressStore } from '../../store/progressStore.js';
import { useExpertQAStore } from '../../store/expertQAStore.js';
import { useWorkshopStore } from '../../store/workshopStore.js';

export default function PassportActionCards() {
  const navigate = useNavigate();
  const passport = usePassportStore((s) => s.passport);
  const stats = useProgressStore((s) => s.stats);
  const openExpertQA = useExpertQAStore((s) => s.openModal);
  const openWorkshop = useWorkshopStore((s) => s.openModal);
  const myTickets = useWorkshopStore((s) => s.myTickets);

  const completedCourses = passport?.stats?.completedCourses ?? stats?.completed ?? 0;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* Thẻ 1: Khóa học E-learning */}
      <button
        type="button"
        onClick={() => navigate('/khoa-hoc?tab=ongoing')}
        className="group flex cursor-pointer flex-col justify-between bg-gradient-to-br from-[#E60067] to-rose-600 p-3.5 text-left text-white shadow-sm transition-all hover:from-pink-600 hover:to-rose-700 rounded-2xl"
      >
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white transition-transform group-hover:scale-105">
          <GraduationCapIcon aria-hidden="true" className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-white">Khóa học E-learning</h3>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
              {completedCourses} Đã xong
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-pink-100">Bài học kỹ năng &amp; chứng chỉ</p>
        </div>
      </button>

      {/* Thẻ 2: Workshop kỹ năng */}
      <button
        type="button"
        onClick={openWorkshop}
        className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 text-left shadow-xs transition-all hover:bg-pink-50/50"
      >
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-[#E60067] transition-transform group-hover:scale-105">
          <CalendarIcon aria-hidden="true" className="h-5 w-5 text-[#E60067]" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-900">Workshop kỹ năng</h3>
            <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-[#E60067]">
              {myTickets.length} Đăng ký
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-slate-500">Lịch thực hành &amp; vé tham gia</p>
        </div>
      </button>

      {/* Thẻ 3: Hỏi Chuyên gia */}
      <button
        type="button"
        onClick={openExpertQA}
        className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 text-left shadow-xs transition-all hover:bg-pink-50/50"
      >
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-amber-500 transition-transform group-hover:scale-105">
          <QuestionMarkIcon aria-hidden="true" className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-900">Hỏi Chuyên gia</h3>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
              Miễn phí
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-slate-500">Tâm lý, pháp lý &amp; quyền lợi</p>
        </div>
      </button>
    </div>
  );
}
