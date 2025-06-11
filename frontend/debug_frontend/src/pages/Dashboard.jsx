import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Title, 
  Grid, 
  Card, 
  Text, 
  Button, 
  Group,
  Badge,
  Loader,
  Alert,
  Box,
  Progress,
  ActionIcon,
  Image,
  Paper,
  RingProgress,
  ThemeIcon,
  SimpleGrid,
  Stack,
  Divider,
  useMantineTheme,
  Overlay,
  rem,
  Tooltip,
  Center,
  Modal,
  TextInput,
  Textarea 
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { 
  IconAlertCircle, 
  IconClock, 
  IconCheck, 
  IconBook, 
  IconTrash,
  IconTrophy,
  IconFlame,
  IconStars,
  IconArrowUpRight,
  IconCertificate,
  IconHeartHandshake,
  IconBrain,
  IconChevronRight,
  IconPlaceholder,
  IconPencil
} from '@tabler/icons-react';
import { courseService } from '../api/courseService';


import PlaceGolderImage from '../assets/place_holder_image.png'

function Dashboard() {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewAllCourses, setViewAllCourses] = useState(false);
  const [userStats, setUserStats] = useState({
    coursesCompleted: 2,
    currentStreak: 5,
    totalHoursLearned: 24
  });

  // State for delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDeleteId, setCourseToDeleteId] = useState(null);

  // State for rename modal
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [courseToRename, setCourseToRename] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Opens the delete confirmation modal
  const handleDelete = (courseId) => {
    setCourseToDeleteId(courseId);
    setDeleteModalOpen(true);
  };

  // Opens the rename modal
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
      setError(t('deleteCourseError', { message: err.message || '' }));
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
      setError(t('renameCourseError', { message: err.message || '' }));
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
  }, []);

  // Helper function to get status badge color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'creating':
        return { color: 'blue', icon: IconClock, label: t('status.creating') };
      case 'finished':
        return { color: 'green', icon: IconCheck, label: t('status.finished') };
      case 'updating':
        return { color: 'orange', icon: IconClock, label: t('status.updating') };
      default:
        return { color: 'gray', icon: IconBook, label: t('status.learning') };
    }
  };

  // Function to calculate progress for a course (placeholder logic)
  const calculateProgress = (course) => {
    // This is placeholder logic - in a real app, this would come from actual user progress data
    if (course.status === 'finished') return 100;
    if (course.status === 'creating') return 0;
    
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
        title={t('deleteCourseModal.title')}
        centered
      >
        <Text>{t('deleteCourseModal.confirmationText')}</Text>
        <Group position="right" mt="md">
          <Button 
            variant="default" 
            onClick={() => {
              setDeleteModalOpen(false);
              setCourseToDeleteId(null);
            }}
          >
            {t('deleteCourseModal.cancelButton')}
          </Button>
          <Button 
            color="red" 
            onClick={confirmDeleteHandler}
            leftIcon={<IconTrash size={rem(16)} />}
          >
            {t('deleteCourseModal.deleteButton')}
          </Button>
        </Group>
      </Modal>

      {/* Rename Modal */}
      <Modal
        opened={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        title={t('renameCourseModal.title')}
        centered
      >
        <Stack spacing="md">
          <TextInput
            label={t('renameCourseModal.newTitleLabel')}
            placeholder={t('renameCourseModal.newTitlePlaceholder')}
            value={newTitle}
            onChange={(event) => setNewTitle(event.currentTarget.value)}
          />
          <Textarea
            label={t('renameCourseModal.newDescriptionLabel')}
            placeholder={t('renameCourseModal.newDescriptionPlaceholder')}
            value={newDescription}
            onChange={(event) => setNewDescription(event.currentTarget.value)}
          />
          <Group position="right" mt="md">
            <Button variant="default" onClick={() => setRenameModalOpen(false)}>
              {t('renameCourseModal.cancelButton')}
            </Button>
            <Button color="teal" onClick={confirmRenameHandler}>
              {t('renameCourseModal.saveButton')}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Header with motivational message */}
      <Box mb="xl">
        <Group position="apart" mb="md">
          <Box>
            <Title order={1} mb={5}>{t('myLearningJourney')}</Title>
            <Text color="dimmed" size="lg">{t('motivationalMessage')}</Text>
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
            {t('createNewCourseButton')}
          </Button>
        </Group>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <Loader size="lg" />
        </Box>
      )}

      {error && !loading && (
        <Alert 
          icon={<IconAlertCircle size={16} />}
          title={t('errorAlertTitle')} 
          color="red" 
          mb="lg"
        >
          {error}
        </Alert>
      )}

      {/* Learning Stats & Motivation Section */}
      {!loading && !error && courses.length > 0 && (
        <SimpleGrid cols={3} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }]} mb="xl">
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
              <ThemeIcon color="green" size={50} radius="md" variant="light">
                <IconTrophy size={30} />
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
            <Title order={2} align="center">{t('beginYourLearningJourney')}</Title>
            <Text align="center" size="lg" maw={500} mx="auto" color="dimmed">
              {t('noCoursesFound')}
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
              {t('createMyFirstCourse')}
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Featured Course (if available) */}
      {!loading && !error && courses.length > 0 && (
        <>
          <Title order={2} mb="md">{t('continueLearning')}</Title>
          <Paper 
            radius="md" 
            p={0}
            withBorder 
            mb="xl" 
            sx={(theme) => ({
              overflow: 'hidden',
              position: 'relative',
            })}
          >          <Grid gutter={0}>
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
                  <Text lineClamp={2} mb="lg" color="dimmed">
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
      )}      {/* Course Grid */}
      {!loading && !error && courses.length > 0 && (
        <>
          <Group position="apart" mb="md">
            <Title order={2} mb="lg">{t('yourCoursesTitle')}</Title>
            <Button 
              variant="subtle" 
              color="blue" 
              rightIcon={<IconArrowUpRight size={16} />}
              onClick={() => setViewAllCourses(!viewAllCourses)}
            >
              {viewAllCourses ? t('showFewerCoursesButton') : t('viewAllCoursesButton')}
            </Button>
          </Group>

          <Grid>
            {(viewAllCourses ? courses : courses.slice(0, 6)).map((course, index) => {
              const statusInfo = getStatusInfo(course.status);
              const StatusIcon = statusInfo.icon;
              const progress = calculateProgress(course);
              
              return (
                <Grid.Col key={course.course_id} xs={12} sm={6} md={4}>
                  <Card 
                    shadow="sm" 
                    padding="lg" 
                    radius="md" 
                    withBorder
                    sx={(theme) => ({
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.shadows.md
                      },
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%'
                    })}
                  >
                    <Card.Section pos="relative">
                      <Image
                        src={ course?.image_url ? course?.image_url : PlaceGolderImage}
                        height={160}
                        alt={course.title}
                      />

                      {progress > 0 && progress < 100 && (                        <Box 
                          sx={{
                            position: 'absolute',
                            bottom: -15,
                            right: 15,
                            zIndex: 2
                          }}
                        >
                          <Tooltip label={t('courseProgressTooltip', { progress })}>
                            <Box>
                              <RingProgress
                                size={60}
                                thickness={5}
                                roundCaps
                                sections={[{ value: progress, color: 'teal' }]}
                                label={
                                  <div style={{ textAlign: 'center' }}>
                                    <Text size="xs" align="center" weight={700}>{progress}%</Text>
                                  </div>
                                }
                                bg={theme.colorScheme === 'dark' ? theme.colors.dark[7] : 'white'}
                              />
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

                    <Text size="sm" color="dimmed" lineClamp={2} mb="md" sx={{ flex: 1 }}>
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
                      variant={course.status === 'creating' ? 'light' : 'filled'}
                      color={course.status === 'creating' ? 'blue' : 'teal'}
                      fullWidth
                      mt="auto"
                      rightIcon={<IconChevronRight size={16} />}
                      onClick={() => navigate(
                        course.status === 'creating' 
                          ? `/dashboard/courses/${course.course_id}?creating=true`
                          : `/dashboard/courses/${course.course_id}`
                      )}
                    >
                      {course.status === 'creating' ? t('viewCreationProgressButton') : t('continueLearningButton')}
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