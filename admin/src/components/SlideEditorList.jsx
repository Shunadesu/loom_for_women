import { useState } from 'react';

/**
 * Quản lý danh sách slide của phần "Cung cấp kiến thức".
 *
 * Props:
 * - value      : array slide [{ title, content, bullets[], imageUrl, note, noteLabel }]
 * - onChange   : (slides) => void
 */
export default function SlideEditorList({ value = [], onChange }) {
  const [openIndex, setOpenIndex] = useState(0);

  const slides = Array.isArray(value) ? value : [];

  const update = (index, patch) => {
    const next = slides.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onChange(next);
  };

  const addSlide = () => {
    onChange([
      ...slides,
      {
        title: '',
        content: '',
        bullets: [''],
        imageUrl: '',
        note: '',
        noteLabel: 'ĐIỂM LƯU Ý AN TOÀN CỐT LÕI',
      },
    ]);
    setOpenIndex(slides.length);
  };

  const removeSlide = (index) => {
    onChange(slides.filter((_, i) => i !== index));
    setOpenIndex(0);
  };

  const move = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
    setOpenIndex(target);
  };

  const setBullet = (index, bulletIndex, text) => {
    const bullets = [...(slides[index]?.bullets || [])];
    bullets[bulletIndex] = text;
    update(index, { bullets });
  };

  const addBullet = (index) => {
    const bullets = [...(slides[index]?.bullets || []), ''];
    update(index, { bullets });
  };

  const removeBullet = (index, bulletIndex) => {
    const bullets = (slides[index]?.bullets || []).filter((_, i) => i !== bulletIndex);
    update(index, { bullets });
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-700">
          Danh sách slide ({slides.length})
        </span>
        <button
          type="button"
          onClick={addSlide}
          className="rounded-md border border-pink-200 bg-pink-50 px-2 py-1 text-[10px] font-bold text-[#E60067] hover:bg-pink-100"
        >
          + Thêm slide
        </button>
      </div>

      {slides.length === 0 && (
        <p className="rounded-md border border-dashed border-pink-200 bg-white px-2.5 py-3 text-center text-[11px] text-slate-400">
          Chưa có slide nào. Bấm "+ Thêm slide" để bắt đầu.
        </p>
      )}

      {slides.map((slide, i) => {
        const expanded = openIndex === i;
        return (
          <div
            key={`slide-${i}`}
            className="rounded-lg border border-pink-200 bg-white p-2.5"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E60067] text-[10px] font-black text-white">
                {i + 1}
              </span>
              <input
                type="text"
                value={slide.title || ''}
                onChange={(e) => update(i, { title: e.target.value })}
                placeholder="Tiêu đề slide"
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-[#E60067]"
              />
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                title="Lên"
                className="rounded border border-slate-200 px-1.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === slides.length - 1}
                title="Xuống"
                className="rounded border border-slate-200 px-1.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => setOpenIndex(expanded ? -1 : i)}
                title="Mở rộng"
                className="rounded border border-slate-200 px-1.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
              >
                {expanded ? '−' : '+'}
              </button>
              <button
                type="button"
                onClick={() => removeSlide(i)}
                title="Xoá slide"
                className="rounded border border-rose-200 px-1.5 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50"
              >
                ✕
              </button>
            </div>

            {expanded && (
              <div className="mt-2.5 space-y-2">
                <textarea
                  rows={2}
                  value={slide.content || ''}
                  onChange={(e) => update(i, { content: e.target.value })}
                  placeholder="Mô tả / dẫn giải cho slide"
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-[#E60067]"
                />

                <div>
                  <span className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
                    Gạch đầu dòng
                  </span>
                  <div className="space-y-1.5">
                    {(slide.bullets || []).map((bullet, bi) => (
                      <div key={`bullet-${i}-${bi}`} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => setBullet(i, bi, e.target.value)}
                          placeholder="Nội dung gạch đầu dòng"
                          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-[#E60067]"
                        />
                        <button
                          type="button"
                          onClick={() => removeBullet(i, bi)}
                          title="Xoá dòng"
                          className="rounded border border-rose-200 px-1.5 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addBullet(i)}
                      className="rounded-md border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                    >
                      + Thêm gạch đầu dòng
                    </button>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <span className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
                      URL ảnh minh hoạ
                    </span>
                    <input
                      type="text"
                      value={slide.imageUrl || ''}
                      onChange={(e) => update(i, { imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-[#E60067]"
                    />
                  </div>
                  <div>
                    <span className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
                      Nhãn ô cảnh báo
                    </span>
                    <input
                      type="text"
                      value={slide.noteLabel || ''}
                      onChange={(e) => update(i, { noteLabel: e.target.value })}
                      placeholder="ĐIỂM LƯU Ý AN TOÀN CỐT LÕI"
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-[#E60067]"
                    />
                  </div>
                </div>

                <div>
                  <span className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
                    Nội dung ô cảnh báo
                  </span>
                  <textarea
                    rows={2}
                    value={slide.note || ''}
                    onChange={(e) => update(i, { note: e.target.value })}
                    placeholder="Kiến thức được bảo trợ bởi Tổng Liên đoàn Lao động..."
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-[#E60067]"
                  />
                </div>

                {slide.imageUrl && (
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="h-24 w-full rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
