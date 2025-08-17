import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery, useViewportSize } from '@mantine/hooks';
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
  Paper,
  SimpleGrid,
  Badge,
  ActionIcon,
  Loader,
  Alert,
  Modal,
  TextInput,
  Textarea,
  Box,
  rem,
  useMantineTheme,
  Tooltip,
  Switch,
  createStyles,
} from '@mantine/core';
import {
  IconBrain,
  IconStar,
  IconClock,
  IconChevronRight,
  IconBook,
  IconStars,
  IconHeartHandshake,
  IconCalendarStats,
  IconCertificate,
  IconFlame,
  IconCheck,
  IconLoader,
  IconAlertCircle,
  IconTrash,
  IconPencil,
  IconArrowUpRight,
  IconWorld,
  IconX,
  IconSearch,
  IconPlus,
} from '@tabler/icons-react';
import courseService from '../api/courseService';
import { useTranslation } from 'react-i18next';
import PlaceGolderImage from '../assets/place_holder_image.png';
import DashboardStats from '../components/DashboardStats';
import EnhancedSearch from '../components/EnhancedSearch';

const useStyles = createStyles((theme) => ({
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
  searchContainer: {
    maxWidth: '600px',
    margin: '0 auto',
    marginBottom: theme.spacing.xl,
  },
  statsContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[3]}`,
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
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { t } = useTranslation('dashboard');
  const { height } = useViewportSize();

  // Mock user stats - in a real app, this would come from an API
  const userStats = useMemo(() => ({
    loginStreak: 7,
    totalCourses: courses.length,
    totalLearnTime: calculateTotalLearnTime(courses),
  }), [courses]);

  // Show limited courses unless "View All" is clicked
  const displayedCourses = viewAllCourses ? courses : courses.slice(0, 3);

  // Calculate total learn time from courses
  function calculateTotalLearnTime(courses) {
    // This is a simplified calculation - adjust based on your actual data structure
    return courses.reduce((total, course) => {
      return total + (course.estimated_hours || 0);
    }, 0);
  }

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
      // Optional: Show a success notification
    } catch (err) {
      setError(t('errors.deleteCourse', { message: err.message || '' }));
      console.error('Error deleting course:', err);
      // Optional: Show an error notification
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
      const updatedCourse = await courseService.updateCourse(courseToRename.course_id, newTitle, newDescription);

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
    const label = t(`status.${status.replace(/^.*\./, '').toLowerCase()}`, { defaultValue: status });

    switch (status) {
      case 'CourseStatus.CREATING':
        return { label, color: 'yellow', Icon: IconLoader };
      case 'CourseStatus.FINISHED':
        return { label, color: 'green', Icon: IconCheck };
      case 'CourseStatus.COMPLETED':
        return { label, color: 'green', Icon: IconCheck };
      case 'CourseStatus.FAILED':
        return { label, color: 'red', Icon: IconAlertCircle };
      default:
        return { label, color: 'gray', Icon: IconBook };
    }
  };

  // Function to calculate progress for a course
  const calculateProgress = (course) => {
    if (course.status === 'CourseStatus.COMPLETED') return 100;
    if (course.status === 'CourseStatus.CREATING') return 0;
    
    return (course && course.chapter_count && course.chapter_count > 0)
      ? Math.round((100 * (course.completed_chapter_count || 0) / course.chapter_count))
      : 0;
  };

  // Format date to relative time (e.g., "2 days ago")
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
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
        <Text>{t('deleteModal.message', { title: courses.find(c => c.course_id === courseToDeleteId)?.title || '' })}</Text>
        <Group position="right" mt="md">
          <Button 
            variant="default" 
            onClick={() => {
              setDeleteModalOpen(false);
              setCourseToDeleteId(null);
            }}
          >
            {t('deleteModal.cancelButton')}
          </Button>
          <Button 
            color="red" 
            onClick={confirmDeleteHandler}
            leftIcon={<IconTrash size={rem(16)} />}
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

      {/* Header with search and create button */}
      <Box mb="xl">
        <Group position="apart" align="flex-start" mb="md">
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
              background: theme.colorScheme === 'dark' ?
                `linear-gradient(45deg, ${theme.colors.teal[9]}, ${theme.colors.cyan[7]})` : 
                `linear-gradient(45deg, ${theme.colors.teal[6]}, ${theme.colors.cyan[4]})`,
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
              },
            })}
          >
            {t('createNewCourse')}
          </Button>
        </Group>

        {/* Enhanced Search */}
        <Box className={classes.searchContainer}>
          <EnhancedSearch 
            courses={courses} 
            onSearchResultClick={handleSearchResultClick} 
          />
        </Box>

        {/* Statistics Section */}
        <Box className={classes.statsContainer}>
          <DashboardStats stats={userStats} theme={theme} />
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

      {loading ? (
        <Group position="center" py="xl">
          <Loader size="lg" variant="dots" />
          <Text size="lg" color="dimmed">{t('loadingCourses')}</Text>
        </Group>
      ) : (
        <Stack spacing="md">
          <Title order={2} className={classes.sectionTitle}>
            {t('recentCourses', { defaultValue: 'Your Recent Courses' })}
          </Title>
          
          {!viewAllCourses && courses.length > 3 && (
            <Text color="dimmed" mb="md" size="sm">
              {t('showingLatestCourses', { defaultValue: 'Showing your 3 most recent courses' })}
            </Text>
          )}
          
          {!loading && !error && courses.length > 0 ? (
            <Grid gutter="lg">
              {displayedCourses.map((course) => {
                const progress = calculateProgress(course);
                const { label: statusLabel, color: statusColor, Icon: StatusIcon } = getStatusInfo(course.status);
                
                return (
                  <Grid.Col key={course.course_id} sm={12} md={6} lg={4}>
                    <Card withBorder radius="md" className={classes.courseCard}>
                      <Card.Section>
                        <Image
                          src={course.image_url || PlaceGolderImage}
                          height={160}
                          alt={course.title}
                          className={classes.courseImage}
                        />
                      </Card.Section>

                      <Group position="apart" mt="md">
                        <Text weight={600} size="lg">
                          {course.title || t('untitledCourse')}
                        </Text>
                        <Badge 
                          color={statusColor} 
                          variant="light"
                          leftSection={<StatusIcon size={14} style={{ marginRight: 4 }} />}
                        >
                          {statusLabel}
                        </Badge>
                      </Group>

                      <Text size="sm" color="dimmed" mt={4} lineClamp={2}>
                        {course.description || t('noDescription')}
                      </Text>

                      <Box mt="md">
                        <Group position="apart" mb={4}>
                          <Text size="sm" color="dimmed">
                            {t('progress')}
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
                      </Box>

                      <Group mt="md" position="apart">
                        <Button 
                          variant="light" 
                          color="blue" 
                          onClick={() => navigate(`/dashboard/courses/${course.course_id}`)}
                          fullWidth
                          leftIcon={<IconBook size={16} />}
                        >
                          {t('openCourse')}
                        </Button>
                        
                        <ActionIcon 
                          variant="subtle" 
                          color="gray"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRename(course);
                          }}
                        >
                          <IconPencil size={18} />
                        </ActionIcon>
                        
                        <ActionIcon 
                          variant="subtle" 
                          color="red"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(course.course_id);
                          }}
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Group>
                    </Card>
                  </Grid.Col>
                );
              })}
            </Grid>
          ) : null}
          
          {!loading && courses.length > 3 && (
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
          
          {!loading && !error && courses.length === 0 && (
            <Paper 
              radius="md" 
              p="xl" 
              withBorder 
              mt="xl"
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
                color="blue"
              >
                {t('createFirstCourse')}
              </Button>
            </Paper>
          )}
        </Stack>
      )}

      {/* Empty state - removed duplicate */}
            <Text align="center" size="lg" maw={500} mx="auto" color="dimmed">
              {t('emptyState.message')}
            </Text>
            <Button 
              size="lg"
              onClick={() => navigate('/dashboard/create-course')} 
              color="teal"
              leftIcon={<IconStars size={20} />}
              mt="md"
              sx={(theme) => ({
                background: theme.colorScheme === 'dark' ? 
                  `linear-gradient(45deg, ${theme.colors.teal[9]}, ${theme.colors.cyan[7]})` : 
                  `linear-gradient(45deg, ${theme.colors.teal[6]}, ${theme.colors.cyan[4]})`,
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                },
              })}
            >
              {t('emptyState.button')}
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Featured Course (if available) */}
      {!loading && !error && courses.length > 0 && (
        <>
          <Title order={2} mb="md">{t('continueLearningTitle')}</Title>
          <Paper 
            radius="md" 
            p={0}
            withBorder 
            mb="xl" 
            sx={{
              overflow: 'hidden',
              position: 'relative',
            }}
          >
           <Grid gutter={0}>
              <Grid.Col sm={5} order={isMobile ? 1 : 2} sx={{ position: 'relative' }}>
                <Image 
                  src={ courses[0]?.image_url ? courses[0]?.image_url : PlaceGolderImage}
                  height={isMobile ? 200 : 300}
                  sx={{ 
                    objectFit: 'cover',
                    height: '100%',
                  }}
                  alt={courses[0]?.title}
                />
              </Grid.Col>
              <Grid.Col sm={7} order={isMobile ? 2 : 1}>
                <Box p="xl">
                  <Badge 
                    variant="filled" 
                    color="teal" 
                    mb="md"
                    leftSection={<IconHeartHandshake size={12} />}
                  >
                    {t('recommendedForYou')}
                  </Badge>
                  <Title order={2} mb="xs">{courses[0]?.title || t('featuredCourse.defaultTitle')}</Title>
                  <Text lineClamp={2} mb="lg" color="dimmed" sx={{ 
                        flex: 1, 
                        overflow: 'auto',  // Make it scrollable
                        paddingRight: '4px',  // Small padding for scrollbar space
                        '&::-webkit-scrollbar': {
                          width: '4px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: 'transparent',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: '#ccc',
                          borderRadius: '2px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                          background: '#999',
                        },
                      }}>
                    {courses[0]?.description || t('featuredCourse.defaultDescription')}
                  </Text>
                  
                  <Group position="apart" mb="md">
                    <Text size="sm">{t('yourProgress')}</Text>
                    <Text size="sm" weight={500}>
                      {calculateProgress(courses[0])}%
                    </Text>
                  </Group>
                  
                  <Progress 
                    value={calculateProgress(courses[0])} 
                    size="lg" 
                    radius="xl" 
                    color="teal" 
                    mb="lg"
                    sx={{ 
                      height: 12,
                      '& .mantine-Progress-bar': { 
                        background: 'linear-gradient(90deg, #36D1DC 0%, #5B86E5 100%)' 
                      }
                    }} 
                  />
                  
                  <Button
                    fullWidth
                    size="md"
                    variant="gradient"
                    gradient={{ from: 'teal', to: 'cyan' }}
                    rightIcon={<IconChevronRight size={16} />}
                    onClick={() => navigate(`/dashboard/courses/${courses[0]?.course_id}`)}
                    mt="lg"
                  >
                    {t('continueLearningButton')}
                  </Button>
                </Box>
              </Grid.Col>
            </Grid>
          </Paper>
        </>
      )}

      {/* Course Grid */}
      {!loading && !error && courses.length > 0 && (
        <Grid gutter="lg">
          {displayedCourses.map((course) => {
            const progress = calculateProgress(course);
            const { label: statusLabel, color: statusColor, Icon: StatusIcon } = getStatusInfo(course.status);
            
            return (
              <Grid.Col key={course.course_id} sm={12} md={6} lg={4}>
                <Card 
                  withBorder 
                  radius="md" 
                  className={classes.courseCard}
                >
                  <Card.Section>
                    <Image
                      src={course.image_url || PlaceGolderImage}
                      height={160}
                      alt={course.title}
                      className={classes.courseImage}
                    />
                  </Card.Section>

          <Grid>
            {displayedCourses.map((course) => {
              const statusInfo = getStatusInfo(course.status);
              const StatusIcon = statusInfo.Icon;
              const progress = calculateProgress(course);

              return (
                <Grid.Col key={course.course_id} xs={12} sm={6} lg={4}>
                  <Card 
                    shadow="sm" 
                    padding="lg" 
                    radius="md" 
                    withBorder
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.shadows.lg,
                      },
                    }}
                    onClick={() => {
                        navigate(`/dashboard/courses/${course.course_id}`);
                    }}
                  >
                    <Card.Section>
                      <Image
                        src={course.image_url || PlaceGolderImage}
                        height={160}
                        alt={course.title}
                        sx={{ objectFit: 'cover' }}
                      />
                      {course.status !== 'CourseStatus.CREATING' && (
                        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                          <Tooltip label={t('courseProgressTooltip', { progress })}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: `conic-gradient(${theme.colors.teal[6]} ${progress * 3.6}deg, ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]} 0deg)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: theme.fontSizes.xs,
                                fontWeight: 600,
                                color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
                                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : 'white',
                              }}
                            >
                              {progress}%
                            </Box>
                          </Tooltip>
                        </Box>
                      )}
                    </Card.Section>

                    <Card.Section withBorder inheritPadding py="xs" mt="md">
                      <Group position="apart">
                        <Badge 
                          color={statusInfo.color} 
                          variant="filled" 
                          leftSection={<StatusIcon size={12} />}
                        >
                          {statusInfo.label}
                        </Badge>
                        {course.is_public && (
                          <Tooltip label={t('publicCourseTooltip', { defaultValue: 'This course is public' })}>
                            <Badge 
                              color="grape" 
                              variant="light" 
                              leftSection={<IconWorld size={12} />}
                            >
                              {t('publicBadge', { defaultValue: 'Public' })}
                            </Badge>
                          </Tooltip>
                        )}
                        <Group spacing="xs" position="right">
                          <ActionIcon 
                            color="red" 
                            variant="subtle"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(course.course_id);
                            }}
                            title={t('deleteCourseTooltip')}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                          <ActionIcon 
                            color="blue" 
                            variant="subtle"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRename(course);
                            }}
                            title={t('renameCourseTooltip')}
                          >
                            <IconPencil size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Card.Section>

                    <Title order={3} mt="md" mb="xs">
                      {course.title}
                    </Title>

                    <Text size="sm" color="dimmed" lineClamp={2} mb="md" sx={{ 
                        flex: 1, 
                        height: '5.5rem',  // Fixed height instead of minHeight
                        overflow: 'auto',  // Make it scrollable
                        paddingRight: '4px',  // Small padding for scrollbar space
                        '&::-webkit-scrollbar': {
                          width: '4px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: 'transparent',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: '#ccc',
                          borderRadius: '2px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                          background: '#999',
                        },
                      }}>
                      {course.description}
                    </Text>

                    {/* Time information with nicer formatting */}
                    {course.total_time_hours && (
                      <Group spacing="xs" mb="md">
                        <IconClock size={14} color={theme.colors.gray[6]} />
                        <Text size="xs" color="dimmed">
                          {t('estimatedTime', { hours: course.total_time_hours })}
                        </Text>
                      </Group>
                    )}

                    <Button
                      variant={course.status === 'CourseStatus.CREATING' ? 'light' : 'filled'}
                      color={course.status === 'CourseStatus.CREATING' ? 'yellow' : 'teal'}
                      fullWidth
                      mt="auto"
                      leftIcon={course.status === 'CourseStatus.CREATING' ? <IconLoader size={16} /> : <IconBook size={16} />}
                    >
                      {course.status === 'CourseStatus.CREATING' 
                        ? t('viewCreationProgressButton')
                        : t('continueLearningButton')
                      }
                    </Button>
                  </Card>
                </Grid.Col>
              );
            })}
          </Grid>
        </>
      )}
        </Stack>
      )}
    </Container>
  );
}

export default Dashboard;