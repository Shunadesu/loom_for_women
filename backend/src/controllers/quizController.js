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
 * KHÁCH (chưa đăng nhập) cũng nộp được — backend vẫn chấm và trả đáp án đúng +
 * giải thích, nhưng KHÔNG lưu QuizAttempt / điểm / tiến độ (các bản ghi này
 * đều cần userId). Frontend tự hiện nhắc đăng nhập để lưu tiến độ.
 *
 * Nếu trả lời đúng và complete=true → tick hoàn thành bài học
 * (dùng lại logic award điểm + cấp chứng chỉ trong progressController).
 */
export const submitQuizAnswer = async (req, res) => {
  try {
    // Token có format Bearer nhưng không hợp lệ / hết hạn → báo 401 để
    // frontend mở drawer đăng nhập. KHÔNG âm thầm hạ xuống chế độ khách,
    // nếu không học viên sẽ tưởng đã lưu tiến độ.
    const authHeader = req.headers.authorization || '';
    const hasToken =
      authHeader.startsWith('Bearer ') && authHeader.slice(7).trim();
    if (!req.user && hasToken) {
      return res
        .status(401)
        .json({ error: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.' });
    }
    const isGuest = !req.user;

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

    // Tổng số câu hỏi của bài học — cần cho cả 2 nhánh (khách / đã đăng nhập).
    const lessonQuizzes = await LessonQuiz.find({ lessonId: lesson._id })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    const totalQuizzes = lessonQuizzes.length;

    // ─── Khách (chưa đăng nhập) ───
    // Chỉ chấm và trả đáp án đúng + giải thích. KHÔNG tạo QuizAttempt,
    // KHÔNG cộng điểm, KHÔNG tick hoàn thành (tất cả đều cần userId).
    // Frontend tự đếm số câu đúng và hiện nhắc đăng nhập để lưu tiến độ.
    if (isGuest) {
      return res.json({
        isCorrect,
        correctAnswer: quiz.correct,
        explain: quiz.explain || '',
        quizId: String(quiz._id),
        attemptId: null,
        attempts: 0,
        progressPct: null,
        totalQuizzes,
        correctQuizzes: null,
        allCorrect: null,
        guest: true,
      });
    }

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
    let correctQuizzes = 0;
    let allCorrect = false;

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
      guest: false,
    });
  } catch (err) {
    console.error('submitQuizAnswer error', err);
    res.status(500).json({ error: 'Không chấm được câu trả lời.' });
  }
};

/**
 * POST /api/progress/lessons/:lessonId/quiz/submit
 * Nộp TOÀN BỘ đáp án trắc nghiệm của 1 bài học trong 1 lần.
 *
 * Body: { answers: [{ quizId, answer }], complete?: boolean }
 * Trả về: {
 *   results: [{ quizId, answer, isCorrect, correctAnswer, explain }],
 *   correctQuizzes, allCorrect, totalQuizzes, progressPct, guest
 * }
 *
 * Dùng cho luồng "điền hết rồi nộp 1 lần" — thay vì gọi
 * POST /lessons/:lessonId/quiz nhiều lần (mỗi câu 1 request).
 *
 * KHÁCH (chưa đăng nhập) cũng nộp được — backend vẫn chấm và trả đáp án đúng +
 * giải thích, nhưng KHÔNG lưu QuizAttempt / điểm / tiến độ.
 */
export const submitQuizAnswers = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const hasToken =
      authHeader.startsWith('Bearer ') && authHeader.slice(7).trim();
    if (!req.user && hasToken) {
      return res
        .status(401)
        .json({ error: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.' });
    }
    const isGuest = !req.user;

    const { lessonId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ error: 'Lesson ID không hợp lệ.' });
    }

    const lesson = await Lesson.findById(lessonId).lean();
    if (!lesson) return res.status(404).json({ error: 'Không tìm thấy bài học.' });

    const rawAnswers = Array.isArray(req.body?.answers) ? req.body.answers : [];
    if (rawAnswers.length === 0) {
      return res.status(400).json({ error: 'Chưa có đáp án nào để nộp.' });
    }

    const lessonQuizzes = await LessonQuiz.find({ lessonId: lesson._id })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    if (lessonQuizzes.length === 0) {
      return res.status(404).json({ error: 'Bài học này chưa có câu hỏi trắc nghiệm.' });
    }
    const totalQuizzes = lessonQuizzes.length;

    // Gom đáp án theo quizId, bỏ qua câu không thuộc bài học hoặc sai định dạng.
    const quizById = new Map(lessonQuizzes.map((q) => [String(q._id), q]));
    const entries = [];
    for (const item of rawAnswers) {
      const quizId = String(item?.quizId || '');
      const answer = String(item?.answer || '').trim().toUpperCase();
      if (!['A', 'B', 'C', 'D'].includes(answer)) continue;
      const quiz = quizById.get(quizId);
      if (!quiz) continue;
      entries.push({
        quiz,
        answer,
        isCorrect: answer === quiz.correct,
      });
    }
    if (entries.length === 0) {
      return res.status(400).json({ error: 'Đáp án không hợp lệ.' });
    }

    const results = entries.map((e) => ({
      quizId: String(e.quiz._id),
      answer: e.answer,
      isCorrect: e.isCorrect,
      correctAnswer: e.quiz.correct,
      explain: e.quiz.explain || '',
    }));

    // ─── Khách (chưa đăng nhập) ───
    // Chỉ chấm, không tạo QuizAttempt / không cộng điểm / không tick hoàn thành.
    if (isGuest) {
      const correctQuizzes = results.filter((r) => r.isCorrect).length;
      return res.json({
        results,
        totalQuizzes,
        correctQuizzes,
        allCorrect: correctQuizzes === totalQuizzes,
        progressPct: null,
        guest: true,
      });
    }

    // ─── Đã đăng nhập ───
    for (const e of entries) {
      await QuizAttempt.create({
        userId: req.user._id,
        courseId: lesson.courseId,
        lessonId: lesson._id,
        quizId: e.quiz._id,
        answer: e.answer,
        isCorrect: e.isCorrect,
      });

      // Cộng điểm lần đầu (chống double-count)
      if (e.isCorrect) {
        const txCount = await QuizAttempt.countDocuments({
          userId: req.user._id,
          quizId: e.quiz._id,
          isCorrect: true,
        });
        if (txCount === 1) {
          await awardPoints({
            userId: req.user._id,
            delta: e.quiz.points || POINT_RULES.QUIZ_CORRECT,
            type: 'quiz_correct',
            refId: String(e.quiz._id),
            description: `Trả lời đúng trắc nghiệm: ${lesson.title}`,
          });
        }
      }
    }

    // Đánh dấu hoàn thành bài học khi trả lời đúng TẤT CẢ câu hỏi.
    let progressPct = null;
    let correctQuizzes = 0;
    let allCorrect = false;

    if (totalQuizzes > 0) {
      const correctQuizIds = await QuizAttempt.distinct('quizId', {
        userId: req.user._id,
        lessonId: lesson._id,
        isCorrect: true,
      });
      const correctSet = new Set(correctQuizIds.map(String));
      correctQuizzes = lessonQuizzes.filter((q) =>
        correctSet.has(String(q._id))
      ).length;
      allCorrect = correctQuizzes === totalQuizzes;

      if (allCorrect && req.body?.complete !== false) {
        const result = await completeLessonForUser(req.user._id, lesson);
        progressPct = result.progressPct;
      }
    }

    res.json({
      results,
      totalQuizzes,
      correctQuizzes,
      allCorrect,
      progressPct,
      guest: false,
    });
  } catch (err) {
    console.error('submitQuizAnswers error', err);
    res.status(500).json({ error: 'Không chấm được câu trả lời.' });
  }
};

/**
 * GET /api/progress/lessons/:lessonId/quiz/answers
 * Trả về TOÀN BỘ câu hỏi kèm đáp án đúng + giải thích, để học viên xem lại
 * sau khi nộp bài (không cần đăng nhập).
 *
 * Endpoint này cố ý công khai: học viên đã xem hết bài học rồi mới nộp trắc
 * nghiệm, nên không có lý do gì chặn họ xem lại đáp án.
 */
export const getLessonQuizAnswers = async (req, res) => {
  try {
    const { lessonId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ error: 'Lesson ID không hợp lệ.' });
    }

    const quizzes = await LessonQuiz.find({ lessonId })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    const items = quizzes.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      type: q.type,
      correct: q.correct,
      explain: q.explain || '',
      order: q.order,
    }));

    res.json({ items });
  } catch (err) {
    console.error('getLessonQuizAnswers error', err);
    res.status(500).json({ error: 'Không tải được đáp án.' });
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
