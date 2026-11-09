/**
 * Kiểm tra logic của form Admin (không cần trình duyệt):
 *   - draftToFormData đóng gói đủ 4 phần + media
 *   - missingParts đánh dấu phần còn thiếu
 *   - lessonToDraft chuyển dữ liệu server → nháp
 * Chạy: node scripts/testAdminFormLogic.js
 */
import 'dotenv/config';
import {
  createLessonDraft,
  lessonToDraft,
  draftToFormData,
  missingParts,
} from '../../admin/src/components/lessonDraft.js';

let failed = 0;
const assert = (label, cond) => {
  if (!cond) failed += 1;
  console.log(`${cond ? '  ✓' : '  ✗'} ${label}${cond ? '' : '  <<< FAIL'}`);
};

// ─── Bản nháp rỗng → thiếu cả 4 phần ───
console.log('[1] Bản nháp mới');
const empty = createLessonDraft();
assert('Có key & id=null', Boolean(empty.key) && empty.id === null);
assert('Thiếu đủ 4 phần', missingParts(empty).length === 4);
console.log(`    Thiếu: ${missingParts(empty).join(', ')}`);

// ─── Đóng gói FormData ───
console.log('\n[2] draftToFormData đóng gói đủ 4 phần');
const draft = createLessonDraft('video');
draft.title = 'Bài 1: Test';
draft.durationSeconds = 600;
draft.knowledgeTitle = 'Kiến thức';
draft.knowledgeContent = 'Nội dung chi tiết';
draft.slidePdfTitle = 'Slide PDF';
draft.slides = [
  { title: 'Slide 1', content: 'a', bullets: ['x'] },
  { title: 'Slide 2', content: 'b', bullets: [] },
];
draft.simulation = {
  videoUrl: 'https://youtu.be/abc',
  description: 'Mô tả',
  statement: 'Phát biểu',
  isCorrect: false,
};
draft.summary = {
  format: 'pdf_video',
  imageUrl: 'https://img/1.png',
  videoUrl: 'https://youtu.be/xyz',
  title: 'Tóm tắt',
};
draft.quizzes = [
  { question: 'C1', options: { A: 'a', B: 'b', C: 'c', D: 'd' }, correct: 'B', type: 'single' },
  { question: 'C2', options: { A: 'Đúng', B: 'Sai' }, correct: 'A', type: 'true_false' },
];
draft.videoUrl = 'https://youtu.be/dQw4w9WgXcQ';

const fd = draftToFormData(draft, 0);
const get = (k) => fd.get(k);

assert('title', get('title') === 'Bài 1: Test');
assert('contentType', get('contentType') === 'video');
assert('durationSeconds', get('durationSeconds') === '600');
assert('order', get('order') === '0');
assert('knowledgeTitle', get('knowledgeTitle') === 'Kiến thức');
assert('knowledgeContent', get('knowledgeContent') === 'Nội dung chi tiết');
assert('slidePdfTitle', get('slidePdfTitle') === 'Slide PDF');
assert('videoUrl', get('videoUrl') === 'https://youtu.be/dQw4w9WgXcQ');
assert('summaryImage file chưa chọn → không append', !fd.has('summaryImage'));
assert('pdf file chưa chọn → không append', !fd.has('pdf'));

const slides = JSON.parse(get('slides'));
assert(`slides có 2 phần tử (${slides.length})`, slides.length === 2);
assert('slide giữ bullets', slides[0].bullets.length === 1);

const sims = JSON.parse(get('simulations'));
assert(`simulations có 1 phần tử (${sims.length})`, sims.length === 1);
assert('simulation giữ isCorrect=false', sims[0].isCorrect === false);

const summary = JSON.parse(get('summary'));
assert(`summary giữ format (${summary.format})`, summary.format === 'pdf_video');
assert('summary giữ imageUrl', summary.imageUrl === 'https://img/1.png');

const quizzes = JSON.parse(get('quizzes'));
assert(`quizzes có 2 câu (${quizzes.length})`, quizzes.length === 2);
assert('câu 2 giữ type=true_false', quizzes[1].type === 'true_false');
assert('câu 2 giữ đáp án A', quizzes[1].correct === 'A');

// ─── Không có mô phỏng → simulations = [] ───
console.log('\n[3] Bài học không có mô phỏng');
const d2 = createLessonDraft();
d2.title = 'Bài không mô phỏng';
d2.simulation = { videoUrl: '', description: '', statement: '', isCorrect: false };
const sims2 = JSON.parse(draftToFormData(d2, 0).get('simulations'));
assert(`simulations rỗng (${sims2.length})`, sims2.length === 0);

// ─── Thiếu trắc nghiệm → vẫn còn 3 phần ───
console.log('\n[4] Đánh dấu phần thiếu');
const d3 = createLessonDraft();
d3.slides = [{ title: 'S1' }];
d3.simulation = { videoUrl: 'https://youtu.be/x', description: '', statement: '' };
d3.summary = { imageUrl: 'https://img/a.png' };
const miss3 = missingParts(d3);
assert(`Thiếu đúng 1 phần (${miss3.join(',')})`, miss3.length === 1 && miss3[0] === 'trắc nghiệm');

// ─── lessonToDraft ───
console.log('\n[5] lessonToDraft từ dữ liệu server');
const serverLesson = {
  _id: 'abc123',
  title: 'Bài server',
  contentType: 'video',
  durationSeconds: 120,
  youtubeId: 'dQw4w9WgXcQ',
  videoProvider: 'youtube',
  knowledgeTitle: 'KT',
  knowledgeContent: 'ND',
  slidePdfUrl: '/uploads/lessons/s.pdf',
  slidePdfName: 's.pdf',
};
const content = {
  slides: [{ title: 'S1', content: 'c', bullets: ['b'] }],
  quizzes: [{ question: 'Q1', options: { A: 'a', B: 'b' }, correct: 'A', type: 'single' }],
  simulations: [{ videoUrl: 'https://youtu.be/z', description: 'd', statement: 's', isCorrect: true }],
  summary: { format: 'pdf', imageUrl: 'https://img/b.png', title: 'T' },
};
const back = lessonToDraft(serverLesson, content);
assert('id giữ nguyên', back.id === 'abc123');
assert('title giữ nguyên', back.title === 'Bài server');
assert('knowledgeTitle giữ nguyên', back.knowledgeTitle === 'KT');
assert('slidePdfUrl giữ nguyên', back.slidePdfUrl === '/uploads/lessons/s.pdf');
assert('videoUrl dựng lại từ youtubeId', back.videoUrl.includes('dQw4w9WgXcQ'));
assert('slides nạp đủ', back.slides.length === 1);
assert('quizzes nạp đủ', back.quizzes.length === 1);
assert('simulation nạp đủ', back.simulation.videoUrl === 'https://youtu.be/z');
assert('summary nạp đủ', back.summary.imageUrl === 'https://img/b.png');
assert('Không còn thiếu phần nào', missingParts(back).length === 0);

// Round-trip: draft → FormData → parse → giống draft
const fd2 = draftToFormData(back, 3);
assert('order giữ vị trí', fd2.get('order') === '3');
assert(
  `slides round-trip (${JSON.parse(fd2.get('slides')).length})`,
  JSON.parse(fd2.get('slides')).length === 1
);
assert(
  `quizzes round-trip (${JSON.parse(fd2.get('quizzes')).length})`,
  JSON.parse(fd2.get('quizzes')).length === 1
);

console.log(`\n${failed === 0 ? '✅ TẤT CẢ KIỂM TRA PASS' : `❌ ${failed} KIỂM TRA THẤT BẠI`}`);
process.exit(failed === 0 ? 0 : 1);
