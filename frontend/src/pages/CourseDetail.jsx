import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header.jsx';
import LessonPlayerModal from '../components/course/LessonPlayerModal.jsx';
import {
  PlayIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  HeartIcon,
  HeartFillIcon,
  BookIcon,
  ArrowLeftIcon,
} from '../components/icons/index.jsx';
import { useCourseStore } from '../store/courseStore.js';
import { useProgressStore } from '../store/progressStore.js';
import { useCommentStore } from '../store/commentStore.js';
import { useFavoriteStore } from '../store/favoriteStore.js';
import { useAuthStore } from '../store/authStore.js';
import { useLoginDrawerStore } from '../store/loginDrawerStore.js';
import { useNotification } from '../store/notificationStore.js';
import { addFavorite, removeFavorite } from '../services/favoriteApi.js';
import { resolveImageUrl } from '../utils/imageUrl.js';
import { buildVideoEmbedUrl } from '../utils/videoSource.js';

export default function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = Boolean(token || user?._id);
  const { openLoginDrawer } = useLoginDrawerStore();
  const { notify } = useNotification();

  const detailCache = useCourseStore((s) => s.detailCache);
  const detailLoading = useCourseStore((s) => s.detailLoading);
  const detailError = useCourseStore((s) => s.detailError);
  const fetchDetail = useCourseStore((s) => s.fetchDetail);

  const progressStore = useProgressStore((s) => s.byCourse);
  const completeLesson = useProgressStore((s) => s.complete);
  const applyQuizResult = useProgressStore((s) => s.applyQuizResult);
  const fetchContinue = useProgressStore((s) => s.fetchContinue);
  const fetchStats = useProgressStore((s) => s.fetchStats);
  const isFavorite = useProgressStore((s) => s.isFavorite);
  const toggleFavoriteLocal = useProgressStore((s) => s.toggleFavoriteLocal);

  const comments = useCommentStore((s) => s.byCourse);
  const fetchComments = useCommentStore((s) => s.fetch);
  const postComment = useCommentStore((s) => s.post);
  const posting = useCommentStore((s) => s.posting);

  const data = detailCache[slug];
  const course = data?.course;
  // API trả lessons nằm trong course.lessons — hỗ trợ cả 2 shape cho an toàn.
  const lessons = data?.course?.lessons || data?.lessons || [];
  const myProgress = data?.myProgress;

  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);

  useEffect(() => {
    if (!slug) return;
    fetchDetail(slug).catch(() => {});
  }, [slug, fetchDetail]);

  // Bình luận luôn dùng course._id làm khoá (store đọc theo comments[course._id]).
  // Chờ có course rồi mới tải, tránh gọi 2 lần với 2 kiểu tham số.
  useEffect(() => {
    if (!course?._id) return;
    fetchComments(course._id).catch(() => {});
  }, [course?._id, fetchComments]);

  useEffect(() => {
    if (lessons.length === 0) return;
    // Ưu tiên lesson từ query (?lesson=xxx) — dùng cho deep-link
    const queryLesson = searchParams.get('lesson');
    const fromQuery = queryLesson && lessons.find((l) => String(l._id) === String(queryLesson));
    if (fromQuery) {
      setCurrentLessonId(fromQuery._id);
      return;
    }
    if (currentLessonId) return;
    const lastId = myProgress?.lastLessonId;
    const found = lessons.find((l) => String(l._id) === String(lastId));
    setCurrentLessonId(found ? found._id : lessons[0]._id);
  }, [lessons, currentLessonId, myProgress, searchParams]);

  const currentLesson = lessons.find((l) => String(l._id) === String(currentLessonId));
  const completedSet = new Set(
    (progressStore[course?._id]?.completedLessons || myProgress?.completedLessons || []).map(
      String
    )
  );

  /** Bài học có dữ liệu 4 phần (slide / mô phỏng / tóm tắt / quiz) hay không. */
  const hasStructuredContent = (l) =>
    Boolean(
      l &&
        ((l.slides?.length || 0) > 0 ||
          (l.simulations?.length || 0) > 0 ||
          (l.quizzes?.length || 0) > 0 ||
          l.summary)
    );

  function handleSelectLesson(lesson) {
    setCurrentLessonId(lesson._id);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('lesson', String(lesson._id));
        return next;
      },
      { replace: true }
    );
    // Bài học có nội dung 4 phần → mở thẳng trình phát
    if (hasStructuredContent(lesson)) setPlayerOpen(true);
  }

  function handleQuizPassed(result) {
    applyQuizResult(course?._id, currentLesson?._id, result);
    fetchContinue().catch(() => {});
    fetchStats().catch(() => {});
    notify({
      type: 'success',
      title: 'Chúc mừng!',
      message: 'Bạn đã trả lời đúng. Bài học được đánh dấu hoàn thành.',
    });
  }

  async function handleComplete(lessonId) {
    if (!isAuthenticated) {
      openLoginDrawer();
      return;
    }
    try {
      await completeLesson(lessonId, course._id);
      // Refresh continue + stats cho header
      fetchContinue().catch(() => {});
      fetchStats().catch(() => {});
    } catch (err) {
      notify({ type: 'error', title: 'Lưu tiến độ thất bại', message: err?.response?.data?.error || 'Không lưu được tiến độ.' });
    }
  }

  async function handleToggleFavorite() {
    if (!isAuthenticated) {
      openLoginDrawer();
      return;
    }
    try {
      const fav = isFavorite(course._id);
      if (fav) await removeFavorite(course._id);
      else await addFavorite(course._id);
      toggleFavoriteLocal(course._id);
    } catch (err) {
      notify({ type: 'error', title: 'Không thể cập nhật yêu thích', message: err?.response?.data?.error || 'Không thực hiện được.' });
    }
  }

  async function handlePostComment() {
    if (!isAuthenticated) {
      openLoginDrawer();
      return;
    }
    if (!commentText.trim()) {
      notify({ type: 'warning', title: 'Thiếu nội dung', message: 'Nội dung bình luận không được trống.' });
      return;
    }
    try {
      await postComment({
        courseId: course._id,
        content: commentText.trim(),
        rating: commentRating,
      });
      setCommentText('');
      setCommentRating(5);
    } catch (err) {
      notify({ type: 'error', title: 'Đăng bình luận thất bại', message: err?.response?.data?.error || 'Đăng bình luận thất bại.' });
    }
  }

  if (detailLoading && !course) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary-50 via-white to-primary-50">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-6 sm:px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded-lg bg-slate-200" />
            <div className="aspect-video w-full rounded-2xl bg-slate-200" />
            <div className="h-6 w-3/4 rounded-lg bg-slate-200" />
          </div>
        </main>
      </div>
    );
  }

  if (detailError || !course) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary-50 via-white to-primary-50">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-6 sm:px-6">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 py-10 text-center">
            <BookIcon aria-hidden="true" className="mb-2 h-10 w-10 text-red-300" />
            <p className="text-sm font-bold text-red-700">
              {detailError || 'Không tìm thấy khóa học.'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/khoa-hoc')}
              className="mt-3 rounded-full bg-red-100 px-4 py-1.5 text-xs font-bold text-red-700 hover:bg-red-200"
            >
              Quay lại danh sách
            </button>
          </div>
        </main>
      </div>
    );
  }

  const progressPct = myProgress?.progressPct || 0;
  const courseComments = comments[course._id] || [];
  const heroImage = course.bannerUrl
    ? resolveImageUrl(course.bannerUrl)
    : course.thumbnail
      ? resolveImageUrl(course.thumbnail)
      : '';
  const hasHeroImage = Boolean(heroImage);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen flex-col bg-gradient-to-b from-primary-50 via-white to-primary-50"
    >
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-6 pb-20 sm:px-6 md:pb-6">
        <button
          type="button"
          onClick={() => navigate('/khoa-hoc')}
          className="mb-3 flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#E60067]"
        >
          <ArrowLeftIcon aria-hidden="true" className="h-3 w-3" />
          Quay lại
        </button>

        <div className="space-y-4">
          {/* Hero */}
          <div
            className={[
              'relative overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm',
              hasHeroImage
                ? 'bg-slate-900'
                : 'bg-white p-4 sm:p-6',
            ].join(' ')}
          >
            {hasHeroImage && (
              <>
                <img
                  src={heroImage}
                  alt={course.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/25" />
              </>
            )}
            <div className={hasHeroImage ? 'relative p-4 sm:p-6' : ''}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    {course.isFeatured && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        NỔI BẬT
                      </span>
                    )}
                    {course.videoId && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                        CÓ VIDEO
                      </span>
                    )}
                  </div>
                  <h1
                    className={[
                      'text-xl font-extrabold sm:text-2xl',
                      hasHeroImage ? 'text-white' : 'text-slate-900',
                    ].join(' ')}
                  >
                    {course.title}
                  </h1>
                  {course.description && (
                    <p
                      className={[
                        'mt-2 text-xs sm:text-sm',
                        hasHeroImage ? 'text-white/85' : 'text-slate-600',
                      ].join(' ')}
                    >
                      {course.description}
                    </p>
                  )}
                  <div
                    className={[
                      'mt-3 flex flex-wrap items-center gap-3 text-[11px] font-medium',
                      hasHeroImage ? 'text-white/75' : 'text-slate-500',
                    ].join(' ')}
                  >
                    {course.rating > 0 && (
                      <div className="flex items-center gap-1 font-bold text-amber-500">
                        <StarIcon
                          aria-hidden="true"
                          className="h-3 w-3 fill-amber-400 stroke-amber-400"
                        />
                        <span>{Number(course.rating).toFixed(1)}</span>
                      </div>
                    )}
                    {course.durationMinutes > 0 && (
                      <>
                        <span
                          className={hasHeroImage ? 'text-white/40' : 'text-slate-300'}
                        >
                          |
                        </span>
                        <div className="flex items-center gap-1">
                          <ClockIcon
                            aria-hidden="true"
                            className={
                              hasHeroImage
                                ? 'h-3 w-3 text-white/60'
                                : 'h-3 w-3 text-slate-400'
                            }
                          />
                          <span>{formatDuration(course.durationMinutes)}</span>
                        </div>
                      </>
                    )}
                    {lessons.length > 0 && (
                      <>
                        <span
                          className={hasHeroImage ? 'text-white/40' : 'text-slate-300'}
                        >
                          |
                        </span>
                        <span>{lessons.length} bài học</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className={[
                    'shrink-0 rounded-full p-2 transition-colors',
                    hasHeroImage
                      ? 'bg-black/30 text-white hover:bg-black/50'
                      : 'hover:bg-pink-50',
                  ].join(' ')}
                >
                  {isFavorite(course._id) ? (
                    <HeartFillIcon
                      aria-hidden="true"
                      className="h-6 w-6 text-[#E60067]"
                    />
                  ) : (
                    <HeartIcon
                      aria-hidden="true"
                      className={[
                        'h-6 w-6',
                        hasHeroImage ? 'text-white' : 'text-slate-400',
                      ].join(' ')}
                    />
                  )}
                </button>
              </div>

              {progressPct > 0 && (
                <div
                  className={[
                    'mt-4 rounded-xl p-3',
                    hasHeroImage ? 'bg-black/35' : 'bg-slate-50',
                  ].join(' ')}
                >
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span
                      className={[
                        'font-bold',
                        hasHeroImage ? 'text-white' : 'text-slate-700',
                      ].join(' ')}
                    >
                      Tiến độ của bạn
                    </span>
                    <span className="font-extrabold text-teal-600">
                      {progressPct}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-teal-500 transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Player + Lessons */}
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {/* Video giới thiệu khóa học */}
              {course.videoId && (
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                  <div className="aspect-video w-full bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${course.videoId}?rel=0`}
                      title={`Video giới thiệu ${course.title}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="text-base font-bold text-slate-900">
                      Video giới thiệu khóa học
                    </h2>
                  </div>
                </div>
              )}

              {/* Nội dung bài học — render theo contentType */}
              {currentLesson && (
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                  {currentLesson.contentType === 'image_pdf' ? (
                    <div className="space-y-3 bg-slate-50 p-3">
                      {currentLesson.imageUrl ? (
                        <img
                          src={currentLesson.imageUrl}
                          alt={currentLesson.title}
                          className="mx-auto max-h-[70vh] w-auto rounded-lg object-contain"
                        />
                      ) : (
                        <p className="py-6 text-center text-xs text-slate-400">
                          Bài học chưa có ảnh.
                        </p>
                      )}
                      {currentLesson.pdfUrl && (
                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                          <iframe
                            src={resolveImageUrl(currentLesson.pdfUrl)}
                            title={`Tài liệu ${currentLesson.title}`}
                            className="h-[70vh] w-full"
                          />
                        </div>
                      )}
                    </div>
                  ) : currentLesson.contentType === 'video_pdf' ? (
                    <div>
                      <div className="aspect-video w-full bg-black">
                        <iframe
                          src={buildVideoEmbedUrl(currentLesson)}
                          title={currentLesson.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="h-full w-full"
                        />
                      </div>
                      {currentLesson.pdfUrl && (
                        <div className="border-t border-slate-100 p-3">
                          <a
                            href={resolveImageUrl(currentLesson.pdfUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#E60067] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
                          >
                            <BookIcon aria-hidden="true" className="h-3.5 w-3.5" />
                            Tải tài liệu PDF
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-black">
                      <iframe
                        src={buildVideoEmbedUrl(currentLesson)}
                        title={currentLesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h2 className="text-base font-bold text-slate-900">
                      {currentLesson.title}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {hasStructuredContent(currentLesson) && (
                        <button
                          type="button"
                          onClick={() => setPlayerOpen(true)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#E60067] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#c90059]"
                        >
                          <PlayIcon aria-hidden="true" className="h-3.5 w-3.5" />
                          Học bài học 4 phần
                        </button>
                      )}
                      {completedSet.has(String(currentLesson._id)) ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <CheckCircleIcon
                            aria-hidden="true"
                            className="h-4 w-4"
                          />
                          Đã hoàn thành
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleComplete(currentLesson._id)}
                          className="rounded-full bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700"
                        >
                          Đánh dấu hoàn thành
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
                <h3 className="mb-3 text-sm font-extrabold text-slate-900">
                  Bình luận ({courseComments.length})
                </h3>
                {isAuthenticated && (
                  <div className="mb-4 space-y-2 rounded-xl bg-slate-50 p-3">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Nhập bình luận của bạn..."
                      rows={3}
                      className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-[#E60067] focus:outline-none"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <span className="font-bold">Đánh giá:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setCommentRating(star)}
                            className="transition-transform hover:scale-110"
                          >
                            <StarIcon
                              aria-hidden="true"
                              className={[
                                'h-4 w-4',
                                star <= commentRating
                                  ? 'fill-amber-400 stroke-amber-400'
                                  : 'fill-none stroke-slate-300',
                              ].join(' ')}
                            />
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handlePostComment}
                        disabled={posting}
                        className="rounded-full bg-[#E60067] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#d0005a] disabled:opacity-50"
                      >
                        {posting ? 'Đang gửi...' : 'Gửi'}
                      </button>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  {courseComments.length === 0 ? (
                    <p className="text-center text-xs text-slate-400">
                      Chưa có bình luận nào.
                    </p>
                  ) : (
                    courseComments.map((c) => (
                      <div
                        key={c._id}
                        className="rounded-xl border border-slate-100 bg-slate-50/50 p-3"
                      >
                        <div className="mb-1 flex items-start justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            {c.userId?.name || c.userId?.phone || 'Ẩn danh'}
                          </span>
                          {c.rating > 0 && (
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: c.rating }, (_, i) => (
                                <StarIcon
                                  key={i}
                                  aria-hidden="true"
                                  className="h-3 w-3 fill-amber-400 stroke-amber-400"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-slate-700">{c.content}</p>
                        <span className="mt-1 block text-[10px] text-slate-400">
                          {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Lesson List */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Nội dung khóa học
                </h3>
              </div>
              <div className="max-h-[600px] divide-y divide-slate-100 overflow-y-auto">
                {lessons.map((l, i) => {
                  const isActive = String(l._id) === String(currentLessonId);
                  const isDone = completedSet.has(String(l._id));
                  return (
                    <button
                      key={l._id}
                      type="button"
                      onClick={() => handleSelectLesson(l)}
                      className={[
                        'group flex w-full items-start gap-3 p-3 text-left transition-colors',
                        isActive
                          ? 'bg-pink-50'
                          : 'hover:bg-slate-50',
                      ].join(' ')}
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                        {isDone ? (
                          <CheckCircleIcon
                            aria-hidden="true"
                            className="h-4 w-4 text-emerald-600"
                          />
                        ) : (
                          i + 1
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={[
                            'text-xs font-bold',
                            isActive ? 'text-[#E60067]' : 'text-slate-900',
                          ].join(' ')}
                        >
                          {l.title}
                        </p>
                        <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                          <span
                            className={[
                              'inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold',
                              lessonTypeBadge(l.contentType).className,
                            ].join(' ')}
                          >
                            {lessonTypeBadge(l.contentType).label}
                          </span>
                          {hasStructuredContent(l) && (
                            <span className="inline-block rounded-full bg-pink-100 px-1.5 py-0.5 text-[9px] font-bold text-[#E60067]">
                              4 phần
                            </span>
                          )}
                          {l.durationSeconds > 0 && (
                            <span>
                              {Math.floor(l.durationSeconds / 60)} phút
                            </span>
                          )}
                        </span>
                      </div>
                      {isActive && (
                        <PlayIcon
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-[#E60067]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Trình phát bài học 4 phần */}
      <LessonPlayerModal
        open={playerOpen}
        onClose={() => setPlayerOpen(false)}
        course={course}
        lesson={currentLesson}
        isAuthenticated={isAuthenticated}
        onRequireLogin={() => openLoginDrawer()}
        onPassed={handleQuizPassed}
        onOpenCertificate={() => {
          setPlayerOpen(false);
          navigate('/chung-chi');
        }}
      />
    </motion.div>
  );
}

/** Nhãn + màu badge của loại nội dung bài học. */
function lessonTypeBadge(contentType) {
  if (contentType === 'video_pdf') {
    return { label: 'PDF + Video', className: 'bg-violet-100 text-violet-700' };
  }
  if (contentType === 'image_pdf') {
    return { label: 'Ảnh + PDF', className: 'bg-amber-100 text-amber-700' };
  }
  return { label: 'Chỉ Video', className: 'bg-sky-100 text-sky-700' };
}

function formatDuration(min) {
  if (!min) return '';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return `${h} Tiếng ${m} Phút`;
  if (h > 0) return `${h} Tiếng`;
  return `${m} Phút`;
}