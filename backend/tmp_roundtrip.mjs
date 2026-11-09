// Mô phỏng đúng luồng CourseForm (admin) khi tạo khóa học + bài học.
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const BASE = 'http://localhost:3010/api';
const token = jwt.sign(
  { sub: '6ac4e83a94a00f5fa0b9f33c', role: 'admin', phone: '0900000000' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
const H = { Authorization: `Bearer ${token}` };

const json = (r) => r.json();

// ─── 1. Tạo khóa học (giống createCourseAdmin) ───
const courseFd = new FormData();
courseFd.append('title', 'TMP FORM ROUNDTRIP');
courseFd.append('description', 'tmp');
courseFd.append('coverUrl', 'https://x/y.png');
courseFd.append('thumbnail', 'https://x/y.png');
courseFd.append('category', 'Kỹ năng thủ công');
courseFd.append('rating', '0');
courseFd.append('durationMinutes', '0');
courseFd.append('isFeatured', 'false');
courseFd.append('isPublished', 'true');
courseFd.append('isActive', 'true');
courseFd.append('videoId', '');
courseFd.append('bannerUrl', '');
const courseRes = await fetch(`${BASE}/admin/courses`, {
  method: 'POST',
  headers: H,
  body: courseFd,
});
const courseBody = await json(courseRes);
console.log('createCourse status', courseRes.status);
const courseId = courseBody?.course?._id;
console.log('courseId =', courseId);

// ─── 2. Tạo bài học (giống draftToFormData + createLessonAdmin) ───
const lessonFd = new FormData();
lessonFd.append('title', 'Bài học TMP 1');
lessonFd.append('contentType', 'video');
lessonFd.append('durationSeconds', '0');
lessonFd.append('order', '0');
lessonFd.append('videoUrl', '');
lessonFd.append('knowledgeTitle', 'KT');
lessonFd.append('knowledgeContent', 'KC');
lessonFd.append('slidePdfTitle', '');
lessonFd.append('slides', JSON.stringify([
  { title: 'Slide 1', content: 'c', bullets: ['b'], imageUrl: '', note: '', noteLabel: '' },
]));
lessonFd.append('simulations', JSON.stringify([
  { videoUrl: 'https://youtu.be/SNB716MnvY0', description: 'd', statement: 's', isCorrect: false },
]));
lessonFd.append('summary', JSON.stringify({ format: 'pdf_video', imageUrl: 'https://x/i.png', videoUrl: '', title: 'T' }));
lessonFd.append('quizzes', JSON.stringify([
  { question: 'Q?', options: { A: 'a', B: 'b', C: 'c', D: 'd' }, correct: 'B', videoUrl: '', videoDescription: '', explain: 'e', type: 'single' },
]));

const lessonRes = await fetch(`${BASE}/admin/courses/${courseId}/lessons`, {
  method: 'POST',
  headers: H,
  body: lessonFd,
});
console.log('createLesson status', lessonRes.status);
console.log('createLesson body', JSON.stringify(await json(lessonRes)).slice(0, 400));

// ─── 3. Đọc lại danh sách bài học (giống fetchLessonsByCourseAdmin) ───
const listRes = await fetch(`${BASE}/admin/courses/${courseId}/lessons`, { headers: H });
const listBody = await json(listRes);
console.log('list status', listRes.status, 'items =', listBody?.items?.length);

// ─── 4. Đọc nội dung 4 phần (giống fetchCourseContent) ───
const cRes = await fetch(`${BASE}/admin/intake/courses/${courseId}/content`, { headers: H });
const cBody = await json(cRes);
console.log('content status', cRes.status, 'items =', cBody?.items?.length);
console.log('content[0].content =', JSON.stringify(cBody?.items?.[0]?.content).slice(0, 400));

console.log('TMP_COURSE_ID=' + courseId);
