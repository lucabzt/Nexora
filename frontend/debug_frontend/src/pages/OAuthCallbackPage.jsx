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
      const params = new URLSearchParams(location.search);
      const accessToken = params.get('access_token');
      const tokenType = params.get('token_type');
      const userId = params.get('user_id');
      const username = params.get('username');
      const isAdminStr = params.get('is_admin');

      if (accessToken && userId) {
        const isAdmin = isAdminStr === 'true'; // Convert string to boolean
        const tokenData = {
          access_token: accessToken,
          token_type: tokenType || 'bearer',
          user_id: userId, // fetchAndSetFullUser expects user_id or id
          username: username,
          is_admin: isAdmin,
        };

        try {
          const user = await fetchAndSetFullUser(tokenData);
          if (user) {
            navigate('/'); // Redirect to home page on successful login
          } else {
            // Handle case where user is not set, possibly show error
            navigate('/login?error=oauth_failed');
          }
        } catch (error) {
          console.error('OAuth callback processing failed:', error);
          navigate('/login?error=oauth_exception');
        }
      } else {
        // Parameters not found, redirect to login with an error
        navigate('/login?error=oauth_missing_params');
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
