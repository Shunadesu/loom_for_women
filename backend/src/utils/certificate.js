import crypto from 'crypto';
import Certificate from '../models/Certificate.js';

/**
 * Tạo Certificate nếu chưa tồn tại cho cặp (userId, courseId).
 * Trả về { created: boolean, certificate }.
 */
export async function issueCertificateIfNeeded(userId, courseId) {
  const existing = await Certificate.findOne({ userId, courseId }).lean();
  if (existing) return { created: false, certificate: existing };

  const serial = generateSerial();
  const cert = await Certificate.create({
    userId,
    courseId,
    serialNumber: serial,
    issuedAt: new Date(),
  });
  return { created: true, certificate: cert.toObject ? cert.toObject() : cert };
}

export function generateSerial() {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `LOOM-${year}-${random}`;
}