import { useEffect, useState } from 'react';
import LessonContentEditor, {
  lessonToDraft,
  draftToFormData,
} from './LessonContentEditor.jsx';
import { fetchCourseContent } from '../services/courseIntakeApi.js';
import { updateLessonAdmin } from '../services/lessonApi.js';
import { useNotification } from '../store/notificationStore.js';

/**
 * Modal sửa nội dung 4 phần của 1 bài học — dùng chung với form nhập khóa học.
 *
 * Props:
 * - courseId : khóa học chứa bài học
 * - lessonId : bài học cần sửa
 * - onClose  : callback đóng modal
 * - onSaved  : callback sau khi lưu thành công
 */
export default function LessonFourPartModal({ courseId, lessonId, onClose, onSaved }) {
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { notify } = useNotification();

  useEffect(() => {
    if (!courseId || !lessonId) return undefined;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchCourseContent(courseId);
        if (cancelled) return;
        const item = (data.items || []).find(
          (it) => String(it._id) === String(lessonId)
        );
        if (!item) {
          notify({
            type: 'error',
            title: 'Không tìm thấy',
            message: 'Không tìm thấy bài học cần sửa.',
          });
          onClose?.();
          return;
        }
        setDraft(lessonToDraft(item, item.content || null));
      } catch (err) {
        if (cancelled) return;
        notify({
          type: 'error',
          title: 'Tải dữ liệu thất bại',
          message: err?.response?.data?.error || 'Không tải được nội dung bài học.',
        });
        onClose?.();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId, notify, onClose]);

  async function handleSave() {
    if (!draft) return;
    setSaving(true);
    try {
      await updateLessonAdmin(lessonId, draftToFormData(draft));
      notify({
        type: 'success',
        title: 'Cập nhật thành công',
        message: 'Nội dung 4 phần của bài học đã được cập nhật.',
      });
      if (onSaved) onSaved();
    } catch (err) {
      notify({
        type: 'error',
        title: 'Lưu thất bại',
        message: err?.response?.data?.error || 'Lưu bài học thất bại.',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4">
      <div className="mx-auto my-4 w-full max-w-3xl">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-extrabold text-white">
            Sửa nội dung 4 phần của bài học
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white hover:bg-white/30"
          >
            Đóng
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
            Đang tải nội dung bài học...
          </div>
        ) : draft ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <LessonContentEditor value={draft} index={1} onChange={setDraft} />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-md bg-primary-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : 'Lưu nội dung 4 phần'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
