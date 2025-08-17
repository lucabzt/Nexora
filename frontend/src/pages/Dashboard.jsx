import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Image,
  Button,
  Group,
  Stack,
  ThemeIcon,
  Progress,
  Badge,
  ActionIcon,
  Loader,
  Alert,
  Modal,
  TextInput,
  Textarea,
  Box,
  useMantineTheme,
  Switch,
  createStyles,
} from '@mantine/core';
import {
  IconBook,
  IconTrash,
  IconPencil,
  IconWorld,
  IconX,
  IconPlus,
  IconAlertCircle,
  IconLoader,
  IconCheck,
  IconChevronRight,
} from '@tabler/icons-react';
import courseService from '../api/courseService';
import statisticsService from '../api/statisticsService';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import PlaceGolderImage from '../assets/place_holder_image.png';
import DashboardStats from '../components/DashboardStats';
import EnhancedSearch from '../components/EnhancedSearch';

const useStyles = createStyles((theme) => ({
  continueSection: {
    marginBottom: theme.spacing.xl,
    width: '100%',
    '& .mantine-Card-root': {
      overflow: 'visible',
    },
  },
  continueCard: {
    display: 'flex',
    gap: theme.spacing.lg,
    [theme.fn.smallerThan('sm')]: {
      flexDirection: 'column',
    },
  },
  continueContent: {
    flex: 1,
    minWidth: '50%',
    maxWidth: '50%',
    [theme.fn.smallerThan('sm')]: {
      minWidth: '100%',
      maxWidth: '100%',
    },
  },
  continueImageContainer: {
    position: 'relative',
    width: '50%',
    overflow: 'hidden',
    [theme.fn.smallerThan('sm')]: {
      width: '100%',
      height: '200px',
      marginTop: theme.spacing.md,
    },
  },
  continueImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 'auto',
    height: '100%',
    minWidth: '100%',
    minHeight: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    borderRadius: theme.radius.md,
  },
  courseCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: theme.shadows.md,
    },
  },
  courseImage: {
    objectFit: 'cover',
    height: '160px',
    width: '100%',
  },
  contentContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  searchContainer: {
    width: '90%',
    margin: '0 auto',
    marginBottom: theme.spacing.xl,
  },
  statsContainer: {
    marginBottom: theme.spacing.xl,
    width: '100%',
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[3]}`,
  },
  courseDescription: {
    flex: 1,
    height: '3rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    paddingRight: '4px',
  },
}));

function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewAllCourses, setViewAllCourses] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDeleteId, setCourseToDeleteId] = useState(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [courseToRename, setCourseToRename] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const [totalLearnTime, setTotalLearnTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Calculate user stats
  const userStats = useMemo(() => ({
    loginStreak: user?.login_streak || 0,
    totalCourses: courses.length,
    totalLearnTime: totalLearnTime,
  }), [courses, user?.login_streak, totalLearnTime]);

  // Show limited courses unless "View All" is clicked
  const displayedCourses = viewAllCourses ? courses : courses.slice(0, 3);

  // Calculate total learn time from courses
  function calculateTotalLearnTime(courses) {
    return courses.reduce((total, course) => total + (course.estimated_hours || 0), 0);
  }

  // Function to calculate progress for a course
  const calculateProgress = (course) => {
    if (course.status === 'CourseStatus.COMPLETED') return 100;
    if (course.status === 'CourseStatus.CREATING') return 0;
    
    return (course && course.chapter_count && course.chapter_count > 0)
      ? Math.round((100 * (course.completed_chapter_count || 0) / course.chapter_count))
      : 0;
  };


  // Handlers for course actions
  const handleDelete = (courseId) => {
    setCourseToDeleteId(courseId);
    setDeleteModalOpen(true);
  };

  const handleRename = (course) => {
    setCourseToRename(course);
    setNewTitle(course.title || '');
    setNewDescription(course.description || '');
    setIsPublic(course.is_public || false);
    setRenameModalOpen(true);
  };

  // Handles the actual deletion after confirmation
  const confirmDeleteHandler = async () => {
    if (!courseToDeleteId) return;
    try {
      await courseService.deleteCourse(courseToDeleteId);
      setCourses(prevCourses => prevCourses.filter(course => course.course_id !== courseToDeleteId));
      setError(null);
    } catch (err) {
      setError(t('errors.deleteCourse', { message: err.message || '' }));
      console.error('Error deleting course:', err);
    } finally {
      setDeleteModalOpen(false);
      setCourseToDeleteId(null);
    }
  };

  const confirmRenameHandler = async () => {
    if (!courseToRename) return;

    try {
      // First, update the public status
      await courseService.updateCoursePublicStatus(courseToRename.course_id, isPublic);

      // Then, update the title and description
      const updatedCourse = await courseService.updateCourse(
        courseToRename.course_id, 
        newTitle, 
        newDescription
      );

      // Combine updates for the UI
      const finalUpdatedCourse = { ...updatedCourse, is_public: isPublic };

      setCourses(prevCourses =>
        prevCourses.map(course =>
          course.course_id === courseToRename.course_id ? finalUpdatedCourse : course
        )
      );
      setRenameModalOpen(false);
    } catch (err) {
      setError(t('errors.renameCourse', { message: err.message || '' }));
      console.error('Error renaming course:', err);
    }
  };

  // Fetch courses on component mount
  const fetchTotalLearnTime = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const data = await statisticsService.getTotalLearnTime(user.id);
      setTotalLearnTime(data ? Math.round(data / 3600 ) : 0);
    } catch (err) {
      console.error('Error fetching total learn time:', err);
      setError('Failed to load learning statistics');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTotalLearnTime();
  }, [fetchTotalLearnTime]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const coursesData = await courseService.getUserCourses();
        setCourses(coursesData);
        setError(null);
      } catch (error) {
        setError(t('loadCoursesError'));
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [t]);

  // Handle search result click
  const handleSearchResultClick = (result) => {
    if (result.type === 'course') {
      navigate(`/dashboard/courses/${result.id}`);
    } else if (result.type === 'chapter' && result.courseId) {
      navigate(`/dashboard/courses/${result.courseId}?chapter=${result.id}`);
    }
  };

  // Helper function to get status badge color and icon
  const getStatusInfo = (status) => {
    const label = t(`status.${status?.replace(/^.*\./, '').toLowerCase()}`, { defaultValue: status || 'Unknown' });

    switch (status) {
      case 'CourseStatus.CREATING':
        return { label, color: 'yellow', Icon: IconLoader };
      case 'CourseStatus.FINISHED':
      case 'CourseStatus.COMPLETED':
        return { label, color: 'green', Icon: IconCheck };
      case 'CourseStatus.FAILED':
        return { label, color: 'red', Icon: IconAlertCircle };
      default:
        return { label, color: 'gray', Icon: IconBook };
    }
  };

  // Render a single course card
  const renderCourseCard = (course) => {
    const progress = calculateProgress(course);
    const { label: statusLabel, color: statusColor, Icon: StatusIcon } = getStatusInfo(course.status);

    return (
      <Grid.Col key={course.course_id} xs={12} sm={6} lg={4}>
        <Card 
          withBorder 
          radius="md" 
          className={classes.courseCard}
          style={{ cursor: 'pointer' }}
        >
          <Card.Section>
            <Image
              src={course.image_url || PlaceGolderImage}
              height={160}
              alt={course.title}
              className={classes.courseImage}
              onClick={() => navigate(`/dashboard/courses/${course.course_id}`)}
            />
          </Card.Section>

          <Box p="md" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Group position="apart" mb="xs" noWrap>
              <Badge 
                color={statusColor} 
                variant="light"
                size="md"
                leftSection={<StatusIcon size={14} style={{ marginRight: 4 }} />}
              >
                {statusLabel}
              </Badge>
              
              <Group spacing="xs">
                <ActionIcon 
                  variant="subtle" 
                  color="gray"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename(course);
                  }}
                >
                  <IconPencil size={16} />
                </ActionIcon>
                <ActionIcon 
                  variant="subtle" 
                  color="red"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(course.course_id);
                  }}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Group>

            <Text 
              weight={600} 
              size="lg" 
              lineClamp={2}
              style={{ 
                cursor: 'pointer',
                wordBreak: 'break-word',
                minHeight: '3em',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              onClick={() => navigate(`/dashboard/courses/${course.course_id}`)}
            >
              {course.title || t('untitledCourse')}
            </Text>

            <Text 
              size="sm" 
              color="dimmed" 
              className={classes.courseDescription}
              onClick={() => navigate(`/dashboard/courses/${course.course_id}`)}
              style={{ cursor: 'pointer' }}
            >
              {course.description || t('noDescription')}
            </Text>

            <Box mt="auto" pt="md">
              <Group position="apart" mb={4}>
                <Text size="sm" color="dimmed">
                  {t('yourProgress')}
                </Text>
                <Text size="sm" weight={600}>
                  {progress}%
                </Text>
              </Group>
              <Progress 
                value={progress} 
                size="sm" 
                radius="xl" 
                color={progress === 100 ? 'teal' : 'blue'}
              />
              <Button 
                fullWidth
                variant="light" 
color="teal" 
                mt="md"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/dashboard/courses/${course.course_id}`);
                }}
                leftIcon={<IconBook size={16} />}
              >
                {t('openCourse')}
              </Button>
            </Box>
          </Box>
        </Card>
      </Grid.Col>
    );
  };

  return (
    <Container size="lg" py="xl">
      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCourseToDeleteId(null);
        }}
        title={t('deleteModal.title')}
        centered
      >
        <Text>{t('deleteModal.message', { 
          title: courses.find(c => c.course_id === courseToDeleteId)?.title || '' 
        })}</Text>
        <Group position="right" mt="md">
          <Button 
            variant="default" 
            onClick={() => setDeleteModalOpen(false)}
          >
            {t('deleteModal.cancelButton')}
          </Button>
          <Button 
            color="red" 
            onClick={confirmDeleteHandler}
            leftIcon={<IconTrash size={16} />}
          >
            {t('deleteModal.confirmButton')}
          </Button>
        </Group>
      </Modal>

      {/* Rename Modal */}
      <Modal
        opened={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        title={t('renameModal.title')}
        centered
      >
        <Stack spacing="md">
          <TextInput
            label={t('renameModal.titleLabel')}
            placeholder={t('renameModal.titlePlaceholder')}
            value={newTitle}
            onChange={(event) => setNewTitle(event.currentTarget.value)}
          />
          <Textarea
            label={t('renameModal.descriptionLabel')}
            value={newDescription}
            onChange={(event) => setNewDescription(event.currentTarget.value)}
            autosize
            minRows={3}
            maxRows={6}
            mt="md"
          />

          <Switch
            mt="lg"
            checked={isPublic}
            onChange={(event) => setIsPublic(event.currentTarget.checked)}
            label={t('renameModal.publicLabel', { defaultValue: 'Make course public' })}
            description={t('renameModal.publicDescription', { defaultValue: 'Public courses can be viewed by anyone.' })}
            thumbIcon={
              isPublic ? (
                <IconWorld size={12} color={theme.colors.teal[6]} stroke={3} />
              ) : (
                <IconX size={12} color={theme.colors.red[6]} stroke={3} />
              )
            }
          />

          <Group position="right" mt="md">
            <Button variant="default" onClick={() => setRenameModalOpen(false)}>
              {t('renameModal.cancelButton')}
            </Button>
            <Button color="teal" onClick={confirmRenameHandler}>
              {t('renameModal.saveButton')}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Main content container */}
      <Box className={classes.contentContainer} mb="xl">
        <Group position="apart" align="flex-start" mb="xl">
          <Box>
            <Title order={1} mb={5}>{t('myLearningJourney')}</Title>
            <Text color="dimmed" size="lg">{t('welcomeMessage')}</Text>
          </Box>
          <Button 
            size="md"
            color="teal" 
            onClick={() => navigate('/dashboard/create-course')}
            leftIcon={<IconPlus size={20} />}
            sx={(theme) => ({
              background: theme.colorScheme === 'dark'
                ? `linear-gradient(45deg, ${theme.colors.teal[9]}, ${theme.colors.cyan[7]})`
                : `linear-gradient(45deg, ${theme.colors.teal[6]}, ${theme.colors.cyan[4]})`,
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
              },
            })}
          >
            {t('createNewCourse')}
          </Button>
        </Group>

        {/* Statistics Section */}
        <Box className={classes.statsContainer} mb="xl">
          <DashboardStats stats={userStats} theme={theme} />
        </Box>

        {/* Continue Where You Left Off Section */}
        {courses.length > 0 && (
          <Box mb="xl" className={classes.continueSection}>
            <Title order={3} mb="md">
              {t('continueLearningTitle')}
            </Title>
            <Card withBorder radius="md" p="lg">
              <div className={classes.continueCard}>
                <div className={classes.continueContent}>
                  <Text weight={600} size="lg" lineClamp={1}>
                    {courses[0].title}
                  </Text>
                  <Text size="sm" color="dimmed" mt={4}>
                    {t('lastAccessed')}: {new Date(courses[0].last_accessed || courses[0].created_at).toLocaleDateString()}
                  </Text>
                  
                  {courses[0].description && (
                    <Text size="sm" color="dimmed" mt="sm" lineClamp={2} className={classes.courseDescription}>
                      {courses[0].description}
                    </Text>
                  )}
                  
                  <Box mt="md">
                    <Group position="apart" mb={4}>
                      <Text size="sm" weight={500}>{t('yourProgress')}</Text>
                      <Text size="sm" weight={500}>
                        {calculateProgress(courses[0])}%
                      </Text>
                    </Group>
                    <Progress
                      value={calculateProgress(courses[0])}
                      size="lg"
                      radius="xl"
                      styles={{
                        root: { width: '100%' },
                        bar: { backgroundImage: 'linear-gradient(45deg, #20c997, #12b886)' },
                      }}
                    />
                    <Group position="apart" mt="md">
                      <Text size="sm" color="dimmed">
                        {courses[0].completed_chapter_count || 0}/{courses[0].chapter_count || 0} {t('lessons', { count: courses[0].chapter_count || 0 })}
                      </Text>
                      <Button
                        variant="light"
                        color="teal"
                        rightIcon={<IconChevronRight size={16} />}
                        onClick={() => navigate(`/course/${courses[0].course_id}`)}
                      >
                        {t('continueButton')}
                      </Button>
                    </Group>
                  </Box>
                </div>
                
                <div className={classes.continueImageContainer}>
                  {courses[0].image_url && (
                    <img
                      src={courses[0].image_url}
                      alt=""
                      className={classes.continueImage}
                    />
                  )}
                </div>
              </div>
            </Card>
          </Box>
        )}

        {/* Enhanced Search - Full width */}
        <Box mb="xl">
          <Title order={3} mb="xs">
            {t('searchCourses')}
          </Title>
          <Text color="dimmed" size="sm" mb="md">
            {t('searchSubtitle')}
          </Text>
          <Box className={classes.searchContainer}>
            <EnhancedSearch 
              courses={courses} 
              onSearchResultClick={handleSearchResultClick} 
            />
          </Box>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={t('errorAlertTitle')}
          color="red"
          mb="xl"
          variant="outline"
        >
          {error}
        </Alert>
      )}

      {/* Main Content */}
      {loading ? (
        <Group position="center" py="xl">
          <Loader size="lg" variant="dots" />
          <Text size="lg" color="dimmed">{t('loadingCourses')}</Text>
        </Group>
      ) : (
        <Stack spacing="md">
          <Title order={2} className={classes.sectionTitle}>
            {t('recentCoursesTitle')}
          </Title>
          
          {!viewAllCourses && courses.length > 3 && (
            <Text color="dimmed" mb="md" size="sm">
              {t('recentCoursesSubtitle')}
            </Text>
          )}
          
          {courses.length > 0 ? (
            <>
              <Grid gutter="lg">
                {displayedCourses.map(renderCourseCard)}
              </Grid>
              
              {courses.length > 3 && (
                <Group position="center" mt="xl">
                  <Button 
                    variant="outline" 
                    onClick={() => setViewAllCourses(!viewAllCourses)}
                    rightIcon={viewAllCourses ? <IconChevronRight size={16} /> : null}
                    leftIcon={!viewAllCourses ? <IconChevronRight size={16} style={{ transform: 'rotate(-90deg)' }} /> : null}
                  >
                    {viewAllCourses ? t('showLess') : t('viewAllCourses')}
                  </Button>
                </Group>
              )}
            </>
          ) : (
            <Paper 
              radius="md" 
              p="xl" 
              withBorder 
              sx={{
                background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
                textAlign: 'center',
              }}
            >
              <Box mb="md">
                <IconBook size={48} color={theme.colors.gray[5]} />
              </Box>
              <Title order={3} mb="sm">
                {t('noCoursesTitle')}
              </Title>
              <Text color="dimmed" mb="xl">
                {t('noCoursesDescription')}
              </Text>
              <Button 
                leftIcon={<IconPlus size={16} />}
                onClick={() => navigate('/dashboard/create-course')}
color="teal"
              >
                {t('createFirstCourse')}
              </Button>
            </Paper>
          )}
        </Stack>
      )}
    </Container>
  );
}

export default Dashboard;
