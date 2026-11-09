/**
 * Logic thuần của editor bài học 4 phần — tách riêng khỏi JSX
 * để có thể kiểm thử bằng Node (không cần transform JSX).
 */

/**
 * Chuẩn hoá danh sách phát biểu Đúng/Sai của 1 mô phỏng.
 * Hỗ trợ dữ liệu mới (`statements[]`) và dữ liệu cũ (`statement` + `isCorrect`).
 * @param {object} simulation
 * @returns {Array<{text:string,isCorrect:boolean}>}
 */
export function toStatements(simulation) {
  const list = Array.isArray(simulation?.statements) ? simulation.statements : [];
  const mapped = list
    .map((s) => ({
      text: String(s?.text ?? '').trim(),
      isCorrect: s?.isCorrect !== false,
    }))
    .filter((s) => s.text);
  if (mapped.length > 0) return mapped;
  // Fallback dữ liệu cũ: 1 phát biểu phẳng
  const legacyText = String(simulation?.statement ?? '').trim();
  if (!legacyText) return [];
  return [{ text: legacyText, isCorrect: simulation?.isCorrect !== false }];
}

/** Mô phỏng có ít nhất 1 phát biểu Đúng/Sai hay không. */
export function hasStatements(simulation) {
  return toStatements(simulation).length > 0;
}

/** Bản nháp bài học mới — đủ 4 phần + media. */
export function createLessonDraft(contentType = 'video') {
  return {
    key: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    id: null,
    title: '',
    durationSeconds: 0,
    // ─── Phần 1: kiến thức ───
    knowledgeTitle: '',
    knowledgeContent: '',
    slidePdfTitle: '',
    slidePdfFile: null,
    slidePdfName: '',
    slidePdfUrl: '',
    slides: [],
    // ─── Phần 2: mô phỏng ───
    simulation: { videoUrl: '', description: '', statements: [] },
    // ─── Phần 3: tóm tắt ───
    summary: { format: 'pdf_video', imageUrl: '', videoUrl: '', title: '' },
    summaryImageFile: null,
    summaryPdfFile: null,
    // ─── Phần 4: trắc nghiệm ───
    quizzes: [],
    // ─── Media bổ sung ───
    contentType,
    videoUrl: '',
    imageUrl: '',
    pdfFile: null,
    pdfUrl: '',
    pdfName: '',
  };
}

/** Chuyển bài học từ server (kèm content 4 phần) về bản nháp để chỉnh sửa. */
export function lessonToDraft(lesson, content = null) {
  const videoUrl = lesson.videoProvider === 'drive'
    ? `https://drive.google.com/file/d/${lesson.driveFileId}/view`
    : lesson.youtubeId
      ? `https://www.youtube.com/watch?v=${lesson.youtubeId}`
      : '';
  return {
    ...createLessonDraft(lesson.contentType || 'video'),
    key: lesson._id,
    id: lesson._id,
    title: lesson.title || '',
    durationSeconds: Number(lesson.durationSeconds) || 0,
    knowledgeTitle: lesson.knowledgeTitle || '',
    knowledgeContent: lesson.knowledgeContent || '',
    slidePdfTitle: lesson.slidePdfTitle || '',
    slidePdfName: lesson.slidePdfName || '',
    slidePdfUrl: lesson.slidePdfUrl || '',
    slides: (content?.slides || []).map((s) => ({
      title: s.title || '',
      content: s.content || '',
      bullets: s.bullets || [],
      imageUrl: s.imageUrl || '',
      note: s.note || '',
      noteLabel: s.noteLabel || '',
    })),
    simulation: content?.simulations?.[0]
      ? {
          videoUrl: content.simulations[0].videoUrl || '',
          description: content.simulations[0].description || '',
          statements: toStatements(content.simulations[0]),
        }
      : { videoUrl: '', description: '', statements: [] },
    summary: content?.summary
      ? {
          format: content.summary.format || 'pdf_video',
          imageUrl: content.summary.imageUrl || '',
          videoUrl: content.summary.videoUrl || '',
          title: content.summary.title || '',
          pdfUrl: content.summary.pdfUrl || '',
          pdfName: content.summary.pdfName || '',
        }
      : { format: 'pdf_video', imageUrl: '', videoUrl: '', title: '' },
    quizzes: (content?.quizzes || []).map((q) => ({
      question: q.question || '',
      options: q.options || { A: '', B: '', C: '', D: '' },
      correct: q.correct || 'B',
      videoUrl: q.videoUrl || '',
      videoDescription: q.videoDescription || '',
      explain: q.explain || '',
      type: q.type || 'single',
    })),
    videoUrl,
    imageUrl: lesson.imageUrl || '',
    pdfUrl: lesson.pdfUrl || '',
    pdfName: lesson.pdfName || '',
  };
}

/** Đóng gói bản nháp thành FormData gửi lên API (kèm đủ 4 phần). */
export function draftToFormData(draft, order) {
  const form = new FormData();
  form.append('title', (draft.title || '').trim());
  form.append('contentType', draft.contentType || 'video');
  form.append('durationSeconds', String(Number(draft.durationSeconds) || 0));
  if (order !== undefined) form.append('order', String(order));

  // Media bổ sung
  if (draft.contentType === 'image_pdf') {
    form.append('imageUrl', (draft.imageUrl || '').trim());
  } else {
    form.append('videoUrl', (draft.videoUrl || '').trim());
  }
  if (draft.pdfFile) form.append('pdf', draft.pdfFile);

  // Phần 1
  form.append('knowledgeTitle', (draft.knowledgeTitle || '').trim());
  form.append('knowledgeContent', (draft.knowledgeContent || '').trim());
  form.append('slidePdfTitle', (draft.slidePdfTitle || '').trim());
  form.append('slides', JSON.stringify(draft.slides || []));
  if (draft.slidePdfFile) form.append('slidePdf', draft.slidePdfFile);

  // Phần 2
  const sim = draft.simulation || {};
  const statements = toStatements(sim);
  const simulationPayload = {
    videoUrl: (sim.videoUrl || '').trim(),
    description: (sim.description || '').trim(),
    statements,
  };
  form.append(
    'simulations',
    JSON.stringify(
      simulationPayload.videoUrl ||
        simulationPayload.description ||
        statements.length > 0
        ? [simulationPayload]
        : []
    )
  );

  // Phần 3
  form.append('summary', JSON.stringify(draft.summary || {}));
  if (draft.summaryImageFile) form.append('summaryImage', draft.summaryImageFile);
  if (draft.summaryPdfFile) form.append('summaryPdf', draft.summaryPdfFile);

  // Phần 4
  form.append('quizzes', JSON.stringify(draft.quizzes || []));

  return form;
}

/**
 * Kiểm tra bài học có đủ 4 phần hay chưa — trả về danh sách phần còn thiếu.
 * @param {object} draft
 * @returns {string[]} các phần còn thiếu
 */
export function missingParts(draft) {
  const missing = [];
  if (!(draft.slides || []).length) missing.push('slide');
  const sim = draft.simulation || {};
  if (
    !sim.videoUrl?.trim() &&
    !sim.description?.trim() &&
    !hasStatements(sim)
  ) {
    missing.push('mô phỏng');
  }
  const sum = draft.summary || {};
  if (!sum.imageUrl?.trim() && !sum.videoUrl?.trim() && !sum.pdfUrl?.trim()) {
    missing.push('tóm tắt');
  }
  if (!(draft.quizzes || []).length) missing.push('trắc nghiệm');
  return missing;
}
