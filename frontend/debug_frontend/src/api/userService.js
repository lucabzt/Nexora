import { apiWithCookies } from './baseApi';

// Optional: Add a response interceptor for generic error handling if needed
// api.interceptors.response.use(...);

const userService = {
  async getMe() {
    try {
      // The 'api' instance is configured with baseURL '/api/users'
      // and automatically includes the auth token.
      // So, a GET request to '/me' will hit '/api/users/me'.
      const response = await apiWithCookies.get('/users/me');
      return response.data;
    } catch (error) {
      //console.error('Error fetching current user (/me):', error.response || error);
      console.log("Not logged in");
      //throw error;
    }
  },

  async getUser(userId) {
    try {
      const response = await apiWithCookies.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error.response || error);
      throw error;
    }
  },

  async updateUser(userId, userData) {
    try {
      const response = await apiWithCookies.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error.response || error);
      throw error;
    }
  },

  async changePassword(userId, oldPassword, newPassword) {
    try {
      const response = await apiWithCookies.put(`/users/${userId}/change_password`, {
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
  
  // Admin-specific functions
  async getAllUsers() {
    try {
      const response = await apiWithCookies.get('/users/');
      return response.data;
    } catch (error) {
      console.error('Error fetching all users:', error.response || error);
      throw error;
    }
  },

  async adminUpdateUser(userId, userData) {
    try {
      const response = await apiWithCookies.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user as admin:', error.response || error);
      throw error;
    }
  },

  async adminChangePassword(userId, newPassword) {
    try {
      const response = await apiWithCookies.put(`/users/${userId}/change_password`, {
        new_password: newPassword, // Admins don't need to provide old password
      });
      return response.data;
    } catch (error) {
      console.error('Error changing user password as admin:', error.response || error);
      throw error;
    }
  },

  async deleteUser(userId) {
    try {
      const response = await apiWithCookies.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error.response || error);
      throw error;
    }
  },
};

export default userService;
