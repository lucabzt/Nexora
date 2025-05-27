import axios from 'axios';
import authService from './authService'; // For getting auth headers

const API_URL = '/api/users';

// Create axios instance with error handling and auth headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const headers = authService.getAuthHeader();
    if (headers.Authorization) {
      config.headers.Authorization = headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor for generic error handling if needed
// api.interceptors.response.use(...);

const userService = {
  async getUser(userId) {
    try {
      const response = await api.get(`/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error.response || error);
      throw error;
    }
  },

  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error.response || error);
      throw error;
    }
  },

  async changePassword(userId, oldPassword, newPassword) {
    try {
      const response = await api.put(`/${userId}/change_password`, {
        old_password: oldPassword, // Ensure this matches the Pydantic model field name
        new_password: newPassword, // Ensure this matches the Pydantic model field name
      });
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error.response || error);
      throw error;
    }
  },

  // Add other user-related service methods if needed (e.g., deleteUser, getAllUsers for admins)
};

export default userService;
