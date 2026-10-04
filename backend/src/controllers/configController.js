import Config, { CONFIG_ID } from '../models/Config.js';

/**
 * Public — lấy config hiện tại cho frontend.
 * Nếu DB chưa có, tự tạo singleton mặc định (graceful fallback).
 */
export const getConfig = async (_req, res) => {
  try {
    let config = await Config.findById(CONFIG_ID);
    if (!config) {
      config = await Config.create({ _id: CONFIG_ID });
    }
    res.json({ config });
  } catch (err) {
    res.status(500).json({ error: 'Không lấy được config.' });
  }
};