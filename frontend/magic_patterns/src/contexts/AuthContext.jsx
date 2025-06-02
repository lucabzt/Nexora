// frontend/magic_patterns/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { showToast } from '../utils/toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
    handleGoogleCallback();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const response = await authAPI.getMe();
        setUser(response.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCallback = () => {
    // Check if we're on the Google callback page
    if (window.location.pathname === '/auth/google/callback') {
      const urlFragment = window.location.hash.substring(1);
      const params = new URLSearchParams(urlFragment);
      const token = params.get('access_token');

      if (token) {
        localStorage.setItem('access_token', token);
        setIsAuthenticated(true);

        // Fetch user data
        authAPI.getMe()
          .then(response => {
            setUser(response.data);
            showToast('Successfully logged in with Google!', 'success');
            // Redirect to dashboard
            window.location.href = '/dashboard';
          })
          .catch(error => {
            console.error('Failed to fetch user data:', error);
            logout();
          });
      } else {
        showToast('Google login failed', 'error');
        window.location.href = '/';
      }
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { access_token, user_id, username, email, is_admin } = response.data;

      localStorage.setItem('access_token', access_token);
      const userData = { id: user_id, username, email, is_admin };
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
      showToast('Login successful!', 'success');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed';
      showToast(message, 'error');
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      await authAPI.register(userData);
      showToast('Registration successful! Please log in.', 'success');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed';
      showToast(message, 'error');
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    showToast('Logged out successfully', 'success');
  };

  const loginWithGoogle = () => {
    authAPI.loginGoogle();
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    loginWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};