import axios from 'axios';

export const API_URL = 'http://localhost:5000/api';
export const BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
};

export const forumApi = {
  getConfig: () => api.get('/forum/config'),
  getCategories: () => api.get('/forum/categories'),
  getForum: (id: string) => api.get(`/forum/forums/${id}`),
  getThread: (id: string) => api.get(`/forum/threads/${id}`),
  getLatestThreads: () => api.get('/forum/threads/latest'),
  createThread: (data: any) => api.post('/forum/threads', data),
  createPost: (data: any) => api.post('/forum/posts', data),
  toggleLike: (postId: string, userId: string) => api.post(`/forum/posts/${postId}/like`, { userId }),
  getProfile: (userId: string) => api.get(`/forum/users/${userId}`),
  getStats: () => api.get('/forum/stats'),
  // Admin
  adminGetThreads: () => api.get('/forum/admin/threads'),
  adminDeleteThread: (id: string) => api.delete(`/forum/admin/threads/${id}`),
  adminUpdateThread: (id: string, data: any) => api.patch(`/forum/admin/threads/${id}`, data),
  // Admin User Mgmt
  adminGetUsers: () => api.get('/forum/admin/users'),
  adminUpdateUserRole: (id: string, role: string) => api.patch(`/forum/admin/users/${id}/role`, { role }),
  adminDeleteUser: (id: string) => api.delete(`/forum/admin/users/${id}`),
  // Admin Settings
  adminGetSettings: () => api.get('/forum/admin/settings'),
  adminUpdateSetting: (key: string, value: string) => api.post('/forum/admin/settings', { key, value }),
  adminGetAuditLogs: () => api.get('/forum/admin/audit-logs'),
  // Categories Mgmt
  adminGetAllCategories: () => api.get('/forum/admin/all-categories'),
  adminCreateCategory: (data: any) => api.post('/forum/admin/categories', data),
  adminUpdateCategory: (id: string, data: any) => api.patch(`/forum/admin/categories/${id}`, data),
  adminDeleteCategory: (id: string) => api.delete(`/forum/admin/categories/${id}`),
  // Forums Mgmt
  adminCreateForum: (data: any) => api.post('/forum/admin/forums', data),
  adminUpdateForum: (id: string, data: any) => api.patch(`/forum/admin/forums/${id}`, data),
  adminDeleteForum: (id: string) => api.delete(`/forum/admin/forums/${id}`),
  // Follow
  toggleFollow: (userId: string) => api.post(`/forum/follow/${userId}`),
  isFollowing: (userId: string) => api.get(`/forum/users/${userId}/is-following`),
  // Messages
  getConversations: () => api.get('/forum/messages/conversations'),
  getChatHistory: (userId: string) => api.get(`/forum/messages/${userId}`),
  sendMessage: (data: { receiverId: string, content: string }) => api.post('/forum/messages', data),
  // Avatar
  getAvatars: () => api.get('/forum/avatars/list'),
  updateUserAvatar: (avatarPath: string) => api.put('/forum/user/avatar', { avatarPath }),
};

export default api;
