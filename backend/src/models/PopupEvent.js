import mongoose from 'mongoose';

/**
 * PopupEvent — track hành vi user với popup.
 * eventType: 'welcome_seen' | 'welcome_click_start' | 'welcome_close' |
 *            'register_seen' | 'register_submit' | 'login_submit' | 'later_click'
 */
const popupEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    popupId: {
      type: String,
      default: '',
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    sessionId: {
      type: String,
      default: '',
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    occurredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// TTL index — tự xoá events cũ hơn 90 ngày (an toàn kể cả khi cron chưa chạy)
popupEventSchema.index({ occurredAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export default mongoose.model('PopupEvent', popupEventSchema);