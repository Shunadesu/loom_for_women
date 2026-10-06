import { useEffect, useState } from 'react';
import { useProgressStore } from '../../store/progressStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { PlayIcon, ClockIcon, AwardIcon, FlameIcon } from '../icons/index.jsx';

/**
 * Header thống kê học tập của user.
 * Gọi /api/progress/me/stats và hiển thị 3-4 ô.
 * Ẩn hoàn toàn nếu user chưa đăng nhập.
 */
export default function StatsHeader() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = Boolean(token || user?._id);
  const stats = useProgressStore((s) => s.stats);
  const fetchStats = useProgressStore((s) => s.fetchStats);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated, fetchStats]);

  if (!isAuthenticated) return null;

  const items = [
    {
      key: 'ongoing',
      label: 'Đang học',
      value: stats.ongoing,
      Icon: FlameIcon,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      key: 'completed',
      label: 'Đã hoàn tất',
      value: stats.completed,
      Icon: AwardIcon,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      key: 'minutes',
      label: 'Tổng giờ học',
      value: formatHours(stats.totalMinutes),
      Icon: ClockIcon,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(({ key, label, value, Icon, color, bg }) => (
        <div
          key={key}
          className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-3 py-2.5 shadow-xs"
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bg}`}
          >
            <Icon aria-hidden="true" className={`h-4 w-4 ${color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-500">
              {label}
            </p>
            <p className="text-sm font-extrabold text-slate-900">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatHours(minutes) {
  if (!minutes) return '0h';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h <= 0) return `${m} phút`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}p`;
}
