import { HeartIcon, MessageCircleIcon, AwardIcon } from '../icons/index.jsx';

/**
 * Card bài viết diễn đàn
 * Props:
 *   - post: object bài viết
 *   - onLike: callback khi bấm like
 *   - onClick: callback khi click vào card
 */
export default function ForumPostCard({ post, onLike, onClick }) {
  return (
    <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-pink-200">
      {/* Author row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <img
            alt={post.author.name}
            className="h-10 w-10 rounded-full border border-pink-200 object-cover"
            referrerPolicy="no-referrer"
            src={post.author.avatar}
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80';
            }}
          />
          <div>
            <h4 className="text-xs font-extrabold text-slate-900">
              {post.author.name}
            </h4>
            <p className="text-[10px] text-slate-400">
              {post.author.workplace} • {post.author.location} • {post.timestamp}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
          {post.categoryLabel}
        </span>
      </div>

      {/* Quality badge */}
      {post.isQualityPost && (
        <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-pink-500 to-[#E60067] p-2 text-[11px] font-extrabold text-white shadow-xs">
          <span className="flex items-center gap-1.5">
            <AwardIcon className="h-4 w-4 text-yellow-300" />
            <span>🏆 BÀI VIẾT CHẤT LƯỢNG • ĐÃ THƯỞNG 1 VOUCHER</span>
          </span>
          <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px]">
            {post.voucherCode}
          </span>
        </div>
      )}

      {/* Content */}
      <div>
        <h3 className="text-sm font-extrabold leading-snug text-slate-900">
          {post.title}
        </h3>
        <div 
          className="mt-1 text-xs leading-relaxed text-slate-600 forum-post-content line-clamp-4"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {/* Stats footer */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs font-bold text-slate-500">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike?.(post._id);
          }}
          className={[
            'flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all',
            post.isLiked
              ? 'bg-pink-50 text-[#E60067]'
              : 'text-slate-600 hover:bg-slate-50',
          ].join(' ')}
        >
          <HeartIcon
            className={`h-4 w-4 ${post.isLiked ? 'fill-[#E60067]' : ''}`}
          />
          <span>{post.likes} Thích</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <MessageCircleIcon className="h-4 w-4 text-slate-400" />
            <span>{post.commentsCount} Bình luận</span>
          </span>
        </div>
      </div>

      {/* Comment preview */}
      {post.comments && post.comments.length > 0 && (
        <div className="space-y-1 rounded-xl bg-slate-50 p-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-800">
              {post.comments[0].author}
            </span>
            <span className="text-[10px] text-slate-400">
              {post.comments[0].timestamp}
            </span>
          </div>
          <p className="text-[11px] text-slate-600">{post.comments[0].content}</p>
        </div>
      )}
    </div>
  );
}
