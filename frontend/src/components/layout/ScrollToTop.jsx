import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop — đảm bảo khi chuyển route, trang mới luôn bắt đầu từ đầu
 * một cách MƯỢT và KHÔNG BỊ NHÁY.
 *
 * Cách hoạt động (phối hợp với PageTransition):
 *  1) useLayoutEffect chạy ĐỒNG BỘ với DOM (trước paint), set scroll về 0
 *     ngay — nên khi trang mới render, viewport đã ở đầu, không bị "nháy"
 *     về cuối trang cũ.
 *  2) PageTransition (AnimatePresence mode="wait") sẽ lo phần hiệu ứng
 *     fade + slide mượt giữa các trang.
 *  3) Dùng requestAnimationFrame để bật lại smooth scroll native sau khi
 *     React đã commit, tránh xung đột với anchor links trong trang.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const isFirstMount = useRef(true);

  useLayoutEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    // Tắt smooth scroll tạm thời để reset scroll ngay (không animation mới)
    const html = document.documentElement;
    const prevScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);

    // Bật lại smooth scroll ở frame tiếp theo — áp dụng cho anchor trong
    // trang mới (ví dụ click "Xem chi tiết" → cuộn tới #section)
    requestAnimationFrame(() => {
      html.style.scrollBehavior = prevScrollBehavior || '';
    });
  }, [pathname]);

  return null;
}
