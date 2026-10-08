import { useState, useEffect } from 'react';
import { ShareIcon, GiftIcon, CirclePlusIcon, XIcon } from '../icons/index.jsx';
import ForumCategoryTabs from './ForumCategoryTabs.jsx';
import ForumPostCard from './ForumPostCard.jsx';
import NewPostModal from './NewPostModal.jsx';
import { FORUM_CATEGORIES } from '../../data/mockForumPosts.js';
import { useForumPostStore } from '../../store/forumPostStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { useLoginDrawerStore } from '../../store/loginDrawerStore.js';

/**
 * Modal diễn đàn cộng đồng
 * Props:
 *   - isOpen: boolean
 *   - onClose: callback đóng modal
 */
export default function ForumModal({ isOpen, onClose }) {
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const { posts, loading, selectedCategory, setCategory, fetchPosts, createPost, likePost } = useForumPostStore();
  const { user } = useAuthStore();
  const { openLoginDrawer } = useLoginDrawerStore();

  // Reset scroll khi mở modal và fetch posts
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchPosts();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fetch lại khi đổi category
  useEffect(() => {
    if (isOpen) {
      fetchPosts();
    }
  }, [selectedCategory]);

  if (!isOpen) return null;

  // Handle Đăng bài button
  const handleNewPostClick = () => {
    if (!user) {
      openLoginDrawer('/');
      return;
    }
    setIsNewPostModalOpen(true);
  };

  // Handle submit new post
  const handleSubmitPost = async (postData) => {
    await createPost(postData);
    setIsNewPostModalOpen(false);
    
    // Show success message
    alert('Bài viết đã gửi! BQT sẽ duyệt trong vòng 24h. ✅');
    
    // Refresh posts
    fetchPosts();
  };

  // Handle like post
  const handleLike = async (postId) => {
    if (!user) {
      openLoginDrawer('/');
      return;
    }
    
    try {
      await likePost(postId);
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setCategory(category);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm animate-in fade-in">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl transition-all md:max-w-3xl lg:max-w-4xl">
        {/* Header gradient */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#E60067] via-[#f72585] to-rose-600 p-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <ShareIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold leading-tight">
                Diễn Đàn Cộng Đồng Loom
              </h3>
              <p className="text-[10px] text-pink-100">
                Chia sẻ kinh nghiệm • 1 bài chất lượng đổi ngay 1 Voucher
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
            aria-label="Đóng"
          >
            <XIcon className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Voucher banner */}
        <div className="flex items-center justify-between gap-2 border-b border-pink-100 bg-pink-50 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <GiftIcon className="h-5 w-5 shrink-0 animate-bounce text-[#E60067]" />
            <p className="text-[11px] font-semibold leading-tight text-pink-950">
              Chia sẻ bí quyết hay! Bài viết chất lượng được duyệt sẽ{' '}
              <strong>thưởng 1 Voucher mua sắm 50K</strong>.
            </p>
          </div>
          <button 
            onClick={handleNewPostClick}
            className="flex shrink-0 items-center gap-1 rounded-xl bg-[#E60067] px-3 py-1.5 text-[11px] font-bold text-white shadow-xs hover:bg-[#c90059]"
          >
            <CirclePlusIcon className="h-3.5 w-3.5" />
            <span>Đăng bài</span>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {/* Category tabs */}
            <ForumCategoryTabs
              categories={FORUM_CATEGORIES}
              activeCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />

            {/* Posts list */}
            <div className="space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-pink-500"></div>
                  <p className="mt-2 text-sm text-slate-500">Đang tải...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                  <p className="text-sm text-slate-500">
                    Chưa có bài viết trong danh mục này.
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <ForumPostCard
                    key={post._id}
                    post={post}
                    onLike={handleLike}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      <NewPostModal
        isOpen={isNewPostModalOpen}
        onClose={() => setIsNewPostModalOpen(false)}
        onSuccess={handleSubmitPost}
      />
    </div>
  );
}
