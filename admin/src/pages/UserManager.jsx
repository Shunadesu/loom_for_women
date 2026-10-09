import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchUsersAdminSummary,
  deleteUserAdmin,
} from '../services/userApi.js';
import {
  SearchIcon,
  TrashIcon,
  EyeIcon,
  FilterIcon,
} from '../components/icons.jsx';

// Bảng màu tier — đồng bộ với key trả về từ backend (utils/points.js#TIERS).
const TIER_STYLES = {
  newcomer: {
    label: 'Mới',
    className: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  },
  silver: {
    label: 'Bạc',
    className: 'bg-slate-200 text-slate-800 ring-1 ring-slate-300',
  },
  gold: {
    label: 'Vàng',
    className: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
  },
  platinum: {
    label: 'Bạch kim',
    className: 'bg-cyan-100 text-cyan-800 ring-1 ring-cyan-200',
  },
};

function TierBadge({ tier }) {
  if (!tier) {
    return <span className="text-slate-400">—</span>;
  }
  const style = TIER_STYLES[tier.key] || TIER_STYLES.newcomer;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${style.className}`}
      title={`Ngưỡng: ${tier.min} – ${
        Number.isFinite(tier.max) ? tier.max : '∞'
      } điểm`}
    >
      <span className="text-[11px] leading-none">★</span>
      {style.label}
    </span>
  );
}

function RoleBadge({ role }) {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-pink-700 ring-1 ring-pink-200">
        Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200">
      User
    </span>
  );
}

function StatusBadge({ isActive }) {
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Disabled
    </span>
  );
}

function formatDateTime(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function UserManager() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState(''); // '', 'true', 'false'

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, roleFilter, activeFilter]);

  async function loadUsers() {
    setLoading(true);
    try {
      const isActive =
        activeFilter === 'true'
          ? true
          : activeFilter === 'false'
          ? false
          : undefined;
      const result = await fetchUsersAdminSummary({
        search,
        page,
        limit,
        role: roleFilter || undefined,
        isActive,
      });
      setItems(result.items);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (err) {
      const msg = err?.response?.data?.error || 'Không tải được người dùng.';
      alert(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function handleClearFilters() {
    setSearchInput('');
    setSearch('');
    setRoleFilter('');
    setActiveFilter('');
    setPage(1);
  }

  async function handleDelete(user, e) {
    e?.stopPropagation();
    if (!window.confirm(`Xoá người dùng "${user.name || user.phone}"?`)) return;
    try {
      await deleteUserAdmin(user._id);
      setItems((prev) => prev.filter((u) => u._id !== user._id));
    } catch (err) {
      const msg = err?.response?.data?.error || 'Xoá thất bại.';
      alert(msg);
    }
  }

  function handleRowClick(user) {
    navigate(`/admin/users/${user._id}`);
  }

  function handleView(user, e) {
    e.stopPropagation();
    handleRowClick(user);
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-slate-900">
            Quản lý Người dùng
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Danh sách tài khoản người dùng & cấp điểm tích lũy.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-700">
            Tổng: {total}
          </span>
          <span>Trang {page} / {totalPages}</span>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2.5">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-1 items-center gap-2"
        >
          <div className="flex flex-1 items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 focus-within:border-pink-300">
            <SearchIcon aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo SĐT hoặc tên…"
              className="flex-1 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-pink-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-pink-700"
          >
            Tìm
          </button>
        </form>

        <div className="flex items-center gap-1.5">
          <FilterIcon aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-pink-300 focus:outline-none"
          >
            <option value="">Tất cả role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-pink-300 focus:outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Active</option>
            <option value="false">Disabled</option>
          </select>
          {(search || roleFilter || activeFilter) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-md border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Xoá lọc
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-pink-500" />
          <p className="mt-2 text-xs text-slate-500">Đang tải…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          Chưa có người dùng nào phù hợp.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-700">
                    Người dùng
                  </th>
                  <th className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-700">
                    SĐT
                  </th>
                  <th className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-700">
                    Role
                  </th>
                  <th className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-700">
                    Cấp
                  </th>
                  <th className="px-2 py-2 text-center text-[11px] font-bold uppercase text-slate-700">
                    Đang học / Hoàn thành
                  </th>
                  <th className="px-2 py-2 text-center text-[11px] font-bold uppercase text-slate-700">
                    Điểm
                  </th>
                  <th className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-700">
                    Đăng nhập cuối
                  </th>
                  <th className="px-2 py-2 text-center text-[11px] font-bold uppercase text-slate-700">
                    Trạng thái
                  </th>
                  <th className="px-2 py-2 text-right text-[11px] font-bold uppercase text-slate-700">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((user) => {
                  const summary = user.summary || {};
                  const displayName = user.name || user.phone || '—';
                  return (
                    <tr
                      key={user._id}
                      onClick={() => handleRowClick(user)}
                      className="cursor-pointer transition-colors hover:bg-pink-50/40"
                    >
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt=""
                              className="h-8 w-8 shrink-0 rounded-full border border-slate-200 object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-500">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-slate-900">
                              {displayName}
                            </p>
                            {user.passportSerial && (
                              <p className="text-[10px] text-slate-500">
                                {user.passportSerial}
                              </p>
                            )}
                            {user.location && (
                              <p className="truncate text-[10px] text-slate-400">
                                📍 {user.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-[11px] font-mono text-slate-700">
                        {user.phone}
                      </td>
                      <td className="px-2 py-2">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-2 py-2">
                        <TierBadge tier={summary.tier} />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700">
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-700">
                            {summary.coursesInProgress || 0}
                          </span>
                          <span className="text-slate-400">/</span>
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700">
                            {summary.coursesCompleted || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-center text-xs font-bold text-pink-700">
                        {(summary.points || 0).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-2 py-2 text-[11px] text-slate-600">
                        {formatDateTime(user.lastLoginAt)}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <StatusBadge isActive={user.isActive} />
                      </td>
                      <td className="px-2 py-2">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => handleView(user, e)}
                            className="rounded p-1 hover:bg-pink-50"
                            title="Xem chi tiết"
                          >
                            <EyeIcon aria-hidden="true" className="h-3.5 w-3.5 text-pink-600" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(user, e)}
                            className="rounded p-1 hover:bg-red-50"
                            title="Xoá"
                          >
                            <TrashIcon aria-hidden="true" className="h-3.5 w-3.5 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && items.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-md border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Trước
          </button>
          <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-md border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
}
