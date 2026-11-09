import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchAllCoursesAdmin,
  deleteCourseAdmin,
  reorderCoursesAdmin,
} from '../services/courseApi.js';
import { resolveImageUrl } from '../utils/imageUrl.js';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ImageIcon,
  VideoIcon,
} from '../components/icons.jsx';
import { useNotification } from '../store/notificationStore.js';

export default function CourseManager() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotification();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchAllCoursesAdmin();
      setItems(data);
    } catch (err) {
      notify({
        type: 'error',
        title: 'Tải dữ liệu thất bại',
        message: 'Không tải được khóa học.',
      });
    } finally {
      setLoading(false);
    }
  }

  function handleNew() {
    navigate('/courses/new');
  }

  function handleEdit(item) {
    navigate(`/courses/${item._id}/edit`);
  }

  async function handleDelete(item) {
    if (!confirm(`Xoá "${item.title}"?`)) return;
    try {
      await deleteCourseAdmin(item._id);
      setItems(items.filter((c) => c._id !== item._id));
    } catch (err) {
      const msg = err?.response?.data?.error || 'Xoá thất bại.';
      notify({ type: 'error', title: 'Xoá thất bại', message: msg });
    }
  }

  async function handleMoveUp(index) {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setItems(newItems);
    await saveOrder(newItems);
  }

  async function handleMoveDown(index) {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setItems(newItems);
    await saveOrder(newItems);
  }

  async function saveOrder(newItems) {
    try {
      const payload = newItems.map((c, i) => ({ id: c._id, order: i }));
      await reorderCoursesAdmin(payload);
    } catch (err) {
      notify({
        type: 'error',
        title: 'Sắp xếp thất bại',
        message: 'Không sắp xếp được.',
      });
      loadData();
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-extrabold text-slate-900">Quản lý Khóa học</h1>
        <button
          type="button"
          onClick={handleNew}
          className="flex items-center gap-1 rounded-md bg-primary-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-primary-700"
        >
          <PlusIcon aria-hidden="true" className="h-3.5 w-3.5" />
          Thêm mới
        </button>
      </div>

      {loading ? (
        <div className="rounded-md border border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
          Đang tải...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-md border border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
          Chưa có khóa học nào.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-700">
                  Ảnh
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-700">
                  Tiêu đề
                </th>
                <th className="px-2 py-2 text-center text-[11px] font-bold uppercase text-slate-700">
                  Bài học
                </th>
                <th className="px-2 py-2 text-center text-[11px] font-bold uppercase text-slate-700">
                  Rating
                </th>
                <th className="px-2 py-2 text-center text-[11px] font-bold uppercase text-slate-700">
                  Video
                </th>
                <th className="px-2 py-2 text-center text-[11px] font-bold uppercase text-slate-700">
                  Hiển thị
                </th>
                <th className="px-2 py-2 text-right text-[11px] font-bold uppercase text-slate-700">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, i) => (
                <tr key={item._id} className="hover:bg-slate-50">
                  <td className="px-2 py-2">
                    {item.thumbnail ? (
                      <img
                        src={resolveImageUrl(item.thumbnail)}
                        alt={item.title}
                        className="h-8 w-8 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100">
                        <ImageIcon aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <p className="text-xs font-bold text-slate-900">{item.title}</p>
                    <p className="text-[11px] text-slate-500">{item.slug}</p>
                  </td>
                  <td className="px-2 py-2 text-center text-xs font-bold text-slate-900">
                    {item.lessonsCount || 0}
                  </td>
                  <td className="px-2 py-2 text-center text-xs font-bold text-amber-600">
                    {item.rating > 0 ? item.rating.toFixed(1) : '—'}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <span
                      className={[
                        'inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                        item.videoId
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-400',
                      ].join(' ')}
                    >
                      {item.videoId ? 'Có' : '—'}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <span
                      className={[
                        'inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                        item.isPublished && item.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500',
                      ].join(' ')}
                    >
                      {item.isPublished && item.isActive ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/courses/${item._id}/lessons`)}
                        className="rounded p-1 hover:bg-sky-50"
                        title="Quản lý bài học"
                      >
                        <VideoIcon aria-hidden="true" className="h-3.5 w-3.5 text-sky-600" />
                      </button>
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
                        disabled={i === items.length - 1}
                        className="rounded p-1 hover:bg-slate-100 disabled:opacity-30"
                        title="Xuống"
                      >
                        <ArrowDownIcon aria-hidden="true" className="h-3.5 w-3.5 text-slate-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="rounded p-1 hover:bg-blue-50"
                        title="Sửa"
                      >
                        <EditIcon aria-hidden="true" className="h-3.5 w-3.5 text-blue-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
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
    </div>
  );
}
