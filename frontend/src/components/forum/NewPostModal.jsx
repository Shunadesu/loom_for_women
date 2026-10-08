import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { XIcon } from '../icons/index.jsx';

const CATEGORIES = [
  { id: 'income-tips', label: 'Mẹo thu nhập phụ' },
  { id: 'scam-warning', label: 'Cảnh báo lừa đảo' },
  { id: 'learning-tips', label: 'Kinh nghiệm học tập' },
];

const QUILL_MODULES = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
  ],
};

const QUILL_FORMATS = ['bold', 'italic', 'underline', 'list', 'bullet'];

export default function NewPostModal({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề');
      return;
    }
    if (title.length > 200) {
      setError('Tiêu đề không được quá 200 ký tự');
      return;
    }
    if (!content.trim() || content === '<p><br></p>') {
      setError('Vui lòng nhập nội dung');
      return;
    }
    if (!category) {
      setError('Vui lòng chọn danh mục');
      return;
    }

    setSubmitting(true);
    try {
      await onSuccess({ title: title.trim(), content, category });
      
      // Reset form
      setTitle('');
      setContent('');
      setCategory('');
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || 'Đăng bài thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setTitle('');
      setContent('');
      setCategory('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-pink-100 bg-pink-50 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">Đăng bài mới</h2>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-pink-100 hover:text-slate-600 disabled:opacity-50"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề bài viết..."
                maxLength={200}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100 disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
              <div className="mt-1 text-right text-xs text-slate-400">
                {title.length}/200
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100 disabled:bg-slate-50 disabled:cursor-not-allowed"
              >
                <option value="">-- Chọn danh mục --</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nội dung <span className="text-red-500">*</span>
              </label>
              <div className="forum-post-editor">
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={QUILL_MODULES}
                  formats={QUILL_FORMATS}
                  placeholder="Chia sẻ kinh nghiệm, câu chuyện của bạn..."
                  readOnly={submitting}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Bài viết sẽ được BQT duyệt trong vòng 24h
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#E60067] px-6 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#c90059] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang gửi...' : 'Đăng bài'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .forum-post-editor .ql-container {
          min-height: 200px;
          max-height: 300px;
          overflow-y: auto;
          font-family: inherit;
          font-size: 14px;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
        }
        
        .forum-post-editor .ql-toolbar {
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
          background: #f8fafc;
        }
        
        .forum-post-editor .ql-editor {
          min-height: 200px;
        }
        
        .forum-post-editor .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
        }
      `}</style>
    </div>
  );
}
