import Certificate from '../models/Certificate.js';

export const myCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ userId: req.user._id })
      .populate('courseId', 'title slug thumbnail category')
      .sort({ issuedAt: -1 })
      .lean();
    res.json({ items: certs });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

export const verifyCertificate = async (req, res) => {
  try {
    const { serialNumber } = req.params;
    const cert = await Certificate.findOne({ serialNumber })
      .populate('userId', 'name phone')
      .populate('courseId', 'title slug')
      .lean();
    if (!cert) return res.status(404).json({ valid: false, error: 'Chứng chỉ không tồn tại.' });
    res.json({
      valid: true,
      certificate: {
        serialNumber: cert.serialNumber,
        issuedAt: cert.issuedAt,
        user: cert.userId,
        course: cert.courseId,
      },
    });
  } catch (err) {
    res.status(500).json({ valid: false, error: 'Lỗi server.' });
  }
};