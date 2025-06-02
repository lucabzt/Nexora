import { createContext, useState, useEffect, useCallback, useContext } from 'react'; // Added useContext
import authService from '../api/authService';
import userService from '../api/userService'; // Import userService
import { toast } from 'react-toastify'; // Ensure toast is imported

const AuthContext = createContext();



export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAndSetFullUser = useCallback(async (tokenDataInput) => {
    console.log("AuthContext: fetchAndSetFullUser called with:", tokenDataInput);
    if (!tokenDataInput || !tokenDataInput.access_token) {
      console.warn("AuthContext: fetchAndSetFullUser - No tokenData or access_token provided.");
      setUserState(null);
      localStorage.removeItem('user');
      // Do not navigate here, let the caller decide
      return null;
    }

    // Temporarily store the provided token data to ensure authService.getAuthHeader() works for the next call.
    // This might be the minimal token from OAuth or a fuller object from login/localStorage.
    localStorage.setItem('user', JSON.stringify(tokenDataInput));
    console.log("AuthContext: Token data temporarily stored in localStorage.");

    try {
      console.log("AuthContext: Attempting to fetch full user details from /api/users/me...");
      // Fetch full user details from /api/users/me using the token now in localStorage.
      const fullUserFromAPI = await userService.getMe(); // userService.getMe() will use the token
      console.log("AuthContext: Received user details from API:", fullUserFromAPI);

      if (fullUserFromAPI && fullUserFromAPI.id) {
        // Combine the essential token parts with the full user details from the API.
        const completeUser = {
          access_token: tokenDataInput.access_token,
          token_type: tokenDataInput.token_type || 'bearer',
          ...fullUserFromAPI, // This includes id, username, email, is_admin etc.
        };
        
        console.log("AuthContext: Successfully fetched and combined user data:", completeUser);
        setUserState(completeUser);
        localStorage.setItem('user', JSON.stringify(completeUser)); // Persist the complete user object
        console.log("AuthContext: Complete user data stored in state and localStorage.");
        return completeUser;
      } else {
        console.error("AuthContext: Failed to retrieve valid user details from server. API response:", fullUserFromAPI);
        throw new Error("Failed to retrieve valid user details from server.");
      }
    } catch (error) {
      console.error("Error in fetchAndSetFullUser:", error);
      authService.logout(); // Clears localStorage and user state
      setUserState(null);   // Ensure state is cleared
      toast.error(error.message || "Session invalid or expired. Please login again.");
      return null;
    }
  }, []); // Dependencies: setUserState (from useState, stable), authService, userService, toast (imports, stable)

  // Load user from localStorage on initial render and fetch full details
  useEffect(() => {
    const initAuth = async () => {
      console.log("AuthContext: Initializing authentication...");
      setLoading(true);
      const storedUserTokenData = authService.getCurrentUser();
      console.log("AuthContext: Stored user token data from localStorage:", storedUserTokenData);
      if (storedUserTokenData && storedUserTokenData.access_token) {
        console.log("AuthContext: Found stored token, calling fetchAndSetFullUser...");
        await fetchAndSetFullUser(storedUserTokenData);
      } else {
        console.log("AuthContext: No stored token found or token invalid.");
      }
      setLoading(false);
      console.log("AuthContext: Authentication initialization complete.");
    };
    initAuth();
  }, [fetchAndSetFullUser]);

  // Login function
  const login = async (username, password) => {
    console.log(`AuthContext: Attempting login for user: ${username}`);
    try {
      // Step 1: Get token from /token endpoint
      const tokenDataFromEndpoint = await authService.login(username, password);
      console.log("AuthContext: Received data from /token endpoint:", tokenDataFromEndpoint);

      if (tokenDataFromEndpoint && tokenDataFromEndpoint.access_token) {
        // Step 2: Use the received token to fetch full user details via /users/me
        // fetchAndSetFullUser will store the token and then call /users/me
        console.log("AuthContext: Token received, calling fetchAndSetFullUser to get full user details...");
        const userSession = await fetchAndSetFullUser(tokenDataFromEndpoint); // Pass the whole token data

        if (userSession) {
          console.log("AuthContext: Login successful, user session created:", userSession);
          toast.success("Login successful!");
          return { success: true, user: userSession };
        } else {
          console.error("AuthContext: Login failed - fetchAndSetFullUser did not return a user session.");
          // fetchAndSetFullUser handles its own errors including toast
          return { success: false, message: "Failed to process user session after login." };
        }
      } else {
        console.error("AuthContext: Login failed - No access token received from /token endpoint.");
        throw new Error("Login failed: No access token received.");
      }
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.detail) ||
        error.message ||
        error.toString();
      console.error(`AuthContext: Login failed for user ${username}. Error:`, message);
      toast.error(message);
      // Ensure user state is cleared on login failure
      setUserState(null);
      localStorage.removeItem('user');
      return { success: false, message };
    }
  };

  // Register function - remains the same as it doesn't auto-login
  const register = async (username, email, password) => {
    console.log(`AuthContext: Attempting registration for user: ${username}, email: ${email}`);
    try {
      await authService.register(username, email, password);
      toast.success("Registration successful! Please login.");
      console.log(`AuthContext: Registration successful for user: ${username}`);
      return { success: true };
    } catch (error) {
      const message = 
        (error.response && error.response.data && error.response.data.detail) || 
        error.message || 
        error.toString();
      console.error(`AuthContext: Registration failed for user: ${username}. Error:`, message);
      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout function
  const logout = useCallback(() => {
    console.log("AuthContext: Logging out user...");
    authService.logout();
    setUserState(null); // Use the internal setter
    localStorage.removeItem('user'); // Ensure localStorage is also cleared on logout
    toast.info("You have been logged out");
    console.log("AuthContext: User logged out.");
  }, []);

  // Custom setUser function that also updates localStorage
  // Used by SettingsPage to update user profile information
  const setUser = useCallback((newProfileData) => {
    console.log("AuthContext: setUser called with newProfileData:", newProfileData);
    setUserState(currentUserState => {
      if (newProfileData && newProfileData.id) {
        // This function is typically called after a profile update.
        // It's important to merge with existing token info if newProfileData doesn't have it.
        const updatedUser = {
          ...currentUserState, // Keeps access_token, token_type from current state
          ...newProfileData    // Overwrites with new profile details
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log("AuthContext: User profile updated in state and localStorage:", updatedUser);
        return updatedUser;
      } else {
        // If data is invalid or incomplete, log and return current state to avoid issues
        console.warn("AuthContext setUser called with invalid or incomplete data:", newProfileData);
        return currentUserState;
      }
    });
  }, []);


  const value = {
    user,
    setUser, // Expose the custom setUser
    loading,
    isAuthenticated: !!user && !!user.access_token && !!user.id, // More robust check
    login,
    register,
    logout,
    fetchAndSetFullUser // Expose fetchAndSetFullUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);