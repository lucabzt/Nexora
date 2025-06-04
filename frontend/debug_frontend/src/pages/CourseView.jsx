import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  List,
  ThemeIcon,
  Loader,
  Alert,
  Box,
  Paper,
  Image,
  ActionIcon,
  Grid,
  Divider,
  RingProgress,
  Overlay,
  useMantineTheme
} from '@mantine/core';
import { 
  IconAlertCircle, 
  IconCircleCheck, 
  IconCircleDashed, 
  IconClock,
  IconArrowRight,
  IconBook,
  IconBrain,
  IconTrophy,
  IconArrowBack,
  IconCheck,  IconChevronRight,
  IconStar
} from '@tabler/icons-react';
import { courseService } from '../api/courseService';

function CourseView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isCreating = searchParams.get('creating') === 'true';
  const theme = useMantineTheme();
  
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Streaming creation states
  const [isStreamingActive, setIsStreamingActive] = useState(isCreating);
  const [creationProgress, setCreationProgress] = useState({
    status: 'Initializing course creation...',
    progress: 5,
    chaptersCreated: 0,
    estimatedTotal: 3
  });

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const courseData = await courseService.getCourseById(courseId);
        setCourse(courseData);
        setChapters(courseData.chapters || []);
        setError(null);
        
        // If course has chapters, creation is complete
        if (courseData.chapters && courseData.chapters.length > 0) {
          setIsStreamingActive(false);
        }
      } catch (error) {
        setError('Failed to load course. Please try again later.');
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
    
    // If we're in creation mode, set up polling to check for new chapters
    if (isCreating) {
      const pollInterval = setInterval(async () => {
        try {
          const courseData = await courseService.getCourseById(courseId);
          if (courseData) {
            setCourse(courseData);
            const newChapters = courseData.chapters || [];
            setChapters(newChapters);
            
            // Update creation progress
            if (newChapters.length > 0) {
              const estimatedTotal = Math.max(3, Math.ceil((courseData.total_time_hours || 2) * 1.5));
              const progress = Math.min(90, (newChapters.length / estimatedTotal) * 85 + 15);
              
              setCreationProgress({
                status: newChapters.length === estimatedTotal 
                  ? 'Finalizing course creation...'
                  : `Creating chapters... (${newChapters.length}/${estimatedTotal})`,
                progress: Math.round(progress),
                chaptersCreated: newChapters.length,
                estimatedTotal: estimatedTotal
              });
              
              // Check if creation is complete (course status is finished)
              if (courseData.status === 'finished' || newChapters.length >= estimatedTotal) {
                setCreationProgress({
                  status: 'Course creation complete!',
                  progress: 100,
                  chaptersCreated: newChapters.length,
                  estimatedTotal: estimatedTotal
                });
                setIsStreamingActive(false);
                clearInterval(pollInterval);
              }
            }
          }
        } catch (error) {
          console.error('Error polling course data:', error);
        }
      }, 2000); // Poll every 2 seconds
      
      // Cleanup interval on unmount
      return () => clearInterval(pollInterval);
    }
  }, [courseId, isCreating]);

  // Calculate progress
  const completedChapters = chapters.filter(chapter => chapter.is_completed).length;
  const progress = chapters.length > 0 ? (completedChapters / chapters.length) * 100 : 0;
  return (
    <Container size="lg" py="xl">
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

      {!loading && !error && (
        <>          {/* Course Creation Progress Section */}
          {isStreamingActive && (
            <Paper 
              radius="md" 
              p="xl" 
              withBorder 
              mb="xl" 
              sx={(theme) => ({
                position: 'relative',
                overflow: 'hidden',                  backgroundColor: theme.colorScheme === 'dark' ? 
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
                  backgroundImage: 'url("https://plus.unsplash.com/premium_photo-1673468922221-4cae4d1aa748?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',//'url("https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1373&q=80")',
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
                      <span>AI in Action</span>
                    </Group>
                  </Badge>
                  <Title 
                    order={2} 
                    sx={(theme) => ({
                      fontWeight: 800,
                      fontSize: '1.8rem',
                    })}
                  >
                    Creating Your Custom Course
                  </Title>
                </Box>
                
                <ThemeIcon 
                  size={60} 
                  radius="xl" 
                  color={creationProgress.progress === 100 ? "green" : "cyan"} 
                  variant="light"
                  sx={{ border: '4px solid #f0f0f0' }}
                >
                  {creationProgress.progress === 100 ? 
                    <IconCheck size={30} /> : 
                    <IconClock size={30} />
                  }
                </ThemeIcon>
              </Group>
              
              <Box mb="xl">
                <Group position="apart" mb="xs">
                  <Text size="sm" weight={600} color="dimmed">PROGRESS</Text>
                  <Text size="sm" weight={700}>{creationProgress.progress}%</Text>
                </Group>
                
                <Progress 
                  value={creationProgress.progress} 
                  size="lg" 
                  radius="xl" 
                  color={creationProgress.progress === 100 ? 'green' : 'teal'}
                  animate={creationProgress.progress > 0 && creationProgress.progress < 100}
                  sx={(theme) => ({ 
                    height: 12,
                    '& .mantine-Progress-bar': creationProgress.progress !== 100 ? { 
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
                <Text align="center" size="lg" weight={600} mb="xs" color={creationProgress.progress === 100 ? 'teal' : undefined}>
                  {creationProgress.status}
                </Text>
                
                {creationProgress.progress > 0 && creationProgress.progress < 100 && (
                  <Text color="dimmed" size="sm" align="center">
                    This may take a few minutes. Our AI is crafting personalized learning content based on your request.
                  </Text>
                )}
                
                {creationProgress.progress === 100 && (
                  <Group position="center" mt="md">
                    <Button
                      variant="gradient"
                      gradient={{ from: 'teal', to: 'green' }}
                      leftIcon={<IconArrowRight size={16} />}
                      onClick={() => window.location.reload()}
                    >
                      View Your Completed Course
                    </Button>
                  </Group>
                )}
              </Box>
              
              {creationProgress.chaptersCreated > 0 && (
                <Group position="center" mt="md" spacing="xl">
                  <Box sx={{ textAlign: 'center' }}>
                    <Text size="xl" weight={700}>{creationProgress.chaptersCreated}</Text>
                    <Text size="xs" color="dimmed">Chapters Created</Text>
                  </Box>
                  
                  <Divider orientation="vertical" />
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Text size="xl" weight={700}>{creationProgress.estimatedTotal}</Text>
                    <Text size="xs" color="dimmed">Total Chapters</Text>
                  </Box>
                  
                  <Divider orientation="vertical" />
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Text size="xl" weight={700}>{course?.total_time_hours || 2} hrs</Text>
                    <Text size="xs" color="dimmed">Learning Time</Text>
                  </Box>
                </Group>
              )}
            </Paper>
          )}{/* Course Header */}
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
                          Back to Dashboard
                        </Button>
                        
                        {isStreamingActive ? (
                          <Badge size="lg" color="blue" variant="filled" px="md" py="sm">
                            <IconClock size={16} style={{ marginRight: 6 }} />
                            Creating Course
                          </Badge>
                        ) : (
                          <Badge size="lg" color="teal" variant="filled" px="md" py="sm">
                            {Math.round(progress)}% Complete
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
                        {course.title}
                      </Title>
                      
                      <Text size="md" mb="lg" color="dimmed" sx={{ maxWidth: '600px' }}>
                        {course.description}
                      </Text>

                      <Group position="apart" mb="lg">
                        <Box>
                          <Text size="sm" weight={500} color="dimmed">COURSE PROGRESS</Text>
                          <Group spacing="xs" mt="xs">
                            <RingProgress 
                              size={60} 
                              thickness={4} 
                              roundCaps 
                              sections={[{ value: progress, color: 'teal' }]}
                              label={
                                <Text size="xs" align="center" weight={700}>
                                  {Math.round(progress)}%
                                </Text>
                              }
                            />
                            <div>
                              <Text size="md" weight={700}>{completedChapters} of {chapters.length}</Text>
                              <Text size="xs" color="dimmed">Chapters completed</Text>
                            </div>
                          </Group>
                        </Box>
                        
                        <Box>
                          <Text size="sm" weight={500} color="dimmed">ESTIMATED TIME</Text>
                          <Group spacing="xs" mt="xs">
                            <ThemeIcon size="lg" radius="md" color="teal" variant="light">
                              <IconClock size={20} />
                            </ThemeIcon>
                            <div>
                              <Text size="md" weight={700}>{course.total_time_hours || "2"} hours</Text>
                              <Text size="xs" color="dimmed">Total learning time</Text>
                            </div>
                          </Group>
                        </Box>
                      </Group>
                      
                      {!isStreamingActive && chapters.length > 0 && (
                        <Button 
                          size="md"
                          variant="gradient"
                          gradient={{ from: 'teal', to: 'cyan' }}
                          rightIcon={<IconChevronRight size={16} />}
                          onClick={() => navigate('/courses/' + courseId + '/chapters/' + chapters[0]?.id)}
                          mt="md"
                        >
                          {progress > 0 ? 'Continue Learning' : 'Start Learning'}
                        </Button>
                      )}
                      
                      <Text size="xs" color="dimmed" mt={30}>Session ID: {course.session_id}</Text>
                    </Box>
                  </Grid.Col>
                  
                  <Grid.Col md={5} sx={{ position: 'relative' }}>                    <Image 
                      src={"https://plus.unsplash.com/premium_photo-1673468922221-4cae4d1aa748?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}//{'https://source.unsplash.com/600x400/?education,' + encodeURIComponent(course.title)}
                      height={400}
                      sx={{ 
                        objectFit: 'cover',
                        height: '100%',
                      }}
                      alt={course.title}
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
                          <Text color="white" weight={600}>AI-Generated Course</Text>
                          <Text color="white" opacity={0.7} size="xs">
                            Personalized learning path
                          </Text>
                        </div>
                      </Group>
                    </Box>
                  </Grid.Col>
                </Grid>
              </Paper>              {/* Learning journey header */}
              <Group position="apart" align="center" mb="xl">
                <Box>
                  <Title 
                    order={2} 
                    sx={(theme) => ({
                      fontWeight: 700,
                      color: theme.colorScheme === 'dark' ? theme.white : theme.black,
                    })}
                  >
                    Your Learning Journey
                  </Title>
                  <Text color="dimmed">
                    Follow the chapters below to master this topic
                  </Text>
                </Box>
                
                {!isStreamingActive && chapters.length > 0 && (
                  <Group spacing="xs">
                    <ThemeIcon 
                      size={34} 
                      radius="xl" 
                      color={completedChapters === chapters.length ? "green" : "teal"} 
                      variant={completedChapters === chapters.length ? "filled" : "light"}
                    >
                      {completedChapters === chapters.length ? 
                        <IconTrophy size={18} /> : 
                        <IconBrain size={18} />
                      }
                    </ThemeIcon>
                    <div>
                      <Text weight={600} size="sm">
                        {completedChapters === chapters.length ? 
                          'Course Mastered!' : 
                          `${completedChapters === 0 ? 'Begin your learning' : 'Continue learning'}`}
                      </Text>
                      <Text size="xs" color="dimmed">
                        {completedChapters === chapters.length ? 
                          'Congratulations on completing the course!' : 
                          `${completedChapters} of ${chapters.length} chapters completed`}
                      </Text>
                    </div>
                  </Group>
                )}
              </Group>
              
              {/* Show creation progress for chapters */}
              {isStreamingActive && chapters.length === 0 && (
                <Paper withBorder p="xl" radius="md" mb="lg" sx={(theme) => ({
                  backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
                  textAlign: 'center',
                })}>
                  <Loader size="md" mb="md" mx="auto" />
                  <Title order={3} mb="sm">Building Your Custom Course</Title>
                  <Text color="dimmed" size="sm" maw={400} mx="auto">
                    Our AI is crafting personalized chapters tailored just for you. 
                    This may take a few minutes as we create high-quality learning content.
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
                {chapters.map((chapter, index) => {                  // Generate consistent but unique image for each chapter
                  const chapterImage = "https://images.unsplash.com/photo-1745270917449-c2e2c5806586?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"; // 'https://source.unsplash.com/600x400/?' + encodeURIComponent(chapter.caption || 'learning chapter ' + (index + 1));
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
                          src={chapterImage}
                          height={180}
                          alt={chapter.caption || "Chapter " + (index + 1)}
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
                        >                          <Badge 
                            color={chapter.is_completed ? "green" : "blue"} 
                            variant="filled" 
                          >
                            {chapter.is_completed ? "Completed" : chapter.time_minutes + " min"}
                          </Badge>
                          
                          {chapter.mc_questions && (
                            <Badge color="yellow" variant="filled" ml={6}>
                              {chapter.mc_questions.length} {chapter.mc_questions.length === 1 ? 'Quiz' : 'Quizzes'}
                            </Badge>
                          )}
                        </Box>
                      </Card.Section>

                      <Box mt="md" mb="xs" sx={{ flex: 1 }}>
                        <Text 
                          weight={700} 
                          size="lg" 
                          lineClamp={2}
                          sx={{ minHeight: '3.2rem' }}
                        >
                          {chapter.caption || `Chapter ${index + 1}`}
                        </Text>
                        
                        <Text 
                          color="dimmed" 
                          size="sm" 
                          mt="md" 
                          lineClamp={3}
                          sx={{ flex: 1, minHeight: '4.5rem' }}
                        >
                          {chapter.summary}
                        </Text>
                      </Box>

                      <Button
                        variant={chapter.is_completed ? "light" : "filled"}
                        color={chapter.is_completed ? "green" : "teal"}
                        fullWidth
                        mt="md"
                        rightIcon={chapter.is_completed ? <IconCircleCheck size={16} /> : <IconChevronRight size={16} />}
                        onClick={() => navigate(`/courses/${courseId}/chapters/${chapter.id}`)}
                        disabled={isStreamingActive}
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
                        {chapter.is_completed ? 'Review Chapter' : 'Start Learning'}
                      </Button>
                    </Card>
                  );
                })}
                
                {/* Show placeholders for chapters being created */}
                {isStreamingActive && creationProgress.estimatedTotal > chapters.length && 
                  Array.from({ length: creationProgress.estimatedTotal - chapters.length }).map((_, index) => (
                    <Card 
                      key={`placeholder-${index}`} 
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
                            src={`https://source.unsplash.com/600x400/?learning,education,${index}`}
                            height={180}
                            alt={`Upcoming Chapter ${chapters.length + index + 1}`}
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
                            <Text align="center" color="white" weight={600}>Creating Chapter {chapters.length + index + 1}</Text>
                            <Text align="center" color="white" size="xs" opacity={0.8}>Our AI is crafting this content</Text>
                          </Box>
                        </Box>
                      </Card.Section>
                      <Box mt="md" sx={{ flex: 1 }}>
                        <Text weight={500} color="dimmed">Chapter {chapters.length + index + 1}</Text>
                        <Box mt="sm" mb="lg">
                          <Loader size="xs" mb="xs" />
                          <Text size="sm" color="dimmed" lineClamp={3} sx={{ minHeight: '4.5rem' }}>
                            This chapter is being generated with personalized content tailored to your learning needs...
                          </Text>
                        </Box>
                      </Box>
                      <Button variant="light" color="gray" fullWidth mt="md" disabled>
                        Creating Chapter...
                      </Button>
                    </Card>
                  ))
                }
              </SimpleGrid>
            </>
          )}
        </>
      )}
    </Container>
  );
}



export default CourseView;