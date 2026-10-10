import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header.jsx';
import CourseCard from '../components/landing/CourseCard.jsx';
import CourseEmptyState from '../components/landing/CourseEmptyState.jsx';
import { HeartFillIcon } from '../components/icons/index.jsx';
import { useFavoriteStore } from '../store/favoriteStore.js';
import { useAuthStore } from '../store/authStore.js';
import { useLoginDrawerStore } from '../store/loginDrawerStore.js';

export default function MyFavorites() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const items = useFavoriteStore((s) => s.items);
  const loading = useFavoriteStore((s) => s.loading);
  const fetch = useFavoriteStore((s) => s.fetch);

  useEffect(() => {
    if (!isAuthenticated) {
      useLoginDrawerStore.getState().openLoginDrawer();
      navigate('/');
      return;
    }
    fetch().catch(() => {});
  }, [isAuthenticated, navigate, fetch]);

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
          <div className="flex items-center gap-2">
            <HeartFillIcon aria-hidden="true" className="h-5 w-5 text-[#E60067]" />
            <h1 className="text-lg font-extrabold text-slate-900">
              Khóa học yêu thích
            </h1>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex animate-pulse overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs sm:flex-row"
                >
                  <div className="h-28 w-full shrink-0 bg-slate-100 sm:h-28 sm:w-28" />
                  <div className="flex-1 space-y-2 p-3">
                    <div className="h-3 w-16 rounded-full bg-slate-100" />
                    <div className="h-3 w-3/4 rounded-full bg-slate-100" />
                    <div className="h-3 w-1/2 rounded-full bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <CourseEmptyState onReset={() => navigate('/khoa-hoc')} />
          ) : (
            <div className="space-y-3">
              {items.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  onProgressClick={(c) => navigate(`/khoa-hoc/${c.slug}`)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </motion.div>
  );
}