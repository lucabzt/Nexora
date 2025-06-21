import React, { useState, useEffect } from 'react';
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
} from '@tabler/icons-react';
import courseService from '../api/courseService';
import { useTranslation } from 'react-i18next';
import PlaceGolderImage from '../assets/place_holder_image.png'
import SearchBar from '../components/SearchBar';

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
  
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { t } = useTranslation('dashboard');

  // Mock user stats - in real app, this would come from API
  const userStats = {
    coursesCompleted: courses.filter(course => course.status === 'CourseStatus.COMPLETED').length,
    currentStreak: 7,
    totalHoursLearned: 24,
  };

  // Show limited courses unless "View All" is clicked
  const displayedCourses = viewAllCourses ? courses : courses.slice(0, 6);

  // Handlers for course actions
  const handleDelete = (courseId) => {
    setCourseToDeleteId(courseId);
    setDeleteModalOpen(true);
  };

  const handleRename = (course) => {
    setCourseToRename(course);
    setNewTitle(course.title || '');
    setNewDescription(course.description || '');
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
      const updatedCourse = await courseService.updateCourse(courseToRename.course_id, newTitle, newDescription);

      setCourses(prevCourses =>
        prevCourses.map(course =>
          course.course_id === courseToRename.course_id ? updatedCourse : course
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
        setError(t('errors.loadCourses'));
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Helper function to get status badge color and icon
  const getStatusInfo = (status) => {
    const label = t(`status.${status}`, { defaultValue: status });

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

  // Function to calculate progress for a course (placeholder logic)
  const calculateProgress = (course) => {
    console.log(course.status, " sollte so was wie CourseStatus.FAILED sein");
    // This is placeholder logic - in a real app, this would come from actual user progress data
    if (course.status === 'CourseStatus.COMPLETED') return 100;
    if (course.status === 'CourseStatus.CREATING') return 0;
    
    // For in-progress courses, generate a random progress between 10-90%
    return Math.floor((String(course.course_id)?.charCodeAt(0) || 0) % 80) + 10;
  };

  return (
    <Container size="lg" py="xl">
      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCourseToDeleteId(null); // Reset on close as well
        }}
        title={t('deleteModal.title')}
        centered
      >
        <Text>{t('deleteModal.message', { courseName: courses.find(c => c.course_id === courseToDeleteId)?.title || '' })}</Text>
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
            placeholder={t('renameModal.descriptionPlaceholder')}
            value={newDescription}
            onChange={(event) => setNewDescription(event.currentTarget.value)}
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

      {/* Header with motivational message */}
      <Box mb="xl">
        <Group position="apart" mb="md">
          <Box>
            <Title order={1} mb={5}>{t('myLearningJourney')}</Title>
            <Text color="dimmed" size="lg">{t('welcomeMessage')}</Text>
          </Box>
          <Button 
            size="md"
            color="teal" 
            onClick={() => navigate('/dashboard/create-course')}
            leftIcon={<IconBrain size={20} />}
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

      {/* Loading State */}
      {loading && (
        <Group position="center" py="xl">
          <Loader size="lg" variant="dots" />
          <Text size="lg" color="dimmed">{t('loadingCourses')}</Text>
        </Group>
      )}

      {/* User Statistics */}
      {!loading && !error && courses.length > 0 && (
        <SimpleGrid cols={3} spacing="lg" mb="xl" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
          <Paper withBorder p="md" radius="md" shadow="sm">
            <Group position="apart">
              <div>
                <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
                  {t('stats.currentStreak')}
                </Text>
                <Text weight={700} size="xl">{userStats.currentStreak} {t('stats.daysUnit')}</Text>
              </div>
              <ThemeIcon color="orange" size={50} radius="md" variant="light">
                <IconFlame size={30} />
              </ThemeIcon>
            </Group>
            <Text size="xs" color="dimmed" mt="md">
              {t('stats.currentStreakDescription')}
            </Text>
          </Paper>

          <Paper withBorder p="md" radius="md" shadow="sm">
            <Group position="apart">
              <div>
                <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
                  {t('stats.coursesCompleted')}
                </Text>
                <Text weight={700} size="xl">{userStats.coursesCompleted}</Text>
              </div>
              <ThemeIcon color="teal" size={50} radius="md" variant="light">
                <IconCalendarStats size={30} />
              </ThemeIcon>
            </Group>
            <Text size="xs" color="dimmed" mt="md">
              {t('stats.coursesCompletedDescription')}
            </Text>
          </Paper>

          <Paper withBorder p="md" radius="md" shadow="sm">
            <Group position="apart">
              <div>
                <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
                  {t('stats.totalHoursLearned')}
                </Text>
                <Text weight={700} size="xl">{userStats.totalHoursLearned} {t('stats.hoursUnit')}</Text>
              </div>
              <ThemeIcon color="blue" size={50} radius="md" variant="light">
                <IconCertificate size={30} />
              </ThemeIcon>
            </Group>
            <Text size="xs" color="dimmed" mt="md">
              {t('stats.totalHoursLearnedDescription')}
            </Text>
          </Paper>
        </SimpleGrid>
      )}

      {/* Empty state */}
      {!loading && !error && courses.length === 0 && (
        <Paper radius="md" p="xl" withBorder mb="xl" bg={theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0]}>
          <Stack align="center" spacing="md" py="xl">
            <ThemeIcon size={100} radius={100} color="teal" variant="light">
              <IconBook size={60} />
            </ThemeIcon>
            <Title order={2} align="center">{t('emptyState.title')}</Title>
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
        <>
          <Group position="apart" mb="md" align="center">
            <Title order={2}>{t('myCourses')}</Title>
            
            {/* Search Bar - positioned next to My Courses title */}
            <Box sx={{ 
              flexGrow: 1, 
              maxWidth: 400, 
              marginLeft: theme.spacing.xl,
              marginRight: theme.spacing.md,
              '@media (max-width: 768px)': {
                display: 'none',
              },
            }}>
              <SearchBar />
            </Box>
            
            <Button 
              variant="subtle" 
              color="blue" 
              rightIcon={<IconArrowUpRight size={16} />}
              onClick={() => setViewAllCourses(!viewAllCourses)}
            >
              {viewAllCourses ? t('viewLessButton') : t('viewAllButton')}
            </Button>
          </Group>

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
    </Container>
  );
}

export default Dashboard;