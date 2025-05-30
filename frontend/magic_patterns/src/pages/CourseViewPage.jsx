// frontend/magic_patterns/src/pages/CourseViewPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { coursesAPI } from '../services/api';
import { showToast } from '../utils/toast';
import CourseOutline from '../components/CourseOutline';
import CourseContent from '../components/CourseContent';
import LoadingSpinner from '../components/LoadingSpinner';

const CourseViewPage = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [streamingComplete, setStreamingComplete] = useState(false);

  useEffect(() => {
    if (location.state?.streaming) {
      // We're coming from course creation, handle streaming
      handleStreamingCourse();
    } else {
      // Regular course view, fetch from API
      fetchCourse();
    }
  }, [courseId, location.state]);

  const fetchCourse = async () => {
    try {
      const response = await coursesAPI.getCourse(courseId);
      setCourse(response.data);
      setStreamingComplete(true);

      // Select first chapter by default
      if (response.data.chapters && response.data.chapters.length > 0) {
        setSelectedChapter(response.data.chapters[0]);
      }
    } catch (error) {
      showToast('Failed to load course', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStreamingCourse = async () => {
    // Initialize course with the initial data from course creation
    const initialData = location.state.initialData;
    setCourse({
      course_id: initialData.course_id,
      title: initialData.title,
      description: initialData.description,
      session_id: initialData.session_id,
      total_time_hours: initialData.total_time_hours,
      status: 'creating',
      chapters: []
    });
    setLoading(false);

    // Continue listening for streaming updates
    try {
      const response = await coursesAPI.createCourse({
        // This won't actually create a new course, but we need to handle the ongoing stream
        // In a real implementation, you might want to store the stream reference
        // For now, we'll fetch the course periodically until it's complete
      });

      // Since we can't easily continue the existing stream, we'll poll for updates
      pollForUpdates();
    } catch (error) {
      console.error('Error handling streaming course:', error);
      // Fallback to regular fetch
      fetchCourse();
    }
  };

  const pollForUpdates = async () => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await coursesAPI.getCourse(courseId);
        const updatedCourse = response.data;

        setCourse(prevCourse => {
          // Only update if we have new chapters
          if (updatedCourse.chapters.length > (prevCourse?.chapters?.length || 0)) {
            return updatedCourse;
          }
          return prevCourse;
        });

        // If course is finished, stop polling
        if (updatedCourse.status === 'finished') {
          setStreamingComplete(true);
          clearInterval(pollInterval);
          showToast('Course creation completed!', 'success');

          // Select first chapter if none selected
          if (!selectedChapter && updatedCourse.chapters.length > 0) {
            setSelectedChapter(updatedCourse.chapters[0]);
          }
        }
      } catch (error) {
        console.error('Error polling for updates:', error);
        clearInterval(pollInterval);
      }
    }, 2000); // Poll every 2 seconds

    // Cleanup after 5 minutes max
    setTimeout(() => {
      clearInterval(pollInterval);
      if (!streamingComplete) {
        setStreamingComplete(true);
        showToast('Course creation may still be in progress. Refresh to see latest updates.', 'info');
      }
    }, 300000);
  };

  const handleChapterSelect = (chapter) => {
    setSelectedChapter(chapter);
  };

  const handleChapterComplete = async (chapterId) => {
    try {
      await coursesAPI.markChapterComplete(courseId, chapterId);

      // Update local state
      setCourse(prevCourse => ({
        ...prevCourse,
        chapters: prevCourse.chapters.map(ch =>
          ch.id === chapterId ? { ...ch, is_completed: true } : ch
        )
      }));

      // Update selected chapter if it's the one being completed
      if (selectedChapter && selectedChapter.id === chapterId) {
        setSelectedChapter(prev => ({ ...prev, is_completed: true }));
      }

      showToast('Chapter marked as complete!', 'success');
    } catch (error) {
      showToast('Failed to mark chapter as complete', 'error');
    }
  };

  const handleChapterIncomplete = async (chapterId) => {
    try {
      await coursesAPI.markChapterIncomplete(courseId, chapterId);

      // Update local state
      setCourse(prevCourse => ({
        ...prevCourse,
        chapters: prevCourse.chapters.map(ch =>
          ch.id === chapterId ? { ...ch, is_completed: false } : ch
        )
      }));

      // Update selected chapter if it's the one being marked incomplete
      if (selectedChapter && selectedChapter.id === chapterId) {
        setSelectedChapter(prev => ({ ...prev, is_completed: false }));
      }

      showToast('Chapter marked as incomplete', 'info');
    } catch (error) {
      showToast('Failed to mark chapter as incomplete', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
          <p className="text-gray-600">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto h-[calc(100vh-64px)] max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
        <p className="text-gray-600">{course.description}</p>
        {!streamingComplete && (
          <div className="mt-2 flex items-center text-sm text-yellow-600">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
            Course is still being created. New chapters will appear as they're ready.
          </div>
        )}
      </div>

      <div className="grid h-[calc(100%-100px)] gap-6 lg:grid-cols-[300px,1fr]">
        <CourseOutline
          course={course}
          selectedChapter={selectedChapter}
          onChapterSelect={handleChapterSelect}
          onChapterComplete={handleChapterComplete}
          onChapterIncomplete={handleChapterIncomplete}
          streamingComplete={streamingComplete}
        />

        <div className="overflow-hidden">
          {selectedChapter ? (
            <CourseContent
              chapter={selectedChapter}
              onChapterComplete={() => handleChapterComplete(selectedChapter.id)}
              onChapterIncomplete={() => handleChapterIncomplete(selectedChapter.id)}
            />
          ) : (
            <div className="h-full flex items-center justify-center rounded-lg border border-gray-200 bg-white">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {course.chapters.length === 0 ? 'Creating your first chapter...' : 'Select a chapter to begin learning'}
                </h3>
                <p className="text-gray-500">
                  {course.chapters.length === 0
                    ? 'Please wait while we generate your personalized content.'
                    : 'Choose a chapter from the outline to start studying.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseViewPage;