import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchAllCoursesAdmin,
  createCourseAdmin,
  updateCourseAdmin,
  deleteCourseAdmin,
  reorderCoursesAdmin,
} from '../services/courseApi.js';
import { fetchAllCategoriesAdmin } from '../services/categoryApi.js';
import { resolveImageUrl } from '../utils/imageUrl.js';
import { PlusIcon, EditIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, ImageIcon, VideoIcon } from '../components/icons.jsx';
import { useNotification } from '../store/notificationStore.js';

export default function CourseManager() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { notify } = useNotification();

  useEffect(() => {
    loadData();
    loadCategories();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchAllCoursesAdmin();
      setItems(data);
    } catch (err) {
      notify({ type: 'error', title: 'Tải dữ liệu thất bại', message: 'Không tải được khóa học.' });
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const data = await fetchAllCategoriesAdmin();
      setCategories(data);
    } catch (err) {
      console.error('Load categories failed:', err);
    }
  }

  function handleNew() {
    setEditingItem(null);
    setModalOpen(true);
  }

  function handleEdit(item) {
    setEditingItem(item);
    setModalOpen(true);
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

  async function handleSave(formData) {
    try {
      if (editingItem) {
        const updated = await updateCourseAdmin(editingItem._id, formData);
        setItems(items.map((c) => (c._id === updated._id ? updated : c)));
      } else {
        const created = await createCourseAdmin(formData);
        setItems([...items, created]);
      }
      setModalOpen(false);
    } catch (err) {
      notify({ type: 'error', title: 'Lưu thất bại', message: err?.response?.data?.error || 'Lưu thất bại.' });
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
      notify({ type: 'error', title: 'Sắp xếp thất bại', message: 'Không sắp xếp được.' });
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
                <th className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-700">
                  Danh mục
                </th>
                <th className="px-2 py-2 text-center text-[11px] font-bold uppercase text-slate-700">
                  Bài học
                </th>
                <th className="px-2 py-2 text-center text-[11px] font-bold uppercase text-slate-700">
                  Rating
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
                  <td className="px-2 py-2 text-[11px] text-slate-600">
                    {item.category?.name || '—'}
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
                        onClick={() => navigate(`/admin/courses/${item._id}/lessons`)}
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

      {modalOpen && (
        <CourseFormModal
          item={editingItem}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function CourseFormModal({ item, categories, onClose, onSave }) {
  const [title, setTitle] = useState(item?.title || '');
  const [description, setDescription] = useState(item?.description || '');
  const [categoryId, setCategoryId] = useState(item?.category?._id || '');
  const [rating, setRating] = useState(item?.rating || 0);
  const [durationMinutes, setDurationMinutes] = useState(item?.durationMinutes || 0);
  const [isFeatured, setIsFeatured] = useState(item?.isFeatured || false);
  const [isPublished, setIsPublished] = useState(item?.isPublished ?? true);
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const { notify } = useNotification();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      notify({ type: 'warning', title: 'Thiếu thông tin', message: 'Tiêu đề không được trống.' });
      return;
    }
    if (!item && !thumbnailFile) {
      notify({ type: 'warning', title: 'Thiếu ảnh', message: 'Vui lòng chọn ảnh thumbnail.' });
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      if (categoryId) formData.append('category', categoryId);
      formData.append('rating', rating);
      formData.append('durationMinutes', durationMinutes);
      formData.append('isFeatured', isFeatured);
      formData.append('isPublished', isPublished);
      formData.append('isActive', isActive);
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-8 w-full max-w-2xl rounded-lg bg-white p-4 shadow-xl">
        <h2 className="mb-3 text-sm font-extrabold text-slate-900">
          {item ? 'Sửa khóa học' : 'Thêm khóa học'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-[11px] font-bold text-slate-700">
              Tiêu đề *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-primary-600 focus:outline-none"
              placeholder="VD: Học cách móc len tại nhà"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold text-slate-700">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-primary-600 focus:outline-none"
              placeholder="Mô tả ngắn về khóa học..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-700">
                Danh mục
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-primary-600 focus:outline-none"
              >
                <option value="">— Chọn danh mục —</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-700">
                Thời lượng (phút)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(+e.target.value || 0)}
                className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-primary-600 focus:outline-none"
                min="0"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold text-slate-700">
              Rating (0-5)
            </label>
            <input
              type="number"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(+e.target.value || 0)}
              className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-primary-600 focus:outline-none"
              min="0"
              max="5"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold text-slate-700">
              Thumbnail *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files[0])}
              className="w-full text-xs"
            />
            {item?.thumbnail && !thumbnailFile && (
              <img
                src={resolveImageUrl(item.thumbnail)}
                alt="Current"
                className="mt-1.5 h-16 w-16 rounded object-cover"
              />
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300"
              />
              <span className="text-xs font-medium text-slate-700">Nổi bật</span>
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300"
              />
              <span className="text-xs font-medium text-slate-700">Publish</span>
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300"
              />
              <span className="text-xs font-medium text-slate-700">Active</span>
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-md bg-primary-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
