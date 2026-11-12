import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, SparklesIcon, AwardIcon, CheckIcon } from '../icons/index.jsx';
import { useWorkshopStore } from '../../store/workshopStore.js';

const FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'Thực phẩm bền vững', label: 'Thực phẩm bền vững' },
  { id: 'Bảo vệ môi trường', label: 'Bảo vệ môi trường' },
  { id: 'mine', label: 'Vé của tôi', icon: true },
];

function WorkshopCard({ workshop, registered, onRegister, onCancel }) {
  const pct = Math.min(100, Math.round((workshop.registered / workshop.capacity) * 100));
  const remaining = Math.max(0, workshop.capacity - workshop.registered);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all hover:border-pink-300">
      <div className="relative h-32 overflow-hidden bg-slate-100">
        <img
          alt={workshop.title}
          className="h-full w-full object-cover"
          src={workshop.image}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
          <span className={`rounded-md px-2 py-0.5 text-[9px] font-extrabold text-white shadow-xs ${workshop.categoryColor}`}>
            {workshop.category}
          </span>
          <span className="flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs">
            {workshop.format}
          </span>
        </div>
        <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
          <h3 className="text-xs font-black leading-snug drop-shadow-md">{workshop.title}</h3>
        </div>
      </div>

      <div className="space-y-2.5 p-3 text-xs">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2 text-[10px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span>📅</span>
            <span className="font-semibold text-slate-800">{workshop.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>🕘</span>
            <span>{workshop.time}</span>
          </div>
          <div className="col-span-2 flex items-center gap-1.5">
            <span>📍</span>
            <span className="line-clamp-1">{workshop.location}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 pt-2">
          <img
            alt={workshop.speaker.name}
            className="h-8 w-8 rounded-full border border-pink-200 object-cover"
            src={workshop.speaker.avatar}
            loading="lazy"
          />
          <div>
            <div className="text-[11px] font-bold text-slate-900">{workshop.speaker.name}</div>
            <div className="text-[9px] text-slate-500">{workshop.speaker.role}</div>
          </div>
        </div>

        <p className="line-clamp-2 text-[10px] leading-relaxed text-slate-600">
          {workshop.description}
        </p>

        <div className="space-y-1 rounded-xl border border-pink-100 bg-pink-50/60 p-2">
          <div className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-[#E60067]">
            <SparklesIcon className="h-3 w-3 text-[#E60067]" />
            Quyền lợi người tham gia:
          </div>
          {workshop.benefits.map((b) => (
            <div key={b} className="flex items-start gap-1.5 text-[10px] text-slate-700">
              <CheckIcon className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
              <span>{b}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[9px] text-slate-500">
            <span className="font-medium">
              Đã có {workshop.registered}/{workshop.capacity} nữ công nhân đăng ký
            </span>
            <span className="font-bold text-[#E60067]">Còn {remaining} chỗ</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#E60067] to-pink-400"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="pt-1">
          {registered ? (
            <button
              type="button"
              onClick={() => onCancel(workshop.id)}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-extrabold text-emerald-700 transition-all hover:bg-emerald-100"
            >
              <CheckIcon className="h-4 w-4" />
              <span>Đã giữ vé • Hủy đăng ký</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onRegister(workshop.id)}
              disabled={remaining <= 0}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#E60067] px-4 py-2.5 text-xs font-extrabold text-white shadow-md transition-all hover:bg-[#c90059] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SparklesIcon className="h-4 w-4 text-pink-200" />
              <span>{remaining <= 0 ? 'Đã hết chỗ' : 'Đăng Ký Tham Gia Ngay (Miễn Phí)'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WorkshopModal() {
  const isOpen = useWorkshopStore((s) => s.isOpen);
  const closeModal = useWorkshopStore((s) => s.closeModal);
  const activeFilter = useWorkshopStore((s) => s.activeFilter);
  const setFilter = useWorkshopStore((s) => s.setFilter);
  const getFiltered = useWorkshopStore((s) => s.getFiltered);
  const myTickets = useWorkshopStore((s) => s.myTickets);
  const register = useWorkshopStore((s) => s.register);
  const cancel = useWorkshopStore((s) => s.cancel);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) closeModal();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeModal]);

  const filtered = isOpen ? getFiltered() : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="flex max-h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-slate-50 shadow-2xl transition-all sm:max-h-[92vh] sm:rounded-3xl sm:border sm:border-slate-100 md:max-w-3xl lg:max-w-4xl"
              role="dialog"
              aria-modal="true"
              aria-label="Workshop kỹ năng"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative shrink-0 bg-gradient-to-r from-[#E60067] to-[#c90059] p-4 text-white md:p-5">
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Đóng"
                  className="absolute right-3.5 top-3.5 cursor-pointer rounded-full bg-white/20 p-1.5 text-white transition-colors hover:bg-white/30"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
                <div className="mb-1 flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-emerald-400 px-2 py-0.5 text-[9px] font-black uppercase text-slate-900 shadow-xs">
                    🌱 Chuyên đề Xanh 2026
                  </span>
                  <span className="text-[10px] font-medium text-pink-100">Loom for Women</span>
                </div>
                <h2 className="text-base font-extrabold leading-tight text-white">
                  Workshop Bảo Vệ Môi Trường &amp; Thực Phẩm Bền Vững
                </h2>
                <p className="mt-1 text-[11px] leading-snug text-pink-100 opacity-90">
                  Các buổi chia sẻ miễn phí nâng cao năng lực, sống xanh &amp; nhận quà tặng
                  dự thưởng dành cho Nữ công nhân.
                </p>
              </div>

              {/* Filter tabs */}
              <div className="no-scrollbar flex shrink-0 items-center gap-1.5 overflow-x-auto border-b border-slate-100 bg-white px-3 py-2.5">
                {FILTERS.map((f) => {
                  const active = activeFilter === f.id;
                  const count =
                    f.id === 'mine'
                      ? myTickets.length
                      : undefined;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFilter(f.id)}
                      className={`flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all ${
                        active
                          ? 'bg-[#E60067] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f.icon && <AwardIcon className="h-3.5 w-3.5" />}
                      {f.label}
                      {typeof count === 'number' && count > 0 && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                            active ? 'bg-white/20 text-white' : 'bg-[#E60067] text-white'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {filtered.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                    <p className="text-xs font-bold text-slate-700">
                      {activeFilter === 'mine'
                        ? 'Bạn chưa giữ vé workshop nào.'
                        : 'Chưa có workshop trong mục này.'}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {activeFilter === 'mine'
                        ? 'Hãy chọn một workshop bên tab Tất cả và bấm Đăng ký (Miễn phí).'
                        : 'Vui lòng quay lại sau.'}
                    </p>
                    {activeFilter === 'mine' && (
                      <button
                        type="button"
                        onClick={() => setFilter('all')}
                        className="mt-3 rounded-full bg-[#E60067] px-4 py-2 text-xs font-bold text-white hover:bg-[#c90059]"
                      >
                        Xem tất cả workshop
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {filtered.map((w) => (
                      <WorkshopCard
                        key={w.id}
                        workshop={w}
                        registered={myTickets.includes(w.id)}
                        onRegister={register}
                        onCancel={cancel}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
