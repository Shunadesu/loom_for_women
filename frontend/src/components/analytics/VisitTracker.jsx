import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useCourseStore } from '../../store/courseStore.js';
import { trackVisit } from '../../services/visitApi.js';
import { getVisitorId, resolvePageType } from '../../utils/visitTracker.js';

const COURSE_DETAIL_TIMEOUT_MS = 5000;

/**
 * VisitTracker — ghi nhận lượt xem trang mỗi khi người dùng chuyển route.
 *
 * Luồng:
 *  - Trang thường → gửi ngay.
 *  - Trang chi tiết khóa học → chờ `detailCache` để gắn đúng `courseId`.
 *    Trong lúc chờ, lượt xem được "treo" (pending) và sẽ được gửi khi:
 *      (a) cache khóa học nạp xong, hoặc
 *      (b) hết 5s, hoặc
 *      (c) người dùng rời trang (flush ở effect của pathname kế tiếp).
 *    Nhờ (c) lượt xem không bị mất khi user chuyển trang trước khi dữ liệu tải xong.
 *
 * Chống đếm trùng: `startedRef` lưu pathname vừa bắt đầu theo dõi.
 * - React StrictMode gọi effect 2 lần liên tiếp → lần 2 bị bỏ qua.
 * - Điều hướng A → B → A vẫn ghi nhận lại A (vì pathname vừa xử lý là B).
 */
export default function VisitTracker() {
  const location = useLocation();
  const detailCache = useCourseStore((s) => s.detailCache);

  // pathname vừa được bắt đầu theo dõi (chống StrictMode đếm trùng)
  const startedRef = useRef(null);
  // lượt xem đang chờ courseId: { pathname, pageType, slug, timer }
  const pendingRef = useRef(null);

  /** Gửi 1 lượt xem. Nếu đã gửi pathname này rồi thì bỏ qua. */
  const send = (entry, courseId) => {
    if (!entry || entry.sent) return;
    entry.sent = true;
    trackVisit({
      path: entry.pathname,
      pageType: entry.pageType,
      courseId: courseId || null,
      sessionId: getVisitorId(),
      referrer: typeof document !== 'undefined' ? document.referrer || '' : '',
    });
  };

  /** Gửi lượt xem đang treo (kèm courseId nếu cache đã có). */
  const flush = () => {
    const entry = pendingRef.current;
    if (!entry) return;
    pendingRef.current = null;
    if (entry.timer) clearTimeout(entry.timer);
    const cached = entry.slug ? detailCache[entry.slug] : null;
    send(entry, cached?.course?._id || null);
  };

  // 1) Theo dõi pathname hiện tại
  useEffect(() => {
    const pathname = location.pathname;

    // StrictMode gọi effect 2 lần → lần 2 bỏ qua
    if (startedRef.current === pathname) return undefined;
    startedRef.current = pathname;

    // Đang treo lượt xem của trang trước → gửi nốt (không bị mất lượt xem)
    flush();

    const pageType = resolvePageType(pathname);
    const slug = pathname.split('/').filter(Boolean)[1] || '';

    // Trang thường — gửi ngay
    if (pageType !== 'course_detail') {
      send({ pathname, pageType, sent: false }, null);
      return undefined;
    }

    // Trang chi tiết khóa học — treo lượt xem chờ courseId
    const entry = { pathname, pageType, slug, sent: false };
    const cached = detailCache[slug];
    if (cached?.course?._id) {
      send(entry, cached.course._id);
      return undefined;
    }

    // Timeout dự phòng: quá 5s không có dữ liệu thì gửi không kèm courseId
    entry.timer = setTimeout(() => {
      if (pendingRef.current === entry) {
        pendingRef.current = null;
        send(entry, null);
      }
    }, COURSE_DETAIL_TIMEOUT_MS);
    pendingRef.current = entry;

    return undefined;
  }, [location.pathname, detailCache]);

  // 2) Cache khóa học vừa nạp xong → gửi lượt xem đang treo kèm courseId
  useEffect(() => {
    const entry = pendingRef.current;
    if (!entry || !entry.slug) return;
    const cached = detailCache[entry.slug];
    if (cached?.course?._id) {
      pendingRef.current = null;
      if (entry.timer) clearTimeout(entry.timer);
      send(entry, cached.course._id);
    }
  }, [detailCache]);

  return null;
}
