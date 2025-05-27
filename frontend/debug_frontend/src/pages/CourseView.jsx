import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Box
} from '@mantine/core';
import { IconAlertCircle, IconCircleCheck, IconCircleDashed } from '@tabler/icons-react';
import { courseService } from '../api/courseService';

function CourseView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const courseData = await courseService.getCourseById(courseId);
        setCourse(courseData);
        setChapters(courseData.chapters || []);
        setError(null);
      } catch (error) {
        setError('Failed to load course. Please try again later.');
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

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

      {!loading && !error && course && (
        <>
          <Group position="apart" mb="md">
            <div>
              <Title order={1}>{course.title}</Title>
              <Text color="dimmed" size="sm">Session ID: {course.session_id}</Text>
            </div>
            <Badge size="lg" color="teal">
              {Math.round(progress)}% Complete
            </Badge>
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

          <SimpleGrid cols={1} spacing="lg">
            {chapters.map((chapter, index) => (
              <Card key={index} shadow="sm" padding="lg" radius="md" withBorder>
                <Group position="apart" mb="xs">
                  <Text weight={500}>{chapter.caption}</Text>
                  <Badge color={chapter.is_completed ? "green" : "blue"} variant="filled">
                    {chapter.is_completed ? "Completed" : `${chapter.time_minutes} min`}
                  </Badge>
                </Group>

                <Text size="sm" color="dimmed" mb="md" lineClamp={2}>
                  {chapter.summary}
                </Text>

                <Button
                  variant="light"
                  color="blue"
                  fullWidth
                  onClick={() => navigate(`/courses/${courseId}/chapters/${chapter.id}`)}
                >
                  {chapter.is_completed ? 'Review Chapter' : 'Start Learning'}
                </Button>
              </Card>
            ))}
          </SimpleGrid>
        </>
      )}
    </Container>
  );
}

export default CourseView;