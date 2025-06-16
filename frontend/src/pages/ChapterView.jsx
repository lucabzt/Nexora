import { useState } from 'react';
import { useOutletContext, useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Button,
  ActionIcon,
  Alert,
  Divider,
} from '@mantine/core';
import {
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconQuestionMark,
  IconMessageChatbot,
  IconAlertCircle
} from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { courseService } from '../api/courseService';
import { useToolbar } from '../contexts/ToolbarContext';
import AiCodeWrapper from '../components/AiCodeWrapper';

function ChapterView() {
  const { t } = useTranslation(['chapterView', 'toolbar']);
  const { course: _course, chapters } = useOutletContext();
  const { courseId, chapterId } = useParams();
  const navigate = useNavigate();
  const { setToolbarOpen, setActiveTab } = useToolbar();

  const [markingComplete, setMarkingComplete] = useState(false);

  const chapterIndex = chapters.findIndex(c => String(c.id) === chapterId);
  const currentChapter = chapters[chapterIndex];
  const prevChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1] : null;

  if (!currentChapter) {
    return (
      <Container>
        <Alert icon={<IconAlertCircle size={16} />} title={t('errors.chapterNotFoundTitle')} color="red">
          {t('errors.chapterNotFoundMessage')}
        </Alert>
      </Container>
    );
  }

  const handleMarkComplete = async () => {
    try {
      setMarkingComplete(true);
      await courseService.markChapterComplete(courseId, chapterId);
      toast.success(t('toast.markedCompleteSuccess'));
      // Navigate to the next chapter if it exists, otherwise back to the course view
      if (nextChapter) {
        navigate(`/dashboard/courses/${courseId}/chapters/${nextChapter.id}`);
      } else {
        navigate(`/dashboard/courses/${courseId}`);
      }
    } catch (error) {
      toast.error(t('toast.markedCompleteError'));
      console.error('Error marking chapter complete:', error);
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleOpenChat = () => {
    // The key 'chat' is assumed. It might need to be imported from a constants file if available.
    setActiveTab('chat'); 
    setToolbarOpen(true);
  };

  return (
    <Container my="md">
      <Title order={2} mb="lg">{currentChapter.name}</Title>

      <Paper withBorder p="xl" mb="xl">
        <AiCodeWrapper>{currentChapter.content || t('noContent')}</AiCodeWrapper>
      </Paper>

      <Group position="apart" mb="xl">
        <Button
          component={Link}
          to={`/dashboard/courses/${courseId}/chapters/${chapterId}/quiz`}
          variant="outline"
          leftIcon={<IconQuestionMark size={16} />}
        >
          {t('buttons.goToQuiz', 'Go to Quiz')}
        </Button>

        <Button
          onClick={handleMarkComplete}
          loading={markingComplete}
          color="green"
          leftIcon={<IconCircleCheck size={16} />}
        >
          {t('buttons.markComplete', 'Mark as Complete')}
        </Button>
      </Group>

      <Divider my="lg" />

      {/* Navigation Buttons */}
      <Group position="apart">
        <Button
          component={Link}
          to={prevChapter ? `/dashboard/courses/${courseId}/chapters/${prevChapter.id}` : '#'}
          disabled={!prevChapter}
          variant="default"
          leftIcon={<IconChevronLeft size={16} />}
        >
          {t('buttons.previousChapter', 'Previous Chapter')}
        </Button>
        <Button
          component={Link}
          to={nextChapter ? `/dashboard/courses/${courseId}/chapters/${nextChapter.id}` : '#'}
          disabled={!nextChapter}
          variant="default"
          rightIcon={<IconChevronRight size={16} />}
        >
          {t('buttons.nextChapter', 'Next Chapter')}
        </Button>
      </Group>

      {/* Floating Chat Button */}
      <ActionIcon
        size="xl"
        radius="xl"
        variant="filled"
        color="blue"
        onClick={handleOpenChat}
        sx={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 100,
        }}
      >
        <IconMessageChatbot size={28} />
      </ActionIcon>
    </Container>
  );
}

export default ChapterView;