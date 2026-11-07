import api from './api.js';

/**
 * Gửi 1 lượt xem trang lên backend.
 * Fire-and-forget: lỗi tracking không được ảnh hưởng trải nghiệm người dùng.
 */
export const trackVisit = ({
  path,
  pageType = 'other',
  courseId = null,
  sessionId = '',
  referrer = '',
} = {}) =>
  api
    .post('/visits', {
      path,
      pageType,
      courseId,
      sessionId,
      referrer,
    })
    .catch(() => {});
