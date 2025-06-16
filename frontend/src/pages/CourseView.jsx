import { useOutletContext, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Title,
  Text,
  Group,
  Progress,
  Badge,
  Button,
  ThemeIcon,
  Paper,
  Grid,
  Divider,
  Accordion
} from '@mantine/core';
import {
  IconCircleCheck,
  IconClock,
  IconFile,
  IconQuestionMark
} from '@tabler/icons-react';

function CourseView() {
  const { t } = useTranslation('courseView');
  const { course, chapters } = useOutletContext();

  // This check is important because the context might not be ready on the first render
  if (!course || !chapters) {
    return null; // Or a loading spinner, but CourseLayout already handles this
  }

  const completedChapters = chapters.filter(c => c.is_completed).length;
  const totalChapters = chapters.length;
  const progress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  return (
    <Container my="md">
      {/* Hero Card */}
      <Grid gutter="xl">
        <Grid.Col md={8}>
          <Title order={2} mb="xs">{course.name}</Title>
          <Text c="dimmed" mb="lg">{course.description}</Text>
        </Grid.Col>
        <Grid.Col md={4}>
          <Paper withBorder p="md" radius="md">
            <Group position="apart">
              <Text size="lg" weight={500}>{t('progress.title', 'Progress')}</Text>
              <Badge size="lg" variant="filled" color={progress === 100 ? 'green' : 'blue'}>
                {progress}%
              </Badge>
            </Group>
            <Progress value={progress} mt="sm" size="lg" radius="xl" />
            <Text size="sm" c="dimmed" mt="xs">
              {t('progress.completedChapters', {
                defaultValue: '{{completed}} of {{total}} chapters completed',
                completed: completedChapters,
                total: totalChapters
              })}
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>

      <Divider my="xl" />

      {/* Chapters List */}
      <Title order={3} mb="lg">{t('chapters.title', 'Chapters')}</Title>
      <Accordion variant="separated">
        {chapters.map((chapter) => (
          <Accordion.Item key={chapter.id} value={String(chapter.id)}>
            <Accordion.Control>
              <Group position="apart">
                <Text>{chapter.name}</Text>
                {chapter.is_completed ? (
                  <ThemeIcon color="green" variant="light" size="sm">
                    <IconCircleCheck size={16} />
                  </ThemeIcon>
                ) : (
                  <Group spacing="xs">
                    <ThemeIcon color="gray" variant="light" size="sm">
                      <IconClock size={16} />
                    </ThemeIcon>
                    {chapter.estimated_time_in_minutes &&
                      <Text size="xs" color="dimmed">{t('chapters.estimatedTime', {
                        defaultValue: '{{minutes}} min',
                        minutes: chapter.estimated_time_in_minutes
                      })}</Text>
                    }
                  </Group>
                )}
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Text size="sm" color="dimmed" mb="md">{chapter.summary || t('chapters.defaultSummaryText', 'No summary available.')}</Text>
              <Button component={Link} to={`/dashboard/courses/${course.id}/chapters/${chapter.id}`} variant="light" mr="md">
                <Group>
                  <IconFile size={16} />
                  <Text size="sm">{t('buttons.viewContent', 'View Content')}</Text>
                </Group>
              </Button>
              <Button component={Link} to={`/dashboard/courses/${course.id}/chapters/${chapter.id}/quiz`} variant="light">
                <Group>
                  <IconQuestionMark size={16} />
                  <Text size="sm">{t('buttons.startQuiz', 'Start Quiz')}</Text>
                </Group>
              </Button>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Container>
  );
}


export default CourseView;