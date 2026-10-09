import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CameraIcon,
  MicIcon,
  CircleCheckBigIcon,
  SparklesIcon,
} from '../icons/index.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { useLoginDrawerStore } from '../../store/loginDrawerStore.js';
import { createConsignmentProduct } from '../../services/consignmentApi.js';
import { fetchProductCategories } from '../../services/productApi.js';

/** 4 ảnh mẫu (preset) cho phép user chọn nhanh khi chưa có ảnh. */
const SAMPLE_IMAGES = [
  {
    id: 'bag',
    label: 'Túi vải',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'keychain',
    label: 'Móc khóa',
    url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'candle',
    label: 'Nến thơm',
    url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'jewelry',
    label: 'Trang sức',
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600',
  },
];

/** Resize + nén ảnh để giữ data URL đủ nhỏ (< 700KB). */
async function fileToCompressedDataUrl(file, maxSize = 800, quality = 0.82) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxSize) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else if (height > maxSize) {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      try {
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export default function QuickSellModal({ isOpen, onClose }) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const openLoginDrawer = useLoginDrawerStore((s) => s.openLoginDrawer);
  const isAuthenticated = Boolean(token || user?._id);

  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const [selectedImage, setSelectedImage] = useState(null); // string URL/dataURL
  const [voiceText, setVoiceText] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(80000);
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);

  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Body scroll lock + Escape close
  useEffect(() => {
    if (!isOpen) return undefined;
    document.body.style.overflow = 'hidden';
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, submitting, onClose]);

  // Reset form khi mở + load categories
  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setSuccess(false);
    setSelectedImage(null);
    setVoiceText('');
    setTitle('');
    setPrice(80000);
    setCategoryId('');
    // Load product categories
    fetchProductCategories()
      .then((cats) => {
        if (Array.isArray(cats) && cats.length > 0) {
          setCategories(cats);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  // Check Speech Recognition support
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(Boolean(SR));
  }, []);

  // Cleanup recognition khi unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  function startRecording() {
    if (!voiceSupported) {
      setError('Trình duyệt chưa hỗ trợ thu âm giọng nói. Bạn hãy gõ mô tả thủ công nhé.');
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'vi-VN';
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = voiceText || '';

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      setVoiceText((finalTranscript + interim).trim());
    };
    recognition.onerror = (event) => {
      setIsRecording(false);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('Bạn cần cho phép truy cập micro để dùng tính năng thu âm.');
      } else {
        setError(`Thu âm lỗi: ${event.error}`);
      }
    };
    recognition.onend = () => setIsRecording(false);

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      setError('');
    } catch (err) {
      setError('Không thể bắt đầu thu âm. Vui lòng thử lại.');
    }
  }

  function stopRecording() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsRecording(false);
  }

  function handleSamplePick(sample) {
    setSelectedImage(sample.url);
    // Auto-fill title nếu còn trống
    setTitle((prev) => (prev.trim() ? prev : sample.label));
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // cho phép chọn lại cùng file
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh.');
      return;
    }
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setSelectedImage(dataUrl);
      setError('');
    } catch (err) {
      setError('Không đọc được ảnh. Vui lòng thử ảnh khác.');
    }
  }

  function validate() {
    if (!selectedImage) {
      setError('Vui lòng chọn ảnh sản phẩm.');
      return false;
    }
    if (!title.trim()) {
      setError('Vui lòng nhập tên sản phẩm.');
      return false;
    }
    if (!price || Number(price) <= 0) {
      setError('Vui lòng nhập giá bán hợp lệ.');
      return false;
    }
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!isAuthenticated) {
      openLoginDrawer('/');
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: voiceText.trim(),
        thumbnail: selectedImage,
        images: [selectedImage],
        price: Number(price),
        category: categoryId || null,
        sellerName: user?.name || 'Nữ công nhân Loom',
        sellerPhone: user?.phone || '',
        stock: 1,
      };
      await createConsignmentProduct(payload);
      setSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          'Gửi bài đăng thất bại. Vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs animate-in fade-in duration-200"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl transition-all md:max-w-2xl lg:max-w-3xl max-h-[90vh]"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-rose-600 via-[#E60067] to-pink-500 p-4 text-white shadow-md md:p-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-base font-bold">
                📸
              </div>
              <div>
                <h2 className="text-sm font-bold md:text-base">
                  Đăng bán sản phẩm 1-Click
                </h2>
                <p className="text-[10px] text-pink-100 md:text-xs">
                  Dành riêng cho Nữ công nhân lao động • Hỗ trợ chỉnh sửa và đăng bài miễn phí
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-full p-1.5 text-white transition-colors hover:bg-white/20 disabled:opacity-50 cursor-pointer"
              aria-label="Đóng"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          {success ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <CircleCheckBigIcon className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Gửi bài đăng thành công!
              </h3>
              <p className="mt-1.5 text-xs text-slate-600">
                Tình nguyện viên / Admin sẽ hỗ trợ tối ưu hình ảnh và chỉnh sửa nội dung
                trong vòng 24h. Bạn sẽ nhận thông báo khi bài được đăng lên chợ.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 rounded-xl bg-[#E60067] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#c90059] cursor-pointer"
              >
                Đóng
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 overflow-y-auto p-4 text-xs md:p-6"
            >
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
                  {error}
                </div>
              )}

              {!isAuthenticated && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                  Bạn cần <b>đăng nhập</b> trước khi gửi bài đăng.{' '}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openLoginDrawer('/');
                    }}
                    className="font-bold text-[#E60067] underline cursor-pointer"
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Step 1: chọn ảnh */}
                <div>
                  <label className="mb-1.5 flex items-center justify-between font-bold text-slate-800">
                    <span>1. Chụp hoặc chọn ảnh sản phẩm 📷</span>
                    <span className="text-[10px] text-[#E60067] font-bold">Bắt buộc</span>
                  </label>
                  <div className="mb-2 grid grid-cols-4 gap-2">
                    {SAMPLE_IMAGES.map((sample) => {
                      const isActive = selectedImage === sample.url;
                      return (
                        <button
                          key={sample.id}
                          type="button"
                          onClick={() => handleSamplePick(sample)}
                          className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                            isActive
                              ? 'border-[#E60067] ring-2 ring-pink-200 shadow-sm'
                              : 'border-slate-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={sample.url}
                            alt={sample.label}
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[8px] text-white">
                            {sample.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Preview ảnh tự upload (nếu có) */}
                  {selectedImage && !SAMPLE_IMAGES.some((s) => s.url === selectedImage) && (
                    <div className="mb-2 flex items-center gap-2 rounded-xl border border-pink-200 bg-pink-50 p-2">
                      <img
                        src={selectedImage}
                        alt="Ảnh của bạn"
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <span className="flex-1 text-[11px] font-medium text-pink-950">
                        Ảnh từ thiết bị của bạn
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedImage(null)}
                        className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-pink-200/80 bg-pink-50 py-2.5 text-[#E60067] font-bold transition-colors hover:bg-pink-100 cursor-pointer"
                  >
                    <CameraIcon className="h-4 w-4 text-[#E60067]" />
                    <span>Mở Camera điện thoại</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    // capture="environment" bật camera sau trên mobile; trên desktop mở picker bình thường
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Step 2: thu âm / mô tả */}
                <div className="rounded-2xl border border-pink-200/80 bg-pink-50/70 p-3.5">
                  <label className="mb-1 flex items-center justify-between font-bold text-pink-950">
                    <span className="flex items-center gap-1.5">
                      <MicIcon className="h-4 w-4 text-[#E60067]" />
                      <span>2. Thu âm giọng nói mô tả sản phẩm 🎙️</span>
                    </span>
                    <span className="rounded-full bg-pink-200 px-2 py-0.5 text-[10px] font-extrabold text-[#E60067]">
                      Tự động chuyển văn bản
                    </span>
                  </label>
                  <p className="mb-2.5 text-[10px] text-slate-500">
                    Nói về sản phẩm của bạn (ví dụ: tên món đồ, màu sắc, cách bạn tự tay làm ra)
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 font-bold transition-all cursor-pointer ${
                        isRecording
                          ? 'bg-rose-600 text-white shadow-md hover:bg-rose-700'
                          : 'bg-[#E60067] text-white shadow-md hover:bg-[#c90059]'
                      }`}
                    >
                      <MicIcon className="h-4 w-4" />
                      <span>
                        {isRecording ? 'Đang thu… bấm để dừng' : 'Bấm để nói thu âm'}
                      </span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={voiceText}
                    onChange={(e) => setVoiceText(e.target.value)}
                    placeholder="Văn bản thu âm tự động hiển thị ở đây..."
                    className="mt-2.5 w-full rounded-xl border border-pink-200 bg-white p-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#E60067] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Step 3: thông tin sản phẩm */}
              <div className="space-y-2">
                <div>
                  <label className="mb-1 block font-bold text-slate-800">
                    3. Tên sản phẩm
                  </label>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Móc khóa hoa len handmade"
                    maxLength={200}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-[#E60067] focus:outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block font-bold text-slate-800">
                      Giá bán (VND)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-[#E60067] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-bold text-slate-800">
                      Danh mục
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 focus:border-[#E60067] focus:outline-hidden"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((c) => (
                        <option key={c._id || c.id} value={c._id || c.id}>
                          {c.icon ? `${c.icon} ` : ''}
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="flex items-start gap-2 rounded-xl border border-pink-200 bg-pink-50 p-2.5 text-[11px] text-pink-950">
                <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#E60067]" />
                <p>
                  Bài đăng sẽ tự động gửi đến <b>Tình nguyện viên / Admin</b> để hỗ trợ tối ưu
                  ánh sáng hình ảnh và sửa câu chữ đẹp mắt trước khi lên chợ!
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#E60067] via-[#f72585] to-rose-600 py-3 text-xs font-bold text-white shadow-lg transition-all hover:from-[#c90059] hover:to-rose-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Đang gửi…</span>
                  </>
                ) : (
                  <>
                    <CircleCheckBigIcon className="h-4 w-4" />
                    <span>Gửi Bài Đăng Ngay</span>
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
