import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Box, NavLink, Text, Button, ThemeIcon, Loader } from '@mantine/core';
import {
  IconHome2,
  IconChevronRight,
  IconChevronDown,
  IconFileText,
  IconPhoto,
  IconQuestionMark,
  IconCircleCheck,
  IconCircleDashed,
} from '@tabler/icons-react';
import { courseService } from '../api/courseService';

const CourseSidebar = () => {
  const navigate = useNavigate();
  const { courseId, chapterId } = useParams();

  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState(chapterId);

  // Refs to hold interval IDs for cleanup
  const coursePollInterval = useRef(null);
  const quizPollIntervals = useRef({});

  // --- Polling and Data Fetching Logic ---

  // Fetches initial course and chapter data
  const fetchInitialData = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const [courseData, chaptersData] = await Promise.all([
        courseService.getCourseById(courseId),
        courseService.getCourseChapters(courseId),
      ]);

      setCourse(courseData);
      // Initialize chapters with has_questions as false. It will be updated by polling.
      const initialChapters = (chaptersData || []).map(ch => ({ ...ch, has_questions: false }));
      setChapters(initialChapters);

      // Start polling for quiz questions for each chapter
      initialChapters.forEach(chapter => pollForQuiz(chapter.id));

      // If the course is being created, start polling for updates
      if (courseData?.status === 'CourseStatus.CREATING') {
        startCoursePolling();
      }
    } catch (error) {
      console.error('Failed to fetch initial course data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Polls for quiz questions for a single chapter
  const pollForQuiz = (chapId) => {
    // Avoid starting a new poll if one is already running for this chapter
    if (quizPollIntervals.current[chapId]) return;

    quizPollIntervals.current[chapId] = setInterval(async () => {
      try {
        const questions = await courseService.getChapterQuestions(courseId, chapId);
        if (questions && questions.length > 0) {
          // Once questions are found, update the state and stop polling for this chapter
          setChapters(prev => prev.map(ch => ch.id === chapId ? { ...ch, has_questions: true } : ch));
          clearInterval(quizPollIntervals.current[chapId]);
          delete quizPollIntervals.current[chapId];
        }
      } catch (error) {
        // Stop polling on error to avoid spamming logs
        console.error(`Error polling for quiz in chapter ${chapId}:`, error);
        clearInterval(quizPollIntervals.current[chapId]);
        delete quizPollIntervals.current[chapId];
      }
    }, 2000); // Poll every 2 seconds
  };

  // Polls for course status and new chapters
  const startCoursePolling = () => {
    if (coursePollInterval.current) clearInterval(coursePollInterval.current);

    coursePollInterval.current = setInterval(async () => {
      try {
        const [updatedCourse, updatedChaptersData] = await Promise.all([
          courseService.getCourseById(courseId),
          courseService.getCourseChapters(courseId),
        ]);

        setCourse(updatedCourse);

        // Check for newly added chapters
        setChapters(prevChapters => {
          const newChapters = (updatedChaptersData || []).map(newChap => {
            const existing = prevChapters.find(p => p.id === newChap.id);
            return existing ? existing : { ...newChap, has_questions: false };
          });

          // Start polling for quizzes in any brand new chapters
          newChapters.forEach(chapter => {
            const isAlreadyPolling = !!quizPollIntervals.current[chapter.id];
            if (!chapter.has_questions && !isAlreadyPolling) {
              pollForQuiz(chapter.id);
            }
          });

          return newChapters;
        });

        // If course creation is finished, stop polling
        if (updatedCourse?.status === 'CourseStatus.FINISHED') {
          clearInterval(coursePollInterval.current);
        }
      } catch (error) {
        console.error('Error during course polling:', error);
        clearInterval(coursePollInterval.current); // Stop on error
      }
    }, 2000); // Poll every 2 seconds
  };

  // --- Effects ---

  // Initial data load
  useEffect(() => {
    fetchInitialData();

    // Cleanup function to clear all intervals when the component unmounts
    return () => {
      if (coursePollInterval.current) {
        clearInterval(coursePollInterval.current);
      }
      Object.values(quizPollIntervals.current).forEach(clearInterval);
    };
  }, [courseId]);

  // --- Handlers ---

  const handleChapterClick = (id) => {
    setActiveChapter(prev => (prev === id ? null : id));
  };

  const handleNavigation = (chapId, tab) => {
    navigate(`/dashboard/courses/${courseId}/chapters/${chapId}?tab=${tab}`);
  };

  const handleCourseTitleClick = () => {
    navigate(`/dashboard/courses/${courseId}`);
  };

  // --- Render Logic ---

  if (loading) {
    return (
      <Box p="md" style={{ textAlign: 'center' }}>
        <Loader />
        <Text size="sm" mt="sm">Loading Course...</Text>
      </Box>
    );
  }

  return (
    <Box>
      <NavLink
        component={Link}
        to="/dashboard"
        label="Home"
        icon={<IconHome2 size={18} />}
        styles={(theme) => ({ root: { marginBottom: theme.spacing.sm } })}
      />

      <Button
        variant="subtle"
        fullWidth
        onClick={handleCourseTitleClick}
        styles={(theme) => ({
          root: { padding: `0 ${theme.spacing.md}px`, height: 'auto', marginBottom: theme.spacing.md },
          label: { whiteSpace: 'normal', fontSize: theme.fontSizes.lg, fontWeight: 700 },
        })}
      >
        {course?.title || 'Course Overview'}
      </Button>

      {chapters.map((chapter, index) => (
        <NavLink
          key={chapter.id}
          label={`${index + 1}. ${chapter.caption}`}
          opened={activeChapter === chapter.id.toString()}
          onClick={() => handleChapterClick(chapter.id.toString())}
          icon={
            <ThemeIcon variant="light" size="sm" color={chapter.is_completed ? 'green' : 'gray'}>
              {chapter.is_completed ? <IconCircleCheck size={14} /> : <IconCircleDashed size={14} />}
            </ThemeIcon>
          }
          rightSection={activeChapter === chapter.id.toString() ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
        >
          <NavLink
            label="Content"
            icon={<IconFileText size={16} />}
            onClick={() => handleNavigation(chapter.id, 'content')}
            active={chapterId === chapter.id.toString() && new URLSearchParams(window.location.search).get('tab') === 'content'}
          />
          {chapter.file_count > 0 && (
            <NavLink
              label="Files"
              icon={<IconPhoto size={16} />}
              onClick={() => handleNavigation(chapter.id, 'files')}
              active={chapterId === chapter.id.toString() && new URLSearchParams(window.location.search).get('tab') === 'files'}
            />
          )}
          {chapter.has_questions && (
            <NavLink
              label="Quiz"
              icon={<IconQuestionMark size={16} />}
              onClick={() => handleNavigation(chapter.id, 'quiz')}
              active={chapterId === chapter.id.toString() && new URLSearchParams(window.location.search).get('tab') === 'quiz'}
            />
          )}
        </NavLink>
      ))}
    </Box>
  );
};

export default CourseSidebar;
