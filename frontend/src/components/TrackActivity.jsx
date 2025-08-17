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
    console.log('[TrackActivity] Extracting IDs from path:', path);
    const courseMatch = path.match(/\/dashboard\/courses\/(\d+)/);
    const chapterMatch = path.match(/\/dashboard\/courses\/\d+\/chapters\/(\d+)/);
    
    return {
      courseId: courseMatch ? parseInt(courseMatch[1], 10) : null,
      chapterId: chapterMatch ? parseInt(chapterMatch[1], 10) : null
    };
  };

  // Report usage to the server
  const reportUsage = useCallback(() => {
    console.log('[TrackActivity] reportUsage called', { 
      hasUser: !!currentUser, 
      isProtectedRoute,
      currentPath: location.pathname,
      isVisible
    });
    
    // Only track if user is authenticated and on a protected route
    if (!currentUser) {
      console.log('[TrackActivity] Skipping - No user logged in: ');
      return;
    }
    
    if (!isProtectedRoute) {
      console.log('[TrackActivity] Skipping - Not a protected route');
      return;
    }

    const { courseId, chapterId } = extractIdsFromPath(location.pathname);
    

    console.log('[TrackActivity] Sending usage data:', {
        user_id: currentUser.id,
        url: window.location.pathname,
        course_id: courseId,
        chapter_id: chapterId,
        visible: isVisible
    });
      
    statisticsService.postUsage(
            currentUser.id,
            window.location.pathname,
            courseId,
            chapterId,
            isVisible,
            new Date().toISOString()
        )
        .then(() => {
            console.log('[TrackActivity] Successfully sent usage data');
        })
        .catch(error => {
            console.error('[TrackActivity] Failed to send usage data:', error);
        });
  }, [currentUser, isProtectedRoute, location.pathname, isVisible]);

  // Track visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isNowVisible = !document.hidden;
      console.log('[TrackActivity] Visibility changed', { 
        wasVisible: isVisible, 
        nowVisible: isNowVisible,
        currentPath: location.pathname
      });
      
      setIsVisible(isNowVisible);
      
      // Only report if visibility actually changed
      if (isNowVisible !== lastVisibilityRef.current) {
        console.log('[TrackActivity] Visibility state changed, reporting...');
        lastVisibilityRef.current = isNowVisible;
        reportUsage();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Track URL changes and report usage periodically
  useEffect(() => {
    console.log('[TrackActivity] Mounting tracker', { 
      currentUser: !!currentUser, 
      isProtectedRoute,
      currentPath: location.pathname
    });
    console.log('[TrackActivity] Starting tracking...');
    
    const intervalId = setInterval(() => {
        console.log('[TrackActivity] Interval tick - reporting usage');
        reportUsage();
    }, delay); // Report every 10 seconds

    return () => {
        console.log('[TrackActivity] Cleaning up tracker');
        clearInterval(intervalId);
    };
    
  }, [currentUser, isProtectedRoute, reportUsage]);

  return null; // This component doesn't render anything
}
