import api from './api.js';

export const fetchComments = (courseId) =>
  api.get(`/courses/${courseId}/comments`).then((r) => r.data.items || []);

export const postComment = (payload) =>
  api.post('/comments', payload).then((r) => r.data.comment);