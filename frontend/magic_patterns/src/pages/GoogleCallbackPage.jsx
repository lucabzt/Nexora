// frontend/magic_patterns/src/pages/GoogleCallbackPage.jsx
import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const GoogleCallbackPage = () => {
  const { user } = useAuth();

  useEffect(() => {
    // The AuthContext will handle the callback automatically
    // This component just shows a loading state while processing
  }, []);

  return (
    <LoadingSpinner text="Processing Google login..." />
  );
};

export default GoogleCallbackPage;