import { PlusIcon } from '../../components/icons/index.jsx';
import { useNotification } from '../../store/notificationStore.js';

export default function PostProductBanner() {
  const { notify } = useNotification();

  function handleClick() {
    notify({ type: 'info', title: 'Sắp ra mắt', message: 'Tính năng đăng bài sắp ra mắt.' });
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 px-4 py-3 text-white shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
        <PlusIcon aria-hidden="true" className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-extrabold">Bạn có sản phẩm handmade?</p>
        <p className="text-[11px] text-white/90">
          Đăng bài ngay để tiếp cận cộng đồng Loom for Women
        </p>
      </div>
      <button
        type="button"
        onClick={handleClick}
        className="rounded-full bg-white px-4 py-1.5 text-xs font-extrabold text-[#E60067] shadow-xs transition-transform hover:scale-105"
      >
        Đăng bài
      </button>
    </div>
  );
}