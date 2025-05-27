import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import authService from '../api/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial render
  useEffect(() => {
    const initAuth = () => {
      const storedUser = authService.getCurrentUser();
      if (storedUser) {
        setUser(storedUser);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const data = await authService.login(username, password);
      setUser(data);
      return { success: true };
    } catch (error) {
      const message = 
        (error.response && error.response.data && error.response.data.detail) || 
        error.message || 
        error.toString();
      toast.error(message);
      return { success: false, message };
    }
  };

  // Register function
  const register = async (username, email, password) => {
    try {
      await authService.register(username, email, password);
      toast.success("Registration successful! Please login.");
      return { success: true };
    } catch (error) {
      const message = 
        (error.response && error.response.data && error.response.data.detail) || 
        error.message || 
        error.toString();
      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    toast.info("You have been logged out");
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);