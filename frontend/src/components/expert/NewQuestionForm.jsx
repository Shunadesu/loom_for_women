import { useState } from 'react';

const CATEGORIES = [
  'Lừa đảo trực tuyến',
  'Tài chính gia đình',
  'Kỹ năng thủ công',
  'Sức khỏe lao động',
  'Quyền lợi lao động',
  'An toàn lao động',
  'Khác',
];

const PRIORITIES = [
  { value: 'normal', label: 'Bình thường' },
  { value: 'high', label: 'Gấp' },
  { value: 'urgent', label: 'Khẩn cấp' },
];

export default function NewQuestionForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    category: CATEGORIES[0],
    priority: 'normal',
    title: '',
    content: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề câu hỏi';
    } else if (formData.title.trim().length < 10) {
      newErrors.title = 'Tiêu đề phải có tối thiểu 10 ký tự';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Vui lòng nhập nội dung câu hỏi';
    } else if (formData.content.trim().length < 20) {
      newErrors.content = 'Nội dung phải có tối thiểu 20 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        category: CATEGORIES[0],
        priority: 'normal',
        title: '',
        content: '',
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
          <p className="font-bold mb-1">💡 Lưu ý khi đặt câu hỏi:</p>
          <ul className="list-disc list-inside space-y-0.5 text-blue-700">
            <li>Mô tả chi tiết vấn đề để chuyên gia tư vấn chính xác</li>
            <li>Tránh cung cấp thông tin cá nhân nhạy cảm (CMND, STK, mật khẩu)</li>
            <li>Chuyên gia sẽ phản hồi trong vòng 24-48 giờ</li>
          </ul>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Chủ đề câu hỏi <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#E60067] focus:ring-2 focus:ring-pink-100"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Mức độ ưu tiên <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {PRIORITIES.map((priority) => (
              <label
                key={priority.value}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.priority === priority.value
                    ? 'border-[#E60067] bg-pink-50 text-[#E60067]'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={priority.value}
                  checked={formData.priority === priority.value}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="sr-only"
                />
                <span className="text-sm font-semibold">{priority.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Tiêu đề câu hỏi <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Ví dụ: Cách phòng tránh lừa đảo qua tin nhắn Zalo"
            className={`w-full bg-white border rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-100 ${
              errors.title
                ? 'border-red-300 focus:border-red-500'
                : 'border-slate-200 focus:border-[#E60067]'
            }`}
          />
          {errors.title && (
            <p className="mt-1.5 text-xs text-red-600">{errors.title}</p>
          )}
          <p className="mt-1.5 text-xs text-slate-500">
            {formData.title.length}/200 ký tự
          </p>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Nội dung chi tiết <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="Mô tả chi tiết tình huống, vấn đề bạn đang gặp phải..."
            rows={6}
            className={`w-full bg-white border rounded-xl px-3 py-2.5 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-pink-100 ${
              errors.content
                ? 'border-red-300 focus:border-red-500'
                : 'border-slate-200 focus:border-[#E60067]'
            }`}
          />
          {errors.content && (
            <p className="mt-1.5 text-xs text-red-600">{errors.content}</p>
          )}
          <p className="mt-1.5 text-xs text-slate-500">
            {formData.content.length}/1000 ký tự
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-[#E60067] to-rose-600 text-white py-3 rounded-xl text-sm font-bold shadow-lg hover:from-pink-600 hover:to-rose-700 transition-all"
          >
            Gửi câu hỏi
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 bg-slate-100 text-slate-700 py-3 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
