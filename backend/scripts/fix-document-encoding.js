/**
 * Fix lỗi font tiếng Việt cho các bản ghi LessonDocument đã seed sai encoding.
 *
 * Triệu chứng: title chứa các ký tự `?` thay cho ký hiệu tiếng Việt có dấu
 * (ví dụ: "B?ng t�nh" thay vì "Bảng tính").
 *
 * Cách xử lý:
 *   1. Quét LessonDocument có title chứa pattern lỗi encoding.
 *   2. So khớp với bảng SAMPLE_DOCS (title chuẩn) ở seed-documents.js.
 *   3. Cập nhật lại title (và description) cho đúng bản gốc.
 *
 *   node scripts/fix-document-encoding.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';

import LessonDocument from '../src/models/LessonDocument.js';

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('Thiếu MONGODB_URI trong .env');
  process.exit(1);
}

/**
 * Mapping chuẩn: courseTitle → list documents (bản gốc tiếng Việt).
 * Giữ đồng bộ với scripts/seed-documents.js.
 */
const SAMPLE_DOCS = {
  'Nhận diện và phòng chống lừa đảo trực tuyến': [
    {
      title: 'Sổ tay nhận diện 15 thủ đoạn lừa đảo việc làm online mới nhất 2026',
      description:
        'Tài liệu chi tiết phân tích 15 kịch bản lừa đảo nhắm vào công nhân nữ, cách nhận diện đường link giả mạo và số điện thoại tố cáo.',
    },
    {
      title: 'Cẩm nang 3 KHÔNG - Bảo vệ tài khoản Zalo & Ngân hàng',
      description:
        'Quy tắc an toàn số cơ bản: KHÔNG bấm đường link lạ - KHÔNG chuyển tiền cọc - KHÔNG cung cấp mã OTP cho bất kỳ ai.',
    },
    {
      title: 'Infographic: Quy trình 4 bước báo xấu & khóa tài khoản khẩn cấp',
      description:
        'Hình ảnh trực quan cô đọng quy trình xử lý khi nghi ngờ bị lộ thông tin tài khoản ngân hàng hoặc tài khoản Zalo.',
    },
  ],
  'Học cách móc len tại nhà': [
    {
      title: 'Sơ đồ móc hoa hồng tulip cotton milk 5 cánh (Bản in PDF chi tiết)',
      description:
        'Bản vẽ ký hiệu chart móc hoa tulip và hoa hướng dương kèm hình chụp từng bước, giúp chị em dễ dàng thực hành tại nhà.',
    },
    {
      title: 'Bảng tra cứu các loại mũi móc cơ bản & Ký hiệu móc len quốc tế',
      description:
        'Tài liệu gối đầu giường cho người mới học móc len: bảng đối chiếu ký hiệu tiếng Việt - tiếng Anh - hình vẽ minh họa.',
    },
    {
      title: 'Hướng dẫn chụp ảnh sản phẩm len bằng điện thoại đẹp như studio',
      description:
        'Mẹo chụp ảnh sản phẩm handmade bằng ánh sáng tự nhiên, cách canh góc và viết mô tả thu hút trên Chợ sinh kế Loom.',
    },
    {
      title: 'Bảng tính định giá bán sản phẩm thủ công (Tính chi phí len & công móc)',
      description:
        'File mẫu Excel tính giá thành: tự động tính chi phí cuộn len, phụ kiện cành kẽm, giấy gói và gợi ý mức giá bán lãi 40-50%.',
    },
  ],
  'Quản lý tài chính': [
    {
      title: 'Bảng tính mẫu chia lương 50-30-20 (Excel tính chi tiêu gia đình tự động)',
      description:
        'File Excel mẫu đã cài sẵn công thức: nhập tổng lương tháng và thu nhập phụ, tự động phân bổ vào 3 hũ Nhu cầu - Dự phòng - Đầu tư.',
    },
    {
      title: 'Hướng dẫn ghi chép sổ thu chi điện tử trên Zalo',
      description:
        'Sổ tay hướng dẫn tận dụng tin nhắn tự lưu (Cloud của tôi) trên Zalo để ghi chép các khoản chi chợ búa, con cái hàng ngày không bị quên.',
    },
    {
      title: '6 Bước xây dựng Quỹ dự phòng khẩn cấp cho gia đình công nhân',
      description:
        'Tài liệu hướng dẫn cách tiết kiệm 3-6 tháng chi tiêu tối thiểu mà không ảnh hưởng tới chất lượng sinh hoạt của con cái.',
    },
  ],
};

/**
 * So khớp 2 chuỗi bằng cách chuẩn hóa về dạng không dấu + chỉ giữ chữ cái/số,
 * đồng thời loại bỏ khoảng trắng để so sánh "trượt".
 * Dùng để đối chiếu title bị lỗi encoding với title chuẩn.
 */
function normalize(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .replace(/[^\w\s]/g, ' ') // thay ký tự đặc biệt (gồm cả ?, �) bằng space
    .replace(/\s+/g, '') // bỏ luôn khoảng trắng
    .toLowerCase();
}

/**
 * Phiên bản bỏ luôn dấu và cả các nguyên âm — dùng để so sánh
 * với title bị mất nguyên âm do lỗi encoding.
 */
function stripVowels(str) {
  return normalize(str).replace(/[aeiouy]/g, '');
}

/** Levenshtein distance tối ưu bộ nhớ (2 hàng). */
function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1, // insert
        prev[j] + 1, // delete
        prev[j - 1] + cost, // replace
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

/**
 * Tìm bản gốc khớp nhất với `brokenTitle`.
 * Trả về bản gốc hoặc null nếu không tìm thấy.
 * Chiến lược:
 *  1. So khớp chính xác sau khi normalize.
 *  2. Nếu không khớp, so bằng Levenshtein trên chuỗi đã bỏ nguyên âm
 *     (xử lý case bị mất cả nguyên âm có dấu) — ngưỡng 25%.
 */
function findBestMatch(brokenTitle, candidates) {
  // 1. Khớp chính xác
  const exact = candidates.find((c) => normalize(c.title) === normalize(brokenTitle));
  if (exact) return exact;

  // 2. Khớp mờ bằng bỏ nguyên âm
  const a = stripVowels(brokenTitle);
  let best = null;
  let bestScore = Infinity;
  for (const c of candidates) {
    const b = stripVowels(c.title);
    const dist = levenshtein(a, b);
    const ratio = dist / Math.max(a.length, b.length, 1);
    if (ratio < bestScore) {
      bestScore = ratio;
      best = c;
    }
  }
  return bestScore <= 0.25 ? best : null;
}

/** Detect title có dấu hiệu lỗi encoding: chứa ký tự `?` hoặc U+FFFD. */
function isBroken(str) {
  if (!str) return false;
  return /\?/.test(str) || /\uFFFD/.test(str);
}

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Fix:Documents] Đã kết nối MongoDB.');

    // Lập danh sách candidates từ SAMPLE_DOCS
    const candidates = [];
    for (const docs of Object.values(SAMPLE_DOCS)) {
      for (const d of docs) candidates.push(d);
    }

    const all = await LessonDocument.find().lean();
    let fixed = 0;
    let alreadyOk = 0;
    let unmatched = 0;

    for (const doc of all) {
      if (!isBroken(doc.title)) {
        alreadyOk += 1;
        continue;
      }

      const target = findBestMatch(doc.title, candidates);

      if (!target) {
        unmatched += 1;
        console.warn(`[Fix:Documents] ! Không tìm thấy bản chuẩn cho: "${doc.title}"`);
        continue;
      }

      await LessonDocument.updateOne(
        { _id: doc._id },
        { $set: { title: target.title, description: target.description } },
      );
      fixed += 1;
      console.log(`[Fix:Documents] + ${target.title}`);
    }

    console.log(
      `\n[Fix:Documents] Xong. Đã sửa: ${fixed}. Đã đúng sẵn: ${alreadyOk}. Không khớp: ${unmatched}.`,
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Fix:Documents] Lỗi:', err);
    process.exit(1);
  }
})();
