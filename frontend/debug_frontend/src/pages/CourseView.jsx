import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('courseView');
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const theme = useMantineTheme();
  
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [creationStatus, setCreationStatus] = useState(null);
  const [creationProgress, setCreationProgress] = useState({
    status: t('creation.statusInitializing'),
    progress: 0,
    chaptersCreated: 0,
    estimatedTotal: 0
  });


  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const courseData = await courseService.getCourseById(courseId);
        
        console.log('Fetched course data:', courseData);
        setCourse(courseData);
        
        setCreationStatus(courseData.status);
        console.log('Course creation status:', courseData.status);


        setChapters(courseData.chapters || []);
        setError(null);
    
      } catch (error) {
        setError(t('errors.loadFailed'));
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();

    console.log('CourseView mounted, fetching course data for ID:', courseId, 'creationStatus:', creationStatus);
    
    // If we're in creation mode, set up polling to check for new chapters
    if (creationStatus === 'CourseStatus.CREATING') {
      const pollInterval = setInterval(async () => {
        try {
          const courseData = await courseService.getCourseById(courseId);
    
          if (courseData) {
            setCourse(courseData);
            const newChapters = courseData.chapters || [];
            setChapters(newChapters);
            
            // Update creation progress
            if (newChapters.length > 0) {
              const totalChapters = courseData.chapter_count || 1;
              const progress = (totalChapters / newChapters.length) * 100;
              
              setCreationProgress({
                status: t('creation.statusCreatingChapters', { chaptersCreated: newChapters.length, totalChapters: totalChapters }),
                progress: Math.round(progress),
                chaptersCreated: newChapters.length,
                estimatedTotal: totalChapters
              });

              console.log('Current status:', courseData.status);
              
              // Check if creation is complete (course status is finished)
              if (courseData.status === 'CourseStatus.FINISHED') {
                console.log('Course creation completed');


                setCreationProgress({
                  status: t('creation.statusComplete'),
                  progress: 100,
                  chaptersCreated: newChapters.length,
                  estimatedTotal: totalChapters
                });
                clearInterval(pollInterval);
              }
            }
          }
        } catch (error) {
          console.error('Error polling course data:', error);
          setError(t('errors.loadFailed'));
        }
      }, 2000); // Poll every 2 seconds
      
      // Cleanup interval on unmount
      return () => clearInterval(pollInterval);
    }
  }, [creationProgress, courseId, creationStatus, t]);

  // Calculate progress
  const completedChapters = chapters.filter(chapter => chapter.is_completed).length;
  const progress = chapters.length > 0 ? (completedChapters / chapters.length) * 100 : 0;
  return (
    <Container size="lg" py="xl">
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <Loader size="lg" title={t('loadingCourseDetails')} />
        </Box>
      )}

      {error && !loading && (
        <Alert 
          icon={<IconAlertCircle size={16} />}
          title={t('errors.genericTitle')} 
          color="red" 
          mb="lg"
        >
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>          {/* {t('creation.title')} Section */}
          {creationStatus === "creating" && (
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
                      <span>{t('creation.aiInActionBadge')}</span>
                    </Group>
                  </Badge>
                  <Title 
                    order={2} 
                    sx={(theme) => ({
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
                  <Text size="sm" weight={600} color="dimmed">{t('creation.progressLabel')}</Text>
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
                  {t('creation.currentStatusLabel')} {creationProgress.status}
                </Text>
                
                {creationProgress.progress > 0 && creationProgress.progress < 100 && (
                  <Text color="dimmed" size="sm" align="center">
                    {t('creation.description')}
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
                      {t('buttons.viewCompletedCourse')}
                    </Button>
                  </Group>
                )}
              </Box>
              
              {creationProgress.chaptersCreated > 0 && (
                <Group position="center" mt="md" spacing="xl">
                  <Box sx={{ textAlign: 'center' }}>
                    <Text size="xl" weight={700}>{creationProgress.chaptersCreated}</Text>
                    <Text size="xs" color="dimmed">{t('creation.chaptersCreatedLabel', { chaptersCreated: creationProgress.chaptersCreated, estimatedTotal: creationProgress.estimatedTotal })}</Text>
                  </Box>
                  
                  <Divider orientation="vertical" />
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Text size="xl" weight={700}>{creationProgress.estimatedTotal}</Text>
                    <Text size="xs" color="dimmed">{t('creation.estimatedTotalLabel')}</Text>
                  </Box>
                  
                  <Divider orientation="vertical" />
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Text size="xl" weight={700}>{course?.total_time_hours || 2} hrs</Text>
                    <Text size="xs" color="dimmed">{t('creation.learningTimeLabel')}</Text>
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
                          {t('buttons.backToDashboard')}
                        </Button>
                        
                        {creationStatus === "creating" ? (
                          <Badge size="lg" color="blue" variant="filled" px="md" py="sm">
                            <IconClock size={16} style={{ marginRight: 6 }} />
                            {t('creation.statusCreatingCourse')}
                          </Badge>
                        ) : (
                          <Badge size="lg" color="teal" variant="filled" px="md" py="sm">
                            {t('progress.percentageComplete', { percentage: Math.round(progress) })}
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
                          <Text size="sm" weight={500} color="dimmed">{t('progress.courseProgressLabel')}</Text>
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
                              <Text size="xs" color="dimmed">{t('progress.chaptersCompletedStats', { completedChapters, totalChapters: chapters.length })}</Text>
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
                              <Text size="md" weight={700}>{course.total_time_hours || "2"} hours</Text>
                              <Text size="xs" color="dimmed">{t('progress.learningTimeLabel')}</Text>
                            </div>
                          </Group>
                        </Box>
                      </Group>
                      
                      {!creationStatus === "creating" && chapters.length > 0 && (
                        <Button 
                          size="md"
                          variant="gradient"
                          gradient={{ from: 'teal', to: 'cyan' }}
                          rightIcon={<IconChevronRight size={16} />}
                          onClick={() => navigate('/dashboard/courses/' + courseId + '/chapters/' + chapters[0]?.id)}
                          mt="md"
                        >
                          {progress > 0 ? t('buttons.continueLearning') : t('buttons.startLearning')}
                        </Button>
                      )}
                      
                      <Text size="xs" color="dimmed" mt={30}>{t('sessionIdLabel')} {course.session_id}</Text>
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
                          <Text color="white" weight={600}>{t('aiGeneratedCourseLabel')}</Text>
                          <Text color="white" opacity={0.7} size="xs">
                            {t('personalizedLearningPathLabel')}
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
                    {t('learningJourneyLabel')}
                  </Title>
                  <Text color="dimmed">
                    {t('followChaptersLabel')}
                  </Text>
                </Box>
                
                {!creationStatus === "creating" && chapters.length > 0 && (
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
                          t('courseMasteredLabel') : 
                          `${completedChapters === 0 ? t('beginLearningLabel') : t('continueLearningLabel')}`}
                      </Text>
                      <Text size="xs" color="dimmed">
                        {completedChapters === chapters.length ? 
                          t('congratulationsLabel') : 
                          t('progress.chaptersCompletedText', { completedChapters, totalChapters: chapters.length })}
                      </Text>
                    </div>
                  </Group>
                )}
              </Group>
              
              {/* Show creation progress for chapters */}
              {creationStatus === "creating" && chapters.length === 0 && (
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
                        >                          <Badge 
                            color={chapter.is_completed ? "green" : "blue"} 
                            variant="filled" 
                          >
                            {chapter.is_completed ? t('chapters.statusCompleted') : (progress > 0 && index === completedChapters ? t('chapters.statusInProgress') : t('chapters.statusNotStarted'))}
                          </Badge>
                          
                          {chapter.mc_questions && (
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
                          sx={{ minHeight: '3.2rem' }}
                        >
                          {chapter.caption || t('chapters.defaultTitleText', { chapterNumber: index + 1 })}
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
                        onClick={() => navigate(`/dashboard/courses/${courseId}/chapters/${chapter.id}`)}
                        disabled={creationStatus === "creating" && index > 0}
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
                        {chapter.is_completed ? t('buttons.reviewChapter') : t('buttons.startLearning')}
                      </Button>
                    </Card>
                  );
                })}
                
                {/* Show placeholders for chapters being created */}
                {creationStatus === "creating" && creationProgress.estimatedTotal > chapters.length && 
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
                            alt={t('creation.upcomingChapterAlt', { chapterNumber: chapters.length + index + 1 })}
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
                            <Text align="center" color="white" weight={600}>{t('creation.creatingChapterOverlay', { chapterNumber: chapters.length + index + 1 })}</Text>
                            <Text align="center" color="white" size="xs" opacity={0.8}>{t('creation.aiCraftingOverlay')}</Text>
                          </Box>
                        </Box>
                      </Card.Section>
                      <Box mt="md" sx={{ flex: 1 }}>
                        <Text weight={500} color="dimmed">{t('creation.placeholderChapterTitle', { chapterNumber: chapters.length + index + 1 })}</Text>
                        <Box mt="sm" mb="lg">
                          <Loader size="xs" mb="xs" />
                          <Text size="sm" color="dimmed" lineClamp={3} sx={{ minHeight: '4.5rem' }}>
                            {t('creation.placeholderChapterDescription')}
                          </Text>
                        </Box>
                      </Box>
                      <Button variant="light" color="gray" fullWidth mt="md" disabled>
                        {t('creation.placeholderButtonCreating')}
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