import { resolveImageUrl } from '../../utils/imageUrl.js';
import { buildVideoEmbedUrl } from '../../utils/videoSource.js';
import { BookIcon } from '../icons/index.jsx';

/**
 * Hiển thị media của bài học (video / ảnh / PDF) cho các bài học
 * KHÔNG có nội dung 4 phần.
 *
 * Dùng chung cho:
 *   - trang chi tiết khóa học (CourseDetail)
 *   - modal bài học khi mở bài học chỉ có media (LessonPlayerModal)
 *
 * Props:
 * - lesson       : object bài học
 * - pdfInFrame   : true → nhúng PDF bằng iframe; false → chỉ link tải PDF
 * - className    : class tuỳ chọn cho wrapper
 */
export default function LessonMedia({ lesson, pdfInFrame = false, className = '' }) {
  if (!lesson) return null;

  const videoUrl = buildVideoEmbedUrl(lesson);
  const isImagePdf = lesson.contentType === 'image_pdf';
  const isVideoPdf = lesson.contentType === 'video_pdf';

  // ── Bài học dạng ảnh + PDF ──
  if (isImagePdf) {
    return (
      <div className={`space-y-3 bg-slate-50 p-3 ${className}`}>
        {lesson.imageUrl ? (
          <img
            src={resolveImageUrl(lesson.imageUrl)}
            alt={lesson.title}
            className="mx-auto max-h-[70vh] w-auto rounded-lg object-contain"
          />
        ) : (
          <p className="py-6 text-center text-xs text-slate-400">Bài học chưa có ảnh.</p>
        )}
        {lesson.pdfUrl &&
          (pdfInFrame ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <iframe
                src={resolveImageUrl(lesson.pdfUrl)}
                title={`Tài liệu ${lesson.title}`}
                className="h-[70vh] w-full"
              />
            </div>
          ) : (
            <PdfLink lesson={lesson} />
          ))}
      </div>
    );
  }

  // ── Bài học dạng video + PDF ──
  if (isVideoPdf) {
    return (
      <div className={className}>
        <div className="aspect-video w-full bg-black">
          {videoUrl ? (
            <iframe
              src={videoUrl}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs font-medium text-slate-400">
              Bài học này chưa có video.
            </div>
          )}
        </div>
        {lesson.pdfUrl && (
          <div className="border-t border-slate-100 p-3">
            <PdfLink lesson={lesson} />
          </div>
        )}
      </div>
    );
  }

  // ── Mặc định: chỉ video ──
  return (
    <div className={className}>
      <div className="aspect-video w-full bg-black">
        {videoUrl ? (
          <iframe
            src={videoUrl}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-medium text-slate-400">
            Bài học này chưa có video.
          </div>
        )}
      </div>
    </div>
  );
}

/** Link tải tài liệu PDF kèm bài học. */
function PdfLink({ lesson }) {
  return (
    <a
      href={resolveImageUrl(lesson.pdfUrl)}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full bg-[#E60067] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
    >
      <BookIcon aria-hidden="true" className="h-3.5 w-3.5" />
      Tải tài liệu PDF
    </a>
  );
}
