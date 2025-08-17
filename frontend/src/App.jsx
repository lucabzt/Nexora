import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MantineProvider, ColorSchemeProvider } from '@mantine/core';
import { AuthProvider } from './contexts/AuthContext';
import { ToolbarProvider } from './contexts/ToolbarContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { PomodoroProvider } from './contexts/PomodoroContext';

import './i18n/i18n';

// Pages
import Dashboard from './pages/Dashboard.jsx';
import CreateCourse from './pages/CreateCourse';
import CourseView from './pages/CourseView';
import ChapterView from './pages/ChapterView';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import AppLayout from './layouts/AppLayout';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import SettingsPage from './pages/SettingsPage';
import StatisticsPage from './pages/StatisticsPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import Impressum from './pages/Impressum';
import Privacy from './pages/Privacy';
import About from './pages/About';
import PublicCourses from './pages/PublicCourses';
import MyCourses from './pages/MyCourses';
import NotFoundPage from './pages/NotFoundPage';
import AdminView from './pages/AdminView';
import AnkiGeneratorDashboard from "./pages/AnkiGenerator/AnkiGeneratorDashboard.jsx";
import AnkiProcessingStatus from "./pages/AnkiGenerator/AnkiProcessingStatus.jsx";

function App() {
  const [colorScheme, setColorScheme] = useState(() => {
    // Load saved theme from localStorage or default to 'dark'
    return localStorage.getItem('mantine-color-scheme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  const toggleColorScheme = (value) => {
    const nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(nextColorScheme);
    // Save theme to localStorage
    localStorage.setItem('mantine-color-scheme', nextColorScheme);
  };

  // Ensure localStorage is updated when the component mounts if it wasn't set before
  useEffect(() => {
    if (!localStorage.getItem('mantine-color-scheme')) {
      localStorage.setItem('mantine-color-scheme', colorScheme);
    }
  }, [colorScheme]);

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
        <LanguageProvider>
          <AuthProvider>
            {/*<NotificationProvider>*/}
              <ToolbarProvider>
                <PomodoroProvider>
                  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Routes>
                    {/* Public routes with MainLayout */}
                    <Route element={<MainLayout />}>
                      <Route path="/" element={<LandingPage />} /> {/* LandingPage now at root */}
                      <Route path="/auth/login" element={<Login />} />
                      <Route path="/auth/signup" element={<Register />} />
                      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/pricing" element={<PricingPage />} />
                      <Route path="/impressum" element={<Impressum />} />
                      <Route path="/privacy" element={<Privacy />} />
                    </Route>
                      {/* Protected routes now based at /dashboard */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/dashboard" element={<AppLayout />}> {/* Base path for dashboard and other protected routes */}
                        <Route index element={<Dashboard />} /> {/* This will be /dashboard */}
                        <Route path="public-courses" element={<PublicCourses />} />
                        <Route path="my-courses" element={<MyCourses />} />
                        <Route path="create-course" element={<CreateCourse />} /> {/* /dashboard/create-course */}
                        <Route path="courses/:courseId" element={<CourseView />} /> {/* /dashboard/courses/:courseId */}
                        <Route path="courses/:courseId/chapters/:chapterId" element={<ChapterView />} /> {/* /dashboard/courses/:courseId/chapters/:chapterId */}
                        <Route path="settings" element={<SettingsPage />} /> {/* /dashboard/settings */}
                        <Route path="statistics" element={<StatisticsPage />} /> {/* /dashboard/statistics */}
                        <Route path="anki-generator" element={<AnkiGeneratorDashboard />} />
                        <Route path="anki-generator/processing/:taskId" element={<AnkiProcessingStatus />} />
                      </Route>
                    </Route>
                      {/* Admin-only routes - Using AppLayout for consistent interface */}
                    <Route element={<AdminProtectedRoute />}>
                      <Route path="/admin" element={<AppLayout />}>
                        <Route index element={<AdminView />} />
                        {/* Add other admin routes here */}
                      </Route>
                    </Route>

                    {/* Old redirects removed as new routing handles root and protected areas explicitly */}
                    <Route path="*" element={<NotFoundPage />} /> {/* Catch-all route for 404 */}
                  </Routes>          
                  </BrowserRouter>
                  <ToastContainer position="top-right" autoClose={3000} theme={colorScheme} />
                </PomodoroProvider>
              </ToolbarProvider>
            {/*</NotificationProvider>*/}
          </AuthProvider>
        </LanguageProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

export default App;