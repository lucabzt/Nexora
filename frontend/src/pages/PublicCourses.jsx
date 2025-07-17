import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Image,
  Button,
  Group,
  Loader,
  Alert,
  useMantineTheme,
  Box,
} from '@mantine/core';
import { IconBook, IconAlertCircle, IconWorld } from '@tabler/icons-react';
import courseService from '../api/courseService';
import { useTranslation } from 'react-i18next';
import PlaceGolderImage from '../assets/place_holder_image.png';

function PublicCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const { t } = useTranslation('dashboard'); // Reusing dashboard translations for consistency

  useEffect(() => {
    const fetchPublicCourses = async () => {
      try {
        setLoading(true);
        const publicCoursesData = await courseService.getPublicCourses();
        setCourses(publicCoursesData);
        setError(null);
      } catch (error) {
        setError(t('loadCoursesError'));
        console.error('Error fetching public courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicCourses();
  }, [t]);

  if (loading) {
    return <Container style={{ textAlign: 'center', paddingTop: '50px' }}><Loader size="xl" /></Container>;
  }

  if (error) {
    return (
      <Container style={{ paddingTop: '20px' }}>
        <Alert icon={<IconAlertCircle size={16} />} title={t('errorTitle')} color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid p="lg">
      <Group position="apart" mb="xl">
        <Box>
            <Group>
                <IconWorld size={32} />
                <Title order={2}>{t('publicCoursesTitle', { ns: 'dashboard', defaultValue: 'Public Courses' })}</Title>
            </Group>
            <Text color="dimmed" mt="sm">{t('publicCoursesSubtitle', { ns: 'dashboard', defaultValue: 'Explore courses shared by the community.' })}</Text>
        </Box>
      </Group>

      {courses.length === 0 ? (
        <Text>{t('noPublicCourses', { ns: 'dashboard', defaultValue: 'There are no public courses available at the moment.' })}</Text>
      ) : (
        <Grid gutter="xl">
          {courses.map((course) => (
            <Grid.Col key={course.course_id} sm={6} lg={4}>
              <Card 
                shadow="sm" 
                p="lg" 
                radius="md" 
                withBorder
                style={{ display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}
                onClick={() => navigate(`/dashboard/courses/${course.course_id}`)} // Navigate to course view on click
              >
                <Card.Section>
                  <Image src={course.thumbnail_url || PlaceGolderImage} height={180} alt={course.title} />
                </Card.Section>

                <Title order={3} mt="md" mb="xs">
                  {course.title}
                </Title>

                <Text size="sm" color="dimmed" lineClamp={3} style={{ flexGrow: 1 }}>
                  {course.description}
                </Text>

                <Button
                  variant="light"
                  color="blue"
                  fullWidth
                  mt="md"
                  leftIcon={<IconBook size={16} />}
                >
                  {t('viewCourseButton', { ns: 'dashboard', defaultValue: 'View Course' })}
                </Button>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default PublicCourses;
