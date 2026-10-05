/**
 * Seed dữ liệu mẫu cho E-learning: 5 categories + 5 courses + ~30 lessons.
 *
 *   node scripts/seed-courses.js
 *
 * - Idempotent: nếu category đã tồn tại (cùng slug) thì skip.
 * - Course đã tồn tại (cùng slug) thì skip — không ghi đè.
 */

import 'dotenv/config';
import mongoose from 'mongoose';

import Category from '../src/models/Category.js';
import Course from '../src/models/Course.js';
import Lesson from '../src/models/Lesson.js';

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('Thiếu MONGODB_URI trong .env');
  process.exit(1);
}

// ─── Data ─────────────────────────────────────────────────────
const CATEGORIES = [
  {
    name: 'Móc len cơ bản',
    color: '#E60067',
    order: 1,
    courses: [
      {
        title: 'Học cách móc len tại nhà',
        description:
          'Khóa học từ cơ bản đến nâng cao về móc len: nắm mũi móc đơn, móc kép, đọc chart, hoàn thiện sản phẩm đầu tiên.',
        thumbnail:
          'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=600',
        rating: 4.7,
        durationMinutes: 185,
        isFeatured: true,
        lessons: [
          { title: 'Giới thiệu kim móc & len sợi', youtubeId: 'GIm5IEqFs0U', durationSeconds: 320 },
          { title: 'Mũi móc đơn (Single crochet)', youtubeId: 'GnPaxLlGZbU', durationSeconds: 540 },
          { title: 'Mũi móc đôi (Double crochet)', youtubeId: 'Bn3S0c8TlzA', durationSeconds: 480 },
          { title: 'Cách đọc chart & pattern', youtubeId: 'EqCF2qnD8gQ', durationSeconds: 720 },
          { title: 'Lên dây & kết thúc', youtubeId: 'kp5C2gRjIo0', durationSeconds: 600 },
          { title: 'Hoàn thiện khăn len đầu tiên', youtubeId: 'kwE4qhFDrUM', durationSeconds: 900 },
        ],
      },
      {
        title: 'Len amigurumi cho người mới',
        description:
          'Làm thú bông amigurumi từ len. Hướng dẫn từng bước tạo hình tròn, nối chi tiết, mắt an toàn cho trẻ em.',
        thumbnail:
          'https://images.unsplash.com/photo-1605733513597-a8f8341084e6?auto=format&fit=crop&q=80&w=600',
        rating: 4.5,
        durationMinutes: 240,
        lessons: [
          { title: 'Vòng magic & tăng mũi', youtubeId: 'qcK3JZ8FfKY', durationSeconds: 420 },
          { title: 'Định hình đầu thỏ', youtubeId: 'tjEu6BmJsxs', durationSeconds: 600 },
          { title: 'Tai, tay, chân', youtubeId: 'VdKcVXcDDc4', durationSeconds: 720 },
          { title: 'Râu miệng & mắt', youtubeId: 'ox0n5AIMKs0', durationSeconds: 480 },
          { title: 'Hoàn thiện & may ráp', youtubeId: 'pwE4qhFDrUM', durationSeconds: 900 },
        ],
      },
    ],
  },
  {
    name: 'Phòng chống lừa đảo',
    color: '#0EA5E9',
    order: 2,
    courses: [
      {
        title: 'Nhận diện & phòng chống lừa đảo trực tuyến',
        description:
          'Các hình thức lừa đảo phổ biến: giả danh ngân hàng, mạo danh cơ quan chức năng, đầu tư ảo. Cách nhận diện và xử lý.',
        thumbnail:
          'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600',
        rating: 4.9,
        durationMinutes: 120,
        isFeatured: true,
        lessons: [
          { title: 'Nhận diện cuộc gọi lừa đảo', youtubeId: 'dQw4w9WgXcQ', durationSeconds: 480 },
          { title: 'Tin nhắn SMS/OTP giả mạo', youtubeId: 'jNQXAC9IVRw', durationSeconds: 360 },
          { title: 'Lừa đảo qua mạng xã hội', youtubeId: 'M7lc1UVf-VE', durationSeconds: 540 },
          { title: 'Đầu tư tài chính ảo', youtubeId: '3JZ_D3ELwOQ', durationSeconds: 600 },
          { title: 'Cách báo cáo & xử lý', youtubeId: 'tVj0ZTS4WF4', durationSeconds: 420 },
        ],
      },
    ],
  },
  {
    name: 'Sức khỏe nữ',
    color: '#10B981',
    order: 3,
    courses: [
      {
        title: 'Chăm sóc sức khỏe sinh sản cơ bản',
        description:
          'Kiến thức cơ bản về sức khỏe sinh sản, các dấu hiệu cần khám, chế độ dinh dưỡng phù hợp.',
        thumbnail:
          'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600',
        rating: 4.6,
        durationMinutes: 95,
        lessons: [
          { title: 'Khám phụ khoa định kỳ', youtubeId: 'y6120QOlsfU', durationSeconds: 540 },
          { title: 'Dấu hiệu bất thường', youtubeId: 'fLexgOxsZu0', durationSeconds: 480 },
          { title: 'Dinh dưỡng cho phụ nữ', youtubeId: '8jPQjjsBbIc', durationSeconds: 600 },
        ],
      },
    ],
  },
  {
    name: 'Kỹ năng mềm',
    color: '#F59E0B',
    order: 4,
    courses: [
      {
        title: 'Giao tiếp & đàm phán hiệu quả',
        description:
          'Kỹ năng giao tiếp, lắng nghe chủ động, đàm phán trong công việc và cuộc sống.',
        thumbnail:
          'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=600',
        rating: 4.8,
        durationMinutes: 150,
        lessons: [
          { title: 'Lắng nghe chủ động', youtubeId: '6stlCkUDG_s', durationSeconds: 480 },
          { title: 'Ngôn ngữ cơ thể', youtubeId: 'hHW1oYp4HMc', durationSeconds: 540 },
          { title: 'Kỹ thuật đàm phán', youtubeId: 'FTl0w1eXE_M', durationSeconds: 600 },
        ],
      },
    ],
  },
  {
    name: 'Tài chính cá nhân',
    color: '#8B5CF6',
    order: 5,
    courses: [
      {
        title: 'Quản lý chi tiêu & tiết kiệm',
        description:
          'Cách lập ngân sách, theo dõi chi tiêu, tiết kiệm hiệu quả cho người mới.',
        thumbnail:
          'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=600',
        rating: 4.7,
        durationMinutes: 110,
        lessons: [
          { title: 'Lập ngân sách hàng tháng', youtubeId: 'YQHsU92IBKA', durationSeconds: 540 },
          { title: 'Quy tắc 50/30/20', youtubeId: 'Q0HsU92IBKB', durationSeconds: 480 },
          { title: 'Công cụ theo dõi chi tiêu', youtubeId: 'E0HsU92IBKC', durationSeconds: 360 },
        ],
      },
    ],
  },
];

const slugify = (str) =>
  String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Đã kết nối MongoDB.');

    let categoryCount = 0;
    let courseCount = 0;
    let lessonCount = 0;

    for (const catData of CATEGORIES) {
      const { courses, ...catFields } = catData;
      const slug = slugify(catFields.name);

      let category = await Category.findOne({ slug });
      if (!category) {
        category = await Category.create({ ...catFields, slug });
        categoryCount += 1;
        console.log(`[Seed] + Category: ${category.name}`);
      } else {
        console.log(`[Seed] = Category (đã có): ${category.name}`);
      }

      for (const courseData of courses) {
        const courseSlug = slugify(courseData.title);
        let course = await Course.findOne({ slug: courseSlug });
        if (course) {
          console.log(`[Seed] = Course (đã có): ${courseData.title}`);
          continue;
        }
        course = await Course.create({
          title: courseData.title,
          slug: courseSlug,
          description: courseData.description,
          thumbnail: courseData.thumbnail,
          category: category._id,
          rating: courseData.rating || 0,
          durationMinutes: courseData.durationMinutes || 0,
          isPublished: true,
          isFeatured: courseData.isFeatured || false,
          order: courseCount,
          isActive: true,
        });
        courseCount += 1;
        console.log(`[Seed] + Course: ${course.title}`);

        if (courseData.lessons && courseData.lessons.length > 0) {
          const lessonDocs = courseData.lessons.map((l, i) => ({
            courseId: course._id,
            title: l.title,
            youtubeId: l.youtubeId,
            order: i,
            durationSeconds: l.durationSeconds || 0,
          }));
          await Lesson.insertMany(lessonDocs);
          await Course.findByIdAndUpdate(course._id, {
            lessonsCount: lessonDocs.length,
          });
          lessonCount += lessonDocs.length;
        }
      }
    }

    console.log(
      `\n[Seed] Xong. Mới: ${categoryCount} categories, ${courseCount} courses, ${lessonCount} lessons.`
    );
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Lỗi:', err);
    process.exit(1);
  }
})();