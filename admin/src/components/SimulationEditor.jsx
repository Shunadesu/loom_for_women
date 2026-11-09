/**
 * Editor Phần 2 — Mô phỏng tình huống (Video & Đúng/Sai).
 *
 * Props:
 * - value    : { videoUrl, description, statements: [{ text, isCorrect }] }
 * - onChange : (next) => void
 */

/** Tạo 1 phát biểu Đúng/Sai mới. */
export const emptyStatement = () => ({ text: '', isCorrect: false });

export default function SimulationEditor({ value, onChange }) {
  const sim = value || {};
  const patch = (changes) => onChange({ ...sim, ...changes });

  const statements = Array.isArray(sim.statements) ? sim.statements : [];

  const updateStatement = (index, changes) => {
    patch({
      statements: statements.map((s, i) =>
        i === index ? { ...s, ...changes } : s
      ),
    });
  };

  const addStatement = () => {
    patch({ statements: [...statements, emptyStatement()] });
  };

  const removeStatement = (index) => {
    patch({ statements: statements.filter((_, i) => i !== index) });
  };

  const moveStatement = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= statements.length) return;
    const next = [...statements];
    [next[index], next[target]] = [next[target], next[index]];
    patch({ statements: next });
  };

  const duplicateStatement = (index) => {
    const next = [...statements];
    next.splice(index + 1, 0, { ...statements[index] });
    patch({ statements: next });
  };

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

      <div className="space-y-2 rounded-lg border border-teal-200 bg-white/80 p-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-slate-600">
            Phát biểu Đúng / Sai cho học viên tự kiểm tra ({statements.length})
          </span>
          <button
            type="button"
            onClick={addStatement}
            className="rounded-md border border-teal-200 bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-700 hover:bg-teal-100"
          >
            + Thêm phát biểu
          </button>
        </div>

        {statements.length === 0 && (
          <p className="rounded-md border border-dashed border-teal-200 bg-white px-2.5 py-3 text-center text-[11px] text-slate-400">
            Chưa có phát biểu nào. Bấm "+ Thêm phát biểu" để học viên tự kiểm tra.
          </p>
        )}

        {statements.map((st, i) => (
          <div
            key={`statement-${i}`}
            className="grid gap-2 rounded-lg border border-teal-200 bg-white p-2.5 sm:grid-cols-[1fr_130px]"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-700 text-[10px] font-black text-white">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={st.text || ''}
                  onChange={(e) => updateStatement(i, { text: e.target.value })}
                  placeholder="VD: Chị Lan nên nhập mã OTP để nhận thưởng ngay."
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white p-1.5 text-slate-900 outline-none focus:border-teal-600"
                />
              </div>
              <div className="mt-1.5 flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => moveStatement(i, -1)}
                  disabled={i === 0}
                  title="Lên"
                  className="rounded border border-slate-200 px-1.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveStatement(i, 1)}
                  disabled={i === statements.length - 1}
                  title="Xuống"
                  className="rounded border border-slate-200 px-1.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => duplicateStatement(i)}
                  title="Nhân bản phát biểu"
                  className="rounded border border-slate-200 px-1.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                >
                  ⧉
                </button>
                <button
                  type="button"
                  onClick={() => removeStatement(i)}
                  title="Xoá phát biểu"
                  className="rounded border border-rose-200 px-1.5 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50"
                >
                  ✕
                </button>
              </div>
            </div>
            <div>
              <span className="mb-1 block text-[10px] font-bold text-slate-600">
                Đáp án
              </span>
              <select
                value={st.isCorrect !== false ? 'true' : 'false'}
                onChange={(e) =>
                  updateStatement(i, { isCorrect: e.target.value === 'true' })
                }
                className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-slate-900 outline-none focus:border-teal-600"
              >
                <option value="false">Sai</option>
                <option value="true">Đúng</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
