import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchCourseAdmin,
  createCourseAdmin,
  updateCourseAdmin,
} from '../services/courseApi.js';
import { resolveImageUrl } from '../utils/imageUrl.js';
import { extractYoutubeId } from '../utils/youtube.js';
import { ArrowLeftIcon, ImageIcon } from '../components/icons.jsx';
import { useNotification } from '../store/notificationStore.js';

/**
 * Trang nhập / sửa khóa học.
 * - Không có courseId → chế độ "Thêm khóa học".
 * - Có courseId       → chế độ "Sửa khóa học".
 */
export default function CourseForm() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(courseId);
  const { notify, toast } = useNotification();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState('');

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
        const data = await fetchCourseAdmin(courseId);
        if (cancelled) return;
        setTitle(data.title || '');
        setDescription(data.description || '');
        setRating(data.rating || 0);
        setDurationMinutes(data.durationMinutes || 0);
        setIsFeatured(Boolean(data.isFeatured));
        setIsPublished(data.isPublished ?? true);
        setIsActive(data.isActive ?? true);
        setVideoUrl(data.videoId ? `https://youtu.be/${data.videoId}` : '');
        setBannerUrl(data.bannerUrl || '');
        setCurrentThumbnailUrl(data.thumbnail || '');
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
    : currentThumbnail;

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
    if (!isEdit && !thumbnailFile) {
      notify({
        type: 'warning',
        title: 'Thiếu ảnh',
        message: 'Vui lòng chọn ảnh thumbnail.',
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
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('rating', rating);
      formData.append('durationMinutes', durationMinutes);
      formData.append('isFeatured', isFeatured);
      formData.append('isPublished', isPublished);
      formData.append('isActive', isActive);
      formData.append('videoId', videoId || '');
      formData.append('bannerUrl', bannerUrl.trim());
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

      if (isEdit) {
        await updateCourseAdmin(courseId, formData);
        toast({
          type: 'success',
          title: 'Cập nhật thành công',
          message: 'Khóa học đã được cập nhật.',
        });
      } else {
        await createCourseAdmin(formData);
        toast({
          type: 'success',
          title: 'Tạo thành công',
          message: 'Khóa học đã được thêm.',
        });
      }
      navigate('/courses');
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
            ? 'Cập nhật thông tin khóa học hiện có.'
            : 'Điền thông tin để tạo khóa học mới.'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-md border border-slate-200 bg-white p-4"
      >
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
        <div className="grid gap-3 sm:grid-cols-2">
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
        <div>
          <label className="mb-1 block text-[11px] font-bold text-slate-700">
            Thumbnail {isEdit ? '' : '*'}
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
          <p className="mt-0.5 text-[10px] text-slate-400">
            {isEdit
              ? 'Để trống nếu không muốn thay đổi ảnh hiện tại.'
              : 'Bắt buộc chọn ảnh thumbnail khi tạo khóa học mới.'}
          </p>
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
            Dán URL ảnh nền (Unsplash, ...). Bỏ trống để dùng thumbnail làm ảnh nền.
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
                ? 'Chưa có ảnh nền — đang dùng thumbnail.'
                : 'Chưa có ảnh nào.'}
          </p>
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
