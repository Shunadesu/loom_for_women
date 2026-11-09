import mongoose from 'mongoose';
import Lesson from '../models/Lesson.js';
import LessonQuiz from '../models/LessonQuiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { awardPoints, POINT_RULES } from '../utils/points.js';
import { completeLessonForUser } from '../services/lessonCompletionService.js';

/**
 * POST /api/progress/lessons/:lessonId/quiz
 * Nộp đáp án trắc nghiệm của 1 bài học.
 *
 * Body: { quizId?, answer: 'A'|'B'|'C'|'D', complete?: boolean }
 * Trả về: { isCorrect, correctAnswer, explain, quizCount, attempts }
 *
 * Nếu trả lời đúng và complete=true → tick hoàn thành bài học
 * (dùng lại logic award điểm + cấp chứng chỉ trong progressController).
 */
export const submitQuizAnswer = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Vui lòng đăng nhập để làm trắc nghiệm.' });
    }

    const { lessonId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ error: 'Lesson ID không hợp lệ.' });
    }

    const lesson = await Lesson.findById(lessonId).lean();
    if (!lesson) return res.status(404).json({ error: 'Không tìm thấy bài học.' });

    const { quizId, answer } = req.body || {};
    const normalized = String(answer || '').trim().toUpperCase();

    let quiz = null;
    if (quizId && mongoose.Types.ObjectId.isValid(quizId)) {
      quiz = await LessonQuiz.findOne({ _id: quizId, lessonId: lesson._id }).lean();
    }
    if (!quiz) {
      quiz = await LessonQuiz.findOne({ lessonId: lesson._id })
        .sort({ order: 1, createdAt: 1 })
        .lean();
    }
    if (!quiz) {
      return res.status(404).json({ error: 'Bài học này chưa có câu hỏi trắc nghiệm.' });
    }

    if (!['A', 'B', 'C', 'D'].includes(normalized)) {
      return res.status(400).json({ error: 'Đáp án không hợp lệ.' });
    }

    const isCorrect = normalized === quiz.correct;

    const attempt = await QuizAttempt.create({
      userId: req.user._id,
      courseId: lesson.courseId,
      lessonId: lesson._id,
      quizId: quiz._id,
      answer: normalized,
      isCorrect,
    });

    // Cộng điểm quiz lần đầu (chống double-count)
    if (isCorrect) {
      const txCount = await QuizAttempt.countDocuments({
        userId: req.user._id,
        quizId: quiz._id,
        isCorrect: true,
      });
      if (txCount === 1) {
        await awardPoints({
          userId: req.user._id,
          delta: quiz.points || POINT_RULES.QUIZ_CORRECT,
          type: 'quiz_correct',
          refId: String(quiz._id),
          description: `Trả lời đúng trắc nghiệm: ${lesson.title}`,
        });
      }
    }

    const attempts = await QuizAttempt.countDocuments({
      userId: req.user._id,
      quizId: quiz._id,
    });

    // Đánh dấu hoàn thành bài học khi trả lời đúng TẤT CẢ câu hỏi.
    // Nếu bài học chỉ có 1 câu thì hành vi giống cũ (đúng 1 câu là xong).
    let progressPct = null;
    let totalQuizzes = 0;
    let correctQuizzes = 0;
    let allCorrect = false;

    const lessonQuizzes = await LessonQuiz.find({ lessonId: lesson._id })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    totalQuizzes = lessonQuizzes.length;

    if (totalQuizzes > 0) {
      const correctQuizIds = await QuizAttempt.distinct('quizId', {
        userId: req.user._id,
        lessonId: lesson._id,
        isCorrect: true,
      });
      const correctSet = new Set(correctQuizIds.map(String));
      correctQuizzes = lessonQuizzes.filter((q) => correctSet.has(String(q._id))).length;
      allCorrect = correctQuizzes === totalQuizzes;

      if (allCorrect && req.body?.complete !== false) {
        const result = await completeLessonForUser(req.user._id, lesson);
        progressPct = result.progressPct;
      }
    }

    res.json({
      isCorrect,
      correctAnswer: quiz.correct,
      explain: quiz.explain || '',
      quizId: String(quiz._id),
      attemptId: String(attempt._id),
      attempts,
      progressPct,
      totalQuizzes,
      correctQuizzes,
      allCorrect,
    });
  } catch (err) {
    console.error('submitQuizAnswer error', err);
    res.status(500).json({ error: 'Không chấm được câu trả lời.' });
  }
};

/**
 * GET /api/progress/lessons/:lessonId/quiz
 * Trả về câu hỏi (không kèm đáp án đúng) + lịch sử trả lời của user.
 */
export const getLessonQuiz = async (req, res) => {
  try {
    const { lessonId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ error: 'Lesson ID không hợp lệ.' });
    }

    const quizzes = await LessonQuiz.find({ lessonId })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    let attempts = [];
    if (req.user) {
      attempts = await QuizAttempt.find({
        userId: req.user._id,
        lessonId,
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    const items = quizzes.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      type: q.type,
      videoUrl: q.videoUrl,
      videoDescription: q.videoDescription,
      points: q.points,
      order: q.order,
    }));

    res.json({ items, attempts });
  } catch (err) {
    console.error('getLessonQuiz error', err);
    res.status(500).json({ error: 'Không tải được câu hỏi.' });
  }
};
