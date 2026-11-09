/**
 * Seed dữ liệu mẫu cho khóa học 4 phần (theo thiết kế "Móc len cơ bản").
 *
 *   node scripts/seed-course-4parts.js
 *
 * - Idempotent: nếu khóa học đã tồn tại (theo slug) thì bỏ qua.
 * - Tạo 1 khóa học + 1 bài học đầy đủ:
 *     1. Cung cấp kiến thức : 4 slide + PDF slide
 *     2. Mô phỏng tình huống: video YouTube + mô tả
 *     3. Tóm tắt            : PDF infographic + video
 *     4. Đánh giá           : 1 câu trắc nghiệm A/B/C/D
 */

import 'dotenv/config';
import mongoose from 'mongoose';

import Course from '../src/models/Course.js';
import Lesson from '../src/models/Lesson.js';
import LessonSlide from '../src/models/LessonSlide.js';
import LessonQuiz from '../src/models/LessonQuiz.js';
import LessonSimulation from '../src/models/LessonSimulation.js';
import LessonSummary from '../src/models/LessonSummary.js';

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('Thiếu MONGODB_URI trong .env');
  process.exit(1);
}

const COURSE = {
  title: 'Học cách móc len tại nhà',
  slug: 'hoc-cach-moc-len-tai-nha-4-phan',
  description:
    'Khóa học móc len dành cho nữ công nhân: từ cầm kim móc cơ bản, mô phỏng tình huống thực tế đến tóm tắt infographic và trắc nghiệm tổng kết.',
  category: 'Kỹ năng thủ công',
  thumbnail:
    'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=600',
  coverUrl:
    'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=600',
  bannerUrl:
    'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=1200',
  rating: 4.7,
  durationMinutes: 185,
  isFeatured: true,
};

const SLIDES = [
  {
    title: '1. Tổng quan & Khái niệm: Cầm kim móc & tạo mũi móc xích cơ bản',
    content:
      'Bộ slide bài giảng chuẩn hóa từ chuyên gia Loom & Công đoàn, trực quan, cô đọng và dễ tiếp thu cho nữ công nhân.',
    bullets: [
      'Góc quay cận cảnh thao tác ngón tay, dùng len cotton milk dễ làm cho người mới bắt đầu.',
      'Nhận diện các thủ đoạn và tình huống phát sinh phổ biến trong đời sống lao động tại khu công nghiệp.',
      'Mục tiêu: Nắm vững nguyên tắc cơ bản và hình thành phản xạ tự vệ an toàn trước các cạm bẫy.',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=600',
    noteLabel: 'ĐIỂM LƯU Ý AN TOÀN CỐT LÕI',
    note: 'Kiến thức được bảo trợ bởi Tổng Liên đoàn Lao động & Dự án Loom for Women.',
    durationSeconds: 150,
  },
  {
    title: '2. Các quy tắc an toàn cốt lõi (3 KHÔNG)',
    content:
      'Ba nguyên tắc "KHÔNG" giúp người học tránh lãng phí sợi len và tránh lỗi kỹ thuật khi mới bắt đầu.',
    bullets: [
      'KHÔNG kéo căng sợi quá tay — dễ đứt và khó thao tác.',
      'KHÔNG dùng kim móc quá nhỏ với len mỏng — dễ làm rụng mũi móc.',
      'KHÔNG học quá 2 tiếng mỗi ngày — cần thời gian để tay ghi nhớ động tác.',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1606913079621-e64bd28682ba?auto=format&fit=crop&q=80&w=600',
    noteLabel: 'LƯU Ý',
    note: 'Nên học vào buổi tối khi đã nghỉ ngơi, tránh học lúc đang mệt.',
    durationSeconds: 150,
  },
  {
    title: '3. Quy trình 4 bước xử lý khẩn cấp khi gặp sự cố',
    content:
      'Khi móc len bị mắc, đứt hoặc kim móc bị kẹt, hãy tuân thủ đúng 4 bước dưới đây.',
    bullets: [
      'Bước 1 — Dừng lại, không kéo mạnh sợi.',
      'Bước 2 — Tháo mũi móc ra khỏi hàng móc.',
      'Bước 3 — Kiểm tra đầu sợi, cắt phần bị xù nếu cần.',
      'Bước 4 — Móc lại từ mũi móc gần nhất và tiếp tục.',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&q=80&w=600',
    noteLabel: 'AN TOÀN',
    note: 'Luôn để kim móc nằm ngang trên mặt bàn khi không dùng tới.',
    durationSeconds: 150,
  },
  {
    title: '4. Tóm lược & Chuẩn bị sang phần mô phỏng',
    content:
      'Tóm tắt 4 ý chính và mời bạn chuyển sang phần mô phỏng tình huống thực tế.',
    bullets: [
      'Kiến thức cốt lõi: cầm kim, giữ sợi, mũi móc xích.',
      'Quy tắc 3 KHÔNG giúp tiết kiệm thời gian và sợi.',
      'Quy trình 4 bước xử lý sự cố.',
      'Bước tiếp theo: xem video mô phỏng và trả lời câu hỏi.',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600',
    noteLabel: 'CHÚC MỪNG',
    note: 'Bạn đã hoàn thành phần kiến thức. Tiếp tục sang phần mô phỏng nhé!',
    durationSeconds: 150,
  },
];

const SIMULATIONS = [
  {
    videoUrl: 'https://www.youtube.com/embed/SNB716MnvY0',
    description:
      'Chị Lan nhận cuộc gọi trúng thưởng từ số lạ, bị dẫn dắt đến trang đăng nhập giả và yêu cầu nhập mã OTP.',
    statement:
      'Chị Lan nên nhập mã OTP để nhận thưởng ngay trong ngày.',
    isCorrect: false,
  },
];

const SUMMARY = {
  format: 'pdf_video',
  imageUrl:
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=900',
  videoUrl: 'https://www.youtube.com/embed/SNB716MnvY0',
  title: 'Infographic tổng kết bài móc len cơ bản',
};

const QUIZZES = [
  {
    question:
      'Khi nhận được cuộc gọi trúng thưởng từ số lạ, bạn nên làm gì trước tiên?',
    options: {
      A: 'Làm theo hướng dẫn để nhận thưởng ngay',
      B: 'Từ chối và xác minh lại qua kênh chính thống',
      C: 'Chuyển tiếp cho bạn bè cùng đăng ký',
      D: 'Cung cấp mã OTP để hệ thống kiểm tra',
    },
    correct: 'B',
    videoUrl: 'https://www.youtube.com/embed/SNB716MnvY0',
    videoDescription:
      'Chị Lan nhận cuộc gọi trúng thưởng từ số lạ, bị dẫn dắt đến trang đăng nhập giả và yêu cầu nhập mã OTP.',
    explain:
      'Không bao giờ cung cấp mã OTP cho người lạ. Từ chối và xác minh lại qua kênh chính thống.',
    points: 10,
  },
];

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Đã kết nối MongoDB.');

    const existing = await Course.findOne({ slug: COURSE.slug });
    if (existing) {
      console.log(`[Seed] = Course (đã có): ${COURSE.title}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    const course = await Course.create({
      ...COURSE,
      isPublished: true,
      isActive: true,
      order: 0,
      lessonsCount: 1,
    });
    console.log(`[Seed] + Course: ${course.title}`);

    const lesson = await Lesson.create({
      courseId: course._id,
      title: 'Bài 1: Cầm kim móc & tạo mũi móc xích cơ bản',
      contentType: 'video',
      knowledgeTitle: 'Bài 1: Cầm kim móc & tạo mũi móc xích cơ bản',
      knowledgeContent:
        'Nội dung bài học dạng Slide & Text chi tiết dành cho công nhân học nghề móc len tại nhà.',
      slidePdfTitle: 'Cẩm nang Hướng dẫn Thực hành',
      slidePdfName: 'Cam_Nang_Thuc_Hanh_2026.pdf',
      durationSeconds: 600,
      order: 0,
    });
    console.log(`[Seed] + Lesson: ${lesson.title}`);

    await LessonSlide.insertMany(
      SLIDES.map((s, i) => ({ ...s, lessonId: lesson._id, courseId: course._id, order: i }))
    );
    await LessonSimulation.insertMany(
      SIMULATIONS.map((s, i) => ({
        ...s,
        youtubeId: 'SNB716MnvY0',
        lessonId: lesson._id,
        courseId: course._id,
        order: i,
      }))
    );
    await LessonSummary.create({
      ...SUMMARY,
      youtubeId: 'SNB716MnvY0',
      lessonId: lesson._id,
      courseId: course._id,
      order: 0,
    });
    await LessonQuiz.insertMany(
      QUIZZES.map((q, i) => ({
        ...q,
        youtubeId: 'SNB716MnvY0',
        type: 'single',
        lessonId: lesson._id,
        courseId: course._id,
        order: i,
      }))
    );

    console.log(
      `\n[Seed] Xong. Đã tạo khóa học "${course.title}" với 4 slide, 1 mô phỏng, 1 tóm tắt, 1 quiz.`
    );
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Lỗi:', err);
    process.exit(1);
  }
})();
