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
  TextInput,
} from '@mantine/core';
import { IconBook, IconAlertCircle, IconWorld, IconSearch } from '@tabler/icons-react';
import courseService from '../api/courseService';
import { useTranslation } from 'react-i18next';
import PlaceGolderImage from '../assets/place_holder_image.png';

function PublicCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation('dashboard');

  useEffect(() => {
    const fetchPublicCourses = async () => {
      try {
        setLoading(true);
        const publicCoursesData = await courseService.getPublicCourses();
        setCourses(publicCoursesData);
        setError(null);
      } catch (err) {
        setError(t('loadCoursesError'));
        console.error('Error fetching public courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicCourses();
  }, [t]);

  const filteredCourses = courses.filter(course => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const title = (course.title || '').toLowerCase();
    const description = (course.description || '').toLowerCase();
    return title.includes(query) || description.includes(query);
  });

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
    <Container size="lg" py="xl">
      <Group position="apart" mb="xl">
        <Box>
          <Group>
            <IconWorld size={32} />
            <Title order={2}>{t('publicCoursesTitle', { ns: 'dashboard', defaultValue: 'Public Courses' })}</Title>
          </Group>
          <Text color="dimmed" mt="sm">{t('publicCoursesSubtitle', { ns: 'dashboard', defaultValue: 'Explore courses shared by the community.' })}</Text>
        </Box>
      </Group>

      <TextInput
        placeholder={t('searchPublicCoursesPlaceholder', { ns: 'dashboard', defaultValue: 'Search courses by title or description...' })}
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.currentTarget.value)}
        icon={<IconSearch size={16} />}
        mb="xl"
      />

      {filteredCourses.length === 0 && !loading ? (
        <Text align="center" mt="xl">
          {searchQuery ? t('noSearchResults', { ns: 'dashboard', defaultValue: 'No courses match your search.' }) : t('noPublicCourses', { ns: 'dashboard', defaultValue: 'There are no public courses available at the moment.' })}
        </Text>
      ) : (
        <Grid gutter="x1">
          {filteredCourses.map((course) => (
            <Grid.Col key={course.course_id} sm={12} md={6} lg={4}>
              <Card 
                shadow="sm" 
                p="lg" 
                radius="md" 
                withBorder
                style={{ display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}
                onClick={() => navigate(`/dashboard/courses/${course.course_id}`)}
              >
                <Card.Section>
                  <Image src={course.image_url || PlaceGolderImage} height={180} alt={course.title} />
                </Card.Section>

                <Title order={3} mt="md" mb="xs">
                  {course.title}
                </Title>

                <Text size="xs" color="dimmed" mb="md">
                  {t('byAuthor', { ns: 'dashboard', defaultValue: 'By' })} {course.user_name}
                </Text>

                <Text size="sm" color="dimmed"  lineClamp={5}mb="md" sx={{
                  flex: 1,
                  height: '6rem',
                  overflow: 'auto',
                  paddingRight: '4px',
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
