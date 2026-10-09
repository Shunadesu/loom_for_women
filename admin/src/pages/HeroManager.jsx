import { useEffect, useState } from 'react';
import { useHeroStore } from '../store/heroStore.js';
import HeroManagerModal from '../components/HeroManagerModal.jsx';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '../components/icons.jsx';

export default function HeroManager() {
  const heroes = useHeroStore((s) => s.heroes);
  const loading = useHeroStore((s) => s.loading);
  const error = useHeroStore((s) => s.error);
  const fetchAll = useHeroStore((s) => s.fetchAll);
  const createHero = useHeroStore((s) => s.create);
  const updateHero = useHeroStore((s) => s.update);
  const removeHero = useHeroStore((s) => s.remove);
  const reorderHeroes = useHeroStore((s) => s.reorder);

  const [modal, setModal] = useState(null); // null | { type: 'add' | 'edit', hero?: Hero }

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function handleSave(formData) {
    if (modal?.type === 'edit' && modal.hero) {
      await updateHero(modal.hero._id, formData);
    } else {
      await createHero(formData);
    }
  }

  async function handleDelete(hero) {
    if (!confirm(`Xoá ảnh "${hero.alt || 'không tên'}"?`)) return;
    await removeHero(hero._id);
  }

  async function handleMoveUp(index) {
    if (index === 0) return;
    const newItems = [...heroes];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    await saveOrder(newItems);
  }

  async function handleMoveDown(index) {
    if (index === heroes.length - 1) return;
    const newItems = [...heroes];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    await saveOrder(newItems);
  }

  async function saveOrder(newItems) {
    const payload = newItems.map((h, i) => ({ id: h._id, order: i }));
    try {
      await reorderHeroes(payload);
    } catch (err) {
      alert('Không sắp xếp được.');
      fetchAll();
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-extrabold text-slate-900">Hero Banner</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Ảnh sẽ hiển thị trên trang chủ — sắp xếp theo thứ tự tăng dần.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ type: 'add' })}
          className="flex items-center gap-1 rounded-md bg-[#E60067] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-[#d0005a]"
        >
          <PlusIcon aria-hidden="true" className="h-3.5 w-3.5" />
          Thêm ảnh
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-100 bg-red-50 px-2.5 py-1.5 text-xs text-red-700">
          {error}
        </div>
      )}

      {loading && heroes.length === 0 ? (
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="px-2 py-4 text-center text-xs text-slate-500">Đang tải...</div>
        </div>
      ) : heroes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-8 text-center">
          <div className="mb-2 text-2xl">🖼️</div>
          <p className="text-xs font-bold text-slate-700">Chưa có ảnh hero nào</p>
          <p className="mt-1 text-[11px] text-slate-400">Bấm "Thêm ảnh" để bắt đầu.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="w-24 px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-700">
                  Ảnh
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-700">
                  Alt
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-700">
                  Link
                </th>
                <th className="w-16 px-2 py-2 text-center text-[11px] font-bold uppercase text-slate-700">
                  Thứ tự
                </th>
                <th className="w-24 px-2 py-2 text-center text-[11px] font-bold uppercase text-slate-700">
                  Trạng thái
                </th>
                <th className="w-36 px-2 py-2 text-right text-[11px] font-bold uppercase text-slate-700">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {heroes.map((hero, i) => (
                <tr
                  key={hero._id}
                  className={`hover:bg-slate-50 ${hero.isActive ? '' : 'opacity-60'}`}
                >
                  <td className="px-2 py-2">
                    <div className="h-12 w-20 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                      <img
                        src={hero.imageUrl}
                        alt={hero.alt || 'Hero'}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <span className="text-xs font-bold text-slate-900">
                      {hero.alt || '(Chưa có alt)'}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    {hero.link ? (
                      <a
                        href={hero.link}
                        target="_blank"
                        rel="noreferrer"
                        className="block max-w-[220px] truncate text-[11px] text-primary-600 hover:underline"
                        title={hero.link}
                      >
                        🔗 {hero.link}
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-center text-xs font-bold text-slate-700">
                    {hero.order}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <span
                      className={[
                        'inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                        hero.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500',
                      ].join(' ')}
                    >
                      {hero.isActive ? 'Đang hiện' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(i)}
                        disabled={i === 0}
                        className="rounded p-1 hover:bg-slate-100 disabled:opacity-30"
                        title="Lên"
                      >
                        <ArrowUpIcon aria-hidden="true" className="h-3.5 w-3.5 text-slate-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(i)}
                        disabled={i === heroes.length - 1}
                        className="rounded p-1 hover:bg-slate-100 disabled:opacity-30"
                        title="Xuống"
                      >
                        <ArrowDownIcon
                          aria-hidden="true"
                          className="h-3.5 w-3.5 text-slate-600"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => setModal({ type: 'edit', hero })}
                        className="rounded p-1 hover:bg-blue-50"
                        title="Sửa"
                      >
                        <EditIcon aria-hidden="true" className="h-3.5 w-3.5 text-blue-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(hero)}
                        className="rounded p-1 hover:bg-red-50"
                        title="Xoá"
                      >
                        <TrashIcon aria-hidden="true" className="h-3.5 w-3.5 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <HeroManagerModal
          hero={modal.type === 'edit' ? modal.hero : null}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
