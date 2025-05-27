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
  Box
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { courseService } from '../api/courseService';


function Dashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <Container size="lg" py="xl">
      <Group position="apart" mb="lg">
        <Title order={1}>My Learning Dashboard</Title>
        <Button 
          color="teal" 
          onClick={() => navigate('/create-course')}
        >
          Create New Course
        </Button>
      </Group>

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

      {!loading && !error && courses.length === 0 && (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text align="center" py="xl">
            You don't have any courses yet. Create your first course to get started!
          </Text>
          <Group position="center">
            <Button onClick={() => navigate('/create-course')} color="teal">
              Create First Course
            </Button>
          </Group>
        </Card>
      )}

      {!loading && !error && courses.length > 0 && (
        <Grid>
          {courses.map((course) => (
            <Grid.Col key={course.course_id} xs={12} sm={6} md={4}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section withBorder inheritPadding py="xs">
                  <Badge color="cyan" variant="outline">
                    Session ID: {course.session_id}
                  </Badge>
                </Card.Section>

                <Title order={3} mt="md" mb="xs">
                  {course.title}
                </Title>

                <Text size="sm" color="dimmed" lineClamp={3}>
                  {course.description}
                </Text>

                <Button
                  variant="light"
                  color="blue"
                  fullWidth
                  mt="md"
                  onClick={() => navigate(`/courses/${course.course_id}`)}
                >
                  Continue Learning
                </Button>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default Dashboard;