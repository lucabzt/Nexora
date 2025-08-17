import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader, Center, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useTranslation } from 'react-i18next'; // Added for translations

function OAuthCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchAndSetCurrentUser } = useAuth();
  const { t } = useTranslation('auth'); // Initialize useTranslation for the 'auth' namespace

  useEffect(() => {
    const processOAuthCallback = async () => {
      console.log("OAuthCallbackPage: Processing OAuth callback (cookie-based)...");
      const queryParams = new URLSearchParams(location.search);
      const oauthError = queryParams.get('error');
      const oauthErrorDescription = queryParams.get('error_description');

      if (oauthError) {
        const errorMessage = oauthErrorDescription || oauthError || 'An unknown OAuth error occurred.';
        console.error(`OAuthCallbackPage: OAuth provider error: ${errorMessage}`);
        showNotification({
          title: t('notifications.oauthCallback.titleErrorProvider'),
          message: t('notifications.oauthCallback.messageErrorProvider', { errorMessage }),
          color: 'red',
        });
        navigate('/auth/login?error=oauth_provider_error');
        return;
      }

      // If no explicit OAuth error in query params, attempt to fetch user
      // This relies on the backend having set an HTTP-only cookie
      try {
        console.log("OAuthCallbackPage: Calling fetchAndSetCurrentUser (expecting cookie)...");
        // fetchAndSetFullUser should now internally use the cookie to call /api/auth/me or similar
        const user = await fetchAndSetCurrentUser(); 

        if (user) {
          console.log("OAuthCallbackPage: fetchAndSetCurrentUser successful, user:", user);
          showNotification({
            title: t('notifications.oauthCallback.titleSuccess'),
            message: t('notifications.oauthCallback.messageSuccess', { username: user.username || t('notifications.oauthCallback.defaultUsername') }),
            color: 'green',
          });
          navigate('/dashboard'); // Redirect to dashboard
        } else {
          console.error("OAuthCallbackPage: fetchAndSetCurrentUser did not return a user (cookie auth). Possible session issue.");
          showNotification({
            title: t('notifications.oauthCallback.titleErrorSession'),
            message: t('notifications.oauthCallback.messageErrorSession'),
            color: 'red',
          });
          navigate('/login?error=session_verification_failed');
        }
      } catch (error) {
        console.error('OAuthCallbackPage: Error during fetchAndSetCurrentUser (cookie auth):', error);
        showNotification({
          title: t('notifications.oauthCallback.titleErrorException'),
          message: t('notifications.oauthCallback.messageErrorException'),
          color: 'red',
        });
        navigate('/auth/login?error=oauth_processing_exception');
      }
    };

    processOAuthCallback();
  }, [location, navigate, fetchAndSetCurrentUser, t]); // Added 't' to dependencies array

  return (
    <Center style={{ height: '100vh', flexDirection: 'column' }}>
      <Loader size="xl" />
      <Text mt="md">{t('notifications.oauthCallback.loadingText')}</Text>
    </Center>
  );
}

export default OAuthCallbackPage;
