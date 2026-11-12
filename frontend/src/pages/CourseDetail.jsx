import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header.jsx';
import LessonPlayerModal from '../components/course/LessonPlayerModal.jsx';
import LessonMedia from '../components/course/LessonMedia.jsx';
import CourseDetailHero from '../components/course/CourseDetailHero.jsx';
import {
  PlayIcon,
  CheckCircleIcon,
  TrophyIcon,
  BookIcon,
  ArrowLeftIcon,
  StarIcon,
  UserIcon,
} from '../components/icons/index.jsx';
import { useCourseStore } from '../store/courseStore.js';
import { useProgressStore } from '../store/progressStore.js';
import { useCommentStore } from '../store/commentStore.js';
import { useFavoriteStore } from '../store/favoriteStore.js';
import { useAuthStore } from '../store/authStore.js';
import { useLoginDrawerStore } from '../store/loginDrawerStore.js';
import { useNotification } from '../store/notificationStore.js';
import { addFavorite, removeFavorite } from '../services/favoriteApi.js';
import {
  getLessonParts,
  hasStructuredContent,
  countAvailableParts,
} from '../utils/lessonParts.js';

export default function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
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
  const fetchProgress = useProgressStore((s) => s.fetch);

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
  // Đang gọi API đánh dấu hoàn thành → chống gọi trùng cho cùng 1 bài học.
  const completingRef = useRef(new Set());

  useEffect(() => {
    if (!slug) return;
    fetchDetail(slug).catch(() => {});
  }, [slug, fetchDetail]);

  // Nạp tiến độ tổng (đã hoàn thành bài nào, % từng khóa) để gộp với dữ liệu
  // trong myProgress của API chi tiết.
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchProgress().catch(() => {});
  }, [isAuthenticated, fetchProgress]);

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

  // Danh sách bài đã hoàn thành: gộp cả dữ liệu từ API (myProgress) lẫn từ
  // store (cập nhật tức thì sau khi đánh dấu hoàn thành) để không mất bài học
  // đã hoàn thành trước đó.
  const completedSet = useMemo(() => {
    const set = new Set((myProgress?.completedLessons || []).map(String));
    for (const id of progressStore[course?._id]?.completedLessons || []) {
      set.add(String(id));
    }
    return set;
  }, [myProgress?.completedLessons, progressStore, course?._id]);

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
    // Click vào bài học → mở modal ngay (bài học 4 phần hoặc bài học chỉ có media)
    setPlayerOpen(true);
  }

  function handleQuizPassed(result) {
    // Khách (chưa đăng nhập) không có tiến độ nào được lưu → không ghi tiến độ giả.
    if (!isAuthenticated) return;
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
    // Bài học đã hoàn thành rồi → không gọi API lại (tránh báo trùng,
    // ví dụ khi vừa trả lời đúng trắc nghiệm ở Phần 4).
    const key = String(lessonId);
    if (completedSet.has(key) || completingRef.current.has(key)) return;
    completingRef.current.add(key);
    try {
      await completeLesson(lessonId, course._id);
      // Nạp lại tiến độ tổng (danh sách bài đã hoàn thành + % khóa học).
      fetchProgress().catch(() => {});
      // Refresh continue + stats cho header
      fetchContinue().catch(() => {});
      fetchStats().catch(() => {});
      notify({
        type: 'success',
        title: 'Đã hoàn thành bài học',
        message: 'Tiến trình học tập của bạn đã được cập nhật.',
      });
    } catch (err) {
      completingRef.current.delete(key);
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
      // Bình luận được +2 điểm ở backend → tải lại tổng điểm để header
      // và trang điểm nhảy số ngay.
      try {
        const { usePointsStore } = await import('../store/pointsStore.js');
        usePointsStore.getState().fetch().catch(() => {});
      } catch (_) {}
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

  // Tiến trình khóa học = max(giá trị từ API, giá trị vừa cập nhật ở store).
  // Khóa học coi như đã hoàn tất khi đạt 100% → lúc đó mới hiện nút chứng nhận.
  const courseProgressPct = Math.max(
    Number(myProgress?.progressPct) || 0,
    Number(progressStore[course._id]?.progressPct) || 0
  );
  const courseCompleted = courseProgressPct >= 100;
  const canOpenCertificate = isAuthenticated && courseCompleted;

  // Thanh tiến trình trên hero cũng phản ánh tiến trình vừa cập nhật.
  const progressPct = courseProgressPct;
  const courseComments = comments[course._id] || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen flex-col bg-gradient-to-b from-primary-50 via-white to-primary-50"
    >
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-6 pb-20 sm:px-6 md:pb-6">
        <nav
          aria-label="Breadcrumb"
          className="mb-3 flex items-center gap-1.5 text-[11px] font-medium text-slate-500"
        >
          <Link
            to="/"
            className="flex items-center gap-1 font-bold text-slate-600 transition-colors hover:text-[#E60067]"
          >
            <ArrowLeftIcon aria-hidden="true" className="h-3 w-3" />
            Trang chủ
          </Link>
          <span className="text-slate-300">/</span>
          <Link
            to="/khoa-hoc"
            className="font-bold text-slate-600 transition-colors hover:text-[#E60067]"
          >
            Khóa học
          </Link>
          <span className="text-slate-300">/</span>
          <span className="truncate font-bold text-slate-900">{course.title}</span>
        </nav>

        <div className="space-y-4">
          {/* Hero */}
          <CourseDetailHero
            course={course}
            lessons={lessons}
            progressPct={progressPct}
            completedCount={completedSet.size}
            isFavorite={isFavorite(course._id)}
            onToggleFavorite={handleToggleFavorite}
          />

          {/* Player + Lessons */}
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {/* Video giới thiệu khóa học */}
              {course.videoId && (
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                  <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[11px] font-black text-white">
                      ▶
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-sm font-extrabold text-slate-900">
                        Video giới thiệu khóa học
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        Xem tổng quan nội dung trước khi bắt đầu học
                      </p>
                    </div>
                  </div>
                  <div className="aspect-video w-full bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${course.videoId}?rel=0`}
                      title={`Video giới thiệu ${course.title}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                </section>
              )}

              {/* Nội dung bài học — ưu tiên player 4 phần nếu bài học có nội dung cấu trúc */}
              {currentLesson && (
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                  {hasStructuredContent(currentLesson) ? (
                    /* Bài học có 4 phần → không render media cũ (tránh khung đen) */
                    <div>
                      <div className="flex items-start gap-3 bg-gradient-to-r from-pink-50 via-white to-white px-4 py-4 sm:px-5">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E60067] text-sm font-black text-white shadow-sm">
                          4
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E60067]">
                            Bài học 4 phần
                          </span>
                          <h2 className="mt-0.5 text-base font-extrabold text-slate-900">
                            {currentLesson.title}
                          </h2>
                          <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                            Slide bài giảng → Mô phỏng tình huống → Tóm tắt bài
                            học → Trắc nghiệm tổng kết.
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPlayerOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#E60067] px-4 py-2 text-xs font-bold text-white hover:bg-[#c90059]"
                          >
                            <PlayIcon aria-hidden="true" className="h-3.5 w-3.5" />
                            Học bài học 4 phần
                          </button>
                          {completedSet.has(String(currentLesson._id)) ? (
                            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                              <TrophyIcon aria-hidden="true" className="h-4 w-4" />
                              Đã hoàn thành
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-500">
                              Xem đủ 4 phần trong modal để được đánh dấu hoàn thành.
                            </span>
                          )}
                        </div>

                        {/* Timeline 4 phần */}
                        <ol className="mt-4 space-y-0">
                          {getLessonParts(currentLesson).map((part, idx) => (
                            <li key={part.key} className="relative flex gap-3 pb-3 last:pb-0">
                              {idx < 3 && (
                                <span
                                  aria-hidden="true"
                                  className="absolute left-[11px] top-6 h-full w-px bg-slate-200"
                                />
                              )}
                              <span
                                className={[
                                  'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black',
                                  part.available
                                    ? 'bg-[#E60067] text-white shadow-sm'
                                    : 'bg-slate-200 text-slate-400',
                                ].join(' ')}
                              >
                                {PART_STEP_INDEX[part.key]}
                              </span>
                              <div className="min-w-0 flex-1 pt-0.5">
                                <p
                                  className={[
                                    'text-xs font-extrabold',
                                    part.available
                                      ? 'text-slate-900'
                                      : 'text-slate-400',
                                  ].join(' ')}
                                >
                                  {part.label}
                                </p>
                                <p
                                  className={[
                                    'mt-0.5 text-[11px]',
                                    part.available
                                      ? 'text-slate-600'
                                      : 'text-slate-400',
                                  ].join(' ')}
                                >
                                  {part.available
                                    ? partDetail(part)
                                    : 'Chưa có nội dung'}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  ) : (
                    <LessonMedia lesson={currentLesson} pdfInFrame />
                  )}
                  {!hasStructuredContent(currentLesson) && (
                    <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
                      <h2 className="text-base font-bold text-slate-900">
                        {currentLesson.title}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {completedSet.has(String(currentLesson._id)) ? (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                            <TrophyIcon aria-hidden="true" className="h-4 w-4" />
                            Đã hoàn thành
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleComplete(currentLesson._id)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-teal-700"
                          >
                            <CheckCircleIcon aria-hidden="true" className="h-4 w-4" />
                            Đánh dấu hoàn thành
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Comments */}
              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 sm:px-6">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-[11px] font-black text-[#E60067]">
                    {courseComments.length}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Bình luận
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Chia sẻ cảm nhận của bạn về khóa học
                    </p>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  {isAuthenticated ? (
                    <div className="mb-4 space-y-2.5 rounded-xl bg-slate-50 p-3">
                      <span className="block text-[11px] font-extrabold text-slate-700">
                        Viết bình luận
                      </span>
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
                              aria-label={`${star} sao`}
                              className="transition-transform hover:scale-110"
                            >
                              <StarIcon
                                aria-hidden="true"
                                className={[
                                  'h-5 w-5',
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
                  ) : (
                    <button
                      type="button"
                      onClick={() => openLoginDrawer(`/khoa-hoc/${course.slug}`)}
                      className="mb-4 flex w-full items-center gap-3 rounded-xl border border-dashed border-pink-200 bg-pink-50/60 p-3 text-left transition-colors hover:bg-pink-50"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#E60067]">
                        <UserIcon aria-hidden="true" className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-extrabold text-slate-900">
                          Đăng nhập để viết bình luận
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          Chia sẻ trải nghiệm học của bạn với cộng đồng
                        </span>
                      </span>
                    </button>
                  )}
                  <div className="space-y-3">
                    {courseComments.length === 0 ? (
                      <p className="py-4 text-center text-xs text-slate-400">
                        Chưa có bình luận nào.
                      </p>
                    ) : (
                      courseComments.map((c) => {
                        const authorName =
                          c.userId?.name || c.userId?.phone || 'Ẩn danh';
                        return (
                          <div
                            key={c._id}
                            className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-100 text-xs font-black text-[#E60067]">
                              {authorName.charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <span className="block truncate text-xs font-bold text-slate-900">
                                    {authorName}
                                  </span>
                                  <span className="block text-[10px] text-slate-400">
                                    {new Date(c.createdAt).toLocaleDateString(
                                      'vi-VN'
                                    )}
                                  </span>
                                </div>
                                {c.rating > 0 && (
                                  <div className="flex shrink-0 items-center gap-0.5">
                                    {Array.from({ length: c.rating }, (_, i) => (
                                      <StarIcon
                                        key={i}
                                        aria-hidden="true"
                                        className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400"
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                              <p className="text-xs leading-relaxed text-slate-700">
                                {c.content}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Lesson List */}
            <div className="lg:sticky lg:top-4 lg:self-start">
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Nội dung khóa học
                    </h3>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                      {lessons.length} bài
                    </span>
                  </div>
                  {lessons.length > 0 && (
                    <div className="mt-2">
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-teal-500 transition-all duration-500"
                          style={{
                            width: `${Math.round(
                              (completedSet.size / lessons.length) * 100
                            )}%`,
                          }}
                        />
                      </div>
                      <p className="mt-1 text-[10px] font-medium text-slate-500">
                        Đã hoàn thành {completedSet.size}/{lessons.length} bài học
                      </p>
                    </div>
                  )}
                </div>
                <div className="divide-y divide-slate-100 lg:max-h-[calc(100vh-11rem)] lg:overflow-y-auto">
                  {lessons.map((l, i) => {
                    const isActive = String(l._id) === String(currentLessonId);
                    const isDone = completedSet.has(String(l._id));
                    return (
                      <button
                        key={l._id}
                        type="button"
                        onClick={() => handleSelectLesson(l)}
                        className={[
                          'group flex w-full items-start gap-3 border-l-[3px] p-3 text-left transition-colors',
                          isActive
                            ? 'border-l-[#E60067] bg-pink-50'
                            : 'border-l-transparent hover:bg-slate-50',
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
                          {/* Bài học 4 phần → badge loại media không liên quan, bỏ qua */}
                          {!hasStructuredContent(l) && (
                            <span
                              className={[
                                'inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold',
                                lessonTypeBadge(l.contentType).className,
                              ].join(' ')}
                            >
                              {lessonTypeBadge(l.contentType).label}
                            </span>
                          )}
                          {l.durationSeconds > 0 && (
                            <span>
                              {Math.floor(l.durationSeconds / 60)} phút
                            </span>
                          )}
                        </span>

                        {/* Chi tiết 4 phần của bài học */}
                        <LessonPartsGrid lesson={l} />
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
        </div>
      </main>

      {/* Trình phát bài học 4 phần */}
      <LessonPlayerModal
        open={playerOpen}
        onClose={() => setPlayerOpen(false)}
        course={course}
        lesson={currentLesson}
        isAuthenticated={isAuthenticated}
        onRequireLogin={(redirectPath) => openLoginDrawer(redirectPath || '/')}
        onPassed={handleQuizPassed}
        onComplete={handleComplete}
        isCompleted={completedSet.has(String(currentLesson?._id))}
        onOpenCertificate={
          canOpenCertificate
            ? () => {
                // Đã đăng nhập + khóa học đã hoàn tất → sang thẳng trang chứng nhận.
                setPlayerOpen(false);
                navigate('/chung-chi');
              }
            : undefined
        }
      />
    </motion.div>
  );
}

/**
 * Lưới thông tin 4 phần của một bài học.
 *
 * Mỗi phần hiển thị nhãn + số lượng, phần không có nội dung thì mờ đi.
 * Nếu bài học không có bất kỳ phần 4 phần nào → hiển thị loại media
 * (video / ảnh / PDF) cho đúng với thực tế bài học.
 */
function LessonPartsGrid({ lesson }) {
  const parts = getLessonParts(lesson);
  const available = countAvailableParts(lesson);

  // Bài học không có phần 4 phần nào → badge loại media đã hiển thị ở trên
  if (available === 0) return null;

  return (
    <div className="mt-1.5">
      <div className="mb-1 flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-md bg-pink-100 px-1.5 py-0.5 text-[9px] font-extrabold text-[#E60067]">
          Bài học 4 phần
        </span>
        <span className="text-[9px] font-bold text-slate-400">
          {available}/4 phần
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {parts.map((part) => (
          <div
            key={part.key}
            className={[
              'flex items-center gap-1 rounded-md border px-1.5 py-1 text-[9px] font-bold',
              part.available
                ? 'border-pink-100 bg-pink-50/70 text-[#E60067]'
                : 'border-slate-100 bg-slate-50 text-slate-300',
            ].join(' ')}
          >
            <span
              className={[
                'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[8px] font-black',
                part.available
                  ? 'bg-[#E60067] text-white'
                  : 'bg-slate-200 text-slate-400',
              ].join(' ')}
            >
              {part.available ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-2.5 w-2.5"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                part.key === 'slides' ? '1' : part.key === 'simulations' ? '2' : part.key === 'summary' ? '3' : '4'
              )}
            </span>
            <span className="truncate">{part.label}</span>
            {part.available && part.isPdf && (
              <span className="ml-auto shrink-0 font-extrabold">PDF</span>
            )}
            {part.available && !part.isPdf && part.count > 0 && (
              <span className="ml-auto shrink-0 font-extrabold">
                {part.count}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
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

/** Số thứ tự của từng phần trong 4 phần. */
const PART_STEP_INDEX = {
  slides: 1,
  simulations: 2,
  summary: 3,
  quizzes: 4,
};

/** Mô tả ngắn nội dung của một phần. */
function partDetail(part) {
  if (part.key === 'slides') {
    return part.isPdf
      ? 'Tài liệu PDF slide bài giảng'
      : `${part.count} slide bài giảng`;
  }
  if (part.key === 'simulations') return `${part.count} mô phỏng tình huống`;
  if (part.key === 'summary') return 'Infographic & tài liệu tóm tắt';
  return `${part.count} câu hỏi trắc nghiệm`;
}