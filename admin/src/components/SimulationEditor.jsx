/**
 * Editor Phần 2 — Mô phỏng tình huống (Video & Đúng/Sai).
 *
 * Props:
 * - value    : { videoUrl, description, statement, isCorrect }
 * - onChange : (next) => void
 */
export default function SimulationEditor({ value, onChange }) {
  const sim = value || {};
  const patch = (changes) => onChange({ ...sim, ...changes });

  return (
    <div className="space-y-2.5">
      <div>
        <label className="mb-1 block font-bold text-slate-800">
          URL Video mô phỏng tình huống thực tế (YouTube)
        </label>
        <input
          type="text"
          value={sim.videoUrl || ''}
          onChange={(e) => patch({ videoUrl: e.target.value })}
          placeholder="https://www.youtube.com/embed/..."
          className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 outline-none focus:border-teal-600"
        />
      </div>

      <div>
        <label className="mb-1 block font-bold text-slate-800">
          Mô tả bối cảnh tình huống trong video
        </label>
        <textarea
          rows={2}
          value={sim.description || ''}
          onChange={(e) => patch({ description: e.target.value })}
          placeholder="VD: Chị Lan nhận cuộc gọi trúng thưởng..."
          className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 outline-none focus:border-teal-600"
        />
      </div>

      <div className="grid gap-2 rounded-lg border border-teal-200 bg-white/80 p-2.5 sm:grid-cols-[1fr_130px]">
        <div>
          <span className="mb-1 block text-[10px] font-bold text-slate-600">
            Phát biểu Đúng / Sai cho học viên tự kiểm tra
          </span>
          <input
            type="text"
            value={sim.statement || ''}
            onChange={(e) => patch({ statement: e.target.value })}
            placeholder="VD: Chị Lan nên nhập mã OTP để nhận thưởng ngay."
            className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-slate-900 outline-none focus:border-teal-600"
          />
        </div>
        <div>
          <span className="mb-1 block text-[10px] font-bold text-slate-600">
            Đáp án
          </span>
          <select
            value={sim.isCorrect !== false ? 'true' : 'false'}
            onChange={(e) =>
              patch({ isCorrect: e.target.value === 'true' })
            }
            className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-slate-900 outline-none focus:border-teal-600"
          >
            <option value="false">Sai</option>
            <option value="true">Đúng</option>
          </select>
        </div>
      </div>
    </div>
  );
}
