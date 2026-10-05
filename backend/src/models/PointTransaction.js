import mongoose from 'mongoose';

/**
 * PointTransaction — Lịch sử cộng/trừ điểm của user.
 * type: 'lesson_complete' | 'course_finish' | 'comment' | 'admin_award' | 'spent'
 */
const pointTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    delta: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'lesson_complete',
        'course_finish',
        'comment',
        'admin_award',
        'spent',
      ],
      index: true,
    },
    refId: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: '',
      maxlength: 200,
    },
  },
  { timestamps: true }
);

pointTransactionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('PointTransaction', pointTransactionSchema);