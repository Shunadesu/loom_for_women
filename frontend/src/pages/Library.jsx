import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header.jsx';
import LibraryHeader from '../components/library/LibraryHeader.jsx';
import LibraryFilters from '../components/library/LibraryFilters.jsx';
import DocumentCard from '../components/library/DocumentCard.jsx';
import DocumentPreviewModal from '../components/library/DocumentPreviewModal.jsx';
import { useDocumentStore } from '../store/documentStore.js';
import { useAuthStore } from '../store/authStore.js';

export default function Library() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const items = useDocumentStore((s) => s.items);
  const total = useDocumentStore((s) => s.total);
  const loading = useDocumentStore((s) => s.loading);
  const error = useDocumentStore((s) => s.error);
  const filters = useDocumentStore((s) => s.filters);
  const setFilter = useDocumentStore((s) => s.setFilter);
  const fetchDocuments = useDocumentStore((s) => s.fetchDocuments);
  const fetchCounts = useDocumentStore((s) => s.fetchCounts);
  const fetchCourses = useDocumentStore((s) => s.fetchCourses);
  const courseOptions = useDocumentStore((s) => s.courseOptions);
  const counts = useDocumentStore((s) => s.counts);
  const triggerDownload = useDocumentStore((s) => s.triggerDownload);

  const [previewDoc, setPreviewDoc] = useState(null);

  // Lần đầu mount → load filters + counts + courses
  useEffect(() => {
    fetchCourses().catch(() => {});
    fetchCounts().catch(() => {});
    fetchDocuments().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Khi filter thay đổi → fetch lại items
  const handleChange = useCallback(
    (patch) => {
      setFilter(patch);
      // Fetch ngay (không debounce cho đơn giản)
      requestAnimationFrame(() => {
        fetchDocuments().catch(() => {});
      });
    },
    [setFilter, fetchDocuments]
  );

  const handleSearch = useCallback(() => {
    fetchDocuments().catch(() => {});
  }, [fetchDocuments]);

  const handlePreview = useCallback((doc) => {
    setPreviewDoc(doc);
  }, []);

  const handleDownload = useCallback(
    async (doc) => {
      // Mở tab mới với URL tài liệu + đánh dấu download
      window.open(doc.fileUrl, '_blank', 'noopener,noreferrer');
      try {
        await triggerDownload(doc._id);
      } catch {}
    },
    [triggerDownload]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen flex-col bg-gradient-to-b from-primary-50 via-white to-primary-50"
    >
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-6 sm:px-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-3.5 sm:p-6 overflow-hidden">
          <div className="p-3.5 space-y-3 text-xs pb-10">
            <LibraryHeader />

            <LibraryFilters
              filters={filters}
              counts={counts}
              courseOptions={courseOptions}
              onChange={handleChange}
              onSearch={handleSearch}
            />

            {!isAuthenticated && (
              <div className="rounded-2xl bg-pink-50 border border-pink-100 p-3 text-[11px] font-medium text-[#E60067]">
                Bạn có thể duyệt và tải tài liệu mà không cần đăng nhập. Đăng
                nhập để theo dõi tiến độ học tập và lưu tài liệu.
              </div>
            )}

            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-100 p-3 text-[11px] font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2.5">
                {loading && items.length === 0 ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={`sk-${i}`}
                      className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs animate-pulse h-28"
                    />
                  ))
                ) : items.length === 0 ? (
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center text-xs text-slate-500">
                    Không tìm thấy tài liệu phù hợp.
                  </div>
                ) : (
                  items.map((doc) => (
                    <DocumentCard
                      key={doc._id}
                      doc={doc}
                      onPreview={handlePreview}
                      onDownload={handleDownload}
                    />
                  ))
                )}
              </div>

            {!loading && total > items.length && (
              <p className="text-center text-[10px] text-slate-400 pt-1">
                Hiển thị {items.length} / {total} tài liệu
              </p>
            )}
          </div>
        </div>
      </main>

      <DocumentPreviewModal
        doc={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </motion.div>
  );
}