import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchCourseAdmin,
  createCourseAdmin,
  updateCourseAdmin,
} from '../services/courseApi.js';
import { fetchLessonsByCourseAdmin } from '../services/lessonApi.js';
import { fetchCourseContent } from '../services/courseIntakeApi.js';
import { CATEGORY_OPTIONS } from '../utils/categories.js';
import { resolveImageUrl } from '../utils/imageUrl.js';
import { extractYoutubeId } from '../utils/youtube.js';
import { ArrowLeftIcon, ImageIcon, PlusIcon } from '../components/icons.jsx';
import CourseFormSkeleton from '../components/CourseFormSkeleton.jsx';
import { useNotification } from '../store/notificationStore.js';

/** Badge trạng thái 4 phần nội dung của 1 bài học. */
const PART_BADGES = [
  {
    key: 'slide',
    short: 'Slide',
    label: 'Cung cấp kiến thức',
    check: (c) => (c.slides || []).length > 0,
  },
  {
    key: 'sim',
    short: 'Mô phỏng',
    label: 'Mô phỏng tình huống',
    check: (c) => (c.simulations || []).length > 0,
  },
  {
    key: 'sum',
    short: 'Tóm tắt',
    label: 'Tóm tắt bài học',
    check: (c) => Boolean(c.summary),
  },
  {
    key: 'quiz',
    short: 'Quiz',
    label: 'Đánh giá trắc nghiệm',
    check: (c) => (c.quizzes || []).length > 0,
  },
];

/**
 * Trang nhập / sửa khóa học — dùng chung cho cả 2 chế độ.
 * - Không có courseId → "Thêm khóa học".
 * - Có courseId       → "Sửa khóa học".
 *
 * Bài học KHÔNG nhập tại đây nữa — mỗi bài học nằm ở trang riêng
 * (/courses/:courseId/lessons/new và /courses/:courseId/lessons/:lessonId/edit)
 * với 6 bước: thông tin → slide → mô phỏng → tóm tắt → trắc nghiệm → media.
 */
export default function CourseForm({ onSaved }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(courseId);
  const { notify, toast } = useNotification();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [creatingLesson, setCreatingLesson] = useState(false);

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

  // Danh sách bài học (chỉ để hiển thị tóm tắt + link sửa)
  const [lessons, setLessons] = useState([]);
  const [contentMap, setContentMap] = useState({});

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
    setContentMap({});
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

        // Nạp danh sách bài học + nội dung 4 phần để hiển thị tóm tắt
        try {
          const existing = await fetchLessonsByCourseAdmin(courseId);
          if (cancelled) return;
          setLessons(existing);
          const map = {};
          for (const item of contentData?.items || []) {
            map[String(item._id)] = item.content || {};
          }
          setContentMap(map);
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

  /** Gom dữ liệu form khóa học thành FormData. */
  function buildCourseFormData() {
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
    return formData;
  }

  /**
   * Mở trang nhập bài học.
   * - Khóa học đã tồn tại → sang thẳng trang bài học.
   * - Khóa học mới → tạo khóa học draft trước để có courseId.
   */
  async function handleAddLesson() {
    if (isEdit) {
      navigate(`/courses/${courseId}/lessons/new`);
      return;
    }

    if (!title.trim()) {
      notify({
        type: 'warning',
        title: 'Thiếu thông tin',
        message: 'Vui lòng nhập tiêu đề khóa học trước khi thêm bài học.',
      });
      return;
    }

    setCreatingLesson(true);
    try {
      const created = await createCourseAdmin(buildCourseFormData());
      const newId = created?._id;
      if (!newId) {
        notify({
          type: 'error',
          title: 'Tạo khóa học thất bại',
          message: 'Không tạo được khóa học. Vui lòng thử lại.',
        });
        return;
      }
      if (onSaved) onSaved();
      navigate(`/courses/${newId}/lessons/new`);
    } catch (err) {
      notify({
        type: 'error',
        title: 'Tạo khóa học thất bại',
        message: err?.response?.data?.error || 'Không tạo được khóa học.',
      });
    } finally {
      setCreatingLesson(false);
    }
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

    setSaving(true);
    try {
      const formData = buildCourseFormData();
      if (isEdit) {
        await updateCourseAdmin(courseId, formData);
      } else {
        await createCourseAdmin(formData);
      }

      toast({
        type: 'success',
        title: 'Cập nhật thành công',
        message: isEdit
          ? 'Khóa học đã được cập nhật.'
          : 'Khóa học đã được thêm.',
      });
      if (onSaved) {
        onSaved();
        if (!isEdit) resetForNewCourse();
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
    return <CourseFormSkeleton />;
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
            ? 'Cập nhật thông tin khóa học. Nội dung 4 phần của từng bài học nằm ở trang riêng.'
            : 'Điền thông tin khóa học, sau đó thêm bài học ở trang riêng.'}
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

        {/* ─── Danh sách bài học (tóm tắt) ─── */}
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Bài học ({lessons.length})
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">
                Mỗi bài học được nhập ở trang riêng theo 6 bước: thông tin →
                slide → mô phỏng → tóm tắt → trắc nghiệm → media.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddLesson}
              disabled={creatingLesson}
              className="flex shrink-0 items-center gap-1 rounded-md bg-primary-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              <PlusIcon aria-hidden="true" className="h-3.5 w-3.5" />
              {creatingLesson ? 'Đang tạo...' : 'Thêm bài học'}
            </button>
          </div>

          {lessons.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 px-3 py-4 text-center text-[11px] text-slate-400">
              Chưa có bài học nào. Bấm "Thêm bài học" để bắt đầu.
            </p>
          ) : (
            <div className="overflow-hidden rounded-md border border-slate-200">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="w-10 px-2 py-1.5 text-center text-[10px] font-bold uppercase text-slate-600">
                      STT
                    </th>
                    <th className="px-2 py-1.5 text-left text-[10px] font-bold uppercase text-slate-600">
                      Tiêu đề
                    </th>
                    <th className="px-2 py-1.5 text-center text-[10px] font-bold uppercase text-slate-600">
                      4 phần
                    </th>
                    <th className="w-20 px-2 py-1.5 text-right text-[10px] font-bold uppercase text-slate-600">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lessons.map((lesson, i) => {
                    const content = contentMap[String(lesson._id)] || {};
                    return (
                      <tr key={lesson._id} className="hover:bg-slate-50">
                        <td className="px-2 py-1.5 text-center text-[11px] font-bold text-slate-500">
                          {i + 1}
                        </td>
                        <td className="px-2 py-1.5">
                          <p className="truncate text-[11px] font-bold text-slate-900">
                            {lesson.title || '(Chưa có tiêu đề)'}
                          </p>
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="flex flex-wrap items-center justify-center gap-1">
                            {PART_BADGES.map((p) => {
                              const ok = p.check(content);
                              return (
                                <span
                                  key={p.key}
                                  title={p.label}
                                  className={[
                                    'rounded-full px-1.5 py-0.5 text-[9px] font-bold',
                                    ok
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-slate-100 text-slate-400',
                                  ].join(' ')}
                                >
                                  {ok ? '✓' : '–'} {p.short}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/courses/${courseId}/lessons/${lesson._id}/edit`
                              )
                            }
                            className="rounded border border-pink-200 bg-pink-50 px-2 py-0.5 text-[10px] font-bold text-[#E60067] hover:bg-pink-100"
                          >
                            Sửa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
