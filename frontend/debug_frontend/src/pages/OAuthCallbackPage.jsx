import { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader, Center, Text } from '@mantine/core';

function OAuthCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchAndSetFullUser } = useAuth(); // Assuming fetchAndSetFullUser can handle the token object

  useEffect(() => {
    const processOAuthCallback = async () => {
      console.log("OAuthCallbackPage: Processing OAuth callback...");
      // Read from URL fragment instead of query parameters
      const hash = location.hash.substring(1); // Remove the leading '#'
      console.log("OAuthCallbackPage: URL fragment (hash):", hash);
      const params = new URLSearchParams(hash);
      
      const accessToken = params.get('access_token');
      const tokenType = params.get('token_type');
      console.log("OAuthCallbackPage: Extracted accessToken:", accessToken);
      console.log("OAuthCallbackPage: Extracted tokenType:", tokenType);
      // The backend currently only sends access_token and token_type in the fragment.
      // Other user details (userId, username, email, isAdmin) are part of the JWT token itself
      // and will be decoded by the backend or fetched via a /users/me endpoint after setting the token.
      // So, we don't expect userId, username, etc., directly in the fragment from the backend.

      if (accessToken) {
        console.log("OAuthCallbackPage: Access token found.");
        // Construct a minimal token object, as the backend now sends only token and type in fragment
        const tokenData = {
          access_token: accessToken,
          token_type: tokenType || 'bearer',
          // user_id, username, email, is_admin will be populated by fetchAndSetFullUser
          // after it validates the token and fetches user details.
        };
        console.log("OAuthCallbackPage: Constructed tokenData:", tokenData);

        try {
          console.log("OAuthCallbackPage: Calling fetchAndSetFullUser...");
          // fetchAndSetFullUser should:
          // 1. Store the raw token (access_token, token_type).
          // 2. Make a call to /api/users/me using this token to get full user details.
          // 3. Set the full user context.
          const user = await fetchAndSetFullUser(tokenData); 
          if (user) {
            console.log("OAuthCallbackPage: fetchAndSetFullUser successful, user:", user);
            navigate('/'); // Redirect to home page on successful login
          } else {
            console.error("OAuthCallbackPage: fetchAndSetFullUser did not return a user.");
            // Handle case where user is not set, possibly show error
            navigate('/login?error=oauth_failed_user_not_set');
          }
        } catch (error) {
          console.error('OAuthCallbackPage: OAuth callback processing failed during fetchAndSetFullUser:', error);
          navigate('/login?error=oauth_exception');
        }
      } else {
        console.warn("OAuthCallbackPage: Access token not found in URL fragment.");
        // Parameters not found, redirect to login with an error
        navigate('/login?error=oauth_missing_token_in_fragment');
      }
    };

    processOAuthCallback();
  }, [location, navigate, fetchAndSetFullUser]);

  return (
    <Center style={{ height: '100vh', flexDirection: 'column' }}>
      <Loader size="xl" />
      <Text mt="md">Processing your login...</Text>
    </Center>
  );
}

export default OAuthCallbackPage;
