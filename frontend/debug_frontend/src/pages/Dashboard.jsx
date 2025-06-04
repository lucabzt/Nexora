import { useState, useEffect } from 'react';
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
  Center
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
  IconChevronRight
} from '@tabler/icons-react';
import { courseService } from '../api/courseService';

function Dashboard() {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userStats, setUserStats] = useState({
    coursesCompleted: 2,
    currentStreak: 5,
    totalHoursLearned: 24
  });

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to permanently delete this course? This action cannot be undone.')) {
      return;
    }
    try {
      await courseService.deleteCourse(courseId);
      setCourses(prevCourses => prevCourses.filter(course => course.course_id !== courseId));
      // Optional: Show a success notification
    } catch (err) {
      setError(`Failed to delete course. ${err.message || ''}`);
      console.error('Error deleting course:', err);
      // Optional: Show an error notification
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
        setError('Failed to load courses. Please try again later.');
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
        return { color: 'blue', icon: IconClock, label: 'Creating' };
      case 'finished':
        return { color: 'green', icon: IconCheck, label: 'Finished' };
      case 'updating':
        return { color: 'orange', icon: IconClock, label: 'Updating' };
      default:
        return { color: 'gray', icon: IconBook, label: 'Learning' };
    }
  };
  // Function to generate a placeholder image URL with a specific theme
  const getPlaceholderImage = (index, title) => {
    // Create a consistent seed based on the title
    //const seed = title ? title.length : index;
    const themes = ['education', 'technology', 'science', 'data', 'coding'];
    const theme = themes[index % themes.length];
    return `https://source.unsplash.com/300x200/?${theme},learning`;
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
      {/* Header with motivational message */}
      <Box mb="xl">
        <Group position="apart" mb="md">
          <Box>
            <Title order={1} mb={5}>My Learning Journey</Title>
            <Text color="dimmed">Continue your path to knowledge and growth</Text>
          </Box>
          <Button 
            size="md"
            color="teal" 
            onClick={() => navigate('/create-course')}
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
            Create New Course
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
          title="Error!" 
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
                  Current Streak
                </Text>
                <Text weight={700} size="xl">{userStats.currentStreak} Days</Text>
              </div>
              <ThemeIcon color="orange" size={50} radius="md" variant="light">
                <IconFlame size={30} />
              </ThemeIcon>
            </Group>
            <Text size="xs" color="dimmed" mt="md">
              Keep it up! You're building great habits.
            </Text>
          </Paper>

          <Paper withBorder p="md" radius="md" shadow="sm">
            <Group position="apart">
              <div>
                <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
                  Courses Completed
                </Text>
                <Text weight={700} size="xl">{userStats.coursesCompleted}</Text>
              </div>
              <ThemeIcon color="green" size={50} radius="md" variant="light">
                <IconTrophy size={30} />
              </ThemeIcon>
            </Group>
            <Text size="xs" color="dimmed" mt="md">
              You've already mastered {userStats.coursesCompleted} courses!
            </Text>
          </Paper>

          <Paper withBorder p="md" radius="md" shadow="sm">
            <Group position="apart">
              <div>
                <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
                  Total Learning Hours
                </Text>
                <Text weight={700} size="xl">{userStats.totalHoursLearned} hrs</Text>
              </div>
              <ThemeIcon color="blue" size={50} radius="md" variant="light">
                <IconCertificate size={30} />
              </ThemeIcon>
            </Group>
            <Text size="xs" color="dimmed" mt="md">
              That's {userStats.totalHoursLearned} hours of valuable knowledge!
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
            <Title order={2} align="center">Begin Your Learning Journey</Title>
            <Text align="center" size="lg" maw={500} mx="auto" color="dimmed">
              You don't have any courses yet. Create your first personalized course to
              start expanding your knowledge!
            </Text>
            <Button 
              size="lg"
              onClick={() => navigate('/create-course')} 
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
              Create My First Course
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Featured Course (if available) */}
      {!loading && !error && courses.length > 0 && (
        <>
          <Title order={2} mb="md">Continue Learning</Title>
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
                  src={getPlaceholderImage(0, courses[0]?.title)}
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
                    Recommended For You
                  </Badge>
                  <Title order={2} mb="xs">{courses[0]?.title || 'Introduction to Machine Learning'}</Title>
                  <Text lineClamp={2} mb="lg" color="dimmed">
                    {courses[0]?.description || 'Learn the fundamentals of machine learning and AI. Perfect for beginners wanting to understand core concepts.'}
                  </Text>
                  
                  <Group position="apart" mb="md">
                    <Text size="sm">Your progress:</Text>
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
                    onClick={() => navigate(`/courses/${courses[0]?.course_id}`)}
                    mt="lg"
                  >
                    Continue Learning
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
          <Group position="apart" mb="md">
            <Title order={2}>My Courses</Title>
            <Button 
              variant="subtle" 
              color="blue" 
              rightIcon={<IconArrowUpRight size={16} />}
              onClick={() => {}}
            >
              View All
            </Button>
          </Group>

          <Grid>
            {courses.map((course, index) => {
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
                        src={getPlaceholderImage(index + 1, course.title)}
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
                          <Tooltip label={`${progress}% complete`}>
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
                        <ActionIcon 
                          color="red" 
                          variant="subtle"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(course.course_id);
                          }}
                          title="Delete course"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
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
                          Est. time: {course.total_time_hours} hours
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
                          ? `/courses/${course.course_id}?creating=true`
                          : `/courses/${course.course_id}`
                      )}
                    >
                      {course.status === 'creating' ? 'View Creation Progress' : 'Continue Learning'}
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