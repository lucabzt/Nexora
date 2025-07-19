// /frontend/src/pages/AnkiGenerator/AnkiGeneratorDashboard.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Paper,
  Button,
  Group,
  Stack,
  Alert,
  Loader,
  Grid,
  Card,
  Badge,
  ThemeIcon,
  FileInput,
  Select,
  TextInput,
  Textarea,
  Stepper,
  Box,
  Divider,
  Progress,
  ActionIcon,
  Modal,
  List,
  Code,
  Notification,
} from '@mantine/core';
import {
  IconFileExport,
  IconUpload,
  IconFileText,
  IconBrain,
  IconCards,
  IconDownload,
  IconX,
  IconCheck,
  IconAlertCircle,
  IconInfoCircle,
  IconSparkles,
  IconBookmarks,
  IconPhoto,
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { ankiService } from '../../api/ankiService';

const AnkiGeneratorDashboard = () => {
  const navigate = useNavigate();

  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // Form for configuration
  const form = useForm({
    initialValues: {
      type: 'testing', // 'testing' or 'learning'
      title: '',
      description: '',
      difficulty: 'medium',
      chapterMode: 'auto', // 'auto' or 'manual'
      slidesPerChapter: '5',
    },
    validate: {
      title: (value) => !value ? 'Title is required' : null,
      type: (value) => !value ? 'Please select a flashcard type' : null,
    },
  });

  // File upload handlers
  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      notifications.show({
        title: 'Invalid File',
        message: 'Please select a PDF file',
        color: 'red',
        icon: <IconX size={16} />,
      });
      return;
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      notifications.show({
        title: 'File Too Large',
        message: 'Please select a PDF file smaller than 50MB',
        color: 'red',
        icon: <IconX size={16} />,
      });
      return;
    }

    try {
      setProcessing(true);
      const documentData = await ankiService.uploadDocument(file);
      setUploadedFile(documentData);

      // Auto-fill title from filename if not already set
      if (!form.values.title) {
        const titleFromFile = file.name.replace('.pdf', '').replace(/[_-]/g, ' ');
        form.setFieldValue('title', titleFromFile);
      }

      setActiveStep(1);

      notifications.show({
        title: 'Upload Successful',
        message: 'PDF uploaded successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: 'Upload Failed',
        message: error.message || 'Failed to upload PDF',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setProcessing(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file =>
      file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')
    );

    if (pdfFile) {
      handleFileUpload(pdfFile);
    } else {
      notifications.show({
        title: 'Invalid File',
        message: 'Please drop a PDF file',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  // Generate summary
  const handleGenerateSummary = async () => {
    if (!uploadedFile || !form.isValid()) return;

    try {
      setProcessing(true);
      const summaryData = await ankiService.generateSummary({
        document_id: uploadedFile.id,
        type: form.values.type,
        title: form.values.title,
        description: form.values.description,
        difficulty: form.values.difficulty,
        chapter_mode: form.values.chapterMode,
        slides_per_chapter: parseInt(form.values.slidesPerChapter),
      });

      setSummary(summaryData);
      setActiveStep(2);
    } catch (error) {
      notifications.show({
        title: 'Analysis Failed',
        message: error.message || 'Failed to analyze PDF',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setProcessing(false);
    }
  };

  // Start processing
  const handleStartProcessing = async () => {
    if (!uploadedFile || !summary) return;

    try {
      setProcessing(true);
      const result = await ankiService.generateAnkiDeck({
        document_id: uploadedFile.id,
        type: form.values.type,
        title: form.values.title,
        description: form.values.description,
        difficulty: form.values.difficulty,
        chapter_mode: form.values.chapterMode,
        slides_per_chapter: parseInt(form.values.slidesPerChapter),
      });

      // Navigate to processing status page
      navigate(`/dashboard/anki-generator/processing/${result.task_id}`);
    } catch (error) {
      notifications.show({
        title: 'Processing Failed',
        message: error.message || 'Failed to start processing',
        color: 'red',
        icon: <IconX size={16} />,
      });
      setProcessing(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setActiveStep(0);
    setUploadedFile(null);
    setSummary(null);
    setProcessing(false);
    form.reset();
  };

  return (
    <Container size="lg" py="xl">
      {/* Header */}
      <Stack spacing="lg" mb="xl">
        <Group position="apart">
          <div>
            <Title order={1} size="h2" mb="xs">
              <Group spacing="sm">
                <ThemeIcon size="lg" variant="gradient" gradient={{ from: 'violet', to: 'blue' }}>
                  <IconFileExport size={24} />
                </ThemeIcon>
                Anki Generator
              </Group>
            </Title>
            <Text color="dimmed" size="lg">
              Transform your PDFs into study-ready Anki flashcards
            </Text>
          </div>
          <Button
            variant="light"
            leftIcon={<IconInfoCircle size={16} />}
            onClick={() => setHelpModalOpen(true)}
          >
            How it works
          </Button>
        </Group>

        {/* Feature cards */}
        <Grid>
          <Grid.Col xs={12} sm={6}>
            <Card withBorder padding="lg" h="100%">
              <Group spacing="sm" mb="sm">
                <ThemeIcon color="blue" variant="light">
                  <IconBrain size={20} />
                </ThemeIcon>
                <Text weight={600}>Testing Mode</Text>
              </Group>
              <Text size="sm" color="dimmed">
                Generate multiple-choice questions perfect for exam preparation and knowledge testing
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col xs={12} sm={6}>
            <Card withBorder padding="lg" h="100%">
              <Group spacing="sm" mb="sm">
                <ThemeIcon color="green" variant="light">
                  <IconPhoto size={20} />
                </ThemeIcon>
                <Text weight={600}>Learning Mode</Text>
              </Group>
              <Text size="sm" color="dimmed">
                Create image-based flashcards organized by chapters for visual learning
              </Text>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Stepper */}
      <Paper withBorder p="lg" mb="xl">
        <Stepper active={activeStep} onStepClick={setActiveStep} allowNextStepsSelect={false}>
          <Stepper.Step
            label="Upload"
            description="Upload your PDF file"
            icon={<IconUpload size={18} />}
          >
            <Stack spacing="md" mt="md">
              {/* File upload area */}
              <Paper
                withBorder
                p="xl"
                style={{
                  borderStyle: 'dashed',
                  borderColor: isDragging ? '#228be6' : '#ced4da',
                  backgroundColor: isDragging ? '#f8f9fa' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Stack spacing="md" align="center">
                  <ThemeIcon size={60} variant="light" color="blue">
                    <IconFileText size={30} />
                  </ThemeIcon>
                  <div style={{ textAlign: 'center' }}>
                    <Text size="lg" weight={500} mb="xs">
                      {isDragging ? 'Drop your PDF here' : 'Upload your PDF file'}
                    </Text>
                    <Text size="sm" color="dimmed" mb="md">
                      Drag and drop or click to browse • PDF files only • Max 50MB
                    </Text>
                  </div>
                  <FileInput
                    placeholder="Choose PDF file"
                    accept=".pdf"
                    icon={<IconUpload size={16} />}
                    onChange={handleFileUpload}
                    disabled={processing}
                    styles={{ input: { display: 'none' } }}
                  />
                  <Button
                    variant="light"
                    leftIcon={<IconUpload size={16} />}
                    loading={processing}
                    onClick={() => document.querySelector('input[type="file"]').click()}
                  >
                    Choose PDF File
                  </Button>
                </Stack>
              </Paper>

              {uploadedFile && (
                <Alert icon={<IconCheck size={16} />} color="green" variant="light">
                  <Text weight={500}>File uploaded successfully!</Text>
                  <Text size="sm" color="dimmed">
                    {uploadedFile.filename} ({Math.round(uploadedFile.size / 1024)} KB)
                  </Text>
                </Alert>
              )}
            </Stack>
          </Stepper.Step>

          <Stepper.Step
            label="Configure"
            description="Set up your flashcards"
            icon={<IconCards size={18} />}
          >
            <Stack spacing="md" mt="md">
              <Grid>
                <Grid.Col xs={12} sm={6}>
                  <TextInput
                    label="Deck Title"
                    placeholder="Enter a title for your flashcard deck"
                    required
                    {...form.getInputProps('title')}
                  />
                </Grid.Col>
                <Grid.Col xs={12} sm={6}>
                  <Select
                    label="Flashcard Type"
                    placeholder="Choose flashcard type"
                    required
                    data={[
                      { value: 'testing', label: '🧠 Testing - Multiple Choice Questions' },
                      { value: 'learning', label: '📚 Learning - Image-based Cards' },
                    ]}
                    {...form.getInputProps('type')}
                  />
                </Grid.Col>
              </Grid>

              <Textarea
                label="Description (Optional)"
                placeholder="Add a description for your flashcard deck"
                minRows={2}
                {...form.getInputProps('description')}
              />

              <Grid>
                <Grid.Col xs={12} sm={6}>
                  <Select
                    label="Difficulty Level"
                    data={[
                      { value: 'easy', label: 'Easy' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'hard', label: 'Hard' },
                    ]}
                    {...form.getInputProps('difficulty')}
                  />
                </Grid.Col>
                <Grid.Col xs={12} sm={6}>
                  <Select
                    label="Chapter Detection"
                    data={[
                      { value: 'auto', label: 'Auto-detect chapters' },
                      { value: 'manual', label: 'Manual division' },
                    ]}
                    {...form.getInputProps('chapterMode')}
                  />
                </Grid.Col>
              </Grid>

              {form.values.chapterMode === 'manual' && (
                <Select
                  label="Pages per Chapter"
                  data={[
                    { value: '3', label: '3 pages' },
                    { value: '5', label: '5 pages' },
                    { value: '7', label: '7 pages' },
                    { value: '10', label: '10 pages' },
                  ]}
                  {...form.getInputProps('slidesPerChapter')}
                />
              )}

              <Group position="right" mt="md">
                <Button
                  variant="outline"
                  onClick={handleReset}
                >
                  Reset
                </Button>
                <Button
                  onClick={handleGenerateSummary}
                  loading={processing}
                  disabled={!uploadedFile || !form.isValid()}
                  leftIcon={<IconSparkles size={16} />}
                >
                  Analyze PDF
                </Button>
              </Group>
            </Stack>
          </Stepper.Step>

          <Stepper.Step
            label="Review"
            description="Review and generate"
            icon={<IconCheck size={18} />}
          >
            {summary && (
              <Stack spacing="md" mt="md">
                <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
                  <Text weight={500} mb="xs">Analysis Complete!</Text>
                  <Text size="sm">
                    Your PDF has been analyzed and is ready for flashcard generation.
                  </Text>
                </Alert>

                <Paper withBorder p="md">
                  <Grid>
                    <Grid.Col xs={12} sm={6}>
                      <Stack spacing="xs">
                        <Text size="sm" color="dimmed">Document</Text>
                        <Text weight={500}>{summary.title}</Text>
                      </Stack>
                    </Grid.Col>
                    <Grid.Col xs={12} sm={6}>
                      <Stack spacing="xs">
                        <Text size="sm" color="dimmed">Type</Text>
                        <Badge color={form.values.type === 'testing' ? 'blue' : 'green'}>
                          {form.values.type === 'testing' ? 'Testing Mode' : 'Learning Mode'}
                        </Badge>
                      </Stack>
                    </Grid.Col>
                    <Grid.Col xs={12} sm={6}>
                      <Stack spacing="xs">
                        <Text size="sm" color="dimmed">Estimated Chapters</Text>
                        <Text weight={500}>{summary.estimated_chapters}</Text>
                      </Stack>
                    </Grid.Col>
                    <Grid.Col xs={12} sm={6}>
                      <Stack spacing="xs">
                        <Text size="sm" color="dimmed">Estimated Cards</Text>
                        <Text weight={500}>{summary.estimated_cards}</Text>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                </Paper>

                <Group position="right" mt="md">
                  <Button
                    variant="outline"
                    onClick={() => setActiveStep(1)}
                  >
                    Back to Configure
                  </Button>
                  <Button
                    onClick={handleStartProcessing}
                    loading={processing}
                    leftIcon={<IconDownload size={16} />}
                    gradient={{ from: 'violet', to: 'blue' }}
                    variant="gradient"
                  >
                    Generate Anki Deck
                  </Button>
                </Group>
              </Stack>
            )}
          </Stepper.Step>
        </Stepper>
      </Paper>

      {/* Help Modal */}
      <Modal
        opened={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        title="How Anki Generator Works"
        size="lg"
      >
        <Stack spacing="md">
          <div>
            <Text weight={600} mb="xs">Step 1: Upload your PDF</Text>
            <Text size="sm" color="dimmed">
              Upload any PDF document containing educational content. The system supports files up to 50MB.
            </Text>
          </div>

          <div>
            <Text weight={600} mb="xs">Step 2: Choose your mode</Text>
            <List size="sm" spacing="xs">
              <List.Item>
                <Text><strong>Testing Mode:</strong> Generates multiple-choice questions for exam preparation</Text>
              </List.Item>
              <List.Item>
                <Text><strong>Learning Mode:</strong> Creates image-based flashcards organized by chapters</Text>
              </List.Item>
            </List>
          </div>

          <div>
            <Text weight={600} mb="xs">Step 3: AI Processing</Text>
            <Text size="sm" color="dimmed">
              Our AI analyzes your document, extracts key concepts, and generates high-quality flashcards optimized for learning.
            </Text>
          </div>

          <div>
            <Text weight={600} mb="xs">Step 4: Download & Study</Text>
            <Text size="sm" color="dimmed">
              Download your <Code>.apkg</Code> file and import it directly into Anki for immediate studying.
            </Text>
          </div>
        </Stack>
      </Modal>
    </Container>
  );
};

export default AnkiGeneratorDashboard;