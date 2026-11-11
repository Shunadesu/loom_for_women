/**
 * Tóm tắt nội dung "4 phần" của một bài học.
 *
 * 4 phần:
 *   1. Slide bài giảng  → lesson.slides[]
 *   2. Mô phỏng tình huống → lesson.simulations[]
 *   3. Tóm tắt bài học → lesson.summary (image/pdf/video)
 *   4. Trắc nghiệm tổng kết → lesson.quizzes[]
 *
 * File này chỉ chứa hàm thuần (không phụ thuộc React) để có thể unit-test
 * độc lập, giống `admin/src/components/lessonDraft.js`.
 */

/** Nhãn hiển thị của từng phần. */
export const LESSON_PART_LABELS = {
  slides: 'Slide',
  simulations: 'Mô phỏng',
  summary: 'Tóm tắt',
  quizzes: 'Trắc nghiệm',
};

/** Thứ tự hiển thị 4 phần. */
export const LESSON_PART_KEYS = ['slides', 'simulations', 'summary', 'quizzes'];

/** Phần tóm tắt chỉ "có nội dung" khi có ảnh, PDF hoặc video. */
export function summaryHasContent(summary) {
  if (!summary) return false;
  return Boolean(summary.imageUrl || summary.pdfUrl || summary.videoUrl);
}

/**
 * Chế độ hiển thị Phần 1 của bài học.
 *
 * - 'pdf'    : dùng file PDF slide (nhúng trực tiếp)
 * - 'manual' : dùng danh sách slide thủ công
 *
 * Quy tắc mặc định khi bài học không khai báo `slideMode`:
 * có file PDF slide thì dùng PDF, ngược lại dùng slide thủ công.
 *
 * @param {object} lesson
 * @returns {'pdf'|'manual'}
 */
export function resolveSlideMode(lesson) {
  const mode = String(lesson?.slideMode || '').trim().toLowerCase();
  if (mode === 'manual') return 'manual';
  // 'pdf' nhưng không có file nào → dùng slide thủ công.
  if (mode === 'pdf') return lesson?.slidePdfUrl ? 'pdf' : 'manual';
  if (lesson?.slidePdfUrl) return 'pdf';
  return 'manual';
}

/**
 * Tóm tắt 4 phần của bài học.
 * @returns {Array<{key,label,count,available}>}
 */
export function getLessonParts(lesson) {
  const slides = Array.isArray(lesson?.slides) ? lesson.slides : [];
  const simulations = Array.isArray(lesson?.simulations) ? lesson.simulations : [];
  const quizzes = Array.isArray(lesson?.quizzes) ? lesson.quizzes : [];
  const hasSummary = summaryHasContent(lesson?.summary);

  // Phần 1: dùng PDF slide (nhúng) hoặc danh sách slide thủ công
  const slideMode = resolveSlideMode(lesson);
  const hasSlidePdf = slideMode === 'pdf' && Boolean(lesson?.slidePdfUrl);
  const slidesAvailable = slides.length > 0 || hasSlidePdf;
  const slidesCount = slides.length > 0 ? slides.length : hasSlidePdf ? 1 : 0;

  return [
    {
      key: 'slides',
      label: LESSON_PART_LABELS.slides,
      count: slidesCount,
      available: slidesAvailable,
      mode: slideMode,
      isPdf: hasSlidePdf,
    },
    {
      key: 'simulations',
      label: LESSON_PART_LABELS.simulations,
      count: simulations.length,
      available: simulations.length > 0,
    },
    {
      key: 'summary',
      label: LESSON_PART_LABELS.summary,
      count: hasSummary ? 1 : 0,
      available: hasSummary,
    },
    { key: 'quizzes', label: LESSON_PART_LABELS.quizzes, count: quizzes.length, available: quizzes.length > 0 },
  ];
}

/** Bài học có nội dung 4 phần hay không. */
export function hasStructuredContent(lesson) {
  return getLessonParts(lesson).some((p) => p.available);
}

/** Số phần trong 4 phần đã có nội dung (0–4). */
export function countAvailableParts(lesson) {
  return getLessonParts(lesson).filter((p) => p.available).length;
}

/**
 * Chuỗi tóm tắt ngắn gọn, ví dụ "4 slide • 1 mô phỏng • 1 câu hỏi".
 * @param {object} lesson
 * @param {object} [options]
 * @param {boolean} [options.withSummary=true] - Có đưa phần tóm tắt vào chuỗi.
 */
export function summarizeLessonParts(lesson, options = {}) {
  const { withSummary = true } = options;
  const parts = getLessonParts(lesson);
  const chunks = [];

  const slides = parts.find((p) => p.key === 'slides');
  if (slides?.available) {
    chunks.push(slides.isPdf ? 'PDF slide' : `${slides.count} slide`);
  }

  const simulations = parts.find((p) => p.key === 'simulations');
  if (simulations?.available) {
    chunks.push(`${simulations.count} mô phỏng`);
  }

  if (withSummary) {
    const summary = parts.find((p) => p.key === 'summary');
    if (summary?.available) chunks.push('có tóm tắt');
  }

  const quizzes = parts.find((p) => p.key === 'quizzes');
  if (quizzes?.available) {
    chunks.push(`${quizzes.count} câu hỏi`);
  }

  return chunks.join(' • ');
}
