import CourseComment from '../models/CourseComment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

export const listAllComments = async (req, res) => {
  try {
    const items = await CourseComment.find()
      .populate('userId', 'name phone')
      .populate('courseId', 'title slug')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

// Re-export hideComment để gom vào 1 chỗ
export { hideComment } from './commentController.js';

void Course;
void User;