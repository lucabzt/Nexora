import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Removed useSearchParams as it wasn't used
import { useTranslation } from 'react-i18next';
import image_def_ka_austasuche from "../assets/wired-flat-2566-logo-discord-hover-wink.gif"
import {
  Container,
  Title,
  Text,
  Card,
  Group,
  SimpleGrid,
  Progress,
  Badge,
  Button,
  // List, // Not used
  ThemeIcon,
  Loader,
  Alert,
  Box,
  Paper,
  Image,
  // ActionIcon, // Not used
  Grid,
  Divider,
  RingProgress,
  Overlay,
  // useMantineTheme // Not used directly, but sx prop uses theme
} from '@mantine/core';
import {
  IconAlertCircle,
  IconCircleCheck,
  IconClock,
  IconArrowRight,
  IconBrain,
  IconTrophy,
  IconArrowBack,
  IconCheck,
  IconChevronRight
} from '@tabler/icons-react';
import { courseService } from '../api/courseService'; // Assuming Course and Chapter types are exported

// Mock courseService if not available in this context
// const courseService = {
//   getCourseById: async (id: string): Promise<CourseType> => {
//     console.log(`Mock API: Fetching course ${id}`);
//     // Simulate API delay
//     await new Promise(resolve => setTimeout(resolve, 500));
//     // Simulate evolving course data
//     const staticData = {
//       course_id: parseInt(id),
//       total_time_hours: 2,
//       image_url: "https://plus.unsplash.com/premium_photo-1673468922221-4cae4d1aa748?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//       session_id: "mock-session-123",
//     };

//     // Simulate different stages based on a counter or courseId
//     // This is a simplified mock. A real test would require more dynamic data.
//     if (! (window as any).mockCoursePolls) (window as any).mockCoursePolls = 0;
//     (window as any).mockCoursePolls++;
//     const pollCount = (window as any).mockCoursePolls;

//     if (pollCount < 2) {
//       return {
//         ...staticData,
//         status: 'CourseStatus.CREATING',
//         title: null,
//         description: null,
//         chapter_count: null,
//         chapters: [],
//       };
//     } else if (pollCount < 4) {
//       return {
//         ...staticData,
//         status: 'CourseStatus.CREATING',
//         title: 'My Awesome AI Course',
//         description: 'A deeply engaging course created by AI.',
//         chapter_count: 5,
//         chapters: [
//           { id: '1', caption: 'Chapter 1: Introduction', summary: 'Summary of Ch1', is_completed: false, mc_questions: [{id: 'q1', question: 'Q?'}], content: '' },
//         ],
//       };
//     } else if (pollCount < 6) {
//       return {
//         ...staticData,
//         status: 'CourseStatus.CREATING',
//         title: 'My Awesome AI Course',
//         description: 'A deeply engaging course created by AI.',
//         chapter_count: 5,
//         chapters: [
//           { id: '1', caption: 'Chapter 1: Introduction', summary: 'Summary of Ch1', is_completed: true, mc_questions: [{id: 'q1', question: 'Q?'}], content: '' },
//           { id: '2', caption: 'Chapter 2: Core Concepts', summary: 'Summary of Ch2', is_completed: false, mc_questions: [], content: '' },
//           { id: '3', caption: 'Chapter 3: Advanced Topics', summary: 'Summary of Ch3', is_completed: false, mc_questions: [], content: '' },
//         ],
//       };
//     } else {
//       return {
//         ...staticData,
//         status: 'CourseStatus.FINISHED',
//         title: 'My Awesome AI Course',
//         description: 'A deeply engaging course created by AI.',
//         chapter_count: 5,
//         chapters: [
//           { id: '1', caption: 'Chapter 1: Introduction', summary: 'Summary of Ch1', is_completed: true, mc_questions: [{id: 'q1', question: 'Q?'}], content: '' },
//           { id: '2', caption: 'Chapter 2: Core Concepts', summary: 'Summary of Ch2', is_completed: false, mc_questions: [], content: '' },
//           { id: '3', caption: 'Chapter 3: Advanced Topics', summary: 'Summary of Ch3', is_completed: false, mc_questions: [], content: '' },
//           { id: '4', caption: 'Chapter 4: Practical Applications', summary: 'Summary of Ch4', is_completed: false, mc_questions: [], content: '' },
//           { id: '5', caption: 'Chapter 5: Conclusion & Next Steps', summary: 'Summary of Ch5', is_completed: false, mc_questions: [], content: '' },
//         ],
//       };
//     }
//   }
// };


function CourseView() {
  const { t } = useTranslation('courseView');
  const { courseId } = useParams();
  const navigate = useNavigate();
  // const theme = useMantineTheme(); // Not directly used, sx prop uses theme from context

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [creationProgressUI, setCreationProgressUI] = useState({
    statusText: t('creation.statusInitializing'),
    percentage: 0,
    chaptersCreated: 0,
    estimatedTotal: 0,
  });

  // Initial data fetch
  useEffect(() => {
    if (!courseId) {
      setError(t('errors.invalidCourseId'));
      setLoading(false);
      return;
    }

    const fetchInitialCourseData = async () => {
      try {
        setLoading(true);
        console.log('Fetching initial course data for ID:', courseId);
        const courseData = await courseService.getCourseById(courseId);
        setCourse(courseData);
        setError(null);

        // Initialize creationProgressUI if course is in creating state
        if (courseData.status === 'CourseStatus.CREATING') {
          const currentChapters = courseData.chapters || [];
          const totalChapters = courseData.chapter_count || 0;
          const progressPercent = totalChapters > 0 ? Math.round((currentChapters.length / totalChapters) * 100) : 0;

          setCreationProgressUI({
            statusText: t('creation.statusCreatingChapters', { 
              chaptersCreated: currentChapters.length, 
              totalChapters: totalChapters || t('creation.unknownTotal') 
            }),
            percentage: progressPercent,
            chaptersCreated: currentChapters.length,
            estimatedTotal: totalChapters,
          });
        }
        console.log('Initial course data fetched:', courseData);
      } catch (err) {
        setError(t('errors.loadFailed'));
        console.error('Error fetching initial course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialCourseData();
  }, [courseId, t]);

  // Polling effect for course creation
  useEffect(() => {
    if (!courseId || !course || course.status !== 'CourseStatus.CREATING') {
      return; // Only poll if course exists and is in CREATING status
    }

    console.log('Starting polling for course ID:', courseId, 'current status:', course.status);
    const pollInterval = setInterval(async () => {
      try {
        const polledData = await courseService.getCourseById(courseId);
        console.log('Polled course data:', polledData);
        setCourse(polledData); // Update the main course state

        const currentChapters = polledData.chapters || [];
        const totalChapters = polledData.chapter_count || 0; // Use 0 if null/undefined
        const progressPercent = totalChapters > 0 ? Math.round((currentChapters.length / totalChapters) * 100) : 0;

        if (polledData.status === 'CourseStatus.FINISHED') {
          setCreationProgressUI({
            statusText: t('creation.statusComplete'),
            percentage: 100,
            chaptersCreated: currentChapters.length,
            estimatedTotal: totalChapters,
          });
          console.log('Course creation completed. Stopping poll.');
          clearInterval(pollInterval);
        } else if (polledData.status === 'CourseStatus.CREATING') {
          setCreationProgressUI({
            statusText: t('creation.statusCreatingChapters', { 
                chaptersCreated: currentChapters.length, 
                totalChapters: totalChapters || t('creation.unknownTotal') 
            }),
            percentage: progressPercent,
            chaptersCreated: currentChapters.length,
            estimatedTotal: totalChapters,
          });
        } else {
          // Course status is neither CREATING nor FINISHED (e.g., FAILED)
          console.log('Course status changed to:', polledData.status, '. Stopping poll.');
          clearInterval(pollInterval);
          // Optionally update UI for other statuses like FAILED
        }
      } catch (err) {
        console.error('Error polling course data:', err);
        // Decide if polling should stop or continue on error.
        // For now, it continues, but you might want to stop after N retries or set an error.
        // setError(t('errors.pollFailed')); // This might overwrite other errors.
      }
    }, 2000); // Poll every 2 seconds

    return () => {
      console.log('Cleaning up poll interval for course ID:', courseId);
      clearInterval(pollInterval);
    };
  }, [course, courseId, t]); // Re-run if course object, courseId, or t changes

  const chapters = useMemo(() => course?.chapters || [], [course]);
  
  // Learning progress calculation
  const { learningPercentage, actualCompletedLearningChapters, totalCourseChaptersForLearning } = useMemo(() => {
    if (!course) {
      return { learningPercentage: 0, actualCompletedLearningChapters: 0, totalCourseChaptersForLearning: 0 };
    }
    const learnableChapters = course.chapters || [];
    const completedCount = learnableChapters.filter(ch => ch.is_completed).length;
    const totalCount = course.chapter_count || learnableChapters.length || 0;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    return { 
      learningPercentage: percentage, 
      actualCompletedLearningChapters: completedCount, 
      totalCourseChaptersForLearning: totalCount 
    };
  }, [course]);

  if (loading && !course) { // Show main loader only if no course data yet
    return (
      <Container size="lg" py="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <Loader size="lg" title={t('loadingCourseDetails')} />
        </Box>
      </Container>
    );
  }

  if (error && !course) { // Show main error only if no course data (critical failure)
    return (
      <Container size="lg" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={t('errors.genericTitle')}
          color="red"
          mb="lg"
        >
          {error}
        </Alert>
      </Container>
    );
  }
  
  // If there's a non-critical error but we have some course data, we can show it along with the course
  const showNonCriticalError = error && course;

  return (
    <Container size="lg" py="xl">
      {showNonCriticalError && (
         <Alert 
         icon={<IconAlertCircle size={16} />}
         title={t('errors.genericTitle')} 
         color="orange" 
         mb="lg"
         withCloseButton
         onClose={() => setError(null)}
       >
         {error}
       </Alert>
      )}

      {/* Creation In Progress Section */}
      {course?.status === "CourseStatus.CREATING" && (
        <Paper
          radius="md"
          p="xl"
          withBorder
          mb="xl"
          sx={(theme) => ({
            position: 'relative',
            overflow: 'hidden', backgroundColor: theme.colorScheme === 'dark' ?
              theme.colors.dark[6] :
              theme.white,
          })}
        >
          <Box
            sx={(theme) => ({
              position: 'absolute',
              top: 0,
              right: 0,
              width: '50%',
              height: '100%',
              opacity: 0.05,
              backgroundImage: (course && course.image_url) ? `url("${course.image_url}")` : 'url("https://plus.unsplash.com/premium_photo-1673468922221-4cae4d1aa748?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              [theme.fn.smallerThan('md')]: {
                width: '100%',
              },
            })}
          />

          <Group position="apart" mb="xl">
            <Box>
              <Badge color="blue" variant="filled" size="lg" radius="sm" mb="sm">
                <Group spacing="xs">
                  <IconBrain size={16} />
                  <span>{t('creation.aiInActionBadge')}</span>
                </Group>
              </Badge>
              <Title
                order={2}
                sx={() => ({ // theme implicitly available in sx
                  fontWeight: 800,
                  fontSize: '1.8rem',
                })}
              >
                {t('creation.title')}
              </Title>
            </Box>

            <ThemeIcon
              size={60}
              radius="xl"
              color={creationProgressUI.percentage === 100 ? "green" : "cyan"}
              variant="light"
              sx={{ border: '4px solid #f0f0f0' }}
            >
              {creationProgressUI.percentage === 100 ?
                <IconCheck size={30} /> :
                <IconClock size={30} />
              }
            </ThemeIcon>
          </Group>

          <Box mb="xl">
            <Group position="apart" mb="xs">
              <Text size="sm" weight={600} color="dimmed">{t('creation.progressLabel')}</Text>
              <Text size="sm" weight={700}>{creationProgressUI.percentage}%</Text>
            </Group>

            <Progress
              value={creationProgressUI.percentage}
              size="lg"
              radius="xl"
              color={creationProgressUI.percentage === 100 ? 'green' : 'teal'}
              animate={creationProgressUI.percentage > 0 && creationProgressUI.percentage < 100}
              sx={() => ({ // theme implicitly available in sx
                height: 12,
                '& .mantine-Progress-bar': creationProgressUI.percentage !== 100 ? {
                  background: 'linear-gradient(90deg, #36D1DC 0%, #5B86E5 100%)'
                } : {}
              })}
            />
          </Box>

          <Box
            py="md"
            px="lg"
            mt="md"
            sx={(theme) => ({
              backgroundColor: theme.colorScheme === 'dark' ?
                theme.colors.dark[7] :
                theme.fn.rgba(theme.colors.gray[0], 0.7),
              borderRadius: theme.radius.md,
              position: 'relative',
              zIndex: 2,
            })}
          >
            <Text align="center" size="lg" weight={600} mb="xs" color={creationProgressUI.percentage === 100 ? 'teal' : undefined}>
              {t('creation.currentStatusLabel')} {creationProgressUI.statusText}
            </Text>

            {creationProgressUI.percentage > 0 && creationProgressUI.percentage < 100 && (
              <Text color="dimmed" size="sm" align="center">
                {t('creation.description')}
              </Text>
            )}

            {creationProgressUI.percentage === 100 && (
              <Group position="center" mt="md">
                <Button
                  variant="gradient"
                  gradient={{ from: 'teal', to: 'green' }}
                  leftIcon={<IconArrowRight size={16} />}
                  onClick={() => window.location.reload()} // Reload to get fresh state post-creation
                >
                  {t('buttons.viewCompletedCourse')}
                </Button>
              </Group>
            )}
          </Box>

          {creationProgressUI.chaptersCreated > 0 && (
            <Group position="center" mt="md" spacing="xl">
              <Box sx={{ textAlign: 'center' }}>
                <Text size="xl" weight={700}>{creationProgressUI.chaptersCreated}</Text>
                <Text size="xs" color="dimmed">{t('creation.chaptersCreatedLabelCount', { count: creationProgressUI.chaptersCreated })}</Text>
              </Box>

              <Divider orientation="vertical" />

              <Box sx={{ textAlign: 'center' }}>
                <Text size="xl" weight={700}>{creationProgressUI.estimatedTotal || t('creation.calculating')}</Text>
                <Text size="xs" color="dimmed">{t('creation.estimatedTotalLabel')}</Text>
              </Box>

              <Divider orientation="vertical" />

              <Box sx={{ textAlign: 'center' }}>
                <Text size="xl" weight={700}>{course?.total_time_hours || t('creation.calculating')} hrs</Text>
                <Text size="xs" color="dimmed">{t('creation.learningTimeLabel')}</Text>
              </Box>
            </Group>
          )}
        </Paper>
      )}

      {/* Course Content Section - Render if course data is available */}
      {course && (
        <>
          {/* Course Hero Section */}
          <Paper
            radius="md"
            p={0}
            withBorder
            mb="xl"
            sx={(theme) => ({
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
            })}
          >
            <Grid gutter={0}>
              <Grid.Col md={7}>
                <Box p="xl">
                  <Group position="apart">
                    <Button
                      variant="subtle"
                      leftIcon={<IconArrowBack size={16} />}
                      onClick={() => navigate('/')}
                      mb="md"
                    >
                      {t('buttons.backToDashboard')}
                    </Button>

                    {course.status === "CourseStatus.CREATING" ? (
                      <Badge size="lg" color="blue" variant="filled" px="md" py="sm">
                        <IconClock size={16} style={{ marginRight: 6 }} />
                        {t('creation.statusCreatingCourse')}
                      </Badge>
                    ) : (
                      <Badge size="lg" color="teal" variant="filled" px="md" py="sm">
                        {t('progress.percentageComplete', { percentage: learningPercentage })}
                      </Badge>
                    )}
                  </Group>

                  <Title
                    order={1}
                    mb="xs"
                    sx={(theme) => ({
                      fontSize: '2.5rem',
                      fontWeight: 900,
                      backgroundImage: theme.colorScheme === 'dark'
                        ? `linear-gradient(45deg, ${theme.colors.teal[4]}, ${theme.colors.cyan[6]})`
                        : `linear-gradient(45deg, ${theme.colors.teal[7]}, ${theme.colors.cyan[5]})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    })}
                  >
                    {course.title || t('courseLoadingTitle')}
                  </Title>

                  <Text size="md" mb="lg" color="dimmed" sx={{ maxWidth: '600px' }}>
                    {course.description || t('courseLoadingDescription')}
                  </Text>

                  <Group position="apart" mb="lg">
                    <Box>
                      <Text size="sm" weight={500} color="dimmed">{t('progress.courseProgressLabel')}</Text>
                      <Group spacing="xs" mt="xs">
                        <RingProgress
                          size={60}
                          thickness={4}
                          roundCaps
                          sections={[{ value: learningPercentage, color: 'teal' }]}
                          label={
                            <Text size="xs" align="center" weight={700}>
                              {learningPercentage}%
                            </Text>
                          }
                        />
                        <div>
                          <Text size="md" weight={700}>{actualCompletedLearningChapters} of {totalCourseChaptersForLearning}</Text>
                          <Text size="xs" color="dimmed">{t('progress.chaptersCompletedStats', { completedChapters: actualCompletedLearningChapters, totalChapters: totalCourseChaptersForLearning })}</Text>
                        </div>
                      </Group>
                    </Box>

                    <Box>
                      <Text size="sm" weight={500} color="dimmed">{t('progress.estimatedTimeLabel')}</Text>
                      <Group spacing="xs" mt="xs">
                        <ThemeIcon size="lg" radius="md" color="teal" variant="light">
                          <IconClock size={20} />
                        </ThemeIcon>
                        <div>
                          <Text size="md" weight={700}>{course.total_time_hours || "..."} hours</Text>
                          <Text size="xs" color="dimmed">{t('progress.learningTimeLabel')}</Text>
                        </div>
                      </Group>
                    </Box>
                  </Group>

                  {course.status !== "CourseStatus.CREATING" && chapters.length > 0 && (
                    <Button
                      size="md"
                      variant="gradient"
                      gradient={{ from: 'teal', to: 'cyan' }}
                      rightIcon={<IconChevronRight size={16} />}
                      onClick={() => navigate(`/dashboard/courses/${courseId}/chapters/${chapters[0]?.id}`)}
                      mt="md"
                    >
                      {learningPercentage > 0 ? t('buttons.continueLearning') : t('buttons.startLearning')}
                    </Button>
                  )}

                  <Text size="xs" color="dimmed" mt={30}>{t('sessionIdLabel')} {course.session_id || 'N/A'}</Text>
                </Box>
              </Grid.Col>

              <Grid.Col md={5} sx={{ position: 'relative' }}>
                <Image
                  src={course.image_url || "https://plus.unsplash.com/premium_photo-1673468922221-4cae4d1aa748?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
                  
                  
                  height={400}
                  sx={{
                    objectFit: 'cover',
                    height: '100%',
                  }}
                  alt={course.title || t('courseImageAlt')}
                />
                <Box
                  sx={(theme) => ({
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: theme.spacing.md,
                  })}
                >
                  <Group spacing="xs">
                    <ThemeIcon size={32} radius="xl" color="teal" variant="filled">
                      <IconBrain size={18} />
                    </ThemeIcon>
                    <div>
                      <Text color="white" weight={600}>{t('aiGeneratedCourseLabel')}</Text>
                      <Text color="white" opacity={0.7} size="xs">
                        {t('personalizedLearningPathLabel')}
                      </Text>
                    </div>
                  </Group>
                </Box>
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Learning journey header */}
          <Group position="apart" align="center" mb="xl">
            <Box>
              <Title
                order={2}
                sx={(theme) => ({
                  fontWeight: 700,
                  color: theme.colorScheme === 'dark' ? theme.white : theme.black,
                })}
              >
                {t('learningJourneyLabel')}
              </Title>
              <Text color="dimmed">
                {t('followChaptersLabel')}
              </Text>
            </Box>

            {course.status !== "CourseStatus.CREATING" && chapters.length > 0 && (
              <Group spacing="xs">
                <ThemeIcon
                  size={34}
                  radius="xl"
                  color={actualCompletedLearningChapters === totalCourseChaptersForLearning && totalCourseChaptersForLearning > 0 ? "green" : "teal"}
                  variant={actualCompletedLearningChapters === totalCourseChaptersForLearning && totalCourseChaptersForLearning > 0 ? "filled" : "light"}
                >
                  {actualCompletedLearningChapters === totalCourseChaptersForLearning && totalCourseChaptersForLearning > 0 ?
                    <IconTrophy size={18} /> :
                    <IconBrain size={18} />
                  }
                </ThemeIcon>
                <div>
                  <Text weight={600} size="sm">
                    {actualCompletedLearningChapters === totalCourseChaptersForLearning && totalCourseChaptersForLearning > 0 ?
                      t('courseMasteredLabel') :
                      `${actualCompletedLearningChapters === 0 ? t('beginLearningLabel') : t('continueLearningLabel')}`}
                  </Text>
                  <Text size="xs" color="dimmed">
                    {actualCompletedLearningChapters === totalCourseChaptersForLearning && totalCourseChaptersForLearning > 0 ?
                      t('congratulationsLabel') :
                      t('progress.chaptersCompletedText', { completedChapters: actualCompletedLearningChapters, totalChapters: totalCourseChaptersForLearning })}
                  </Text>
                </div>
              </Group>
            )}
          </Group>

          {/* Show creation progress for chapters if no chapters loaded yet during creation */}
          {course.status === "CourseStatus.CREATING" && chapters.length === 0 && creationProgressUI.estimatedTotal === 0 && (
            <Paper withBorder p="xl" radius="md" mb="lg" sx={(theme) => ({
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
              textAlign: 'center',
            })}>
              <Loader size="md" mb="md" mx="auto" />
              <Title order={3} mb="sm">{t('creation.buildingCourseLabel')}</Title>
              <Text color="dimmed" size="sm" maw={400} mx="auto">
                {t('creation.creatingHighQualityContentLabel')}
              </Text>
            </Paper>
          )}

          {/* Chapters Grid */}
          <SimpleGrid
            cols={3}
            spacing="lg"
            breakpoints={[
              { maxWidth: 'md', cols: 2 },
              { maxWidth: 'sm', cols: 1 },
            ]}
          >
            {chapters.map((chapter, index) => {
              const chapterImage = chapter.image_url ? `url("${chapter.image_url}")` : image_def_ka_austasuche; // Dynamic per chapter
              return (
                <Card
                  key={chapter.id || index}
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  sx={(theme) => ({
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: theme.shadows.md
                    }
                  })}
                >
                  <Card.Section sx={{ position: 'relative' }}>
                    <Image
                      src={chapterImage} // Using the dynamic one
                      height={180}
                      alt={chapter.caption || t('chapters.defaultCaptionText', { chapterNumber: index + 1 })}
                    />

                    {chapter.is_completed && (
                      <ThemeIcon
                        size={40}
                        radius="xl"
                        color="green"
                        variant="filled"
                        sx={(theme) => ({
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          border: `2px solid ${theme.white}`,
                        })}
                      >
                        <IconCheck size={20} />
                      </ThemeIcon>
                    )}

                    <Box
                      sx={(theme) => ({
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        padding: theme.spacing.xs,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                        width: '100%',
                      })}
                    >
                      <Badge
                        color={chapter.is_completed ? "green" : "blue"}
                        variant="filled"
                      >
                        {chapter.is_completed ? t('chapters.statusCompleted') : (learningPercentage > 0 && index === actualCompletedLearningChapters ? t('chapters.statusInProgress') : t('chapters.statusNotStarted'))}
                      </Badge>

                      {chapter.mc_questions && chapter.mc_questions.length > 0 && (
                        <Badge color="yellow" variant="filled" ml={6}>
                          {t('chapters.quizCount', { count: chapter.mc_questions.length })}
                        </Badge>
                      )}
                    </Box>
                  </Card.Section>

                  <Box mt="md" mb="xs" sx={{ flex: 1 }}>
                    <Text
                      weight={700}
                      size="lg"
                      lineClamp={2}
                      sx={{ minHeight: '3.2rem' }} // Ensure consistent height
                    >
                      {chapter.caption || t('chapters.defaultTitleText', { chapterNumber: index + 1 })}
                    </Text>

                    <Text
                      color="dimmed"
                      size="sm"
                      mt="md"
                      lineClamp={3}
                      sx={{ flex: 1, minHeight: '4.5rem' }} // Ensure consistent height
                    >
                      {chapter.summary || t('chapters.defaultSummaryText')}
                    </Text>
                  </Box>

                  <Button
                    variant={chapter.is_completed ? "light" : "filled"}
                    color={chapter.is_completed ? "green" : "teal"}
                    fullWidth
                    mt="md"
                    rightIcon={chapter.is_completed ? <IconCircleCheck size={16} /> : <IconChevronRight size={16} />}
                    onClick={() => navigate(`/dashboard/courses/${courseId}/chapters/${chapter.id}`)}
                    // Disable button for non-first chapters if course is still creating them.
                    // Allow first chapter to be clickable as soon as it appears.
                    disabled={course.status === "CourseStatus.CREATING" && index > (chapters.length -1) /* This logic might need refinement based on how "active" chapter is determined during creation */ }
                    sx={(theme) =>
                      chapter.is_completed
                        ? {}
                        : {
                          background: theme.colorScheme === 'dark' ?
                            `linear-gradient(45deg, ${theme.colors.teal[9]}, ${theme.colors.blue[8]})` :
                            `linear-gradient(45deg, ${theme.colors.teal[6]}, ${theme.colors.cyan[5]})`,
                        }
                    }
                  >
                    {chapter.is_completed ? t('buttons.reviewChapter') : t('buttons.startChapter')}
                  </Button>
                </Card>
              );
            })}

            {/* Placeholder cards for chapters being created */}
            {course.status === "CourseStatus.CREATING" &&
              creationProgressUI.estimatedTotal > chapters.length &&
              Array.from({ length: creationProgressUI.estimatedTotal - chapters.length }).map((_,idx) => {
                const placeholderIndex = chapters.length + idx;
                return (
                  <Card
                    key={`placeholder-${placeholderIndex}`}
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                    sx={(theme) => ({
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: theme.colorScheme === 'dark' ?
                        theme.fn.rgba(theme.colors.dark[6], 0.8) :
                        theme.fn.rgba(theme.white, 0.8),
                    })}
                  >
                    <Card.Section>
                      <Box sx={{ position: 'relative' }}>
                        <Image
                          src='url("https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png")' // Add offset to avoid same images as real chapters
                          height={180}
                          alt={t('creation.upcomingChapterAlt', { chapterNumber: placeholderIndex + 1 })}
                          sx={{ filter: 'blur(3px) grayscale(50%)' }}
                        />
                        <Overlay opacity={0.6} color="#000" />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 20,
                          }}
                        >
                          <Loader color="white" size="md" mb="md" />
                          <Text align="center" color="white" weight={600}>{t('creation.creatingChapterOverlay', { chapterNumber: placeholderIndex + 1 })}</Text>
                          <Text align="center" color="white" size="xs" opacity={0.8}>{t('creation.aiCraftingOverlay')}</Text>
                        </Box>
                      </Box>
                    </Card.Section>
                    <Box mt="md" sx={{ flex: 1 }}>
                      <Text weight={500} color="dimmed">{t('creation.placeholderChapterTitle', { chapterNumber: placeholderIndex + 1 })}</Text>
                      <Box mt="sm" mb="lg">
                         {/* Mimic text loading */}
                        <Box sx={{height: '1rem', width: '80%', backgroundColor: 'rgba(128,128,128,0.2)', borderRadius: '4px', marginBottom: '0.5rem'}} />
                        <Box sx={{height: '1rem', width: '60%', backgroundColor: 'rgba(128,128,128,0.2)', borderRadius: '4px', marginBottom: '0.5rem'}} />
                        <Box sx={{height: '1rem', width: '70%', backgroundColor: 'rgba(128,128,128,0.2)', borderRadius: '4px'}} />
                      </Box>
                    </Box>
                    <Button variant="light" color="gray" fullWidth mt="md" disabled>
                      {t('creation.placeholderButtonCreating')}
                    </Button>
                  </Card>
                );
              })}
          </SimpleGrid>
        </>
      )}
    </Container>
  );
}

export default CourseView;
