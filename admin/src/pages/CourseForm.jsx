import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchCourseAdmin,
  createCourseAdmin,
  updateCourseAdmin,
} from '../services/courseApi.js';
import {
  fetchLessonsByCourseAdmin,
  createLessonAdmin,
  updateLessonAdmin,
  deleteLessonAdmin,
} from '../services/lessonApi.js';
import { fetchCourseContent } from '../services/courseIntakeApi.js';
import LessonContentEditor, {
  createLessonDraft,
  lessonToDraft,
  draftToFormData,
  missingParts,
} from '../components/LessonContentEditor.jsx';
import { CATEGORY_OPTIONS } from '../utils/categories.js';
import { resolveImageUrl } from '../utils/imageUrl.js';
import { extractYoutubeId } from '../utils/youtube.js';
import { ArrowLeftIcon, ImageIcon, PlusIcon } from '../components/icons.jsx';
import { useNotification } from '../store/notificationStore.js';

/**
 * Trang nhập / sửa khóa học — dùng chung cho cả 2 chế độ.
 * - Không có courseId → "Thêm khóa học".
 * - Có courseId       → "Sửa khóa học".
 *
 * Mỗi bài học gồm 2 khối tuỳ chọn:
 *   1. Nội dung 4 phần: slide → mô phỏng → tóm tắt → trắc nghiệm
 *   2. Media bổ sung: video / ảnh / PDF
 */
export default function CourseForm({ onSaved }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(courseId);
  const { notify, toast } = useNotification();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [rating, setRating] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState('');

  // Danh sách bài học nháp (dùng chung cho cả chế độ Thêm và Sửa)
  const [lessons, setLessons] = useState([]);
  const [removedLessonIds, setRemovedLessonIds] = useState([]);

  /** Xoá sạch form sau khi lưu thành công (dùng khi nhúng trong tab khác). */
  function resetForNewCourse() {
    setTitle('');
    setDescription('');
    setCategory(CATEGORY_OPTIONS[0]);
    setRating(0);
    setDurationMinutes(0);
    setIsFeatured(false);
    setIsPublished(true);
    setIsActive(true);
    setThumbnailFile(null);
    setCoverUrl('');
    setVideoUrl('');
    setBannerUrl('');
    setCurrentThumbnailUrl('');
    setLessons([]);
    setRemovedLessonIds([]);
  }

  const videoId = extractYoutubeId(videoUrl);
  const videoInvalid = videoUrl.trim().length > 0 && !videoId;

  // Load khóa học khi sửa
  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const [courseData, contentData] = await Promise.all([
          fetchCourseAdmin(courseId),
          fetchCourseContent(courseId).catch(() => null),
        ]);
        if (cancelled) return;
        setTitle(courseData.title || '');
        setDescription(courseData.description || '');
        setCategory(courseData.category || CATEGORY_OPTIONS[0]);
        setRating(courseData.rating || 0);
        setDurationMinutes(courseData.durationMinutes || 0);
        setIsFeatured(Boolean(courseData.isFeatured));
        setIsPublished(courseData.isPublished ?? true);
        setIsActive(courseData.isActive ?? true);
        setVideoUrl(courseData.videoId ? `https://youtu.be/${courseData.videoId}` : '');
        setBannerUrl(courseData.bannerUrl || '');
        setCoverUrl(courseData.coverUrl || '');
        setCurrentThumbnailUrl(courseData.thumbnail || '');

        // Nạp bài học + nội dung 4 phần vào danh sách nháp
        try {
          const existing = await fetchLessonsByCourseAdmin(courseId);
          if (cancelled) return;
          const contentMap = new Map(
            (contentData?.items || []).map((item) => [
              String(item._id),
              item.content || null,
            ])
          );
          setLessons(
            existing.map((lesson) =>
              lessonToDraft(lesson, contentMap.get(String(lesson._id)))
            )
          );
        } catch {
          if (cancelled) return;
          setLessons([]);
        }
      } catch (err) {
        if (cancelled) return;
        notify({
          type: 'error',
          title: 'Tải khóa học thất bại',
          message: err?.response?.data?.error || 'Không tải được khóa học.',
        });
        navigate('/courses', { replace: true });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  // Preview thumbnail local khi chọn file mới
  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnailFile]);

  const currentThumbnail =
    thumbnailPreview ||
    (currentThumbnailUrl ? resolveImageUrl(currentThumbnailUrl) : '');
  const heroImage = bannerUrl.trim()
    ? resolveImageUrl(bannerUrl.trim())
    : coverUrl.trim()
      ? resolveImageUrl(coverUrl.trim())
      : currentThumbnail;

  function handleAddLesson() {
    setLessons((prev) => [...prev, createLessonDraft()]);
  }

  function handleLessonChange(index, nextDraft) {
    setLessons((prev) =>
      prev.map((item, i) => (i === index ? nextDraft : item))
    );
  }

  function handleRemoveLesson(index) {
    setLessons((prev) => {
      const target = prev[index];
      if (target?.id) {
        setRemovedLessonIds((ids) => [...ids, target.id]);
      }
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleMoveLesson(index, direction) {
    setLessons((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  /** Kiểm tra nhanh trước khi gửi — trả về thông báo lỗi hoặc null. */
  function validateLessons() {
    for (let i = 0; i < lessons.length; i += 1) {
      const l = lessons[i];
      if (!l.title.trim()) {
        return `Bài học #${i + 1} chưa có tiêu đề.`;
      }
      const needsPdf =
        l.contentType === 'video_pdf' || l.contentType === 'image_pdf';
      if (needsPdf && !l.pdfFile && !l.pdfUrl) {
        return `Bài học #${i + 1} cần file PDF (media bổ sung).`;
      }
      if (l.contentType === 'image_pdf' && !l.imageUrl.trim()) {
        return `Bài học #${i + 1} cần URL ảnh (media bổ sung).`;
      }
      // Bài học có media nhưng không có nội dung 4 phần → cần video
      const hasMedia = Boolean(
        l.videoUrl?.trim() || l.imageUrl?.trim() || l.pdfFile || l.pdfUrl
      );
      const missing = missingParts(l);
      if (missing.length === 4 && !hasMedia) {
        return `Bài học #${i + 1} chưa có nội dung nào (thiếu ${missing.join(', ')}).`;
      }
      // Bài học có 4 phần nhưng thiếu câu hỏi → cảnh báo rõ
      if (missing.includes('trắc nghiệm') && missing.length < 4) {
        return `Bài học #${i + 1} thiếu câu hỏi trắc nghiệm (phần 4).`;
      }
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      notify({
        type: 'warning',
        title: 'Thiếu thông tin',
        message: 'Tiêu đề không được trống.',
      });
      return;
    }
    if (!isEdit && !thumbnailFile && !coverUrl.trim()) {
      notify({
        type: 'warning',
        title: 'Thiếu ảnh',
        message: 'Vui lòng chọn ảnh thumbnail hoặc dán URL ảnh bìa.',
      });
      return;
    }
    if (videoInvalid) {
      notify({
        type: 'warning',
        title: 'Link không hợp lệ',
        message: 'Link YouTube không hợp lệ.',
      });
      return;
    }

    const lessonError = validateLessons();
    if (lessonError) {
      notify({
        type: 'warning',
        title: 'Thiếu thông tin',
        message: lessonError,
      });
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('rating', rating);
      formData.append('durationMinutes', durationMinutes);
      formData.append('isFeatured', isFeatured);
      formData.append('isPublished', isPublished);
      formData.append('isActive', isActive);
      formData.append('videoId', videoId || '');
      formData.append('bannerUrl', bannerUrl.trim());
      formData.append('coverUrl', coverUrl.trim());
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

      let savedCourse;
      if (isEdit) {
        savedCourse = await updateCourseAdmin(courseId, formData);
      } else {
        savedCourse = await createCourseAdmin(formData);
      }

      const courseId2 = savedCourse?._id || courseId;

      // Xoá các bài học đã bị gỡ khỏi danh sách
      for (const id of removedLessonIds) {
        try {
          await deleteLessonAdmin(id);
        } catch {
          // bỏ qua lỗi xoá — không chặn luồng chính
        }
      }

      // Tạo / cập nhật bài học theo thứ tự hiển thị
      const failed = [];
      for (let i = 0; i < lessons.length; i += 1) {
        const draft = lessons[i];
        const payload = draftToFormData(draft, i);
        try {
          if (draft.id) {
            await updateLessonAdmin(draft.id, payload);
          } else {
            await createLessonAdmin(courseId2, payload);
          }
        } catch (err) {
          failed.push({
            index: i + 1,
            title: draft.title || `Bài ${i + 1}`,
            error: err?.response?.data?.error || 'Lưu bài học thất bại.',
          });
        }
      }

      if (failed.length > 0) {
        notify({
          type: 'warning',
          title: 'Đã lưu khóa học, nhưng có bài học lỗi',
          message: failed
            .map((f) => `Bài ${f.index} (${f.title}): ${f.error}`)
            .join(' | '),
        });
      } else {
        toast({
          type: 'success',
          title: 'Cập nhật thành công',
          message: isEdit
            ? 'Khóa học và bài học đã được cập nhật.'
            : 'Khóa học đã được thêm.',
        });
        if (onSaved) {
          onSaved();
          if (!isEdit) resetForNewCourse();
        }
      }
      // Nhúng trong trang khác (tab Nhập Bài Học) → không chuyển trang.
      if (!onSaved) navigate('/courses');
    } catch (err) {
      notify({
        type: 'error',
        title: 'Lưu thất bại',
        message: err?.response?.data?.error || 'Lưu thất bại.',
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => navigate('/courses')}
        className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-[#E60067]"
      >
        <ArrowLeftIcon aria-hidden="true" className="h-3 w-3" />
        Quay lại danh sách khóa học
      </button>

      <div>
        <h1 className="text-base font-extrabold text-slate-900">
          {isEdit ? 'Sửa khóa học' : 'Thêm khóa học'}
        </h1>
        <p className="mt-0.5 text-xs text-slate-500">
          {isEdit
            ? 'Cập nhật thông tin khóa học và nội dung 4 phần của từng bài học.'
            : 'Điền thông tin khóa học và nội dung 4 phần cho từng bài học.'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-md border border-slate-200 bg-white p-4"
      >
        {/* ─── Thông tin khóa học ─── */}
        <div className="space-y-3 border-b border-slate-100 pb-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Thông tin khóa học
          </p>
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
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-700">
                Danh mục
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-primary-600 focus:outline-none"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
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
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-700">
                Ảnh bìa (tải file)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files[0])}
                className="w-full text-xs"
              />
              {currentThumbnail ? (
                <img
                  src={currentThumbnail}
                  alt="Current"
                  className="mt-1.5 h-16 w-16 rounded object-cover"
                />
              ) : (
                <div className="mt-1.5 flex h-16 w-16 items-center justify-center rounded bg-slate-100">
                  <ImageIcon aria-hidden="true" className="h-4 w-4 text-slate-400" />
                </div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-700">
                Ảnh bìa (URL)
              </label>
              <input
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-primary-600 focus:outline-none"
                placeholder="https://images.unsplash.com/..."
              />
              <p className="mt-0.5 text-[10px] text-slate-400">
                Dùng khi không muốn upload file. Ảnh bìa sẽ hiển thị trên thẻ khóa học.
              </p>
              {coverUrl.trim() && (
                <img
                  src={resolveImageUrl(coverUrl.trim())}
                  alt="Preview ảnh bìa"
                  className="mt-1.5 h-16 w-16 rounded object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold text-slate-700">
              Video giới thiệu (YouTube)
            </label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className={`w-full rounded-md border px-2.5 py-1.5 text-xs focus:outline-none ${
                videoInvalid
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-slate-300 focus:border-primary-600'
              }`}
              placeholder="https://www.youtube.com/watch?v=... hoặc .../embed/..."
            />
            {videoInvalid ? (
              <p className="mt-0.5 text-[10px] font-bold text-red-600">
                Link YouTube không hợp lệ.
              </p>
            ) : (
              <p className="mt-0.5 text-[10px] text-slate-400">
                Hỗ trợ: youtube.com/watch, youtu.be, /embed/, /shorts/ hoặc 11 ký tự ID.
              </p>
            )}
            {videoId && (
              <div className="mt-1.5 overflow-hidden rounded-md border border-slate-200 bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                  title="Preview video giới thiệu"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="aspect-video w-full"
                />
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold text-slate-700">
              Ảnh nền (URL)
            </label>
            <input
              type="text"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-primary-600 focus:outline-none"
              placeholder="https://images.unsplash.com/..."
            />
            <p className="mt-0.5 text-[10px] text-slate-400">
              Dán URL ảnh nền (Unsplash, ...). Bỏ trống để dùng ảnh bìa làm ảnh nền.
            </p>
            {bannerUrl.trim() && (
              <div className="mt-1.5 flex items-center gap-2">
                <img
                  src={resolveImageUrl(bannerUrl.trim())}
                  alt="Preview ảnh nền"
                  className="h-14 w-24 rounded object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setBannerUrl('')}
                  className="rounded border border-slate-300 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                >
                  Xoá ảnh nền
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── Danh sách bài học ─── */}
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Bài học ({lessons.length})
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">
                Mỗi bài học có thể có nội dung 4 phần (slide → mô phỏng → tóm tắt →
                trắc nghiệm) kèm media bổ sung.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddLesson}
              className="flex shrink-0 items-center gap-1 rounded-md bg-primary-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-primary-700"
            >
              <PlusIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Thêm bài học
            </button>
          </div>

          {lessons.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 px-3 py-4 text-center text-[11px] text-slate-400">
              Chưa có bài học nào. Bấm "Thêm bài học" để bắt đầu.
            </p>
          ) : (
            <div className="space-y-2">
              {lessons.map((draft, i) => (
                <LessonContentEditor
                  key={draft.key}
                  value={draft}
                  index={i + 1}
                  onChange={(next) => handleLessonChange(i, next)}
                  onRemove={() => handleRemoveLesson(i)}
                  onMoveUp={() => handleMoveLesson(i, -1)}
                  onMoveDown={() => handleMoveLesson(i, 1)}
                  disableUp={i === 0}
                  disableDown={i === lessons.length - 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* ─── Xem trước thẻ hero ─── */}
        <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Xem trước thẻ hero
          </p>
          <div className="relative overflow-hidden rounded-lg bg-slate-200">
            {heroImage ? (
              <img
                src={heroImage}
                alt="Hero preview"
                className="h-32 w-full object-cover"
              />
            ) : (
              <div className="flex h-32 w-full items-center justify-center text-[10px] text-slate-400">
                Chưa có ảnh
              </div>
            )}
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-2.5">
              <p className="line-clamp-1 text-[11px] font-extrabold text-white">
                {title.trim() || 'Tiêu đề khóa học'}
              </p>
              <p className="line-clamp-1 text-[9px] text-white/80">
                {description.trim() || 'Mô tả ngắn về khóa học...'}
              </p>
            </div>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">
            {bannerUrl.trim()
              ? 'Đang dùng ảnh nền đã nhập.'
              : currentThumbnail
                ? 'Chưa có ảnh nền — đang dùng ảnh bìa.'
                : 'Chưa có ảnh nào.'}
          </p>
        </div>

        {/* ─── Cờ hiển thị ─── */}
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

        {/* ─── Nút lưu ─── */}
        <div className="flex gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => navigate('/courses')}
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
  );
}
