import PointTransaction from '../models/PointTransaction.js';
import { getUserPoints } from '../utils/points.js';

export const myPoints = async (req, res) => {
  try {
    const total = await getUserPoints(req.user._id);
    const txs = await PointTransaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json({ total, transactions: txs });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

export const myTransactions = async (req, res) => {
  try {
    const txs = await PointTransaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    res.json({ items: txs });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};