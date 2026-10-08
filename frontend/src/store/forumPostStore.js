import { create } from 'zustand';
import {
  fetchForumPosts,
  createForumPost,
  likeForumPost,
} from '../services/forumPostApi.js';

export const useForumPostStore = create((set, get) => ({
  posts: [],
  loading: false,
  selectedCategory: 'all',

  setCategory: (category) => {
    set({ selectedCategory: category });
    get().fetchPosts();
  },

  fetchPosts: async () => {
    set({ loading: true });
    try {
      const category = get().selectedCategory;
      const data = await fetchForumPosts(category);
      set({ posts: data, loading: false });
    } catch (err) {
      console.error('Fetch forum posts failed:', err);
      set({ loading: false });
    }
  },

  createPost: async (postData) => {
    try {
      const newPost = await createForumPost(postData);
      return newPost;
    } catch (err) {
      throw err;
    }
  },

  likePost: async (postId) => {
    try {
      const { likes, isLiked } = await likeForumPost(postId);
      
      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId
            ? { ...post, likes, isLiked }
            : post
        ),
      }));
      
      return { likes, isLiked };
    } catch (err) {
      throw err;
    }
  },
}));
