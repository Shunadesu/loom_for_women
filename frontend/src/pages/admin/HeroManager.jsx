import { useEffect, useState } from 'react';
import { useHeroStore } from '../../store/heroStore.js';
import HeroFormModal from '../../components/admin/HeroFormModal.jsx';

export default function HeroManager() {
  const heroes = useHeroStore((s) => s.heroes);
  const loading = useHeroStore((s) => s.loading);
  const error = useHeroStore((s) => s.error);
  const fetchAll = useHeroStore((s) => s.fetchAll);
  const create = useHeroStore((s) => s.create);
  const update = useHeroStore((s) => s.update);
  const remove = useHeroStore((s) => s.remove);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  function openCreate() {
    setEditing(null);
    setActionError('');
    setModalOpen(true);
  }
  function openEdit(hero) {
    setEditing(hero);
    setActionError('');
    setModalOpen(true);
  }
  function closeModal() {
    if (busy) return;
    setModalOpen(false);
  }

  async function handleSubmit(formData) {
    setBusy(true);
    setActionError('');
    try {
      if (editing) {
        await update(editing._id, formData);
      } else {
        await create(formData);
      }
      setModalOpen(false);
    } catch (err) {
      setActionError(err?.response?.data?.error || err.message || 'Lỗi.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(hero) {
    if (!window.confirm(`Xoá ảnh "${hero.alt || 'này'}"?`)) return;
    setActionError('');
    try {
      await remove(hero._id);
    } catch (err) {
      setActionError(err?.response?.data?.error || err.message || 'Lỗi xoá.');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Hero Banner</h1>
          <p className="mt-1 text-xs text-slate-500">
            Ảnh sẽ hiển thị trên trang chủ — sắp xếp theo thứ tự tăng dần.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-[#E60067] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#d0005a]"
        >
          + Thêm ảnh
        </button>
      </div>

      {actionError && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          {actionError}
        </div>
      )}

      {loading && heroes.length === 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video animate-pulse rounded-2xl border border-slate-100 bg-slate-100"
            />
          ))}
        </div>
      ) : heroes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
          <div className="mb-2 text-3xl">🖼️</div>
          <p className="text-sm font-bold text-slate-700">Chưa có ảnh hero nào</p>
          <p className="mt-1 text-xs text-slate-400">Bấm "Thêm ảnh" để bắt đầu.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {heroes.map((hero) => (
            <div
              key={hero._id}
              className={`group relative overflow-hidden rounded-2xl border bg-white shadow-xs transition-all ${
                hero.isActive ? 'border-slate-100' : 'border-slate-200 opacity-60'
              }`}
            >
              <div className="aspect-video w-full overflow-hidden bg-slate-50">
                <img
                  src={hero.imageUrl}
                  alt={hero.alt || 'Hero'}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900">
                      {hero.alt || '(Chưa có alt)'}
                    </p>
                    {hero.link && (
                      <p className="mt-0.5 truncate text-[10px] text-slate-400">
                        🔗 {hero.link}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] text-slate-400">
                      Thứ tự: <span className="font-bold text-slate-600">{hero.order}</span>
                      {' · '}
                      {hero.isActive ? (
                        <span className="font-bold text-emerald-600">Đang hiện</span>
                      ) : (
                        <span className="font-bold text-slate-400">Đã ẩn</span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(hero)}
                      className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(hero)}
                      className="rounded-md bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600 hover:bg-red-100"
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <HeroFormModal
        open={modalOpen}
        initial={editing}
        onClose={closeModal}
        onSubmit={handleSubmit}
        busy={busy}
      />
    </div>
  );
}