import { create } from 'zustand';
import {
  fetchAllCoursesAdmin,
  createCourseAdmin,
  updateCourseAdmin,
  deleteCourseAdmin,
  fetchAllCategoriesAdmin,
  createCategoryAdmin,
  updateCategoryAdmin,
  deleteCategoryAdmin,
  fetchLessonsAdmin,
  createLessonAdmin,
  updateLessonAdmin,
  deleteLessonAdmin,
} from '../services/courseApi.js';

export const useCourseStore = create((set, get) => ({
  courses: [],
  categories: [],
  loading: false,
  error: null,

  // Lessons cache theo courseId
  lessonsByCourse: {},
  lessonsLoading: false,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const items = await fetchAllCoursesAdmin();
      set({ courses: items, loading: false });
    } catch (err) {
      set({ error: err?.response?.data?.error || 'Lỗi tải khóa học.', loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const cats = await fetchAllCategoriesAdmin();
      set({ categories: cats });
    } catch (err) {
      set({ error: err?.response?.data?.error || 'Lỗi tải danh mục khóa học.' });
    }
  },

  create: async (payload) => {
    const course = await createCourseAdmin(payload);
    set({ courses: [course, ...get().courses] });
    return course;
  },

  update: async (id, payload) => {
    const course = await updateCourseAdmin(id, payload);
    set({
      courses: get().courses.map((c) => (c._id === id ? course : c)),
    });
    return course;
  },

  remove: async (id) => {
    await deleteCourseAdmin(id);
    set({ courses: get().courses.filter((c) => c._id !== id) });
  },

  createCategory: async (payload) => {
    const cat = await createCategoryAdmin(payload);
    set({ categories: [...get().categories, cat] });
    return cat;
  },

  updateCategory: async (id, payload) => {
    const cat = await updateCategoryAdmin(id, payload);
    set({
      categories: get().categories.map((c) => (c._id === id ? cat : c)),
    });
    return cat;
  },

  removeCategory: async (id) => {
    await deleteCategoryAdmin(id);
    set({ categories: get().categories.filter((c) => c._id !== id) });
  },

  // Lessons
  fetchLessons: async (courseId) => {
    set({ lessonsLoading: true });
    try {
      const items = await fetchLessonsAdmin(courseId);
      set({
        lessonsByCourse: { ...get().lessonsByCourse, [courseId]: items },
        lessonsLoading: false,
      });
      return items;
    } catch (err) {
      set({ lessonsLoading: false });
      throw err;
    }
  },

  createLesson: async (courseId, payload) => {
    const lesson = await createLessonAdmin(courseId, payload);
    const current = get().lessonsByCourse[courseId] || [];
    set({
      lessonsByCourse: { ...get().lessonsByCourse, [courseId]: [...current, lesson] },
    });
    return lesson;
  },

  updateLesson: async (courseId, lessonId, payload) => {
    const lesson = await updateLessonAdmin(courseId, lessonId, payload);
    const current = get().lessonsByCourse[courseId] || [];
    set({
      lessonsByCourse: {
        ...get().lessonsByCourse,
        [courseId]: current.map((l) => (l._id === lessonId ? lesson : l)),
      },
    });
    return lesson;
  },

  removeLesson: async (courseId, lessonId) => {
    await deleteLessonAdmin(courseId, lessonId);
    const current = get().lessonsByCourse[courseId] || [];
    set({
      lessonsByCourse: {
        ...get().lessonsByCourse,
        [courseId]: current.filter((l) => l._id !== lessonId),
      },
    });
  },
}));