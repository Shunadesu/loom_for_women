/**
 * Script kiểm tra end-to-end luồng "Thêm khóa học 4 phần".
 * Chạy: node scripts/testCourseIntake.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import Course from '../src/models/Course.js';
import Lesson from '../src/models/Lesson.js';
import LessonSlide from '../src/models/LessonSlide.js';
import LessonQuiz from '../src/models/LessonQuiz.js';
import LessonSimulation from '../src/models/LessonSimulation.js';
import LessonSummary from '../src/models/LessonSummary.js';
import app from '../src/app.js';

const BASE = 'http://localhost:3010';

const log = (...a) => console.log(...a);
const ok = (label, cond) =>
  log(`${cond ? '  ✓' : '  ✗'} ${label}${cond ? '' : '  <<< FAIL'}`);

let failed = 0;
const assert = (label, cond) => {
  if (!cond) failed += 1;
  ok(label, cond);
};

const jsonHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  // ─── Tạo admin test ───
  const phone = '0900000001';
  let admin = await User.findOne({ phone });
  if (!admin) {
    admin = await User.create({
      phone,
      name: 'Admin Test',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'admin',
      isActive: true,
    });
    log('Đã tạo admin test:', phone);
  } else {
    admin.role = 'admin';
    admin.isActive = true;
    admin.passwordHash = await bcrypt.hash('admin123', 10);
    await admin.save();
  }

  const server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  const port = server.address().port;
  const base = `http://localhost:${port}`;

  const loginRes = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password: 'admin123' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  assert('Đăng nhập admin thành công', Boolean(token));
  if (!token) {
    await server.close();
    await mongoose.disconnect();
    process.exit(1);
  }

  // ─── 1. Tạo khóa học ───
  log('\n[1] Tạo khóa học');
  const courseRes = await fetch(`${base}/api/admin/courses`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify({
      title: `E2E Test Course ${Date.now()}`,
      description: 'Khóa học kiểm thử 4 phần',
      category: 'Kỹ năng thủ công',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
      coverUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
      isPublished: true,
    }),
  });
  const courseData = await courseRes.json();
  assert('Tạo khóa học thành công', courseRes.status === 201 && courseData.course);
  const courseId = courseData.course?._id;

  // ─── 2. Tạo bài học KHÔNG có video, chỉ có 4 phần ───
  log('\n[2] Tạo bài học 4 phần (không có video)');
  const lessonBody = new URLSearchParams();
  lessonBody.append('title', 'Bài 1: Nhận diện bẫy lừa đảo');
  lessonBody.append('contentType', 'video');
  lessonBody.append('videoUrl', ''); // không có video
  lessonBody.append('durationSeconds', '300');
  lessonBody.append('knowledgeTitle', 'Bài 1: Nhận diện bẫy lừa đảo');
  lessonBody.append('knowledgeContent', 'Nội dung kiến thức chi tiết');
  lessonBody.append(
    'slides',
    JSON.stringify([
      {
        title: 'Slide 1: Bối cảnh',
        content: 'Giới thiệu vấn đề',
        bullets: ['Bảo vệ bản thân', 'Không báo mã OTP'],
        note: 'Kiến thức được bảo trợ bởi Tổng Liên đoàn Lao động',
        noteLabel: 'ĐIỂM LƯU Ý',
      },
      { title: 'Slide 2: Cách nhận biết', content: 'Dấu hiệu', bullets: [] },
    ])
  );
  lessonBody.append(
    'simulations',
    JSON.stringify([
      {
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Chị Lan nhận cuộc gọi trúng thưởng',
        statement: 'Chị Lan nên nhập mã OTP để nhận thưởng ngay.',
        isCorrect: false,
      },
    ])
  );
  lessonBody.append(
    'summary',
    JSON.stringify({
      format: 'pdf_video',
      imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      title: 'Infographic tổng kết',
    })
  );
  lessonBody.append(
    'quizzes',
    JSON.stringify([
      {
        question: 'Câu 1: Nên làm gì khi nhận OTP?',
        options: { A: 'Nhập ngay', B: 'Từ chối và báo công an', C: 'Đăng nhập', D: 'Chuyển tiền' },
        correct: 'B',
        type: 'single',
        explain: 'Không bao giờ chia sẻ mã OTP',
      },
      {
        question: 'Câu 2: Ai là người gọi điện giả mạo công an?',
        options: { A: 'Đúng', B: 'Sai' },
        correct: 'A',
        type: 'true_false',
        explain: 'Có thể là kẻ lừa đảo',
      },
    ])
  );

  const lessonRes = await fetch(
    `${base}/api/admin/courses/${courseId}/lessons`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: lessonBody,
    }
  );
  const lessonData = await lessonRes.json();
  assert(
    'Tạo bài học 4 phần (không video) thành công',
    lessonRes.status === 201 && lessonData.lesson
  );
  if (!lessonData.lesson) {
    log('Response:', JSON.stringify(lessonData));
    await server.close();
    await mongoose.disconnect();
    process.exit(1);
  }
  const lessonId = lessonData.lesson._id;

  // ─── 3. Kiểm tra 4 phần đã lưu ───
  log('\n[3] Kiểm tra 4 phần đã lưu trong DB');
  const [slides, quizzes, sims, summaries] = await Promise.all([
    LessonSlide.find({ lessonId }).lean(),
    LessonQuiz.find({ lessonId }).lean(),
    LessonSimulation.find({ lessonId }).lean(),
    LessonSummary.find({ lessonId }).lean(),
  ]);
  assert(`Có 2 slide (thực tế ${slides.length})`, slides.length === 2);
  assert(`Có 2 câu hỏi (thực tế ${quizzes.length})`, quizzes.length === 2);
  assert(`Có 1 mô phỏng (thực tế ${sims.length})`, sims.length === 1);
  assert(`Có 1 tóm tắt (thực tế ${summaries.length})`, summaries.length === 1);
  assert(
    `Kiểu quiz true_false được lưu (${quizzes[1]?.type})`,
    quizzes[1]?.type === 'true_false'
  );
  assert(
    'Đáp án đúng được lưu',
    quizzes[0]?.correct === 'B' && quizzes[1]?.correct === 'A'
  );

  // ─── 4. API công khai trả về đủ 4 phần ───
  log('\n[4] Kiểm tra API công khai GET /api/courses/:slug');
  const publicRes = await fetch(`${base}/api/courses/${courseData.course.slug}`);
  const publicData = await publicRes.json();
  const pubLesson = publicData.course?.lessons?.[0];
  assert('Trả về bài học', Boolean(pubLesson));
  assert(`Slides (${pubLesson?.slides?.length})`, pubLesson?.slides?.length === 2);
  assert(
    `Simulations (${pubLesson?.simulations?.length})`,
    pubLesson?.simulations?.length === 1
  );
  assert('Summary', Boolean(pubLesson?.summary));
  assert(`Quizzes (${pubLesson?.quizzes?.length})`, pubLesson?.quizzes?.length === 2);
  assert(
    'Không lộ đáp án đúng',
    pubLesson?.quizzes?.every((q) => q.correct === undefined)
  );

  // ─── 5. Update chỉ media → KHÔNG được xoá 4 phần ───
  log('\n[5] Update chỉ media → nội dung 4 phần phải được giữ nguyên');
  const updateBody = new URLSearchParams();
  updateBody.append('title', 'Bài 1: Nhận diện bẫy lừa đảo (đã sửa)');
  updateBody.append('contentType', 'video');
  updateBody.append('videoUrl', 'https://youtu.be/dQw4w9WgXcQ');
  const updateRes = await fetch(`${base}/api/admin/lessons/${lessonId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: updateBody,
  });
  assert('Update media thành công', updateRes.status === 200);
  const [slides2, quizzes2, sims2, summaries2] = await Promise.all([
    LessonSlide.find({ lessonId }).lean(),
    LessonQuiz.find({ lessonId }).lean(),
    LessonSimulation.find({ lessonId }).lean(),
    LessonSummary.find({ lessonId }).lean(),
  ]);
  assert(`Slides vẫn còn (${slides2.length})`, slides2.length === 2);
  assert(`Quizzes vẫn còn (${quizzes2.length})`, quizzes2.length === 2);
  assert(`Simulations vẫn còn (${sims2.length})`, sims2.length === 1);
  assert(`Summaries vẫn còn (${summaries2.length})`, summaries2.length === 1);

  // ─── 6. Video bắt buộc khi không có 4 phần ───
  log('\n[6] Bài học không có video lẫn 4 phần → phải báo lỗi');
  const emptyBody = new URLSearchParams();
  emptyBody.append('title', 'Bài không có nội dung');
  emptyBody.append('contentType', 'video');
  emptyBody.append('videoUrl', '');
  const emptyRes = await fetch(
    `${base}/api/admin/courses/${courseId}/lessons`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: emptyBody,
    }
  );
  assert('Bị từ chối với 400', emptyRes.status === 400);
  const emptyData = await emptyRes.json();
  assert(`Thông báo lỗi rõ ràng: "${emptyData.error}"`, Boolean(emptyData.error));

  // ─── 7. Hoàn thành bài học khi đúng HẾT câu ───
  log('\n[7] Hoàn thành bài học khi trả lời đúng tất cả câu');
  const userPhone = '0900000002';
  let student = await User.findOne({ phone: userPhone });
  if (!student) {
    student = await User.create({
      phone: userPhone,
      name: 'Học viên Test',
      passwordHash: await bcrypt.hash('student123', 10),
      role: 'user',
      isActive: true,
    });
  }
  const studentLogin = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: userPhone, password: 'student123' }),
  });
  const studentData = await studentLogin.json();
  const studentToken = studentData.token;
  assert('Đăng nhập học viên thành công', Boolean(studentToken));

  // Trả lời đúng câu 1 → chưa hoàn thành (còn 1 câu)
  const q1 = quizzes[0];
  const q2 = quizzes[1];
  const ans1 = await fetch(`${base}/api/progress/lessons/${lessonId}/quiz`, {
    method: 'POST',
    headers: jsonHeaders(studentToken),
    body: JSON.stringify({ quizId: q1._id, answer: q1.correct, complete: true }),
  });
  const ans1Data = await ans1.json();
  assert(
    `Trả lời đúng câu 1 → allCorrect=false (nhận ${ans1Data.allCorrect})`,
    ans1Data.isCorrect === true && ans1Data.allCorrect === false
  );
  assert(
    `progressPct chưa có (nhận ${ans1Data.progressPct})`,
    ans1Data.progressPct === null
  );
  assert(
    `correctQuizzes=1/2 (nhận ${ans1Data.correctQuizzes}/${ans1Data.totalQuizzes})`,
    ans1Data.correctQuizzes === 1 && ans1Data.totalQuizzes === 2
  );

  // Trả lời sai câu 2 → vẫn chưa hoàn thành
  const ans2 = await fetch(`${base}/api/progress/lessons/${lessonId}/quiz`, {
    method: 'POST',
    headers: jsonHeaders(studentToken),
    body: JSON.stringify({ quizId: q2._id, answer: 'A' === q2.correct ? 'B' : 'A' }),
  });
  const ans2Data = await ans2.json();
  assert(
    `Trả lời sai câu 2 → chưa hoàn thành (nhận ${ans2Data.progressPct})`,
    ans2Data.isCorrect === false && ans2Data.progressPct === null
  );

  // Trả lời đúng câu 2 → hoàn thành
  const ans3 = await fetch(`${base}/api/progress/lessons/${lessonId}/quiz`, {
    method: 'POST',
    headers: jsonHeaders(studentToken),
    body: JSON.stringify({ quizId: q2._id, answer: q2.correct, complete: true }),
  });
  const ans3Data = await ans3.json();
  assert(
    `Trả lời đúng câu 2 → allCorrect=true (nhận ${ans3Data.allCorrect})`,
    ans3Data.allCorrect === true
  );
  assert(
    `progressPct đã cập nhật (nhận ${ans3Data.progressPct})`,
    ans3Data.progressPct === 100
  );

  // ─── 8. Xoá bài học → xoá luôn 4 phần ───
  log('\n[8] Xoá bài học → xoá luôn nội dung 4 phần');
  const delRes = await fetch(`${base}/api/admin/lessons/${lessonId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert('Xoá bài học thành công', delRes.status === 200);
  const leftovers = await Promise.all([
    LessonSlide.countDocuments({ lessonId }),
    LessonQuiz.countDocuments({ lessonId }),
    LessonSimulation.countDocuments({ lessonId }),
    LessonSummary.countDocuments({ lessonId }),
  ]);
  assert(`Không còn dữ liệu 4 phần (${leftovers.join(',')})`, leftovers.every((n) => n === 0));

  // ─── Dọn dẹp ───
  await Course.deleteOne({ _id: courseId });
  await User.deleteOne({ phone: userPhone });

  await server.close();
  await mongoose.disconnect();

  log(`\n${failed === 0 ? '✅ TẤT CẢ KIỂM TRA PASS' : `❌ ${failed} KIỂM TRA THẤT BẠI`}`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(async (err) => {
  console.error('LỖI:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
