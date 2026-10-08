import { useEffect, useState } from 'react';
import {
  listDocumentsByLessonAdmin,
  createDocumentAdmin,
  updateDocumentAdmin,
  deleteDocumentAdmin,
} from '../services/documentApi.js';
import {
  PlusIcon,
  TrashIcon,
  EditIcon,
  XIcon,
  FileTextIcon,
  ImageIcon,
} from './icons.jsx';

const FILE_TYPES = [
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'EXCEL' },
  { value: 'infographic', label: 'INFOGRAPHIC' },
  { value: 'guide', label: 'HƯỚNG DẪN' },
];

const TYPE_STYLE = {
  pdf: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: 'text-rose-600' },
  excel: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'text-emerald-600' },
  infographic: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: 'text-purple-600' },
  guide: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-600' },
};

function formatSize(bytes) {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

/**
 * Modal quản lý tài liệu cho 1 bài học.
 * props.lesson: object lesson có _id, title, youtubeId, ...
 */
export default function DocumentManagerModal({ lesson, onClose }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    fileType: 'pdf',
    pageCount: 0,
    isPublished: true,
    file: null,
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!lesson?._id) return;
    load();
  }, [lesson?._id]);

  async function load() {
    setLoading(true);
    try {
      const items = await listDocumentsByLessonAdmin(lesson._id);
      setDocs(items);
    } catch (err) {
      alert('Không tải được danh sách tài liệu.');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      title: '',
      description: '',
      fileType: 'pdf',
      pageCount: 0,
      isPublished: true,
      file: null,
    });
    setEditingId(null);
  }

  function startEdit(doc) {
    setEditingId(doc._id);
    setForm({
      title: doc.title,
      description: doc.description || '',
      fileType: doc.fileType,
      pageCount: doc.pageCount || 0,
      isPublished: doc.isPublished,
      file: null, // không đổi file khi edit
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return alert('Tiêu đề không được trống.');
    if (!editingId && !form.file) return alert('Vui lòng chọn file.');

    setUploading(true);
    try {
      if (editingId) {
        await updateDocumentAdmin(editingId, {
          title: form.title,
          description: form.description,
          fileType: form.fileType,
          pageCount: Number(form.pageCount) || 0,
          isPublished: form.isPublished,
        });
      } else {
        const fd = new FormData();
        fd.append('file', form.file);
        fd.append('title', form.title);
        fd.append('description', form.description);
        fd.append('fileType', form.fileType);
        fd.append('pageCount', String(form.pageCount || 0));
        fd.append('isPublished', String(form.isPublished));
        await createDocumentAdmin(lesson._id, fd);
      }
      resetForm();
      await load();
    } catch (err) {
      alert(err?.response?.data?.error || 'Lưu thất bại.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(doc) {
    if (!confirm(`Xoá tài liệu "${doc.title}"? File vật lý cũng sẽ bị xoá.`)) return;
    try {
      await deleteDocumentAdmin(doc._id);
      setDocs((prev) => prev.filter((d) => d._id !== doc._id));
    } catch (err) {
      alert(err?.response?.data?.error || 'Xoá thất bại.');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Quản lý tài liệu
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Bài học:{' '}
              <span className="font-bold text-slate-700">{lesson?.title}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-slate-100"
            aria-label="Đóng"
          >
            <XIcon aria-hidden="true" className="h-4 w-4 text-slate-600" />
          </button>
        </div>

        {/* Form upload */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 mb-4"
        >
          <p className="text-xs font-bold text-slate-700">
            {editingId ? 'Cập nhật tài liệu' : 'Upload tài liệu mới'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Tiêu đề tài liệu *"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:outline-none"
            />
            <select
              value={form.fileType}
              onChange={(e) => setForm({ ...form, fileType: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:outline-none"
            >
              {FILE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Mô tả ngắn (tuỳ chọn)"
            rows={2}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:outline-none"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="number"
              value={form.pageCount}
              onChange={(e) =>
                setForm({ ...form, pageCount: e.target.value })
              }
              min="0"
              placeholder="Số trang (tuỳ chọn)"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:outline-none"
            />
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) =>
                  setForm({ ...form, isPublished: e.target.checked })
                }
                className="h-4 w-4"
              />
              Hiển thị cho học viên
            </label>
          </div>
          {!editingId && (
            <input
              type="file"
              onChange={(e) =>
                setForm({ ...form, file: e.target.files?.[0] || null })
              }
              accept=".pdf,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
              className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-600 file:text-white file:font-bold file:text-xs hover:file:bg-primary-700"
            />
          )}
          <div className="flex gap-2">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Huỷ sửa
              </button>
            )}
            <button
              type="submit"
              disabled={uploading}
              className="ml-auto rounded-lg bg-primary-600 px-4 py-2 text-xs font-bold text-white hover:bg-primary-700 disabled:opacity-50 flex items-center gap-1"
            >
              <PlusIcon aria-hidden="true" className="h-3 w-3" />
              {uploading
                ? 'Đang lưu...'
                : editingId
                ? 'Lưu thay đổi'
                : 'Upload'}
            </button>
          </div>
        </form>

        {/* List */}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
            Đang tải...
          </div>
        ) : docs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <FileTextIcon
              aria-hidden="true"
              className="mx-auto mb-2 h-8 w-8 text-slate-300"
            />
            <p className="text-sm font-bold text-slate-700">
              Chưa có tài liệu nào
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Upload file đầu lên ở form phía trên.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {docs.map((doc) => {
              const s = TYPE_STYLE[doc.fileType] || TYPE_STYLE.guide;
              return (
                <li
                  key={doc._id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${s.bg} ${s.text} ${s.border}`}
                  >
                    {doc.fileType === 'infographic' ? (
                      <ImageIcon
                        aria-hidden="true"
                        className={`w-4 h-4 ${s.icon}`}
                      />
                    ) : (
                      <FileTextIcon
                        aria-hidden="true"
                        className={`w-4 h-4 ${s.icon}`}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {doc.title}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded border ${s.bg} ${s.text} ${s.border} font-bold mr-1`}
                      >
                        {doc.fileType.toUpperCase()}
                      </span>
                      {doc.fileSize ? formatSize(doc.fileSize) : ''}
                      {doc.pageCount ? ` • ${doc.pageCount} trang` : ''}
                      {' • '}
                      {doc.isPublished ? 'Hiển thị' : 'Đã ẩn'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startEdit(doc)}
                    className="rounded p-1.5 hover:bg-blue-50"
                    title="Sửa metadata"
                  >
                    <EditIcon
                      aria-hidden="true"
                      className="h-4 w-4 text-blue-600"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc)}
                    className="rounded p-1.5 hover:bg-red-50"
                    title="Xoá"
                  >
                    <TrashIcon
                      aria-hidden="true"
                      className="h-4 w-4 text-red-600"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}