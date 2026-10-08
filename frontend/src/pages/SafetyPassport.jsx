import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header.jsx';
import ProfileBanner from '../components/passport/ProfileBanner.jsx';
import PassportActionCards from '../components/passport/PassportActionCards.jsx';
import PassportChips from '../components/passport/PassportChips.jsx';
import PassportCard from '../components/passport/PassportCard.jsx';
import IncomeCard from '../components/passport/IncomeCard.jsx';
import MessagesList from '../components/passport/MessagesList.jsx';
import MyProductsGrid from '../components/passport/MyProductsGrid.jsx';
import OrdersList from '../components/passport/OrdersList.jsx';
import GiftsList from '../components/passport/GiftsList.jsx';
import DocumentCard from '../components/library/DocumentCard.jsx';
import { usePassportStore } from '../store/passportStore.js';

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
  const loadMyProducts = usePassportStore((s) => s.loadMyProducts);
  const loadMyOrders = usePassportStore((s) => s.loadMyOrders);
  const loadMyMessages = usePassportStore((s) => s.loadMyMessages);
  const loading = usePassportStore((s) => s.loading);
  const error = usePassportStore((s) => s.error);

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadPassport();
        await loadMyProducts();
        await loadMyOrders();
        await loadMyMessages();
      } catch (err) {
        console.error('Error loading passport data:', err);
      }
    };

    loadData();
  }, [loadPassport, loadMyProducts, loadMyOrders, loadMyMessages]);

  if (loading && !usePassportStore.getState().passport) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary-50 via-white to-primary-50">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-6 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#E60067]"></div>
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
        <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => loadPassport()}
              className="mt-4 px-4 py-2 bg-[#E60067] text-white rounded-lg text-sm font-bold hover:bg-[#c90059]"
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
      <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-6 pb-20 sm:px-6 md:pb-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-3.5 sm:p-6 overflow-hidden">
          <div className="p-3.5 space-y-4 text-xs">
            <ProfileBanner />

            <PassportActionCards />

            <PassportChips activeTab={activeTab} onChange={setActiveTab} />

            {/* Section theo tab */}
            <div className="space-y-3">
              {activeTab === 'passport' && (
                <>
                  <PassportCard />
                  <IncomeCard />
                </>
              )}

              {activeTab === 'messages' && <MessagesList />}

              {activeTab === 'myProducts' && <MyProductsGrid />}

              {activeTab === 'orders' && <OrdersList />}

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
                    <p className="text-[10px] text-slate-400 italic">
                      Xem toàn bộ tại{' '}
                      <a href="/thu-vien" className="text-[#E60067] font-bold hover:underline">
                        Thư viện tài liệu
                      </a>
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'gifts' && <GiftsList />}
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
