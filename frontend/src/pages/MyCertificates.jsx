import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header.jsx';
import { PdfIcon, CheckCircleIcon } from '../components/icons/index.jsx';
import { useCertificateStore } from '../store/certificateStore.js';
import { useAuthStore } from '../store/authStore.js';

export default function MyCertificates() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const items = useCertificateStore((s) => s.items);
  const loading = useCertificateStore((s) => s.loading);
  const fetch = useCertificateStore((s) => s.fetch);

  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để xem chứng chỉ.');
      navigate('/');
      return;
    }
    fetch().catch(() => {});
  }, [isAuthenticated, navigate, fetch]);

  async function handleDownload(cert) {
    setDownloading(cert._id);
    try {
      // Dynamically import jspdf + html2canvas
      const [jsPDF, html2canvas] = await Promise.all([
        import('jspdf').then((m) => m.default),
        import('html2canvas').then((m) => m.default),
      ]);

      // Tạo HTML template
      const container = document.createElement('div');
      container.style.width = '800px';
      container.style.padding = '40px';
      container.style.backgroundColor = '#fff';
      container.style.fontFamily = 'Arial, sans-serif';
      container.innerHTML = `
        <div style="border: 8px solid #E60067; padding: 40px; text-align: center;">
          <h1 style="font-size: 32px; color: #E60067; margin-bottom: 10px;">CHỨNG CHỈ HOÀN THÀNH</h1>
          <p style="font-size: 14px; color: #64748b; margin-bottom: 30px;">Trao tặng cho</p>
          <h2 style="font-size: 28px; color: #0f172a; margin-bottom: 20px; font-weight: bold;">${cert.userId?.name || cert.userId?.phone || 'Người học'}</h2>
          <p style="font-size: 14px; color: #64748b; margin-bottom: 10px;">Đã hoàn thành xuất sắc khóa học</p>
          <h3 style="font-size: 20px; color: #0f172a; margin-bottom: 30px; font-weight: bold;">${cert.courseId?.title || 'Khóa học'}</h3>
          <p style="font-size: 12px; color: #94a3b8; margin-bottom: 20px;">
            Ngày hoàn thành: ${new Date(cert.issuedAt).toLocaleDateString('vi-VN')}
          </p>
          <p style="font-size: 10px; color: #cbd5e1;">
            Mã số: ${cert.serialNumber}
          </p>
        </div>
      `;
      document.body.appendChild(container);

      const canvas = await html2canvas(container, { scale: 2 });
      document.body.removeChild(container);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const imgW = 297;
      const imgH = (canvas.height * imgW) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgW, imgH);
      pdf.save(`chung-chi-${cert.serialNumber}.pdf`);
    } catch (err) {
      console.error('Download error:', err);
      alert('Không tải được chứng chỉ.');
    } finally {
      setDownloading(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen flex-col bg-gradient-to-b from-primary-50 via-white to-primary-50"
    >
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-6 sm:px-6">
        <div className="space-y-4 overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-3.5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <CheckCircleIcon
              aria-hidden="true"
              className="h-5 w-5 text-emerald-600"
            />
            <h1 className="text-lg font-extrabold text-slate-900">Chứng chỉ của tôi</h1>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="h-4 w-3/4 rounded-lg bg-slate-200" />
                  <div className="mt-2 h-3 w-1/2 rounded-lg bg-slate-200" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-10 text-center">
              <PdfIcon aria-hidden="true" className="mb-2 h-10 w-10 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">
                Bạn chưa có chứng chỉ nào
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Hoàn thành khóa học để nhận chứng chỉ.
              </p>
              <button
                type="button"
                onClick={() => navigate('/khoa-hoc')}
                className="mt-3 rounded-full bg-pink-50 px-4 py-1.5 text-xs font-bold text-[#E60067] hover:bg-pink-100"
              >
                Xem khóa học
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((cert) => (
                <div
                  key={cert._id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4 shadow-xs"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      {cert.courseId?.title || 'Khóa học'}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Hoàn thành:{' '}
                      {new Date(cert.issuedAt).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Mã: {cert.serialNumber}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownload(cert)}
                    disabled={downloading === cert._id}
                    className="flex items-center gap-1 rounded-full bg-[#E60067] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#d0005a] disabled:opacity-50"
                  >
                    <PdfIcon aria-hidden="true" className="h-3 w-3" />
                    {downloading === cert._id ? 'Đang tải...' : 'Tải PDF'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </motion.div>
  );
}