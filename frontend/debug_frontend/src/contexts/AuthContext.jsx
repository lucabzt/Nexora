import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import authService from '../api/authService';
import userService from '../api/userService'; // Import userService

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAndSetFullUser = useCallback(async (userDataFromToken) => {
    if (!userDataFromToken || !userDataFromToken.access_token) {
      setUserState(null);
      localStorage.removeItem('user');
      return null;
    }

    let userIdToFetch = null;
    // Standardize access to user ID, assuming backend might send 'id' or 'user_id' in token response
    if (userDataFromToken.id) {
      userIdToFetch = userDataFromToken.id;
    } else if (userDataFromToken.user_id) {
      userIdToFetch = userDataFromToken.user_id;
    }

    if (userIdToFetch) {
      try {
        const fullUserFromAPI = await userService.getUser(userIdToFetch);
        // Merge token data with full user profile data
        const completeUser = {
          ...userDataFromToken, // Contains access_token, token_type, etc.
          ...fullUserFromAPI,   // Contains id, username, email, profile_image_base64
          id: fullUserFromAPI.id || userIdToFetch, // Ensure 'id' is canonical
        };
        
        // Clean up potential duplicate id key if original was e.g. user_id
        if (completeUser.user_id && completeUser.user_id !== completeUser.id) {
            delete completeUser.user_id;
        }

        setUserState(completeUser);
        localStorage.setItem('user', JSON.stringify(completeUser));
        return completeUser;
      } catch (error) {
        console.error("Failed to fetch full user details:", error);
        // If fetching full details fails, logout the user to prevent inconsistent state
        authService.logout();
        setUserState(null);
        localStorage.removeItem('user');
        toast.error("Session expired or invalid. Please login again.");
        return null;
      }
    } else {
      console.warn("User ID not found in token response. Logging out.");
      authService.logout();
      setUserState(null);
      localStorage.removeItem('user');
      toast.error("User session is corrupted. Please login again.");
      return null;
    }
  }, []);

  // Load user from localStorage on initial render and fetch full details
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const storedUserTokenData = authService.getCurrentUser();
      if (storedUserTokenData && storedUserTokenData.access_token) {
        await fetchAndSetFullUser(storedUserTokenData);
      }
      setLoading(false);
    };
    initAuth();
  }, [fetchAndSetFullUser]);

  // Login function
  const login = async (username, password) => {
    try {
      const dataFromTokenEndpoint = await authService.login(username, password);
      if (dataFromTokenEndpoint && dataFromTokenEndpoint.access_token) {
        await fetchAndSetFullUser(dataFromTokenEndpoint);
        return { success: true };
      } else {
        throw new Error("Login failed: No access token received.");
      }
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.detail) ||
        error.message ||
        error.toString();
      toast.error(message);
      // Ensure user state is cleared on login failure
      setUserState(null);
      localStorage.removeItem('user');
      return { success: false, message };
    }
  };

  // Register function - remains the same as it doesn't auto-login
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
  // Used by SettingsPage to update user profile information
  const setUser = useCallback((newProfileData) => {
    setUserState(currentUserState => {
      if (newProfileData && newProfileData.id) {
        // Merge new profile data with existing state (which includes token)
        const updatedFullUser = {
          ...(currentUserState || {}), // Preserve existing token, etc.
          ...newProfileData,        // Override with new profile data
        };
        localStorage.setItem('user', JSON.stringify(updatedFullUser));
        return updatedFullUser;
      } else if (newProfileData === null) { // For explicit clearing of user
        localStorage.removeItem('user');
        return null;
      }
      // If data is invalid or incomplete, log and return current state to avoid issues
      console.warn("AuthContext setUser called with invalid or incomplete data:", newProfileData);
      return currentUserState;
    });
  }, []);


  const value = {
    user,
    setUser, // Expose the custom setUser
    loading,
    isAuthenticated: !!user && !!user.access_token && !!user.id, // More robust check
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);