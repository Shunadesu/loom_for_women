import mongoose from 'mongoose';
import LessonSlide from '../models/LessonSlide.js';
import LessonQuiz from '../models/LessonQuiz.js';
import LessonSimulation from '../models/LessonSimulation.js';
import LessonSummary from '../models/LessonSummary.js';
import { extractYoutubeId } from '../utils/youtube.js';

/**
 * Dịch vụ dùng chung cho nội dung bài học 4 phần:
 *   1. Cung cấp kiến thức (LessonSlide[] + PDF slide trên Lesson)
 *   2. Mô phỏng tình huống (LessonSimulation[])
 *   3. Tóm tắt bài học (LessonSummary)
 *   4. Đánh giá trắc nghiệm (LessonQuiz[])
 */

/** Parse JSON an toàn từ FormData (multer để mọi field thành string). */
export function parseJsonField(value, fallback = null) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

const toArray = (value) => (Array.isArray(value) ? value : []);

const clean = (value, max = 1000) =>
  String(value ?? '').trim().slice(0, max);

/**
 * Ghi (replace toàn bộ) slides của 1 bài học.
 * @returns {Promise<number>} số slide đã lưu
 */
export async function replaceSlides(lessonId, courseId, slides) {
  await LessonSlide.deleteMany({ lessonId });
  const docs = toArray(slides)
    .map((s, i) => {
      const title = clean(s?.title, 300);
      if (!title) return null;
      return {
        lessonId,
        courseId,
        title,
        content: clean(s?.content, 4000),
        bullets: toArray(s?.bullets)
          .map((b) => clean(b, 500))
          .filter(Boolean),
        imageUrl: clean(s?.imageUrl, 1000),
        note: clean(s?.note, 1000),
        noteLabel: clean(s?.noteLabel, 200),
        durationSeconds: Math.max(0, Number(s?.durationSeconds) || 0),
        order: Number.isFinite(+s?.order) ? +s.order : i,
      };
    })
    .filter(Boolean);
  if (docs.length > 0) await LessonSlide.insertMany(docs);
  return docs.length;
}

/** Ghi (replace toàn bộ) quiz của 1 bài học. */
export async function replaceQuizzes(lessonId, courseId, quizzes) {
  await LessonQuiz.deleteMany({ lessonId });
  const docs = toArray(quizzes)
    .map((q, i) => {
      const question = clean(q?.question, 1000);
      if (!question) return null;
      const options = {
        A: clean(q?.options?.A, 500),
        B: clean(q?.options?.B, 500),
        C: clean(q?.options?.C, 500),
        D: clean(q?.options?.D, 500),
      };
      const correct = ['A', 'B', 'C', 'D'].includes(q?.correct) ? q.correct : 'B';
      return {
        lessonId,
        courseId,
        question,
        options,
        correct,
        type: q?.type === 'true_false' ? 'true_false' : 'single',
        videoUrl: clean(q?.videoUrl, 1000),
        youtubeId: extractYoutubeId(q?.videoUrl) || '',
        videoDescription: clean(q?.videoDescription, 1000),
        explain: clean(q?.explain, 1000),
        points: Math.max(0, Number(q?.points) || 0),
        order: Number.isFinite(+q?.order) ? +q.order : i,
      };
    })
    .filter(Boolean);
  if (docs.length > 0) await LessonQuiz.insertMany(docs);
  return docs.length;
}

/** Ghi (replace toàn bộ) mô phỏng của 1 bài học. */
export async function replaceSimulations(lessonId, courseId, simulations) {
  await LessonSimulation.deleteMany({ lessonId });
  const docs = toArray(simulations)
    .map((sim, i) => {
      const videoUrl = clean(sim?.videoUrl, 1000);
      const description = clean(sim?.description, 2000);
      const statement = clean(sim?.statement, 1000);
      if (!videoUrl && !description && !statement) return null;
      return {
        lessonId,
        courseId,
        videoUrl,
        youtubeId: extractYoutubeId(videoUrl) || '',
        description,
        statement,
        isCorrect: sim?.isCorrect !== false,
        order: Number.isFinite(+sim?.order) ? +sim.order : i,
      };
    })
    .filter(Boolean);
  if (docs.length > 0) await LessonSimulation.insertMany(docs);
  return docs.length;
}

/**
 * Ghi (replace) phần tóm tắt của 1 bài học.
 * @param {object} payload - { format, imageUrl, videoUrl, title, pdfUrl, pdfName }
 */
export async function replaceSummary(lessonId, courseId, payload = {}) {
  await LessonSummary.deleteMany({ lessonId });
  const format = ['pdf_video', 'pdf', 'video'].includes(payload.format)
    ? payload.format
    : 'pdf_video';
  const imageUrl = clean(payload.imageUrl, 1000);
  const videoUrl = clean(payload.videoUrl, 1000);
  const pdfUrl = clean(payload.pdfUrl, 1000);
  if (!imageUrl && !videoUrl && !pdfUrl) return 0;
  await LessonSummary.create({
    lessonId,
    courseId,
    format,
    imageUrl,
    pdfUrl,
    pdfName: clean(payload.pdfName, 300),
    videoUrl,
    youtubeId: extractYoutubeId(videoUrl) || '',
    title: clean(payload.title, 300),
    order: 0,
  });
  return 1;
}

/**
 * Lấy map nội dung 4 phần cho nhiều lesson.
 * @param {Array} lessonIds
 * @returns {Promise<Map<string, object>>}
 */
export async function getLessonContentMap(lessonIds) {
  const ids = toArray(lessonIds).filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );
  const map = new Map();
  if (ids.length === 0) return map;

  const [slides, quizzes, simulations, summaries] = await Promise.all([
    LessonSlide.find({ lessonId: { $in: ids } })
      .sort({ order: 1, createdAt: 1 })
      .lean(),
    LessonQuiz.find({ lessonId: { $in: ids } })
      .sort({ order: 1, createdAt: 1 })
      .lean(),
    LessonSimulation.find({ lessonId: { $in: ids } })
      .sort({ order: 1, createdAt: 1 })
      .lean(),
    LessonSummary.find({ lessonId: { $in: ids } })
      .sort({ order: 1, createdAt: 1 })
      .lean(),
  ]);

  const push = (doc, key) => {
    const lessonKey = String(doc.lessonId);
    if (!map.has(lessonKey)) {
      map.set(lessonKey, { slides: [], quizzes: [], simulations: [], summaries: [] });
    }
    map.get(lessonKey)[key].push(doc);
  };

  slides.forEach((doc) => push(doc, 'slides'));
  quizzes.forEach((doc) => push(doc, 'quizzes'));
  simulations.forEach((doc) => push(doc, 'simulations'));
  summaries.forEach((doc) => push(doc, 'summaries'));

  // Chuẩn hoá output cho từng lesson
  const result = new Map();
  ids.forEach((id) => {
    const key = String(id);
    const entry = map.get(key) || {
      slides: [],
      quizzes: [],
      simulations: [],
      summaries: [],
    };
    result.set(key, {
      slides: entry.slides,
      quizzes: entry.quizzes,
      simulations: entry.simulations,
      summary: entry.summaries[0] || null,
    });
  });
  return result;
}

/** Xoá toàn bộ nội dung 4 phần của 1 lesson (khi xoá lesson). */
export async function purgeLessonContent(lessonId) {
  await Promise.all([
    LessonSlide.deleteMany({ lessonId }),
    LessonQuiz.deleteMany({ lessonId }),
    LessonSimulation.deleteMany({ lessonId }),
    LessonSummary.deleteMany({ lessonId }),
  ]);
}
