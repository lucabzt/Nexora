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
  ActionIcon
} from '@mantine/core';
import { IconAlertCircle, IconClock, IconCheck, IconBook, IconTrash } from '@tabler/icons-react';
import { courseService } from '../api/courseService';

function Dashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          {courses.map((course) => {
            const statusInfo = getStatusInfo(course.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <Grid.Col key={course.course_id} xs={12} sm={6} md={4}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Card.Section withBorder inheritPadding py="xs">
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

                  <Text size="sm" color="dimmed" lineClamp={3} mb="md">
                    {course.description}
                  </Text>

                  {/* Time information */}
                  {course.total_time_hours && (
                    <Text size="xs" color="dimmed" mb="md">
                      Est. time: {course.total_time_hours} hours
                    </Text>
                  )}

                  <Button
                    variant="light"
                    color={course.status === 'creating' ? 'blue' : 'teal'}
                    fullWidth
                    mt="auto"
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
      )}
    </Container>
  );
}

export default Dashboard;