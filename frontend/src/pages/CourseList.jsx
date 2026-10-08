import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header.jsx';
import CourseSearchBar from '../components/landing/CourseSearchBar.jsx';
import CourseNoticeBanner from '../components/landing/CourseNoticeBanner.jsx';
import CourseFilterTabs from '../components/landing/CourseFilterTabs.jsx';
import CourseCard from '../components/landing/CourseCard.jsx';
import CourseCardSkeleton from '../components/landing/CourseCardSkeleton.jsx';
import CourseEmptyState from '../components/landing/CourseEmptyState.jsx';
import StatsHeader from '../components/landing/StatsHeader.jsx';
import ContinueLearningBanner from '../components/landing/ContinueLearningBanner.jsx';
import FeaturedCarousel from '../components/landing/FeaturedCarousel.jsx';
import CategoryFilterChips from '../components/landing/CategoryFilterChips.jsx';
import CourseSortDropdown from '../components/landing/CourseSortDropdown.jsx';
import { useCourseStore } from '../store/courseStore.js';
import { MOCK_COURSES } from '../data/mockCourses.js';

const STATUS_TABS = [
  { id: 'unstarted', apiValue: 'unstarted' },
  { id: 'ongoing', apiValue: 'ongoing' },
  { id: 'completed', apiValue: 'completed' },
];

export default function CourseList() {
  const courses = useCourseStore((s) => s.courses);
  const loading = useCourseStore((s) => s.loading);
  const error = useCourseStore((s) => s.error);
  const list = useCourseStore((s) => s.list);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'ongoing');
  const [activeCategory, setActiveCategory] = useState(
    () => searchParams.get('category') || ''
  );
  const [sortBy, setSortBy] = useState('newest');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Fetch list khi filter / search đổi
  useEffect(() => {
    const apiStatus = STATUS_TABS.find((t) => t.id === activeTab)?.apiValue || 'all';
    list({
      status: apiStatus,
      q: debouncedQuery || undefined,
      category: activeCategory || undefined,
    }).catch(() => {});
  }, [activeTab, debouncedQuery, activeCategory, list]);

  // Đồng bộ URL params
  useEffect(() => {
    const next = new URLSearchParams();
    if (activeTab !== 'ongoing') next.set('tab', activeTab);
    if (activeCategory) next.set('category', activeCategory);
    if (query) next.set('q', query);
    setSearchParams(next, { replace: true });
  }, [activeTab, activeCategory, query, setSearchParams]);

  // Sort + fallback mock
  const displayCourses = useMemo(() => {
    let list2 = error && courses.length === 0 ? filterMock(activeTab, query, activeCategory) : courses;
    list2 = sortCourses(list2, sortBy);
    return list2;
  }, [courses, error, activeTab, query, activeCategory, sortBy]);

  const isLoading = loading && courses.length === 0 && !error;

  function handleProgressClick(course) {
    if (course.lastLessonId) {
      navigate(`/khoa-hoc/${course.slug}?lesson=${course.lastLessonId}`);
    } else {
      navigate(`/khoa-hoc/${course.slug}`);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen flex-col bg-gradient-to-b from-primary-50 via-white to-primary-50"
    >
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-6 pb-20 sm:px-6 md:pb-6">
        <div className="space-y-4 overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-3.5 shadow-sm sm:p-6">
          <CourseSearchBar
            value={query}
            onChange={setQuery}
            onSubmit={() => setDebouncedQuery(query.trim())}
          />
          <CourseNoticeBanner />
          <StatsHeader />
          <ContinueLearningBanner />
          <FeaturedCarousel />

          <CourseFilterTabs active={activeTab} onChange={setActiveTab} />
          <CategoryFilterChips active={activeCategory} onChange={setActiveCategory} />

          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {displayCourses.length} khóa học
            </span>
            <div className="w-44">
              <CourseSortDropdown value={sortBy} onChange={setSortBy} />
            </div>
          </div>

          {error && courses.length === 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
              Backend chưa kết nối — đang hiển thị dữ liệu mẫu.{' '}
              <span className="font-bold">{error}</span>
            </div>
          )}

          <div className="space-y-3">
            {isLoading ? (
              <>
                <CourseCardSkeleton />
                <CourseCardSkeleton />
                <CourseCardSkeleton />
              </>
            ) : displayCourses.length === 0 ? (
              <CourseEmptyState
                onReset={() => {
                  setActiveTab('ongoing');
                  setActiveCategory('');
                  setQuery('');
                }}
              />
            ) : (
              displayCourses.map((c) => (
                <CourseCard
                  key={c._id || c.slug}
                  course={c}
                  onProgressClick={handleProgressClick}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </motion.div>
  );
}

function filterMock(tab, query, categoryId) {
  let list = [...MOCK_COURSES];
  if (tab === 'unstarted') list = list.filter((c) => (c.progressPct || 0) === 0);
  else if (tab === 'ongoing') {
    list = list.filter((c) => {
      const p = c.progressPct || 0;
      return p > 0 && p < 100;
    });
  } else if (tab === 'completed') list = list.filter((c) => (c.progressPct || 0) >= 100);

  const q = query.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.category?.name || '').toLowerCase().includes(q)
    );
  }
  if (categoryId) {
    list = list.filter((c) => c.category?._id === categoryId);
  }
  return list;
}

function sortCourses(arr, by) {
  const list = [...arr];
  switch (by) {
    case 'popular':
      return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'shortest':
      return list.sort((a, b) => (a.durationMinutes || 0) - (b.durationMinutes || 0));
    case 'longest':
      return list.sort((a, b) => (b.durationMinutes || 0) - (a.durationMinutes || 0));
    case 'newest':
    default:
      return list.sort((a, b) => {
        // Mới nhất: dùng createdAt nếu có, fallback updatedAt
        const aDate = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const bDate = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return bDate - aDate;
      });
  }
}
