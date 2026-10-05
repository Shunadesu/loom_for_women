import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header.jsx';
import CourseSearchBar from '../components/landing/CourseSearchBar.jsx';
import CourseNoticeBanner from '../components/landing/CourseNoticeBanner.jsx';
import CourseFilterTabs from '../components/landing/CourseFilterTabs.jsx';
import CourseCard from '../components/landing/CourseCard.jsx';
import CourseCardSkeleton from '../components/landing/CourseCardSkeleton.jsx';
import CourseEmptyState from '../components/landing/CourseEmptyState.jsx';
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

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ongoing');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Fetch list khi mount + thay đổi filter
  useEffect(() => {
    const apiStatus = STATUS_TABS.find((t) => t.id === activeTab)?.apiValue || 'all';
    list({ status: apiStatus, q: debouncedQuery || undefined }).catch(() => {});
  }, [activeTab, debouncedQuery, list]);

  const displayCourses = useMemo(() => {
    // Nếu backend lỗi → fallback mock
    if (error && courses.length === 0) return filterMock(activeTab, query);
    return courses;
  }, [courses, error, activeTab, query]);

  const isLoading = loading && courses.length === 0 && !error;

  function handleProgressClick(course) {
    // Navigate tới detail (dùng navigate trực tiếp hoặc Link bên trong card)
    window.location.href = `/khoa-hoc/${course.slug}`;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen flex-col bg-gradient-to-b from-primary-50 via-white to-primary-50"
    >
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-6 sm:px-6">
        <div className="space-y-4 overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-3.5 shadow-sm sm:p-6">
          <CourseSearchBar
            value={query}
            onChange={setQuery}
            onSubmit={() => setDebouncedQuery(query.trim())}
          />
          <CourseNoticeBanner />
          <CourseFilterTabs active={activeTab} onChange={setActiveTab} />

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
              <CourseEmptyState onReset={() => setActiveTab('ongoing')} />
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

function filterMock(tab, query) {
  let list = [...MOCK_COURSES];
  if (tab === 'unstarted') list = list.filter((c) => (c.progressPct || 0) === 0);
  else if (tab === 'ongoing') list = list.filter((c) => {
    const p = c.progressPct || 0;
    return p > 0 && p < 100;
  });
  else if (tab === 'completed') list = list.filter((c) => (c.progressPct || 0) >= 100);

  const q = query.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.category?.name || '').toLowerCase().includes(q)
    );
  }
  return list;
}