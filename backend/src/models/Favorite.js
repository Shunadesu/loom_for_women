import mongoose from 'mongoose';

/**
 * Favorite — User yêu thích 1 course.
 */
const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

favoriteSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model('Favorite', favoriteSchema);