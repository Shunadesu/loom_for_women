/**
 * Quét database tìm bản ghi bị hỏng encoding tiếng Việt.
 *
 * Triệu chứng: chuỗi tiếng Việt bị thay ký tự bởi `?` hoặc `\uFFFD`
 * (ví dụ: "B?i 1" thay vì "Bài 1"), hoặc bị mojibake kiểu
 * "Bá»?i" (UTF-8 bị đọc như Latin-1).
 *
 * Chạy:
 *   node scripts/scan-encoding-issues.js          # chỉ xuất báo cáo
 *   node scripts/scan-encoding-issues.js --fix    # sửa luận
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import Course from '../src/models/Course.js';
import Lesson from '../src/models/Lesson.js';
import LessonSlide from '../src/models/LessonSlide.js';
import LessonSimulation from '../src/models/LessonSimulation.js';
import LessonSummary from '../src/models/LessonSummary.js';
import LessonQuiz from '../src/models/LessonQuiz.js';
import LessonDocument from '../src/models/LessonDocument.js';

const FIX = process.argv.includes('--fix');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ Thiếu MONGODB_URI');
  process.exit(1);
}

/** Ký tự thay thế / dấu hỏi đứng liền kề chữ cái → dấu hiệu encoding hỏng. */
const BROKEN_PATTERNS = [
  /\?{1,2}[a-zA-ZàáâãèéêìíòóôõùúýÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝĐđ]/, // "B?i", "B??i"
  /\uFFFD/, // �
  /[àáâãèéêìíòóôõùúý]{1,2}[\u0080-\u009F]/, // mojibake Latin-1
  /Ã[¡­]/, // "Bá»" pattern
  /Ä[ÆÐÑ]/, // "Ä" pattern
];

/** Kiểm tra một chuỗi có bị hỏng encoding không. */
export function isBrokenEncoding(value) {
  if (typeof value !== 'string' || !value) return false;
  return BROKEN_PATTERNS.some((re) => re.test(value));
}

/**
 * Sửa chuỗi bị mojibake (UTF-8 đọc như Latin-1) — trường hợp có thể khôi phục.
 * Trả về chuỗi đã sửa, hoặc null nếu không sửa được.
 */
export function repairMojibake(value) {
  if (typeof value !== 'string' || !value) return null;
  try {
    const repaired = Buffer.from(value, 'latin1').toString('utf8');
    // Chỉ chấp nhận nếu kết quả khác và không còn ký tự hỏi/thay thế
    if (repaired !== value && !isBrokenEncoding(repaired)) return repaired;
  } catch {
    /* bỏ qua */
  }
  return null;
}

const MODELS = [
  { name: 'Course', model: Course, fields: ['title', 'description', 'category'] },
  { name: 'Lesson', model: Lesson, fields: ['title', 'knowledgeTitle', 'knowledgeContent', 'slidePdfName', 'slidePdfTitle', 'pdfName'] },
  { name: 'LessonSlide', model: LessonSlide, fields: ['title', 'content', 'note', 'noteLabel'] },
  { name: 'LessonSimulation', model: LessonSimulation, fields: ['description', 'statement', 'videoDescription'] },
  { name: 'LessonSummary', model: LessonSummary, fields: ['title', 'pdfName'] },
  { name: 'LessonQuiz', model: LessonQuiz, fields: ['question', 'explain'] },
  { name: 'LessonDocument', model: LessonDocument, fields: ['title', 'description'] },
];

(async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✓ Đã kết nối MongoDB\n');

  let brokenCount = 0;
  let fixedCount = 0;

  for (const { name, model, fields } of MODELS) {
    const docs = await model.find({}).lean();
    for (const doc of docs) {
      for (const field of fields) {
        const value = doc[field];
        if (!isBrokenEncoding(value)) continue;
        brokenCount += 1;
        console.log(`✗ ${name} (${doc._id}) .${field}`);
        console.log(`    hiện tại: ${JSON.stringify(value)}`);

        if (!FIX) continue;

        const repaired = repairMojibake(value);
        if (repaired) {
          await model.updateOne({ _id: doc._id }, { $set: { [field]: repaired } });
          fixedCount += 1;
          console.log(`    → đã sửa: ${JSON.stringify(repaired)}`);
        } else {
          console.log('    → KHÔNG sửa tự động được (cần sửa tay)');
        }
      }
    }
  }

  console.log('\n---');
  if (brokenCount === 0) {
    console.log('✅ Không phát hiện bản ghi hỏng encoding.');
  } else {
    console.log(`Tổng: ${brokenCount} field hỏng encoding.`);
    if (FIX) console.log(`Đã sửa tự động: ${fixedCount}.`);
    else console.log('Chạy lại với --fix để sửa những case sửa được tự động.');
  }

  await mongoose.disconnect();
  process.exit(0);
})();
