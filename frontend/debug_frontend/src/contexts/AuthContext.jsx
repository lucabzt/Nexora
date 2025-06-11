import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import authService from '../api/authService';
import userService from '../api/userService';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

export const AuthContext = createContext(); // Add export here

export const AuthProvider = ({ children }) => {
  const { t } = useTranslation('auth');
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetches current user details if a valid session cookie exists
  const fetchAndSetCurrentUser = useCallback(async () => {
    console.log("AuthContext: Attempting to fetch current user (cookie-based)...");
    setLoading(true);
    try {
      // userService.getMe() uses apiWithCookies, which sends HttpOnly cookies automatically.
      const currentUser = await userService.getMe();

      if (currentUser && currentUser.id) {
        console.log("AuthContext: Successfully fetched user data:", currentUser);
        setUserState(currentUser);
        // Store non-sensitive user profile in localStorage for quick access if needed.
        localStorage.setItem('userProfile', JSON.stringify(currentUser)); 
        return currentUser;
      } else {
        console.info("AuthContext: No valid user session found or incomplete user data from API.");
        setUserState(null);
        localStorage.removeItem('userProfile');
        return null;
      }
    } catch (error) {
      console.error("AuthContext: Error fetching current user:", error);
      // This error could be a 401 if cookies are invalid/expired and refresh failed.
      // The interceptor in baseApi.js handles refresh attempts.
      setUserState(null);
      localStorage.removeItem('userProfile');
      return null;
    } finally {
      setLoading(false);
    }
  }, [t]); // t for potential future use in error messages

  const login = useCallback(async (username, password) => {
    console.log("AuthContext: login called for username:", username);
    setLoading(true);
    try {
      // authService.login makes the API call. Backend sets HttpOnly cookies.
      // The response data from authService.login might be minimal or just a success status.
      await authService.login(username, password);
      console.log("AuthContext: authService.login successful. Cookies should be set.");

      // After successful login and cookies are set, fetch the full user details.
      const loggedInUser = await fetchAndSetCurrentUser();

      if (loggedInUser) {
        toast.success(t('notifications.loginSuccess', { username: loggedInUser.username }));
        return loggedInUser;
      } else {
        // This implies an issue fetching user data immediately after a successful login call.
        throw new Error(t('notifications.loginErrorAfterSuccess'));
      }
    } catch (error) {
      console.error("AuthContext: Login process failed:", error);
      const errorMessage = error.response?.data?.detail || error.message || t('notifications.loginError');
      toast.error(errorMessage);
      setUserState(null); // Ensure user state is cleared
      localStorage.removeItem('userProfile');
      throw error; // Re-throw for the calling component to handle
    } finally {
      setLoading(false);
    }
  }, [fetchAndSetCurrentUser, t]);

  const register = useCallback(async (username, email, password) => {
    console.log(`AuthContext: Attempting registration for user: ${username}, email: ${email}`);
    setLoading(true);
    try {
      // authService.register makes the API call.
      // Depending on backend, it might auto-login (set cookies) or just create the user.
      // Assuming it does not auto-login here for simplicity.
      const response = await authService.register(username, email, password);
      toast.success(t('notifications.registerSuccess'));
      console.log(`AuthContext: Registration successful for user: ${username}`);

      // After successful login and cookies are set, fetch the full user details.
      const loggedInUser = await fetchAndSetCurrentUser();

      if (loggedInUser) {
        toast.success(t('notifications.loginSuccess', { username: loggedInUser.username }));
        return loggedInUser;
      } else {
        // This implies an issue fetching user data immediately after a successful login call.
        throw new Error(t('notifications.loginErrorAfterSuccess'));
      }
    } catch (error) {

      console.error("AuthContext: Register process failed:", error);
      const errorMessage = error.response?.data?.detail || error.message || t('notifications.registerError');
      toast.error(errorMessage);
      setUserState(null); // Ensure user state is cleared
      localStorage.removeItem('userProfile');
      throw error; // Re-throw for the calling component to handle
    } finally {
      setLoading(false);
    }
  }, [t]);

  const logout = useCallback(async () => {
    console.log("AuthContext: logout called.");
    setLoading(true);
    try {
      await authService.logout(); // Backend clears HttpOnly cookies
      console.log("AuthContext: authService.logout successful.");
    } catch (error) {
      console.error("AuthContext: Error during authService.logout:", error);
      // Still proceed to clear client-side state
    } finally {
      setUserState(null);
      localStorage.removeItem('userProfile');
      // Optionally, clear other related local storage items if any
      console.log("AuthContext: Client-side user state and profile cleared.");
      toast.info(t('notifications.logoutSuccess'));
      setLoading(false);
      // Navigation to login page can be handled by the component calling logout or a route guard.
    }
  }, [t]);

  // Custom setUser function for profile updates (e.g., after editing user settings)
  // This assumes newProfileData is the complete, updated user object from the backend.
  const updateUserProfile = useCallback((newProfileData) => {
    console.log("AuthContext: updateUserProfile called with newProfileData:", newProfileData);
    if (newProfileData && newProfileData.id) {
      setUserState(newProfileData);
      localStorage.setItem('userProfile', JSON.stringify(newProfileData));
      console.log("AuthContext: User profile updated in state and localStorage:", newProfileData);
    } else {
      console.warn("AuthContext updateUserProfile called with invalid or incomplete data:", newProfileData);
    }
  }, []);

  // Initialize auth state on app load by trying to fetch the current user
  useEffect(() => {
    const initAuth = async () => {
      console.log("AuthContext: Initializing authentication...");
      await fetchAndSetCurrentUser();
      // setLoading(false) is now handled within fetchAndSetCurrentUser's finally block
    };
    initAuth();
  }, [fetchAndSetCurrentUser]); // Dependency: fetchAndSetCurrentUser

  // The context value that will be supplied to consuming components
  const contextValue = {
    user,
    setUser: updateUserProfile, // Expose for profile updates
    login,
    logout,
    register,
    fetchAndSetCurrentUser, // Expose this if components need to refresh user data manually
    loading,
    isAuthenticated: !!user, // Simpler check: if user object exists, they are authenticated
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);