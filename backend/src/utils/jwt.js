import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me';
const EXPIRES = process.env.JWT_EXPIRES_IN || '30d';

export const signToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};