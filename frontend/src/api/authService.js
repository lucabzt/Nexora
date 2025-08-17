import axios from 'axios';
import { apiWithCookies, apiWithoutCookies } from './baseApi';

const API_URL = '/api';

class AuthService {
  async login(username, password) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    // The backend at /auth/token should set an HTTP-only cookie upon successful login.
    const response = await apiWithoutCookies.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    // User data (like username, roles) might be returned, but not the token for client storage.
    return response.data;
  }

  async adminLoginAs(userId) {
    try {
      const response = await apiWithCookies.post(`/auth/admin/login-as/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error logging in as user:', error.response || error);
      const errorMessage = error.response?.data?.detail || 'Failed to log in as user';
      throw new Error(errorMessage);
    }
  }

  async register(username, email, password) {
    return (await apiWithoutCookies.post('/auth/signup', {
      username,
      email,
      password,
    })).data;
  }

  async logout() {
    // Call backend to invalidate session/cookie
    try {
      await apiWithCookies.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed', error);
      // Optionally, still attempt to clear any local user state if needed
    }
  }

  async getCurrentUser() {
    try {
      // Fetch user data from a protected endpoint. If cookie is valid, this will succeed.
      const response = await apiWithCookies.get('/users/me');
      return response.data; // Contains user profile information
    } catch (error) {
      // This can happen if the user is not authenticated or if there's a network issue.
      // console.error('Error fetching current user:', error);
      return null;
    }
  }

  // New method for Google OAuth
  redirectToGoogleOAuth() {
    // The backend URL that initiates the Google OAuth flow
    window.location.href = `/api/auth/login/google`;
  }

  redirectToGithubOAuth() {
    // The backend URL that initiates the Google OAuth flow
    window.location.href = `/api/auth/login/github`;
  }

  redirectToDiscordOAuth() {
    // The backend URL that initiates the Discord OAuth flow
    window.location.href = `/api/auth/login/discord`;
  }
}

export default new AuthService();