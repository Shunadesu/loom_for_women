import jwt from 'jsonwebtoken';
import 'dotenv/config';

const token = jwt.sign(
  { sub: '6ac4e83a94a00f5fa0b9f33c', role: 'admin', phone: '0900000000' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
console.log(token);
