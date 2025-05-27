import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import authService from '../api/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial render
  useEffect(() => {
    const initAuth = () => {
      const storedUser = authService.getCurrentUser();
      if (storedUser) {
        setUserState(storedUser);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const data = await authService.login(username, password);
      setUserState(data); // Use the internal setter
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
  const logout = useCallback(() => {
    authService.logout();
    setUserState(null); // Use the internal setter
    localStorage.removeItem('user'); // Ensure localStorage is also cleared on logout
    toast.info("You have been logged out");
  }, []);

  // Custom setUser function that also updates localStorage
  const setUser = useCallback((newUser) => {
    setUserState(newUser);
    // Update localStorage whenever user state changes
    if (newUser) {
      // Ensure the full user object including ID is stored
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
  }, []);


  const value = {
    user,
    setUser, // Expose the custom setUser
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);