export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: `Không tìm thấy route ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (err, _req, res, _next) => {
  console.error('[ERROR]', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ error: `Giá trị trùng ở trường "${field}".` });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `ID không hợp lệ (${err.path}).` });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Lỗi server, vui lòng thử lại sau.',
  });
};