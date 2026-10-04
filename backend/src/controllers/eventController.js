import PopupEvent from '../models/PopupEvent.js';

const ALLOWED = new Set([
  'welcome_seen',
  'welcome_click_start',
  'welcome_close',
  'register_seen',
  'register_submit',
  'login_submit',
  'register_close',
]);

export const trackEvent = async (req, res) => {
  const { eventType, popupId = '', sessionId = '', metadata = {} } = req.body || {};
  const userId = req.user?._id || null;

  if (!eventType || typeof eventType !== 'string') {
    return res.status(400).json({ error: 'eventType là bắt buộc.' });
  }
  if (!ALLOWED.has(eventType)) {
    return res.status(400).json({ error: `eventType "${eventType}" không hợp lệ.` });
  }
  if (typeof metadata !== 'object' || Array.isArray(metadata)) {
    return res.status(400).json({ error: 'metadata phải là object.' });
  }

  try {
    const evt = await PopupEvent.create({
      eventType,
      popupId,
      sessionId,
      userId,
      metadata,
    });
    res.status(201).json({ ok: true, id: evt._id });
  } catch (err) {
    res.status(500).json({ error: 'Ghi event thất bại.' });
  }
};