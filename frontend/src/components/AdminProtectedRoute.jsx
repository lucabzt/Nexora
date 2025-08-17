import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Alert, Center, Loader } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

function AdminProtectedRoute() {
  const { user, isAuthenticated, loading } = useAuth();
  const { t } = useTranslation('admin');

  // Show a loading indicator while checking authentication
  if (loading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="xl" />
      </Center>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // If authenticated but not admin, show access denied with a redirect
  if (!user.is_admin) {
    return (
      <Center style={{ height: '100vh', padding: '20px' }}>
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title={t('accessDeniedTitle')} 
          color="red"
          withCloseButton
          closeButtonLabel={t('closeAlert')}
        >
          {t('accessDeniedMessage')}
          <meta httpEquiv="refresh" content="3;url=/" />
        </Alert>
      </Center>
    );
  }

  // User is authenticated and has admin privileges
  return <Outlet />;
}

export default AdminProtectedRoute;
