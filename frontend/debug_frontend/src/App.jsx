import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MantineProvider } from '@mantine/core';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Dashboard from './pages/Dashboard';
import CreateCourse from './pages/CreateCourse';
import CourseView from './pages/CourseView';
import ChapterView from './pages/ChapterView';
import Login from './pages/Login';
import Register from './pages/Register';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS theme={{ 
      colorScheme: 'dark',
      primaryColor: 'cyan',
      components: {
        Button: {
          styles: {
            root: {
              fontWeight: 600,
            },
          },
        },
      },
    }}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="create-course" element={<CreateCourse />} />
                <Route path="courses/:courseId" element={<CourseView />} />
                <Route path="courses/:courseId/chapters/:chapterId" element={<ChapterView />} />
              </Route>
            </Route>
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;
