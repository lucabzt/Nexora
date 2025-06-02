// frontend/magic_patterns/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CourseCreationPage from './pages/CourseCreationPage';
import CourseViewPage from './pages/CourseViewPage';
import GoogleCallbackPage from './pages/GoogleCallbackPage';
import Navbar from './components/Navbar';
import PaperBackground from './components/PaperBackground';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <PaperBackground>
      <div className="min-h-screen w-full">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <div className="pt-16">
                  <DashboardPage />
                </div>
              </>
            </ProtectedRoute>
          } />
          <Route path="/create" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <div className="pt-16">
                  <CourseCreationPage />
                </div>
              </>
            </ProtectedRoute>
          } />
          <Route path="/course/:courseId" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <div className="pt-16">
                  <CourseViewPage />
                </div>
              </>
            </ProtectedRoute>
          } />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </PaperBackground>
  );
};

export function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}