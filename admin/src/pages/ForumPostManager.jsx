import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchForumPostsAdmin,
  approveForumPost,
  rejectForumPost,
  markQualityPost,
  deleteForumPost,
} from '../services/forumPostApi.js';
import {
  EditIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
  AwardIcon,
  EyeIcon,
} from '../components/icons.jsx';

const TABS = [
  { id: 'pending', label: 'Chờ duyệt', color: 'yellow' },
  { id: 'approved', label: 'Đã duyệt', color: 'green' },
  { id: 'rejected', label: 'Đã từ chối', color: 'red' },
];

const CATEGORY_LABELS = {
  'income-tips': 'Mẹo thu nhập phụ',
  'scam-warning': 'Cảnh báo lừa đảo',
  'learning-tips': 'Kinh nghiệm học tập',
};

export default function ForumPostManager() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qualityModalOpen, setQualityModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [activeTab]);

  async function loadPosts() {
    setLoading(true);
    try {
      const data = await fetchForumPostsAdmin(activeTab);
      setPosts(data);
    } catch (err) {
      alert('Không tải được danh sách bài viết.');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(post) {
    if (!confirm(`Duyệt bài "${post.title}"?`)) return;
    try {
      await approveForumPost(post._id);
      loadPosts();
    } catch (err) {
      alert(err?.response?.data?.error || 'Duyệt thất bại.');
    }
  }

  async function handleReject(post) {
    if (!confirm(`Từ chối bài "${post.title}"?`)) return;
    try {
      await rejectForumPost(post._id);
      loadPosts();
    } catch (err) {
      alert(err?.response?.data?.error || 'Từ chối thất bại.');
    }
  }

  async function handleDelete(post) {
    if (!confirm(`Xóa bài "${post.title}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await deleteForumPost(post._id);
      setPosts(posts.filter((p) => p._id !== post._id));
    } catch (err) {
      alert(err?.response?.data?.error || 'Xóa thất bại.');
    }
  }

  function openQualityModal(post) {
    setSelectedPost(post);
    setVoucherCode(post.voucherCode || '');
    setQualityModalOpen(true);
  }

  async function handleMarkQuality(isQuality) {
    if (!selectedPost) return;
    
    try {
      await markQualityPost(selectedPost._id, isQuality, isQuality ? voucherCode : null);
      setQualityModalOpen(false);
      setSelectedPost(null);
      setVoucherCode('');
      loadPosts();
    } catch (err) {
      alert(err?.response?.data?.error || 'Cập nhật thất bại.');
    }
  }

  function openPreviewModal(post) {
    setSelectedPost(post);
    setPreviewModalOpen(true);
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quản lý Diễn đàn</h1>
        <p className="mt-1 text-sm text-slate-500">
          Duyệt bài viết và đánh dấu bài chất lượng
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {TABS.map((tab) => {
          const count = posts.length;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'relative px-4 py-2.5 text-sm font-semibold transition-colors',
                isActive
                  ? 'text-pink-600'
                  : 'text-slate-600 hover:text-slate-900',
              ].join(' ')}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && count > 0 && (
                <span className="ml-2 rounded-full bg-pink-100 px-2 py-0.5 text-xs font-bold text-pink-700">
                  {count}
                </span>
              )}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-pink-500" />
          <p className="mt-3 text-sm text-slate-500">Đang tải...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-sm text-slate-500">
            Không có bài viết nào trong tab này.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                    Tiêu đề
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                    Tác giả
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                    Danh mục
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                    Ngày đăng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <p className="text-sm font-semibold text-slate-900 line-clamp-2">
                          {post.title}
                        </p>
                        {post.isQualityPost && (
                          <div className="mt-1 flex items-center gap-1 text-xs font-bold text-yellow-600">
                            <AwardIcon className="h-3 w-3" />
                            <span>Chất lượng</span>
                            {post.voucherCode && (
                              <span className="rounded bg-yellow-100 px-1.5 py-0.5">
                                {post.voucherCode}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={post.author?.avatar}
                          alt=""
                          className="h-8 w-8 rounded-full border border-slate-200"
                        />
                        <div className="text-xs">
                          <p className="font-semibold text-slate-900">
                            {post.author?.name || 'N/A'}
                          </p>
                          <p className="text-slate-500">{post.author?.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {CATEGORY_LABELS[post.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openPreviewModal(post)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                          title="Xem nội dung"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        
                        {post.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(post)}
                              className="rounded-lg border border-green-200 bg-green-50 p-1.5 text-green-600 hover:bg-green-100"
                              title="Duyệt"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(post)}
                              className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                              title="Từ chối"
                            >
                              <XIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        
                        {post.status === 'approved' && (
                          <button
                            onClick={() => openQualityModal(post)}
                            className="rounded-lg border border-yellow-200 bg-yellow-50 p-1.5 text-yellow-600 hover:bg-yellow-100"
                            title="Đánh dấu chất lượng"
                          >
                            <AwardIcon className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDelete(post)}
                          className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                          title="Xóa"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quality Modal */}
      {qualityModalOpen && selectedPost && (
        <QualityModal
          post={selectedPost}
          voucherCode={voucherCode}
          onVoucherChange={setVoucherCode}
          onSave={handleMarkQuality}
          onClose={() => {
            setQualityModalOpen(false);
            setSelectedPost(null);
            setVoucherCode('');
          }}
        />
      )}

      {/* Preview Modal */}
      {previewModalOpen && selectedPost && (
        <PreviewModal
          post={selectedPost}
          onClose={() => {
            setPreviewModalOpen(false);
            setSelectedPost(null);
          }}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    pending: { label: 'Chờ duyệt', color: 'yellow' },
    approved: { label: 'Đã duyệt', color: 'green' },
    rejected: { label: 'Đã từ chối', color: 'red' },
  };
  const { label, color } = config[status] || config.pending;

  return (
    <span
      className={[
        'inline-block rounded-full px-2.5 py-1 text-xs font-semibold',
        color === 'yellow' && 'bg-yellow-100 text-yellow-700',
        color === 'green' && 'bg-green-100 text-green-700',
        color === 'red' && 'bg-red-100 text-red-700',
      ].join(' ')}
    >
      {label}
    </span>
  );
}

function QualityModal({ post, voucherCode, onVoucherChange, onSave, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">
            Đánh dấu bài chất lượng
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {post.title}
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Mã Voucher thưởng
            </label>
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => onVoucherChange(e.target.value)}
              placeholder="VD: VOUCHER-50K-COOP"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
            />
          </div>
          
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-3 text-xs text-yellow-800">
            <p><strong>Lưu ý:</strong> Bài được đánh dấu chất lượng sẽ hiển thị badge vàng và mã voucher cho tác giả.</p>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
          {post.isQualityPost && (
            <button
              onClick={() => onSave(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Bỏ đánh dấu
            </button>
          )}
          <button
            onClick={() => onSave(true)}
            className="rounded-xl bg-yellow-500 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-600"
          >
            Đánh dấu chất lượng
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewModal({ post, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            Xem trước nội dung
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6 space-y-4 max-h-[calc(90vh-140px)]">
          <div>
            <h4 className="text-xl font-bold text-slate-900">{post.title}</h4>
            <p className="mt-1 text-sm text-slate-500">
              Danh mục: {CATEGORY_LABELS[post.category]}
            </p>
          </div>
          
          <div 
            className="prose prose-sm max-w-none forum-post-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
        
        <div className="border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
