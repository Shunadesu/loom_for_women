/**
 * Seed dữ liệu mẫu cho Thư viện tài liệu.
 *
 *   node scripts/seed-documents.js
 *
 * - Idempotent: nếu document đã tồn tại (cùng lessonId+title) thì skip.
 * - File thực tế KHÔNG được copy lên server — chỉ ghi bản ghi với URL ngoài (Unsplash /
 *   file mẫu công khai) để FE hiển thị. Để test upload thật, dùng admin UI.
 */

import 'dotenv/config';
import mongoose from 'mongoose';

import Course from '../src/models/Course.js';
import Lesson from '../src/models/Lesson.js';
import LessonDocument from '../src/models/LessonDocument.js';

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('Thiếu MONGODB_URI trong .env');
  process.exit(1);
}

/**
 * Map tài liệu mẫu: lessonTitle → array of documents.
 * Sử dụng URL từ các nguồn công khai (Wikipedia/W3C) để demo — không upload file thật.
 */
const SAMPLE_DOCS = {
  'Nhận diện và phòng chống lừa đảo trực tuyến': [
    {
      title: 'Sổ tay nhận diện 15 thủ đoạn lừa đảo việc làm online mới nhất 2026',
      description:
        'Tài liệu chi tiết phân tích 15 kịch bản lừa đảo nhắm vào công nhân nữ, cách nhận diện đường link giả mạo và số điện thoại tố cáo.',
      fileUrl:
        'https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?auto=format&fit=crop&q=80&w=600',
      fileType: 'pdf',
      fileExt: '.pdf',
      fileSize: 2_457_600,
      pageCount: 18,
      downloadCount: 1420,
    },
    {
      title: 'Cẩm nang 3 KHÔNG - Bảo vệ tài khoản Zalo & Ngân hàng',
      description:
        'Quy tắc an toàn số cơ bản: KHÔNG bấm đường link lạ - KHÔNG chuyển tiền cọc - KHÔNG cung cấp mã OTP cho bất kỳ ai.',
      fileUrl:
        'https://images.unsplash.com/photo-1512486130939-2c4f79935b1a?auto=format&fit=crop&q=80&w=600',
      fileType: 'pdf',
      fileExt: '.pdf',
      fileSize: 1_126_400,
      pageCount: 12,
      downloadCount: 980,
    },
    {
      title: 'Infographic: Quy trình 4 bước báo xấu & khóa tài khoản khẩn cấp',
      description:
        'Hình ảnh trực quan cô đọng quy trình xử lý khi nghi ngờ bị lộ thông tin tài khoản ngân hàng hoặc tài khoản Zalo.',
      fileUrl:
        'https://images.unsplash.com/photo-1611224923853-80b023f0a066?auto=format&fit=crop&q=80&w=600',
      fileType: 'infographic',
      fileExt: '.jpg',
      fileSize: 870_400,
      pageCount: 4,
      downloadCount: 2150,
    },
  ],
  'Học cách móc len tại nhà': [
    {
      title: 'Sơ đồ móc hoa hồng tulip cotton milk 5 cánh (Bản in PDF chi tiết)',
      description:
        'Bản vẽ ký hiệu chart móc hoa tulip và hoa hướng dương kèm hình chụp từng bước, giúp chị em dễ dàng thực hành tại nhà.',
      fileUrl:
        'https://images.unsplash.com/photo-1584992236310-6edcdddd04ff?auto=format&fit=crop&q=80&w=600',
      fileType: 'pdf',
      fileExt: '.pdf',
      fileSize: 3_244_800,
      pageCount: 8,
      downloadCount: 4500,
    },
    {
      title: 'Bảng tra cứu các loại mũi móc cơ bản & Ký hiệu móc len quốc tế',
      description:
        'Tài liệu gối đầu giường cho người mới học móc len: bảng đối chiếu ký hiệu tiếng Việt - tiếng Anh - hình vẽ minh họa.',
      fileUrl:
        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
      fileType: 'pdf',
      fileExt: '.pdf',
      fileSize: 2_097_152,
      pageCount: 16,
      downloadCount: 2980,
    },
    {
      title: 'Hướng dẫn chụp ảnh sản phẩm len bằng điện thoại đẹp như studio',
      description:
        'Mẹo chụp ảnh sản phẩm handmade bằng ánh sáng tự nhiên, cách canh góc và viết mô tả thu hút trên Chợ sinh kế Loom.',
      fileUrl:
        'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600',
      fileType: 'guide',
      fileExt: '.pdf',
      fileSize: 1_572_864,
      pageCount: 12,
      downloadCount: 1840,
    },
    {
      title: 'Bảng tính định giá bán sản phẩm thủ công (Tính chi phí len & công móc)',
      description:
        'File mẫu Excel tính giá thành: tự động tính chi phí cuộn len, phụ kiện cành kẽm, giấy gói và gợi ý mức giá bán lãi 40-50%.',
      fileUrl:
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=600',
      fileType: 'excel',
      fileExt: '.xlsx',
      fileSize: 389_120,
      pageCount: 2,
      downloadCount: 2100,
    },
  ],
  'Quản lý tài chính': [
    {
      title: 'Bảng tính mẫu chia lương 50-30-20 (Excel tính chi tiêu gia đình tự động)',
      description:
        'File Excel mẫu đã cài sẵn công thức: nhập tổng lương tháng và thu nhập phụ, tự động phân bổ vào 3 hũ Nhu cầu - Dự phòng - Đầu tư.',
      fileUrl:
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600',
      fileType: 'excel',
      fileExt: '.xlsx',
      fileSize: 460_800,
      pageCount: 3,
      downloadCount: 3100,
    },
    {
      title: 'Hướng dẫn ghi chép sổ thu chi điện tử trên Zalo',
      description:
        'Sổ tay hướng dẫn tận dụng tin nhắn tự lưu (Cloud của tôi) trên Zalo để ghi chép các khoản chi chợ búa, con cái hàng ngày không bị quên.',
      fileUrl:
        'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=600',
      fileType: 'guide',
      fileExt: '.pdf',
      fileSize: 1_887_436,
      pageCount: 10,
      downloadCount: 860,
    },
    {
      title: '6 Bước xây dựng Quỹ dự phòng khẩn cấp cho gia đình công nhân',
      description:
        'Tài liệu hướng dẫn cách tiết kiệm 3-6 tháng chi tiêu tối thiểu mà không ảnh hưởng tới chất lượng sinh hoạt của con cái.',
      fileUrl:
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600',
      fileType: 'pdf',
      fileExt: '.pdf',
      fileSize: 1_258_291,
      pageCount: 14,
      downloadCount: 1120,
    },
  ],
};

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Seed:Documents] Đã kết nối MongoDB.');

    let created = 0;
    let skipped = 0;

    for (const [courseTitle, docs] of Object.entries(SAMPLE_DOCS)) {
      const course = await Course.findOne({ title: courseTitle });
      if (!course) {
        console.log(`[Seed:Documents] ! Không tìm thấy course: "${courseTitle}" — bỏ qua`);
        continue;
      }

      // Lấy lesson đầu tiên của course (hoặc dùng lessonId null nếu chưa có)
      const lessons = await Lesson.find({ courseId: course._id })
        .sort({ order: 1, createdAt: 1 })
        .lean();
      if (lessons.length === 0) {
        console.log(`[Seed:Documents] ! Course "${courseTitle}" chưa có lesson — bỏ qua`);
        continue;
      }

      // Phân bổ đều docs cho từng lesson trong course (round-robin)
      for (const doc of docs) {
        const lesson = lessons[created % lessons.length];
        const exists = await LessonDocument.findOne({
          lessonId: lesson._id,
          title: doc.title,
        });
        if (exists) {
          skipped += 1;
          console.log(`[Seed:Documents] = Đã có: ${doc.title}`);
          continue;
        }
        await LessonDocument.create({
          lessonId: lesson._id,
          courseId: course._id,
          title: doc.title,
          description: doc.description,
          fileUrl: doc.fileUrl,
          fileType: doc.fileType,
          fileExt: doc.fileExt,
          fileSize: doc.fileSize,
          pageCount: doc.pageCount,
          downloadCount: doc.downloadCount,
          isPublished: true,
          order: created,
        });
        created += 1;
        console.log(`[Seed:Documents] + ${doc.title}`);
      }
    }

    // Cập nhật documentsCount cho mỗi lesson
    const lessons = await Lesson.find().lean();
    for (const lesson of lessons) {
      const count = await LessonDocument.countDocuments({ lessonId: lesson._id });
      if (lesson.documentsCount !== count) {
        await Lesson.findByIdAndUpdate(lesson._id, { documentsCount: count });
      }
    }

    console.log(
      `\n[Seed:Documents] Xong. Mới: ${created} documents. Đã có sẵn: ${skipped}.`
    );
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed:Documents] Lỗi:', err);
    process.exit(1);
  }
})();