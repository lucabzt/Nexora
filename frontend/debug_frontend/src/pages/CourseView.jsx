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
  Paper
} from '@mantine/core';
import { IconAlertCircle, IconCircleCheck, IconCircleDashed, IconClock } from '@tabler/icons-react';
import { courseService } from '../api/courseService';

function CourseView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isCreating = searchParams.get('creating') === 'true';
  
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
        <>
          {/* Course Creation Progress Section */}
          {isStreamingActive && (
            <Paper radius="md" p="xl" withBorder mb="xl">
              <Group position="apart" mb="md">
                <Title order={2}>Creating Your Course</Title>
                <Badge color="blue" variant="light">
                  <IconClock size={14} style={{ marginRight: 4 }} />
                  Creating
                </Badge>
              </Group>
              
              <Progress 
                value={creationProgress.progress} 
                mb="md" 
                size="lg" 
                radius="xl" 
                color={creationProgress.progress === 100 ? 'green' : 'blue'}
                animate={creationProgress.progress > 0 && creationProgress.progress < 100}
              />
              
              <Text align="center" mb="md" size="lg" weight={500}>
                {creationProgress.status}
              </Text>
              
              {creationProgress.progress > 0 && creationProgress.progress < 100 && (
                <Text color="dimmed" size="sm" align="center">
                  This may take a few minutes. Our AI is crafting personalized content for your course.
                </Text>
              )}
            </Paper>
          )}

          {/* Course Header */}
          {course && (
            <>
              <Group position="apart" mb="md">
                <div>
                  <Title order={1}>{course.title}</Title>
                  <Text color="dimmed" size="sm">Session ID: {course.session_id}</Text>
                </div>
                <Group spacing="xs">
                  {isStreamingActive ? (
                    <Badge size="lg" color="blue" variant="light">
                      <IconClock size={14} style={{ marginRight: 4 }} />
                      Creating...
                    </Badge>
                  ) : (
                    <Badge size="lg" color="teal">
                      {Math.round(progress)}% Complete
                    </Badge>
                  )}
                </Group>
              </Group>

              <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
                <Text size="md" mb="md">{course.description}</Text>
                <Progress value={progress} size="md" radius="xl" mb="md" />
                <Group position="apart">
                  <Text size="sm" color="dimmed">{completedChapters} of {chapters.length} chapters completed</Text>
                  <Text size="sm" color="dimmed">
                    Estimated time: {course.total_time_hours || "2"} hours
                  </Text>
                </Group>
              </Card>

              <Title order={2} mb="md">Course Chapters</Title>

              {/* Show creation progress for chapters */}
              {isStreamingActive && chapters.length === 0 && (
                <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
                  <Group position="center">
                    <Loader size="sm" />
                    <Text color="dimmed">Generating course chapters...</Text>
                  </Group>
                </Card>
              )}

              <SimpleGrid cols={1} spacing="lg">
                {chapters.map((chapter, index) => (
                  <Card key={chapter.id || index} shadow="sm" padding="lg" radius="md" withBorder>
                    <Group position="apart" mb="xs">
                      <Text weight={500}>{chapter.caption}</Text>
                      <Group spacing="xs">
                        <Badge color={chapter.is_completed ? "green" : "blue"} variant="filled">
                          {chapter.is_completed ? "Completed" : `${chapter.time_minutes} min`}
                        </Badge>
                        {chapter.mc_questions && (
                          <Badge color="gray" variant="outline" size="sm">
                            {chapter.mc_questions.length} questions
                          </Badge>
                        )}
                      </Group>
                    </Group>

                    <Text size="sm" color="dimmed" mb="md" lineClamp={2}>
                      {chapter.summary}
                    </Text>

                    <Button
                      variant="light"
                      color="blue"
                      fullWidth
                      onClick={() => navigate(`/courses/${courseId}/chapters/${chapter.id}`)}
                      disabled={isStreamingActive}
                    >
                      {chapter.is_completed ? 'Review Chapter' : 'Start Learning'}
                    </Button>
                  </Card>
                ))}
                
                {/* Show placeholder for chapters being created */}
                {isStreamingActive && creationProgress.estimatedTotal > chapters.length && (
                  <>
                    {Array.from({ length: creationProgress.estimatedTotal - chapters.length }).map((_, index) => (
                      <Card key={`placeholder-${index}`} shadow="sm" padding="lg" radius="md" withBorder opacity={0.5}>
                        <Group position="apart" mb="xs">
                          <Text weight={500} color="dimmed">Chapter {chapters.length + index + 1}</Text>
                          <Badge color="gray" variant="outline">
                            Creating...
                          </Badge>
                        </Group>
                        <Text size="sm" color="dimmed" mb="md">
                          This chapter is being generated...
                        </Text>
                        <Button variant="light" color="gray" fullWidth disabled>
                          Creating Chapter
                        </Button>
                      </Card>
                    ))}
                  </>
                )}
              </SimpleGrid>
            </>
          )}
        </>
      )}
    </Container>
  );
}



export default CourseView;