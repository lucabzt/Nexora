import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MantineProvider, ColorSchemeProvider } from '@mantine/core';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Dashboard from './pages/Dashboard';
import CreateCourse from './pages/CreateCourse';
import CourseView from './pages/CourseView';
import ChapterView from './pages/ChapterView';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import AppLayout from './layouts/AppLayout';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [colorScheme, setColorScheme] = useState('dark');
  
  const toggleColorScheme = (value) => {
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider withGlobalStyles withNormalizeCSS theme={{ 
        colorScheme: colorScheme,
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
              {/* Public routes with MainLayout */}
              <Route element={<MainLayout />}>
                <Route path="/home" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="create-course" element={<CreateCourse />} />
                  <Route path="courses/:courseId" element={<CourseView />} />
                  <Route path="courses/:courseId/chapters/:chapterId" element={<ChapterView />} />
                  <Route path="home" element={<LandingPage />} />
                </Route>
              </Route>
              
              {/* Redirect root path for non-authenticated users to home */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
          <ToastContainer position="top-right" autoClose={3000} />
        </AuthProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

export default App;
