import { motion } from 'framer-motion';
import Header from '../components/layout/Header.jsx';
import SearchBar from '../components/landing/SearchBar.jsx';
import HeroBanner from '../components/landing/HeroBanner.jsx';
import QuickActions from '../components/landing/QuickActions.jsx';
import MyCourseCards from '../components/landing/MyCourseCards.jsx';
import OAFollowCard from '../components/landing/OAFollowCard.jsx';
import CategoryNav from '../components/landing/CategoryNav.jsx';
import NewsList from '../components/landing/NewsList.jsx';
import {
  CATEGORY_HOC_TAP,
  CATEGORY_MUA_SAM,
} from '../data/homeContent.js';

export default function Home() {
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
          <SearchBar />
          <HeroBanner />
          <QuickActions />
          <MyCourseCards />
          <OAFollowCard />
          <div id="loom-catalog-sections" className="scroll-mt-4 space-y-4">
            <CategoryNav title="Học tập cùng Loom" items={CATEGORY_HOC_TAP} />
            <CategoryNav title="Mua sắm cùng Loom" items={CATEGORY_MUA_SAM} />
          </div>
          <NewsList />
        </div>
      </main>
    </motion.div>
  );
}