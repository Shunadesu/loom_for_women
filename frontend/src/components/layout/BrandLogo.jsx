import { useConfigStore } from '../../store/configStore.js';
import { resolveImageUrl } from '../../utils/imageUrl.js';

const DEFAULT_LOGO = '/logo.png';

/**
 * Logo thương hiệu — dùng chung cho header, footer, popup và favicon.
 * Nguồn ảnh lấy từ Config singleton (admin quản lý).
 * Nếu chưa có logo trong DB (hoặc ảnh lỗi) → fallback về /logo.png mặc định.
 */
export default function BrandLogo({ className = '', alt, style, ...rest }) {
  const config = useConfigStore((s) => s.config);
  const logoUrl = config?.logoUrl || '';
  const src = logoUrl ? resolveImageUrl(logoUrl) : DEFAULT_LOGO;

  return (
    <img
      src={src}
      alt={alt || config?.logoAlt || 'Logo Loom for Women'}
      style={style}
      className={className}
      {...rest}
      onError={(e) => {
        // Tránh vòng lặp vô hạn khi file mặc định cũng lỗi
        e.currentTarget.onerror = null;
        e.currentTarget.src = DEFAULT_LOGO;
      }}
    />
  );
}
