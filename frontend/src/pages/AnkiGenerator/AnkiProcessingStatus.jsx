// /frontend/src/pages/AnkiGenerator/AnkiProcessingStatus.jsx

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Paper,
  Button,
  Group,
  Stack,
  Alert,
  Progress,
  Timeline,
  ThemeIcon,
  Badge,
  Grid,
  Card,
  ActionIcon,
  Modal,
  Code,
  Loader,
  Divider,
  List,
  ScrollArea,
} from '@mantine/core';
import {
  IconCheck,
  IconX,
  IconClock,
  IconDownload,
  IconRefresh,
  IconArrowLeft,
  IconFileExport,
  IconBrain,
  IconCards,
  IconUpload,
  IconSparkles,
  IconAlertCircle,
  IconInfoCircle,
  IconPlayerStop,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { ankiService } from '../../api/ankiService';

const AnkiProcessingStatus = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  // State management
  const [taskStatus, setTaskStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canceling, setCanceling] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  // Polling interval reference
  const pollIntervalRef = useRef(null);

  // Fetch task status
  const fetchTaskStatus = async () => {
    try {
      const status = await ankiService.getTaskStatus(taskId);
      setTaskStatus(status);
      setError(null);

      // Stop polling if task is complete or failed
      if (status.status === 'completed' || status.status === 'failed' || status.status === 'cancelled') {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      }
    } catch (error) {
      console.error('Error fetching task status:', error);
      setError(error.message);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    } finally {
      setLoading(false);
    }
  };

  // Start polling for status updates
  useEffect(() => {
    if (taskId) {
      // Initial fetch
      fetchTaskStatus();

      // Set up polling for active tasks
      pollIntervalRef.current = setInterval(fetchTaskStatus, 2000); // Poll every 2 seconds

      // Cleanup on unmount
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [taskId]);

  // Handle download
  const handleDownload = async () => {
    try {
      const blob = await ankiService.downloadAnkiDeck(taskId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${taskStatus.title || 'anki-deck'}.apkg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      notifications.show({
        title: 'Download Started',
        message: 'Your Anki deck is being downloaded',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: 'Download Failed',
        message: error.message || 'Failed to download Anki deck',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  // Handle cancel task
  const handleCancel = async () => {
    try {
      setCanceling(true);
      await ankiService.cancelTask(taskId);

      notifications.show({
        title: 'Task Cancelled',
        message: 'Processing has been cancelled',
        color: 'orange',
        icon: <IconPlayerStop size={16} />,
      });

      // Refresh status
      await fetchTaskStatus();
    } catch (error) {
      notifications.show({
        title: 'Cancel Failed',
        message: error.message || 'Failed to cancel task',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setCanceling(false);
    }
  };

  // Handle retry task
  const handleRetry = async () => {
    try {
      setRetrying(true);
      const newTask = await ankiService.retryTask(taskId);

      notifications.show({
        title: 'Task Restarted',
        message: 'Processing has been restarted',
        color: 'blue',
        icon: <IconRefresh size={16} />,
      });

      // Navigate to new task
      navigate(`/dashboard/anki-generator/processing/${newTask.task_id}`);
    } catch (error) {
      notifications.show({
        title: 'Retry Failed',
        message: error.message || 'Failed to retry task',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setRetrying(false);
    }
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'gray', icon: <IconClock size={16} />, label: 'Pending' };
      case 'processing':
        return { color: 'blue', icon: <Loader size={16} />, label: 'Processing' };
      case 'completed':
        return { color: 'green', icon: <IconCheck size={16} />, label: 'Completed' };
      case 'failed':
        return { color: 'red', icon: <IconX size={16} />, label: 'Failed' };
      case 'cancelled':
        return { color: 'orange', icon: <IconPlayerStop size={16} />, label: 'Cancelled' };
      default:
        return { color: 'gray', icon: <IconClock size={16} />, label: 'Unknown' };
    }
  };

  // Get processing step info
  const getStepInfo = (step, isCompleted = false, isFailed = false, stepDetails = null) => {
    const steps = {
      'analyzing': { icon: <IconBrain size={16} />, label: 'Analyzing PDF', description: 'Reading and understanding content' },
      'extracting': { icon: <IconSparkles size={16} />, label: 'Extracting Content', description: 'Identifying key concepts' },
      'generating': { icon: <IconCards size={16} />, label: 'Generating Cards', description: 'Creating flashcards' },
      'packaging': { icon: <IconFileExport size={16} />, label: 'Packaging Deck', description: 'Building Anki file' },
      'completed': { icon: <IconCheck size={16} />, label: 'Completed', description: 'Ready for download' },
    };

    const stepInfo = steps[step] || { icon: <IconClock size={16} />, label: step, description: '' };

    switch (step) {
      case 'generating': {
        const chunkInfo = stepDetails?.chunks_total ? 
          ` (${stepDetails.chunks_completed || 0}/${stepDetails.chunks_total} chunks)` : '';
        return {
          icon: <IconBrain size={16} />,
          label: `Generating Questions${chunkInfo}`,
          description: stepDetails?.chunks_total ? 
            `Processing document chunks and creating questions (${stepDetails.questions_generated || 0} questions so far)` :
            'Creating flashcard questions from your content',
          color: isCompleted ? 'green' : (isFailed ? 'red' : 'blue')
        };
      }
      default:
        return {
          ...stepInfo,
          color: isCompleted ? 'green' : (isFailed ? 'red' : 'blue')
        };
    }
  };

  if (loading && !taskStatus) {
    return (
      <Container size="lg" py="xl">
        <Stack align="center" spacing="lg">
          <Loader size="lg" />
          <Text>Loading task status...</Text>
        </Stack>
      </Container>
    );
  }

  if (error && !taskStatus) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error Loading Task">
          <Text mb="md">{error}</Text>
          <Group>
            <Button variant="outline" onClick={() => navigate('/dashboard/anki-generator')}>
              Back to Generator
            </Button>
            <Button onClick={fetchTaskStatus} leftIcon={<IconRefresh size={16} />}>
              Retry
            </Button>
          </Group>
        </Alert>
      </Container>
    );
  }

  const statusInfo = getStatusInfo(taskStatus?.status);

  return (
    <Container size="lg" py="xl">
      {/* Header */}
      <Stack spacing="lg" mb="xl">
        <Group position="apart">
          <div>
            <Group spacing="sm" mb="xs">
              <ActionIcon
                variant="subtle"
                onClick={() => navigate('/dashboard/anki-generator')}
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
              <Title order={1} size="h2">
                Processing Status
              </Title>
            </Group>
            <Text color="dimmed" size="lg">
              {taskStatus?.title || 'Anki Deck Generation'}
            </Text>
          </div>
          <Badge
            color={statusInfo.color}
            variant="light"
            size="lg"
            leftSection={statusInfo.icon}
          >
            {statusInfo.label}
          </Badge>
        </Group>
      </Stack>

      {/* Main content */}
      <Grid>
        <Grid.Col xs={12} md={8}>
          {/* Progress section */}
          <Paper withBorder p="lg" mb="lg">
            <Stack spacing="md">
              <Group position="apart">
                <Text weight={600} size="lg">Processing Progress</Text>
                {taskStatus?.progress_percentage !== undefined && (
                  <Text color="dimmed">{taskStatus.progress_percentage}%</Text>
                )}
              </Group>

              {taskStatus?.progress_percentage !== undefined && (
                <Progress
                  value={taskStatus.progress_percentage}
                  color={statusInfo.color}
                  size="lg"
                  striped={taskStatus.status === 'processing'}
                  animate={taskStatus.status === 'processing'}
                />
              )}

              {/* Enhanced chunk processing progress */}
              {taskStatus?.step_details && taskStatus.step_details.chunks_total && (
                <Stack spacing="xs">
                  <Group position="apart">
                    <Text size="sm">Processing chunks</Text>
                    <Text size="sm" color="dimmed">
                      {taskStatus.step_details.chunks_completed || 0} / {taskStatus.step_details.chunks_total}
                    </Text>
                  </Group>
                  <Progress 
                    value={Math.min(100, (taskStatus.step_details.chunks_completed / taskStatus.step_details.chunks_total) * 100)}
                    size="sm"
                    color="blue"
                  />
                  
                  <Group position="apart">
                    <Text size="sm">Questions generated</Text>
                    <Text size="sm" color="dimmed">
                      {taskStatus.step_details.questions_generated || 0} / {taskStatus.step_details.estimated_questions || 0}
                    </Text>
                  </Group>
                  
                  {taskStatus.estimated_time_remaining && (
                    <Text size="xs" color="dimmed" align="center">
                      Estimated time remaining: {taskStatus.estimated_time_remaining}
                    </Text>
                  )}
                </Stack>
              )}


              {taskStatus?.current_step && (
                <Alert
                  icon={getStepInfo(taskStatus.current_step, true, false, taskStatus.step_details).icon}
                  color="blue"
                  variant="light"
                >
                  <Text weight={500}>{getStepInfo(taskStatus.current_step, true, false, taskStatus.step_details).label}</Text>
                  <Text size="sm" color="dimmed">
                    {getStepInfo(taskStatus.current_step, true, false, taskStatus.step_details).description}
                  </Text>
                </Alert>
              )}
            </Stack>
          </Paper>

          {/* Processing steps timeline */}
          <Paper withBorder p="lg" mb="lg">
            <Text weight={600} size="lg" mb="md">Processing Steps</Text>
            <Timeline active={taskStatus?.completed_steps?.length || 0} bulletSize={24} lineWidth={2}>
              {['analyzing', 'extracting', 'generating', 'packaging'].map((step) => {
                const stepInfo = getStepInfo(
                  step,
                  taskStatus?.current_step === step,
                  taskStatus?.completed_steps?.includes(step)
                );

                return (
                  <Timeline.Item
                    key={step}
                    bullet={
                      <ThemeIcon color={stepInfo.color} size={24} radius="xl">
                        {stepInfo.icon}
                      </ThemeIcon>
                    }
                    title={stepInfo.label}
                  >
                    <Text color="dimmed" size="sm">
                      {stepInfo.description}
                    </Text>
                    {taskStatus?.step_details?.[step] && (
                      <Text size="xs" color="dimmed" mt="xs">
                        {taskStatus.step_details[step]}
                      </Text>
                    )}
                  </Timeline.Item>
                );
              })}
            </Timeline>

            {/* Activity Feed */}
            {taskStatus?.activity_log && taskStatus.activity_log.length > 0 && (
              <Paper p="md" withBorder>
                <Group position="apart" mb="sm">
                  <Text weight={500} size="sm">Processing Activity</Text>
                  <Badge size="xs" variant="light">
                    {taskStatus.activity_log.length} events
                  </Badge>
                </Group>
                
                <ScrollArea h={150}>
                  <Stack spacing={4}>
                    {taskStatus.activity_log.slice().reverse().map((activity, index) => (
                      <Group key={index} spacing="xs" noWrap>
                        <Text size="xs" color="dimmed" style={{ minWidth: '50px' }}>
                          {activity.timestamp}
                        </Text>
                        <Text size="xs">{activity.message}</Text>
                      </Group>
                    ))}
                  </Stack>
                </ScrollArea>
              </Paper>
            )}
          </Paper>

          {/* Error details */}
          {taskStatus?.status === 'failed' && taskStatus?.error_message && (
            <Paper withBorder p="lg" mb="lg">
              <Alert icon={<IconAlertCircle size={16} />} color="red" title="Processing Failed">
                <Text mb="md">{taskStatus.error_message}</Text>
                {taskStatus.error_details && (
                  <Code block>{taskStatus.error_details}</Code>
                )}
              </Alert>
            </Paper>
          )}
        </Grid.Col>

        <Grid.Col xs={12} md={4}>
          {/* Task details */}
          <Paper withBorder p="lg" mb="lg">
            <Text weight={600} mb="md">Task Details</Text>
            <Stack spacing="sm">
              <Group position="apart">
                <Text size="sm" color="dimmed">Type</Text>
                <Badge color={taskStatus?.type === 'testing' ? 'blue' : 'green'} variant="light">
                  {taskStatus?.type === 'testing' ? 'Testing' : 'Learning'}
                </Badge>
              </Group>
              <Group position="apart">
                <Text size="sm" color="dimmed">Started</Text>
                <Text size="sm">
                  {taskStatus?.started_at ? new Date(taskStatus.started_at).toLocaleString() : 'N/A'}
                </Text>
              </Group>
              {taskStatus?.completed_at && (
                <Group position="apart">
                  <Text size="sm" color="dimmed">Completed</Text>
                  <Text size="sm">
                    {new Date(taskStatus.completed_at).toLocaleString()}
                  </Text>
                </Group>
              )}
              {taskStatus?.estimated_cards && (
                <Group position="apart">
                  <Text size="sm" color="dimmed">Est. Cards</Text>
                  <Text size="sm">{taskStatus.estimated_cards}</Text>
                </Group>
              )}
              
              {/* Processing Statistics */}
              {taskStatus?.stats && (
                <>
                  <Divider />
                  <Text size="sm" weight={500} color="dimmed">Processing Stats</Text>
                  
                  {taskStatus.stats.processing_speed && (
                    <Group position="apart">
                      <Text size="sm" color="dimmed">Speed</Text>
                      <Text size="sm">{taskStatus.stats.processing_speed}</Text>
                    </Group>
                  )}
                  
                  {taskStatus.stats.questions_generated && (
                    <Group position="apart">
                      <Text size="sm" color="dimmed">Generated</Text>
                      <Text size="sm">{taskStatus.stats.questions_generated} questions</Text>
                    </Group>
                  )}
                  
                  {taskStatus.stats.chunks_total && (
                    <Group position="apart">
                      <Text size="sm" color="dimmed">Text Chunks</Text>
                      <Text size="sm">{taskStatus.stats.chunks_completed || 0}/{taskStatus.stats.chunks_total}</Text>
                    </Group>
                  )}
                </>
              )}
            </Stack>
          </Paper>

          {/* Actions */}
          <Paper withBorder p="lg">
            <Text weight={600} mb="md">Actions</Text>
            <Stack spacing="sm">
              {taskStatus?.status === 'completed' && (
                <Button
                  fullWidth
                  leftIcon={<IconDownload size={16} />}
                  onClick={handleDownload}
                  color="green"
                >
                  Download Anki Deck
                </Button>
              )}

              {taskStatus?.status === 'processing' && (
                <Button
                  fullWidth
                  variant="outline"
                  color="orange"
                  leftIcon={<IconPlayerStop size={16} />}
                  onClick={handleCancel}
                  loading={canceling}
                >
                  Cancel Processing
                </Button>
              )}

              {(taskStatus?.status === 'failed' || taskStatus?.status === 'cancelled') && (
                <Button
                  fullWidth
                  variant="outline"
                  leftIcon={<IconRefresh size={16} />}
                  onClick={handleRetry}
                  loading={retrying}
                >
                  Retry Processing
                </Button>
              )}

              <Button
                fullWidth
                variant="subtle"
                leftIcon={<IconArrowLeft size={16} />}
                onClick={() => navigate('/dashboard/anki-generator')}
              >
                Back to Generator
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Download info modal */}
      <Modal
        opened={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        title="Download Instructions"
        size="md"
      >
        <Stack spacing="md">
          <Text>
            Your Anki deck has been generated successfully! Here's how to use it:
          </Text>

          <List spacing="sm" size="sm">
            <List.Item>Download the <Code>.apkg</Code> file</List.Item>
            <List.Item>Open Anki on your computer or mobile device</List.Item>
            <List.Item>Go to File → Import (or use Ctrl+Shift+I)</List.Item>
            <List.Item>Select the downloaded <Code>.apkg</Code> file</List.Item>
            <List.Item>Start studying your new flashcard deck!</List.Item>
          </List>

          <Divider />

          <Group position="right">
            <Button variant="outline" onClick={() => setDownloadModalOpen(false)}>
              Close
            </Button>
            <Button leftIcon={<IconDownload size={16} />} onClick={handleDownload}>
              Download Now
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default AnkiProcessingStatus;