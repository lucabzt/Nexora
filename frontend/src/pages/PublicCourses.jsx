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
  Paper,
  Stack,
  ActionIcon,
  Modal,
  Textarea,
  Switch,
  rem,
} from '@mantine/core';
import { IconBook, IconAlertCircle, IconWorld, IconSearch, IconUser, IconBooks, IconPencil, IconTrash, IconX } from '@tabler/icons-react';
import courseService from '../api/courseService';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import PlaceGolderImage from '../assets/place_holder_image.png';

function PublicCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation('dashboard');
  const theme = useMantineTheme();
  const { user } = useAuth();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDeleteId, setCourseToDeleteId] = useState(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [courseToRename, setCourseToRename] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const handleDelete = (courseId) => {
    setCourseToDeleteId(courseId);
    setDeleteModalOpen(true);
  };

  const handleRename = (course) => {
    setCourseToRename(course);
    setNewTitle(course.title || '');
    setNewDescription(course.description || '');
    setIsPublic(course.is_public || false);
    setRenameModalOpen(true);
  };

  const confirmDeleteHandler = async () => {
    if (!courseToDeleteId) return;
    try {
      await courseService.deleteCourse(courseToDeleteId);
      setCourses(courses.filter(course => course.course_id !== courseToDeleteId));
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const confirmRenameHandler = async () => {
    if (!courseToRename) return;
    try {
      // First update title and description
      const updatedCourse = await courseService.updateCourse(
        courseToRename.course_id,
        newTitle,
        newDescription
      );
      
      // Then update the public status separately since it's a different endpoint
      if (isPublic !== courseToRename.is_public) {
        await courseService.updateCoursePublicStatus(courseToRename.course_id, isPublic);
        updatedCourse.is_public = isPublic;
      }
      
      // Update the local state with the updated course
      setCourses(courses.map(course => 
        course.course_id === updatedCourse.course_id ? { ...course, ...updatedCourse } : course
      ));
      
      setRenameModalOpen(false);
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

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
    return (
      <Container 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          textAlign: 'center',
          gap: '1rem'
        }}
      >
        <Loader size="xl" variant="dots" />
        <Text size="lg" color="dimmed">
          {t('loadingPublicCourses', { ns: 'dashboard', defaultValue: 'Loading public courses...' })}
        </Text>
      </Container>
    );
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
      <Box
        pb="xl"
        mb="xl"
        style={{
          borderBottom: `1px solid ${
            theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
          }`,
        }}
      >
        <Group position="apart">
          <div>
            <Title order={2}>{t('publicCoursesTitle', { ns: 'dashboard', defaultValue: 'Public Courses' })}</Title>
            <Text color="dimmed" mt={4}>
              {t('publicCoursesSubtitle', { ns: 'dashboard', defaultValue: 'Explore courses shared by the community.' })}
            </Text>
          </div>
          <IconWorld size={40} color={theme.colors.teal[5]} stroke={1.5} />
        </Group>
      </Box>

      <TextInput
        placeholder={t('searchPublicCoursesPlaceholder', { ns: 'dashboard', defaultValue: 'Search courses by title or description...' })}
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.currentTarget.value)}
        icon={<IconSearch size={16} />}
        mb="xl"
      />

      {filteredCourses.length === 0 && !loading ? (
        <Paper withBorder radius="md" p="xl" mt="xl" bg={theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0]}>
          <Stack align="center" spacing="md" py="xl">
            <IconBooks size={60} color={theme.colors.gray[6]} stroke={1.5} />
            <Title order={3} align="center">
              {searchQuery 
                ? t('noSearchResults', { ns: 'dashboard', defaultValue: 'No courses match your search.' }) 
                : t('noPublicCourses', { ns: 'dashboard', defaultValue: 'There are no public courses available at the moment.' })}
            </Title>
            <Text color="dimmed" size="sm" align="center">
              {searchQuery 
                ? t('tryDifferentKeywords', { ns: 'dashboard', defaultValue: 'Try searching with different keywords.' }) 
                : t('checkBackLater', { ns: 'dashboard', defaultValue: 'Please check back later for new content.' })}
            </Text>
          </Stack>
        </Paper>
      ) : (
        <Grid gutter="xl">
          {filteredCourses.map((course) => (
            <Grid.Col key={course.course_id} sm={6} md={4} lg={4}>
              <Card 
                shadow="sm" 
                p="lg" 
                radius="md" 
                withBorder
                style={{ display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}
                onClick={() => navigate(`/dashboard/courses/${course.course_id}`)}
                sx={{
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows.lg,
                  },
                }}
              >
                <Card.Section>
                  <Image src={course.image_url || PlaceGolderImage} height={180} alt={course.title} />
                </Card.Section>

                <Title order={3} mt="md" mb="xs">
                  {course.title}
                </Title>

                <Group position="apart" mb="md" noWrap>
                  <Group spacing="xs" noWrap>
                    <IconUser size={14} color={theme.colors.gray[6]} />
                    <Text size="xs" color="dimmed">
                      {t('byAuthor', { ns: 'dashboard', defaultValue: 'By' })}{' '}
                      <Text component="span" weight={700} style={{ color: 'var(--mantine-color-text)' }}>
                        {course.user_name}
                      </Text>
                    </Text>
                  </Group>
                  {user?.is_admin && (
                    <Group spacing={4}>
                      <ActionIcon 
                        size="sm"
                        color="blue"
                        variant="subtle"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRename(course);
                        }}
                        title={t('renameCourseTooltip')}
                      >
                        <IconPencil size={14} />
                      </ActionIcon>
                      <ActionIcon 
                        size="sm"
                        color="red"
                        variant="subtle"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(course.course_id);
                        }}
                        title={t('deleteCourseTooltip')}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  )}
                </Group>

                <Text size="sm" color="dimmed"  lineClamp={5} mb="md" sx={{
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
      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={t('deleteModal.title')}
        centered
      >
        <Text>{t('deleteModal.message', { title: courses.find(c => c.course_id === courseToDeleteId)?.title || '' })}</Text>
        <Group position="right" mt="md">
          <Button 
            variant="default" 
            onClick={() => {
              setDeleteModalOpen(false);
              setCourseToDeleteId(null);
            }}
          >
            {t('deleteModal.cancelButton')}
          </Button>
          <Button 
            color="red" 
            onClick={confirmDeleteHandler}
            leftIcon={<IconTrash size={rem(16)} />}
          >
            {t('deleteModal.confirmButton')}
          </Button>
        </Group>
      </Modal>

      {/* Rename Modal */}
      <Modal
        opened={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        title={t('renameModal.title')}
        centered
      >
        <Stack spacing="md">
          <TextInput
            label={t('renameModal.titleLabel')}
            placeholder={t('renameModal.titlePlaceholder')}
            value={newTitle}
            onChange={(event) => setNewTitle(event.currentTarget.value)}
          />
          <Textarea
            label={t('renameModal.descriptionLabel')}
            value={newDescription}
            onChange={(event) => setNewDescription(event.currentTarget.value)}
            autosize
            minRows={3}
            maxRows={6}
            mt="md"
          />

          <Switch
            mt="lg"
            checked={isPublic}
            onChange={(event) => setIsPublic(event.currentTarget.checked)}
            label={t('renameModal.publicLabel', { defaultValue: 'Make course public' })}
            description={t('renameModal.publicDescription', { defaultValue: 'Public courses can be viewed by anyone.' })}
            thumbIcon={
              isPublic ? (
                <IconWorld size={12} color={theme.colors.teal[6]} stroke={3} />
              ) : (
                <IconX size={12} color={theme.colors.red[6]} stroke={3} />
              )
            }
          />

          <Group position="right" mt="md">
            <Button variant="default" onClick={() => setRenameModalOpen(false)}>
              {t('renameModal.cancelButton')}
            </Button>
            <Button color="teal" onClick={confirmRenameHandler}>
              {t('renameModal.saveButton')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

export default PublicCourses;
