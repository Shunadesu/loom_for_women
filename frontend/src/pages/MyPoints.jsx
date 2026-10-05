import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header.jsx';
import { PercentIcon, TrophyIcon, ArrowUpIcon } from '../components/icons/index.jsx';
import { usePointsStore } from '../store/pointsStore.js';
import { useAuthStore } from '../store/authStore.js';

export default function MyPoints() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const total = usePointsStore((s) => s.total);
  const transactions = usePointsStore((s) => s.transactions);
  const loading = usePointsStore((s) => s.loading);
  const fetch = usePointsStore((s) => s.fetch);
  const fetchTransactions = usePointsStore((s) => s.fetchTransactions);

  useEffect(() => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để xem điểm.');
      navigate('/');
      return;
    }
    fetch().catch(() => {});
    fetchTransactions().catch(() => {});
  }, [isAuthenticated, navigate, fetch, fetchTransactions]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen flex-col bg-gradient-to-b from-primary-50 via-white to-primary-50"
    >
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-6 sm:px-6">
        <div className="space-y-4">
          {/* Tổng điểm */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-[#E60067] to-[#d0005a] p-6 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <TrophyIcon aria-hidden="true" className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Tổng điểm
                  </span>
                </div>
                <p className="text-4xl font-extrabold">
                  {loading ? '...' : total.toLocaleString()}
                </p>
                <p className="mt-1 text-xs font-medium text-pink-100">
                  Điểm tích lũy từ học tập
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/40 bg-pink-100/20 text-3xl">
                🎯
              </div>
            </div>
          </div>

          {/* Quy tắc tích điểm */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <PercentIcon aria-hidden="true" className="h-4 w-4 text-teal-600" />
              Cách tích điểm
            </h2>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <span className="font-bold text-teal-600">+5 điểm</span>
                <span>Hoàn thành 1 bài học</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-teal-600">+100 điểm</span>
                <span>Hoàn thành 1 khóa học (100%)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-teal-600">+2 điểm</span>
                <span>Đăng 1 bình luận</span>
              </div>
            </div>
          </div>

          {/* Lịch sử */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-3 text-sm font-extrabold text-slate-900">
              Lịch sử giao dịch
            </h2>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex animate-pulse items-center justify-between rounded-xl bg-slate-50 p-3"
                  >
                    <div className="h-3 w-1/2 rounded-lg bg-slate-200" />
                    <div className="h-3 w-12 rounded-lg bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-center text-xs text-slate-400">
                Chưa có giao dịch nào.
              </p>
            ) : (
              <div className="space-y-2">
                {transactions.map((t) => (
                  <div
                    key={t._id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3"
                  >
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900">{t.reason}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(t.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div
                      className={[
                        'flex items-center gap-1 text-xs font-extrabold',
                        t.amount > 0 ? 'text-emerald-600' : 'text-red-600',
                      ].join(' ')}
                    >
                      {t.amount > 0 && (
                        <ArrowUpIcon aria-hidden="true" className="h-3 w-3" />
                      )}
                      <span>{t.amount > 0 ? '+' : ''}{t.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </motion.div>
  );
}