/**
 * Đọc nội dung bằng giọng nói (Web Speech API) cho nút "Nghe thuyết minh".
 *
 * Không dùng thư viện ngoài — trình duyệt hỗ trợ sẵn.
 * Hỗ trợ cả `speechSynthesis` và `webkitSpeechSynthesis` (Safari cũ).
 */

const getSynth = () => {
  if (typeof window === 'undefined') return null;
  return window.speechSynthesis || window.webkitSpeechSynthesis || null;
};

/** Kiểm tra trình duyệt có hỗ trợ đọc văn bản. */
export function isSpeechSupported() {
  return Boolean(getSynth());
}

/** Dừng mọi phát thanh đang chạy. */
export function stopSpeaking() {
  const synth = getSynth();
  if (synth) {
    try {
      synth.cancel();
    } catch {
      // bỏ qua
    }
  }
}

/**
 * Đọc 1 đoạn văn bản.
 * @param {string} text
 * @param {object} options - { lang = 'vi-VN', rate = 0.95, pitch = 1, onEnd, onStart }
 * @returns {boolean} true nếu đã bắt đầu đọc
 */
export function speak(text, options = {}) {
  const synth = getSynth();
  const content = String(text || '').trim();
  if (!synth || !content) return false;

  try {
    synth.cancel();
    const utterance = new window.SpeechSynthesisUtterance(content);
    utterance.lang = options.lang || 'vi-VN';
    utterance.rate = options.rate ?? 0.95;
    utterance.pitch = options.pitch ?? 1;
    if (typeof options.onStart === 'function') {
      utterance.onstart = options.onStart;
    }
    if (typeof options.onEnd === 'function') {
      utterance.onend = options.onEnd;
      utterance.onerror = options.onEnd;
    }
    synth.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

/**
 * Tạo nội dung đọc từ 1 slide: tiêu đề + gạch đầu dòng + ghi chú.
 * @param {object} slide
 * @returns {string}
 */
export function buildSlideSpeech(slide) {
  if (!slide) return '';
  const parts = [];
  if (slide.title) parts.push(slide.title);
  if (slide.content) parts.push(slide.content);
  const bullets = Array.isArray(slide.bullets) ? slide.bullets.filter(Boolean) : [];
  if (bullets.length > 0) {
    parts.push(bullets.map((b) => `• ${b}`).join('. '));
  }
  if (slide.note) {
    parts.push(`${slide.noteLabel || 'Lưu ý'}: ${slide.note}`);
  }
  return parts.join('. ');
}
