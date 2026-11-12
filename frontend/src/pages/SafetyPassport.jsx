import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header.jsx';
import ProfileBanner from '../components/passport/ProfileBanner.jsx';
import PassportActionCards from '../components/passport/PassportActionCards.jsx';
import PassportChips from '../components/passport/PassportChips.jsx';
import PassportCard from '../components/passport/PassportCard.jsx';
import DocumentCard from '../components/library/DocumentCard.jsx';
import { usePassportStore } from '../store/passportStore.js';
import { useProgressStore } from '../store/progressStore.js';
import { useExpertQAStore } from '../store/expertQAStore.js';
import { useForumStore } from '../store/forumStore.js';
import { useSupportStore } from '../store/supportStore.js';
import { useWorkshopStore } from '../store/workshopStore.js';
import { MOCK_QUESTIONS } from '../data/mockExpertQA.js';
import { MOCK_FORUM_POSTS } from '../data/mockForumPosts.js';

const MOCK_DOCUMENTS = [
  {
    _id: '1',
    title: 'Sổ tay nhận diện 15 thủ đoạn lừa đảo việc làm online mới nhất 2026',
    description: 'Tài liệu chi tiết phân tích 15 kịch bản lừa đảo nhắm vào công nhân nữ...',
    fileType: 'pdf',
    fileSize: 2400000,
    pageCount: 18,
    downloadCount: 1420,
    createdAt: '2026-07-28',
    courseId: { _id: '1', title: 'Nhận diện và phòng chống lừa đảo trực tuyến' },
    courseProgressPct: 100,
  },
  {
    _id: '2',
    title: 'Sơ đồ móc hoa hồng tulip cotton milk 5 cánh',
    description: 'Bản vẽ ký hiệu chart móc hoa tulip và hoa hướng dương kèm hình chụp...',
    fileType: 'pdf',
    fileSize: 3100000,
    pageCount: 8,
    downloadCount: 4500,
    createdAt: '2026-07-30',
    courseId: { _id: '2', title: 'Học cách móc len tại nhà' },
    courseProgressPct: 65,
  },
];

export default function SafetyPassport() {
  const [activeTab, setActiveTab] = useState('passport');
  const loadPassport = usePassportStore((s) => s.loadPassport);
  const fetchStats = useProgressStore((s) => s.fetchStats);
  const loading = usePassportStore((s) => s.loading);
  const error = usePassportStore((s) => s.error);
  const openExpertQA = useExpertQAStore((s) => s.openModal);
  const openForum = useForumStore((s) => s.openForum);
  const openSupport = useSupportStore((s) => s.openModal);
  const openWorkshop = useWorkshopStore((s) => s.openModal);

  useEffect(() => {
    loadPassport().catch(() => {});
    fetchStats().catch(() => {});
  }, [loadPassport, fetchStats]);

  function handleTabChange(tab) {
    if (tab === 'support') {
      openSupport();
      return;
    }
    if (tab === 'workshop') {
      openWorkshop();
      return;
    }
    setActiveTab(tab);
  }

  if (loading && !usePassportStore.getState().passport) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary-50 via-white to-primary-50">
        <Header />
        <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-3 py-6">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-[#E60067]"></div>
            <p className="mt-2 text-sm text-slate-600">Đang tải thông tin hộ chiếu...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !usePassportStore.getState().passport) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary-50 via-white to-primary-50">
        <Header />
        <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-3 py-6">
          <div className="text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => loadPassport()}
              className="mt-4 rounded-lg bg-[#E60067] px-4 py-2 text-sm font-bold text-white hover:bg-[#c90059]"
            >
              Thử lại
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen flex-col bg-gradient-to-b from-primary-50 via-white to-primary-50"
    >
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-6 pb-20 sm:px-6 md:pb-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-3.5 shadow-sm sm:p-6">
          <div className="space-y-6 font-sans text-xs">
            <ProfileBanner />

            <PassportActionCards />

            <PassportChips activeTab={activeTab} onChange={handleTabChange} />

            {/* Section theo tab */}
            <div className="space-y-4">
              {activeTab === 'passport' && <PassportCard />}

              {activeTab === 'expert' && (
                <div className="space-y-2.5">
                  {MOCK_QUESTIONS.slice(0, 3).map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={openExpertQA}
                      className="w-full rounded-2xl border border-slate-200/80 bg-white p-3.5 text-left shadow-xs transition-all hover:border-pink-200"
                    >
                      <span className="inline-block rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-[#E60067]">
                        {q.category}
                      </span>
                      <h4 className="mt-1.5 line-clamp-2 text-xs font-extrabold text-slate-900">
                        {q.title}
                      </h4>
                      <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">{q.content}</p>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={openExpertQA}
                    className="w-full rounded-full bg-[#E60067] px-3 py-2 text-xs font-bold text-white hover:bg-[#c90059]"
                  >
                    Đặt câu hỏi mới (Miễn phí)
                  </button>
                </div>
              )}

              {activeTab === 'forum' && (
                <div className="space-y-2.5">
                  {MOCK_FORUM_POSTS.slice(0, 3).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={openForum}
                      className="w-full rounded-2xl border border-slate-200/80 bg-white p-3.5 text-left shadow-xs transition-all hover:border-pink-200"
                    >
                      <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {p.categoryLabel}
                      </span>
                      <h4 className="mt-1.5 line-clamp-2 text-xs font-extrabold text-slate-900">
                        {p.title}
                      </h4>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {p.author?.name} • {p.timeAgo} • ♥ {p.likes}
                      </p>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={openForum}
                    className="w-full rounded-full border border-pink-200 bg-pink-50 px-3 py-2 text-xs font-bold text-[#E60067] hover:bg-pink-100"
                  >
                    Mở Diễn đàn cộng đồng
                  </button>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900">
                    Tài liệu đã lưu ({MOCK_DOCUMENTS.length})
                  </h3>
                  {MOCK_DOCUMENTS.map((doc) => (
                    <DocumentCard
                      key={doc._id}
                      doc={doc}
                      onPreview={() => {}}
                      onDownload={() => {}}
                    />
                  ))}
                  <div className="text-center">
                    <p className="text-[10px] italic text-slate-400">
                      Xem toàn bộ tại{' '}
                      <a href="/thu-vien" className="font-bold text-[#E60067] hover:underline">
                        Thư viện tài liệu
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
