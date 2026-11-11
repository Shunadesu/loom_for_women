/**
 * Kiểm tra helper 4 phần của frontend (không cần trình duyệt):
 *   - getLessonParts: đếm & đánh dấu 4 phần của bài học
 *   - hasStructuredContent: bài học có nội dung 4 phần hay không
 *   - countAvailableParts: số phần đã có nội dung (0–4)
 *   - summarizeLessonParts: chuỗi tóm tắt
 *
 * Chạy: node scripts/testFrontendLessonParts.js
 */
import {
  getLessonParts,
  hasStructuredContent,
  countAvailableParts,
  summarizeLessonParts,
  summaryHasContent,
  resolveSlideMode,
} from '../../frontend/src/utils/lessonParts.js';

let failed = 0;
const assert = (label, cond) => {
  if (!cond) failed += 1;
  console.log(`${cond ? '  ✓' : '  ✗'} ${label}${cond ? '' : '  <<< FAIL'}`);
};

const byKey = (parts, key) => parts.find((p) => p.key === key);

// ─── Bài học rỗng ───
console.log('[1] Bài học không có nội dung');
const empty = getLessonParts({});
assert('Có đúng 4 phần', empty.length === 4);
assert('Thứ tự đúng', empty.map((p) => p.key).join(',') === 'slides,simulations,summary,quizzes');
assert('Không phần nào available', empty.every((p) => !p.available));
assert('hasStructuredContent = false', hasStructuredContent({}) === false);
assert('countAvailableParts = 0', countAvailableParts({}) === 0);
assert('summarize rỗng', summarizeLessonParts({}) === '');

// ─── Bài học đủ 4 phần (khớp với dữ liệu thật) ───
console.log('\n[2] Bài học có đủ 4 phần');
const full = {
  slides: [{ title: 'S1' }, { title: 'S2' }, { title: 'S3' }, { title: 'S4' }],
  simulations: [{ videoUrl: 'https://youtu.be/x' }],
  summary: { imageUrl: '/uploads/summary.png', pdfUrl: '/uploads/summary.pdf' },
  quizzes: [{ question: 'Q1' }],
};
const fullParts = getLessonParts(full);
assert('Slide count = 4', byKey(fullParts, 'slides').count === 4);
assert('Slide available', byKey(fullParts, 'slides').available === true);
assert('Mô phỏng count = 1', byKey(fullParts, 'simulations').count === 1);
assert('Mô phỏng available', byKey(fullParts, 'simulations').available === true);
assert('Tóm tắt available', byKey(fullParts, 'summary').available === true);
assert('Trắc nghiệm count = 1', byKey(fullParts, 'quizzes').count === 1);
assert('Trắc nghiệm available', byKey(fullParts, 'quizzes').available === true);
assert('hasStructuredContent = true', hasStructuredContent(full) === true);
assert('countAvailableParts = 4', countAvailableParts(full) === 4);
assert(
  'Tóm tắt chuỗi đầy đủ',
  summarizeLessonParts(full) === '4 slide • 1 mô phỏng • có tóm tắt • 1 câu hỏi'
);

// ─── Bài học chỉ có một phần ───
console.log('\n[3] Bài học chỉ có slide');
const slideOnly = { slides: [{ title: 'S1' }] };
assert('hasStructuredContent = true', hasStructuredContent(slideOnly) === true);
assert('countAvailableParts = 1', countAvailableParts(slideOnly) === 1);
assert('Chuỗi chỉ có slide', summarizeLessonParts(slideOnly) === '1 slide');

// ─── Tóm tắt rỗng không tính là có nội dung ───
console.log('\n[4] Tóm tắt rỗng');
assert('summaryHasContent({}) = false', summaryHasContent({}) === false);
assert('summaryHasContent(null) = false', summaryHasContent(null) === false);
assert(
  'summaryHasContent({imageUrl}) = true',
  summaryHasContent({ imageUrl: '/a.png' }) === true
);
assert(
  'summaryHasContent({pdfUrl}) = true',
  summaryHasContent({ pdfUrl: '/a.pdf' }) === true
);
assert(
  'summaryHasContent({videoUrl}) = true',
  summaryHasContent({ videoUrl: 'https://youtu.be/x' }) === true
);
const emptySummary = { slides: [{ title: 'S1' }], summary: { title: 'Không có gì' } };
assert('Tóm tắt rỗng → không available', byKey(getLessonParts(emptySummary), 'summary').available === false);

// ─── Dữ liệu thiếu / sai kiểu ───
console.log('\n[5] Dữ liệu thiếu hoặc sai kiểu');
const broken = { slides: null, simulations: undefined, quizzes: 'abc' };
const brokenParts = getLessonParts(broken);
assert('Không crash', brokenParts.length === 4);
assert('Slide count = 0', byKey(brokenParts, 'slides').count === 0);
assert('Mô phỏng count = 0', byKey(brokenParts, 'simulations').count === 0);
assert('Trắc nghiệm count = 0', byKey(brokenParts, 'quizzes').count === 0);
assert('hasStructuredContent(null) = false', hasStructuredContent(null) === false);
assert('countAvailableParts(null) = 0', countAvailableParts(null) === 0);

// ─── Phần 1 dùng file PDF slide ───
console.log('\n[6] Phần 1 dùng file PDF slide');
assert('Không PDF, không slide → manual', resolveSlideMode({}) === 'manual');
assert(
  'Có slidePdfUrl (auto) → pdf',
  resolveSlideMode({ slidePdfUrl: '/uploads/lessons/a.pdf' }) === 'pdf'
);
assert(
  'slideMode=manual ghi đè (có PDF)',
  resolveSlideMode({ slideMode: 'manual', slidePdfUrl: '/a.pdf' }) === 'manual'
);
assert(
  'slideMode=pdf ghi đè (không PDF)',
  resolveSlideMode({ slideMode: 'pdf' }) === 'pdf'
);

const pdfLesson = {
  slidePdfUrl: '/uploads/lessons/a.pdf',
  slidePdfTitle: 'Slide Cẩm nang',
  quizzes: [{ question: 'Q1' }],
};
const pdfParts = getLessonParts(pdfLesson);
assert('Phần slide available (có PDF)', byKey(pdfParts, 'slides').available === true);
assert('Phần slide đánh dấu isPdf', byKey(pdfParts, 'slides').isPdf === true);
assert('Phần slide count = 1', byKey(pdfParts, 'slides').count === 1);
assert('hasStructuredContent = true', hasStructuredContent(pdfLesson) === true);
assert('countAvailableParts = 2', countAvailableParts(pdfLesson) === 2);
assert(
  'Chuỗi ghi "PDF slide"',
  summarizeLessonParts(pdfLesson) === 'PDF slide • 1 câu hỏi'
);

// Bài học có cả PDF lẫn slide thủ công → PDF ưu tiên
const bothLesson = {
  slidePdfUrl: '/uploads/lessons/a.pdf',
  slides: [{ title: 'S1' }, { title: 'S2' }],
};
assert(
  'Có cả PDF và slide → vẫn ưu tiên PDF',
  resolveSlideMode(bothLesson) === 'pdf' && byKey(getLessonParts(bothLesson), 'slides').isPdf === true
);

// Chế độ thủ công dù PDF vẫn còn → dùng slide tay
const manualLesson = {
  slideMode: 'manual',
  slidePdfUrl: '/uploads/lessons/a.pdf',
  slides: [{ title: 'S1' }],
};
assert(
  'slideMode=manual → dùng slide thủ công',
  byKey(getLessonParts(manualLesson), 'slides').isPdf === false &&
    byKey(getLessonParts(manualLesson), 'slides').count === 1
);

console.log('\n' + (failed === 0 ? '✅ TẤT CẢ KIỂM TRA PASS' : `❌ ${failed} KIỂM TRA FAIL`));
process.exit(failed === 0 ? 0 : 1);
