import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import statisticsService from '../api/statisticsService';

// Track user activity and report to server
export default function TrackActivity({ user: currentUser }) {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const isProtectedRoute = location.pathname.startsWith('/dashboard');
  const delay = 10000;

  // Extract course and chapter IDs from URL
  const extractIdsFromPath = (path) => {
    const courseMatch = path.match(/\/dashboard\/courses\/(\d+)/);
    const chapterMatch = path.match(/\/dashboard\/courses\/\d+\/chapters\/(\d+)/);
    
    return {
      courseId: courseMatch ? parseInt(courseMatch[1], 10) : null,
      chapterId: chapterMatch ? parseInt(chapterMatch[1], 10) : null
    };
  };

  // Report usage to the server
  const reportUsage = useCallback(() => {
    // Only track if user is authenticated and on a protected route
    if (!currentUser || !isProtectedRoute) {
      return;
    }

    const { courseId, chapterId } = extractIdsFromPath(location.pathname);
    

    console.log('Sending usage:', {
        user_id: currentUser.id,
        url: window.location.pathname,
        course_id: courseId,
        chapter_id: chapterId,
        visible: isVisible
    });
      
    statisticsService.postUsage(
            window.location.pathname,
            currentUser.id,
            courseId,
            chapterId,
            isVisible
        );
  }, [currentUser, isProtectedRoute, location.pathname, isVisible]);

  // Track visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isNowVisible = !document.hidden;
      setIsVisible(isNowVisible);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Track URL changes and report usage periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
        reportUsage();
    }, delay); // Report every 10 seconds

    return () => {
        clearInterval(intervalId);
    };
    
  }, [currentUser, isProtectedRoute, reportUsage]);

  return null; // This component doesn't render anything
}
