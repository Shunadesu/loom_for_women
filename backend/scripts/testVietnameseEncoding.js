/**
 * Kiểm tra vòng tròn encoding tiếng Việt qua đúng đường đi của Admin UI.
 *
 * Admin gửi FormData (multipart/form-data) → multer → Express → Mongoose.
 * Script này dùng FormData + fetch của Node (giống hệt trình duyệt) để:
 *   1. Tạo khóa học có tiêu đề tiếng Việt đầy đủ dấu.
 *   2. Tạo bài học 4 phần với tiêu đề / slide / mô phỏng / tóm tắt / quiz tiếng Việt.
 *   3. Đọc lại từ DB và từ API công khai → so khớp CHÍNH XÁC từng ký tự.
 *   4. Dọn dẹp (xoá khóa học).
 *
 * Chạy: node scripts/testVietnameseEncoding.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import Course from '../src/models/Course.js';
import Lesson from '../src/models/Lesson.js';
import LessonSlide from '../src/models/LessonSlide.js';
import LessonQuiz from '../src/models/LessonQuiz.js';
import LessonSimulation from '../src/models/LessonSimulation.js';
import LessonSummary from '../src/models/LessonSummary.js';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3010';
const ADMIN_PHONE = process.env.TEST_ADMIN_PHONE || '0912345678';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'admin123';

let failed = 0;
const assert = (label, cond) => {
  if (!cond) failed += 1;
  console.log(`${cond ? '  ✓' : '  ✗'} ${label}${cond ? '' : '  <<< FAIL'}`);
};

// Chuỗi thử nghiệm: đủ dấu tiếng Việt + ký tự đặc biệt
const T = {
  courseTitle: 'Khóa học kiểm tra tiếng Việt: ĐẶNG ĐƯỜNG Ốc & Việt',
  lessonTitle: 'Bài 1: Cầm kim móc & tạo mũi móc xích cơ bản',
  knowledgeTitle: 'Kiến thức nền tảng về an toàn lao động nữ',
  slideTitle: '1. Tổng quan & Khái niệm: Cầm kim móc',
  slideContent: 'Bản slide bài giảng chuẩn hóa — trực quan, cô đọng, dễ tiếp thu.',
  bullet: 'Góc quay cận cảnh thao tác ngón tay, dùng len cotton milk dễ bắt đầu.',
  simDesc: 'Mô phỏng tình huống người lao động bị lừa đảo trong khu công nghiệp.',
  simStatement: 'Phát biểu này là đúng về nguyên tắc an toàn khi dùng ứng dụng ngân hàng.',
  summaryTitle: 'Infographic tổng kết: 3 KHÔNG cần nhớ',
  question: 'Trong 3 NGUYÊN TẮC an toàn số, hành động nào sau đây là ĐÚNG?',
  optionA: 'Không chia sẻ mã OTP cho bất kỳ ai',
  optionB: 'Chuyển tiền trước khi nhận hàng',
};

const login = async () => {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: ADMIN_PHONE, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Đăng nhập thất bại: ${res.status}`);
  return (await res.json()).token;
};

(async () => {
  const token = await login();
  console.log('✓ Đăng nhập admin\n');

  const slug = `vn-encoding-test-${Date.now()}`;

  // ─── 1. Tạo khóa học (multipart, giống Admin UI) ───
  console.log('[1] Tạo khóa học tiếng Việt qua FormData');
  const courseForm = new FormData();
  courseForm.append('title', T.courseTitle);
  courseForm.append('description', 'Mô tả khóa học kiểm tra encoding tiếng Việt đầy đủ dấu.');
  courseForm.append('category', 'An toàn lao động');
  courseForm.append('thumbnail', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f');

  const courseRes = await fetch(`${BASE}/api/admin/courses`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: courseForm,
  });
  const courseJson = await courseRes.json();
  assert('Tạo khóa học thành công', courseRes.ok);
  const courseId = courseJson.course._id;

  // ─── 2. Tạo bài học 4 phần (multipart, giống Admin UI) ───
  console.log('\n[2] Tạo bài học 4 phần tiếng Việt qua FormData');
  const lessonForm = new FormData();
  lessonForm.append('title', T.lessonTitle);
  lessonForm.append('contentType', 'video');
  lessonForm.append('durationSeconds', '600');
  lessonForm.append('knowledgeTitle', T.knowledgeTitle);
  lessonForm.append(
    'slides',
    JSON.stringify([
      { title: T.slideTitle, content: T.slideContent, bullets: [T.bullet] },
    ])
  );
  lessonForm.append(
    'simulations',
    JSON.stringify([{ videoUrl: '', description: T.simDesc, statement: T.simStatement, isCorrect: true }])
  );
  lessonForm.append(
    'summary',
    JSON.stringify({ format: 'pdf', imageUrl: '', videoUrl: '', title: T.summaryTitle })
  );
  lessonForm.append(
    'quizzes',
    JSON.stringify([
      {
        question: T.question,
        options: { A: T.optionA, B: T.optionB, C: 'Tuỳ chọn C', D: 'Tuỳ chọn D' },
        correct: 'A',
        type: 'single',
      },
    ])
  );

  const lessonRes = await fetch(`${BASE}/api/admin/courses/${courseId}/lessons`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: lessonForm,
  });
  const lessonJson = await lessonRes.json();
  assert('Tạo bài học thành công', lessonRes.ok);
  const lessonId = lessonJson.lesson._id;

  // ─── 3. Đọc lại từ DB ───
  console.log('\n[3] Đối chiếu dữ liệu trong MongoDB');
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);

  const courseDoc = await Course.findById(courseId).lean();
  assert('Tiêu đề khóa học khớp tuyệt đối', courseDoc.title === T.courseTitle);
  assert('Mô tả khóa học khớp tuyệt đối', courseDoc.description === 'Mô tả khóa học kiểm tra encoding tiếng Việt đầy đủ dấu.');

  const lessonDoc = await Lesson.findById(lessonId).lean();
  assert('Tiêu đề bài học khớp tuyệt đối', lessonDoc.title === T.lessonTitle);
  assert('knowledgeTitle khớp tuyệt đối', lessonDoc.knowledgeTitle === T.knowledgeTitle);

  const slideDoc = await LessonSlide.findOne({ lessonId }).lean();
  assert('Tiêu đề slide khớp tuyệt đối', slideDoc.title === T.slideTitle);
  assert('Nội dung slide khớp tuyệt đối', slideDoc.content === T.slideContent);
  assert('Bullet slide khớp tuyệt đối', slideDoc.bullets[0] === T.bullet);

  const simDoc = await LessonSimulation.findOne({ lessonId }).lean();
  assert('Mô tả mô phỏng khớp tuyệt đối', simDoc.description === T.simDesc);
  assert('Phát biểu mô phỏng khớp tuyệt đối', simDoc.statement === T.simStatement);

  const summaryDoc = await LessonSummary.findOne({ lessonId }).lean();
  assert('Tiêu đề tóm tắt khớp tuyệt đối', summaryDoc.title === T.summaryTitle);

  const quizDoc = await LessonQuiz.findOne({ lessonId }).lean();
  assert('Câu hỏi khớp tuyệt đối', quizDoc.question === T.question);
  assert('Đáp án A khớp tuyệt đối', quizDoc.options.A === T.optionA);
  assert('Đáp án B khớp tuyệt đối', quizDoc.options.B === T.optionB);

  // ─── 4. Đọc lại từ API công khai ───
  console.log('\n[4] Đối chiếu dữ liệu trả về từ API công khai');
  const pubRes = await fetch(`${BASE}/api/courses/${slug}`);
  const pubJson = await pubRes.json();
  const pubLesson = pubJson.course.lessons[0];
  assert('API trả về bài học', Boolean(pubLesson));
  assert('Tiêu đề qua API khớp tuyệt đối', pubLesson.title === T.lessonTitle);
  assert('Slide qua API khớp tuyệt đối', pubLesson.slides[0].title === T.slideTitle);
  assert('Mô phỏng qua API khớp tuyệt đối', pubLesson.simulations[0].description === T.simDesc);
  assert('Tóm tắt qua API khớp tuyệt đối', pubLesson.summary.title === T.summaryTitle);
  assert('Câu hỏi qua API khớp tuyệt đối', pubLesson.quizzes[0].question === T.question);
  assert('Đáp án A qua API khớp tuyệt đối', pubLesson.quizzes[0].options.A === T.optionA);

  // ─── 5. Dọn dẹp ───
  console.log('\n[5] Dọn dẹp');
  await fetch(`${BASE}/api/admin/courses/${courseId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const stillThere = await Course.findById(courseId).lean();
  assert('Khóa học test đã bị xoá', !stillThere);

  await mongoose.disconnect();
  console.log('\n' + (failed === 0 ? '✅ TẤT CẢ KIỂM TRA PASS' : `❌ ${failed} KIỂM TRA FAIL`));
  process.exit(failed === 0 ? 0 : 1);
})().catch(async (err) => {
  console.error('❌ Lỗi:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
