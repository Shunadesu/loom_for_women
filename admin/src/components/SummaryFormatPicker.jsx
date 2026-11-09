/**
 * Chọn định dạng hiển thị cho phần "Tóm tắt bài học" (Phần 3).
 *
 * Props:
 * - value    : { format, imageUrl, videoUrl, title }
 * - onChange : (next) => void
 */
const FORMATS = [
  {
    value: 'pdf_video',
    label: '✨ PDF Infographic + Video',
    hint: 'Hiển thị cả ảnh infographic và video tóm tắt',
  },
  {
    value: 'pdf',
    label: '🖼️ Chỉ PDF Infographic',
    hint: 'Chỉ hiển thị ảnh/URL infographic tóm tắt',
  },
  {
    value: 'video',
    label: '🎬 Chỉ Video Tóm Tắt',
    hint: 'Chỉ hiển thị video tóm tắt',
  },
];

export default function SummaryFormatPicker({ value, onChange }) {
  const summary = value || {};
  const format = summary.format || 'pdf_video';

  const patch = (changes) => onChange({ ...summary, ...changes });

  return (
    <div className="space-y-2.5">
      <div>
        <span className="mb-1.5 block text-[10px] font-bold uppercase text-slate-500">
          Định dạng tóm tắt bài học hiển thị cho người dùng
        </span>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
          {FORMATS.map((f) => {
            const active = format === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => patch({ format: f.value })}
                title={f.hint}
                className={`rounded-xl border p-2 text-[11px] font-bold text-center transition-all ${
                  active
                    ? 'border-[#E60067] bg-[#E60067] text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {format !== 'video' && (
        <div>
          <span className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
            URL Ảnh PDF Infographic / Poster tóm tắt
          </span>
          <input
            type="text"
            value={summary.imageUrl || ''}
            onChange={(e) => patch({ imageUrl: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-[#E60067]"
          />
          {summary.imageUrl && (
            <img
              src={summary.imageUrl}
              alt="Preview infographic"
              className="mt-1.5 h-24 w-full rounded-lg object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
      )}

      {format !== 'pdf' && (
        <div>
          <span className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
            URL Video Tóm Tắt
          </span>
          <input
            type="text"
            value={summary.videoUrl || ''}
            onChange={(e) => patch({ videoUrl: e.target.value })}
            placeholder="https://www.youtube.com/embed/..."
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-[#E60067]"
          />
        </div>
      )}

      <div>
        <span className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
          Tiêu đề phần tóm tắt (tuỳ chọn)
        </span>
        <input
          type="text"
          value={summary.title || ''}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="VD: Infographic tổng kết bài móc len cơ bản"
          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-[#E60067]"
        />
      </div>
    </div>
  );
}
