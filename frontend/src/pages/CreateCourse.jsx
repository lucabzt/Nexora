import { useState, forwardRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Title, 
  Text, 
  Paper, 
  Stepper, 
  Button, 
  Group, 
  TextInput, 
  Textarea, 
  Select, 
  NumberInput, 
  Box, 
  FileInput, 
  Image, 
  List, 
  ThemeIcon, 
  Progress, 
  Stack, 
  useMantineTheme,
  LoadingOverlay,
  Center,
  RingProgress,
  Divider,
  Alert,
  Modal,
  Anchor,
  SimpleGrid,
  FileButton,
  Card,
  Slider,
  ActionIcon,

} from '@mantine/core';
import { 
  IconBook, 
  IconClock, 
  IconGlobe, 
  IconBrain, 
  IconUpload, 
  IconFile, 
  IconPhoto, 
  IconCheck, 
  IconArrowRight, 
  IconArrowLeft,
  IconSparkles,
  IconTarget,
  IconX,
  IconEdit,
  IconAlertCircle,
  IconFileText,
  IconSchool,
  IconRocket
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { toast } from 'react-toastify';
import { courseService } from '../api/courseService';
import ReactCountryFlag from 'react-country-flag';
import PremiumModal from '../components/PremiumModal';

const LanguageSelectItem = forwardRef(({ label, countryCode, ...others }, ref) => (
  <div ref={ref} {...others}>
    <Group noWrap>
      <ReactCountryFlag
        countryCode={countryCode}
        svg
        style={{ width: '1.5em', height: '1.5em' }}
        title={countryCode}
      />
      <Text size="sm">{label}</Text>
    </Group>
  </div>
));



function CreateCourse() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('createCourse');
  const theme = useMantineTheme();
  
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm({
    initialValues: {
      query: '',
      time_hours: 2,
      language: i18n.language,
      difficulty: '',
      documents: [],
      images: [],
    },
    validate: {
      query: (value) => (!value ? t('form.validation.topicRequired') : null),
      time_hours: (value) => (value <= 0 ? t('form.validation.timePositive') : null),
      difficulty: (value) => (!value ? t('form.validation.difficultyRequired') : null),
    },
  });

  const steps = [
    { 
      label: t('stepper.details.label') || 'Learning Goal', 
      description: t('stepper.details.description') || 'What do you want to learn?',
      icon: <IconBrain size={20} />,
      color: 'teal'
    },
    { 
      label: t('stepper.uploads.label') || 'Time Investment', 
      description: 'How much time to invest?',
      icon: <IconClock size={20} />,
      color: 'blue'
    },
    { 
      label: t('stepper.review.label') || 'Course Settings', 
      description: 'Difficulty and language',
      icon: <IconTarget size={20} />,
      color: 'cyan'
    },
    { 
      label: 'Review & Create', 
      description: 'Confirm your choices',
      icon: <IconCheck size={20} />,
      color: 'green'
    }
  ];

  const difficultyOptions = [
    { value: 'beginner', label: t('form.difficulty.options.beginner') || 'Beginner', description: 'New to this topic', icon: IconBook },
    { value: 'intermediate', label: t('form.difficulty.options.intermediate') || 'Intermediate', description: 'Some knowledge', icon: IconBrain },
    { value: 'advanced', label: t('form.difficulty.options.advanced') || 'Advanced', description: 'Experienced learner', icon: IconSparkles },
    { value: 'university', label: t('form.difficulty.options.university') || 'University', description: 'University level', icon: IconSchool }
  ];

  const languageOptions = [
    { value: 'en', label: t('form.language.options.english') || 'English', countryCode: 'US' },
    { value: 'de', label: t('form.language.options.german') || 'Deutsch', countryCode: 'DE' }
  ];

  const handleDocumentUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const documentData = await courseService.uploadDocument(file);
      setUploadedDocuments(prev => [...prev, documentData]);
      toast.success(t('toast.documentUploadSuccess', { fileName: file.name }));
      return documentData;
    } catch (err) {
      console.error('Error uploading document:', err);
      toast.error(t('toast.documentUploadError', { error: err.message || t('errors.unknown') }));
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const imageData = await courseService.uploadImage(file);
      setUploadedImages(prev => [...prev, imageData]);
      toast.success(t('toast.imageUploadSuccess', { fileName: file.name }));
      return imageData;
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error(t('toast.imageUploadError', { error: err.message || t('errors.unknown') }));
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const nextStep = () => {
    console.log('Next step clicked, current step:', activeStep, 'isValid:', isStepValid(activeStep), 'query length:', form.values.query.trim().length);
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const handleFileUpload = async (files, type) => {
    if (files && files.length > 0) {
      for (const file of files) {
        if (type === 'document') {
          await handleDocumentUpload(file);
        } else {
          await handleImageUpload(file);
        }
      }
      form.setFieldValue(type === 'document' ? 'documents' : 'images', 
        [...form.values[type === 'document' ? 'documents' : 'images'], ...files]);
    }
  };

  const removeFile = (index, type) => {
    if (type === 'document') {
      setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
    } else {
      setUploadedImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (form.validate().hasErrors) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const documentIds = uploadedDocuments.map(doc => doc.id);
      const imageIds = uploadedImages.map(img => img.id);

      const data = await courseService.createCourse({
        query: form.values.query,
        time_hours: form.values.time_hours,
        language: form.values.language,
        difficulty: form.values.difficulty,
        document_ids: documentIds,
        picture_ids: imageIds,
      });

      console.log('Course creation initiated:', data);
      navigate(`/dashboard/courses/${data.course_id}`);
      
    } catch (err) { 
      console.error('Error initiating course creation:', err);
      // Handle specific error cases
      
      if (err.response?.status === 429) {
        // Handle rate limiting or course limit errors
        const errorData = err.response?.data?.detail || {};
        console.log('Error data:', errorData);
        
        if (errorData.code === 'MAX_COURSE_CREATIONS_REACHED' || 
            errorData.code === 'MAX_PRESENT_COURSES_REACHED') {
          const errorMessage = t(`errors.${errorData.code === 'MAX_COURSE_CREATIONS_REACHED' ? 'maxCoursesCreated' : 'maxActiveCourses'}`, { limit: errorData.limit });
          console.log('Showing premium modal for error:', errorMessage);
          
          // Set limit reached state and show premium modal
          setIsLimitReached(true);
          setShowPremiumModal(true);
          console.log('showPremiumModal set to:', true, 'with limitReached: true');
          
          // Use setTimeout to ensure state update is processed
          setTimeout(() => {
            toast.error(errorMessage, {
              autoClose: 5000,
              onClose: () => {
                console.log('Toast closed');
                setIsSubmitting(false);
              }
            });
          }, 100);
          return;
        }
      }
      // Default error handling
      const errorMessage = err.response?.data?.message || err.response?.data?.detail || err.message || t('errors.unknown');
      setError(errorMessage);
      toast.error(errorMessage, {
        onClose: () => setIsSubmitting(false) // Reset loading state when toast is closed
      });
    }
  };


  const isStepValid = (step) => {
    switch (step) {
      case 0: return form.values.query.trim().length > 0;
      case 1: return form.values.time_hours > 0;
      case 2: return form.values.difficulty && form.values.language;
      case 3: return true;
      default: return false;
    }
  };

  // Step Content Components
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing="lg">
            <Box ta="center" mb="sm">
              <ThemeIcon 
                size={60} 
                radius="xl" 
                variant="gradient"
                gradient={{ from: 'teal', to: 'cyan' }}
                mb="sm"
              >
                <img 
                  src="/logo_white_mittig.png"
                  alt="Logo"
                  style={{ 
                    height: 28,
                    width: 'auto',
                    filter: 'drop-shadow(0 2px 4px rgba(139, 92, 246, 0.3))',
                  }}></img>
              </ThemeIcon>
              <Title order={3} mb="xs">{t('form.topic.label') || 'What would you like to learn?'}</Title>
              <Text color="dimmed" size="md">
                {t('form.topic.placeholder') || 'Describe your learning goal and upload any relevant materials'}
              </Text>
            </Box>

            <Textarea
              placeholder={t('form.topic.placeholder') || "I want to learn about React hooks and how to build modern web applications with functional components..."}
              required
              autosize
              minRows={3}
              maxRows={4}
              {...form.getInputProps('query')}
              styles={{
                input: {
                  fontSize: 14,
                  lineHeight: 1.5,
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: `2px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                  '&:focus': {
                    borderColor: theme.colors.teal[6],
                    boxShadow: `0 0 0 3px ${theme.colors.teal[6]}20`
                  }
                }
              }}
            />

            <Divider label={t('form.uploads.description') || "Optional: Add Learning Materials"} labelPosition="center" />

            <SimpleGrid cols={2} spacing="md">
              <FileButton
                onChange={(files) => handleFileUpload(files, 'document')}
                accept=".pdf,.doc,.docx,.txt"
                multiple
                disabled={isUploading || isSubmitting}
              >
                {(props) => (
                  <Card 
                    {...props}
                    p="md"
                    withBorder
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: isUploading ? 0.6 : 1,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows.md
                      }
                    }}
                  >
                    <Stack align="center" spacing="xs">
                      <ThemeIcon size={40} color="blue" variant="light" radius="xl">
                        <IconFile size={20} />
                      </ThemeIcon>
                      <Text weight={600} size="xs">{t('form.documents.label') || 'Upload Documents'}</Text>
                      <Text size="xs" color="dimmed" ta="center">
                        PDF, DOC, TXT files
                      </Text>
                    </Stack>
                  </Card>
                )}
              </FileButton>

              <FileButton
                onChange={(files) => handleFileUpload(files, 'image')}
                accept="image/*"
                multiple
                disabled={isUploading || isSubmitting}
              >
                {(props) => (
                  <Card 
                    {...props}
                    p="md"
                    withBorder
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: isUploading ? 0.6 : 1,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows.md
                      }
                    }}
                  >
                    <Stack align="center" spacing="xs">
                      <ThemeIcon size={40} color="teal" variant="light" radius="xl">
                        <IconPhoto size={20} />
                      </ThemeIcon>
                      <Text weight={600} size="xs">{t('form.images.label') || 'Upload Images'}</Text>
                      <Text size="xs" color="dimmed" ta="center">
                        PNG, JPG, GIF files
                      </Text>
                    </Stack>
                  </Card>
                )}
              </FileButton>
            </SimpleGrid>

            {(uploadedDocuments.length > 0 || uploadedImages.length > 0) && (
              <Box>
                <Text weight={600} mb="sm">
                  {t('form.documents.uploadedTitle') || 'Uploaded Files'} ({uploadedDocuments.length + uploadedImages.length})
                </Text>
                <Group grow>
                  {uploadedDocuments.length > 0 && (
                    <div>
                     {/* <Text size="sm" weight={500} mb="xs">{t('form.documents.uploadedTitle') || 'Documents'}</Text> */}
                      <List size="sm" spacing="xs">
                        {uploadedDocuments.map((doc, index) => (
                          <List.Item key={doc.id} icon={<IconFileText size={14} />}>
                            <Group position="apart">
                              <Text size="xs" truncate>{doc.filename}</Text>
                              <ActionIcon
                                size="xs"
                                color="red"
                                variant="subtle"
                                onClick={() => removeFile(index, 'document')}
                              >
                                <IconX size={10} />
                              </ActionIcon>
                            </Group>
                          </List.Item>
                        ))}
                      </List>
                    </div>
                  )}
                  {uploadedImages.length > 0 && (
                    <div>
                      {/* <Text size="sm" weight={500} mb="xs">{t('form.images.uploadedTitle') || 'Images'}</Text> */}
                      <List size="sm" spacing="xs">
                        {uploadedImages.map((img, index) => (
                          <List.Item key={img.id} icon={<IconPhoto size={14} />}>
                            <Group position="apart">
                              <Text size="xs" truncate>{img.filename || img.name || 'Image'}</Text>
                              <ActionIcon
                                size="xs"
                                color="red"
                                variant="subtle"
                                onClick={() => removeFile(index, 'image')}
                              >
                                <IconX size={10} />
                              </ActionIcon>
                            </Group>
                          </List.Item>
                        ))}
                      </List>
                    </div>
                  )}
                </Group>
              </Box>
            )}

            {isUploading && (
              <Alert 
                icon={<IconUpload size={16} />}
                title={t('alert.uploading.title') || 'Uploading files...'} 
                color="blue"
              >
                {t('alert.uploading.message') || 'Please wait while your files are being uploaded.'}
              </Alert>
            )}
          </Stack>
        );

      case 1:
        return (
          <Stack spacing="">
            <Box ta="center" mb="sm">
              <ThemeIcon 
                size={60} 
                radius="xl" 
                variant="gradient"
                gradient={{ from: 'blue', to: 'teal' }}
                mb="sm"
              >
                <IconClock size={30} />
              </ThemeIcon>
              <Title order={3} mb="xs">{t('form.duration.label') || 'Time Investment'}</Title>
              <Text color="dimmed" size="md">
                {t('form.duration.description') || 'How many hours do you want to dedicate to this course?'}
              </Text>
            </Box>

            <Card p="lg" withBorder radius="lg" bg={theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0]}>
              <Center mb="lg">
                <RingProgress
                  size={160}
                  thickness={10}
                  roundCaps
                  sections={[{ 
                    value: (form.values.time_hours / 30) * 100, 
                    color: theme.colors.blue[6] 
                  }]}
                  label={
                    <Stack align="center" spacing={2}>
                      <Text size="lg" weight={700} color={theme.colors.blue[6]}>
                        {form.values.time_hours}
                      </Text>
                      <Text size="xs" color="dimmed">{form.values.time_hours === 1 ? 'hour' : 'hours'}</Text>
                    </Stack>
                  }
                />
              </Center>

              <Slider
                value={form.values.time_hours}
                onChange={(value) => form.setFieldValue('time_hours', value)}
                min={1}
                max={30}
                step={1}
                size="lg"
                radius="xl"
                color="blue"
                marks={[
                  { value: 5, label: '5h' },
                  { value: 10, label: '10h' },
                  { value: 15, label: '15h' },
                  { value: 20, label: '20h' },
                  { value: 25, label: '25h' },
                  { value: 30, label: '30h'},
                ]}
                styles={{
                  track: { height: 8 },
                  thumb: { 
                    width: 24, 
                    height: 24,
                    border: `3px solid ${theme.colors.blue[6]}`,
                    backgroundColor: theme.white
                  }
                }}
              />

              <SimpleGrid cols={3} spacing="md" mt="lg">
                <Card p="sm" withBorder radius="md" ta="center">
                  <Text size="xs" color="dimmed" weight={600} transform="uppercase">Quick</Text>
                  <Text size="md" weight={700}>1-5 hours</Text>
                  <Text size="xs" color="dimmed">Quick Refresher</Text>
                </Card>
                <Card p="sm" withBorder radius="md" ta="center">
                  <Text size="xs" color="dimmed" weight={600} transform="uppercase">Deep Dive</Text>
                  <Text size="md" weight={700}>5-20 hours</Text>
                  <Text size="xs" color="dimmed">Deep Dive into a Complex Topic</Text>
                </Card>
                <Card p="sm" withBorder radius="md" ta="center">
                  <Text size="xs" color="dimmed" weight={600} transform="uppercase">Mastery</Text>
                  <Text size="md" weight={700}>20+ hours</Text>
                  <Text size="xs" color="dimmed">University Level Mastering of the Topic</Text>
                </Card>
              </SimpleGrid>
            </Card>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing="lg">
            <Box ta="center" mb="sm">
              <Title order={3} mb="xs">{t('form.difficulty.label') || 'Course Settings'}</Title>
              <Text color="dimmed" size="md">
                Choose your difficulty level and preferred language
              </Text>
            </Box>

            <Box>
              <Text weight={600} mb="md">{t('form.difficulty.label') || 'Difficulty Level'}</Text>
              <SimpleGrid cols={1} spacing="sm">
                {difficultyOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Card
                      key={option.value}
                      p="md"
                      withBorder
                      radius="md"
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: form.values.difficulty === option.value 
                          ? (theme.colorScheme === 'dark' ? theme.colors.teal[9] : theme.colors.teal[0])
                          : 'transparent',
                        borderColor: form.values.difficulty === option.value 
                          ? theme.colors.teal[6] 
                          : (theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]),
                        '&:hover': {
                          borderColor: theme.colors.teal[6],
                          transform: 'translateY(-1px)'
                        }
                      }}
                      onClick={() => form.setFieldValue('difficulty', option.value)}
                    >
                      <Group position="apart">
                        <Group noWrap>
                          <ThemeIcon variant="light" size="lg" color={form.values.difficulty === option.value ? 'teal' : 'gray'}>
                            <Icon size={20} />
                          </ThemeIcon>
                          <div>
                            <Text weight={600} size="sm">{option.label}</Text>
                            <Text size="xs" color="dimmed">{option.description}</Text>
                          </div>
                        </Group>
                        {form.values.difficulty === option.value && (
                          <ThemeIcon color="teal" variant="filled" radius="xl" size="sm">
                            <IconCheck size={14} />
                          </ThemeIcon>
                        )}
                      </Group>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Box>

            <Box>
              <Text weight={600} mb="md">{t('form.language.label') || 'Course Language'}</Text>
              {(() => {
                const selectedLanguage = languageOptions.find(lang => lang.value === form.values.language);

                return (
                  <Select
                    placeholder={t('form.language.placeholder')}
                    icon={selectedLanguage ? <ReactCountryFlag countryCode={selectedLanguage.countryCode} svg style={{ width: '1.2em', height: '1.2em' }} /> : <IconGlobe size={16} />}
                    itemComponent={LanguageSelectItem}
                    data={languageOptions}
                    {...form.getInputProps('language')}
                    size="md"
                  />
                );
              })()}
            </Box>
          </Stack>
        );

      case 3: {
        const selectedLanguage = languageOptions.find(o => o.value === form.values.language);
        const selectedDifficulty = difficultyOptions.find(o => o.value === form.values.difficulty);
        const DifficultyIcon = selectedDifficulty?.icon;

        return (
          <Stack spacing="lg">
            <Box ta="center" mb="sm">
              <ThemeIcon 
                size={60} 
                radius="xl" 
                variant="gradient"
                gradient={{ from: 'green', to: 'teal' }}
                mb="sm"
              >
                <IconCheck size={30} />
              </ThemeIcon>
              <Title order={3} mb="xs">{t('form.review.title') || 'Review & Create'}</Title>
              <Text color="dimmed" size="md">
                {t('form.review.confirmation') || 'Confirm your choices and create your personalized course'}
              </Text>
            </Box>

            <Card p="lg" withBorder radius="lg" bg={theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0]}>
              <Stack spacing="md">
                <Group position="apart">
                  <Text weight={600} color="dimmed">{t('form.topic.label') || 'Learning Goal'}</Text>
                  <ActionIcon 
                    variant="subtle" 
                    onClick={() => setActiveStep(0)}
                    title="Edit"
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                </Group>
                <Text sx={{
                  backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.white,
                  padding: 12,
                  borderRadius: 6,
                  border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                  fontSize: 14,
                  lineHeight: 1.4
                }}>
                  {form.values.query || t('form.review.notSet') || "No learning goal specified"}
                </Text>

                <Group grow>
                  <Box>
                    <Group position="apart" mb="xs">
                      <Text weight={600} color="dimmed">{t('form.duration.label') || 'Time Investment'}</Text>
                      <ActionIcon variant="subtle" onClick={() => setActiveStep(1)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Group>
                    <Group spacing="xs">
                      <ThemeIcon color="blue" variant="light" size="sm">
                        <IconClock size={14} />
                      </ThemeIcon>
                      <Text weight={600}>{form.values.time_hours} hours</Text>
                    </Group>
                  </Box>

                  <Box>
                    <Group position="apart" mb="xs">
                      <Text weight={600} color="dimmed">{t('form.difficulty.label') || 'Difficulty'}</Text>
                      <ActionIcon variant="subtle" onClick={() => setActiveStep(2)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Group>
                    <Group spacing="xs">
                      {DifficultyIcon ? (
                        <ThemeIcon color="cyan" variant="light" size="sm">
                          <DifficultyIcon size={14} />
                        </ThemeIcon>
                      ) : <IconTarget size={14} />}
                      <Text weight={600} transform="capitalize">
                        {selectedDifficulty?.label || t('form.review.notSet') || "Not selected"}
                      </Text>
                    </Group>
                  </Box>
                </Group>

                <Group grow>
                  <Box>
                    <Group position="apart" mb="xs">
                      <Text weight={600} color="dimmed">{t('form.language.label') || 'Language'}</Text>
                      <ActionIcon variant="subtle" onClick={() => setActiveStep(2)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Group>
                    <Group spacing="xs">
                      {selectedLanguage ? (
                        <ReactCountryFlag
                          countryCode={selectedLanguage.countryCode}
                          svg
                          style={{ width: '1.2em', height: '1.2em', borderRadius: '2px' }}
                          title={selectedLanguage.countryCode}
                        />
                      ) : (
                        <ThemeIcon color="teal" variant="light" size="sm">
                          <IconGlobe size={14} />
                        </ThemeIcon>
                      )}
                      <Text weight={600}>
                        {selectedLanguage?.label || "English"}
                      </Text>
                    </Group>
                  </Box>

                  <Box>
                    <Text weight={600} color="dimmed" mb="xs">Materials</Text>
                    <Group spacing="xs">
                      <ThemeIcon color="orange" variant="light" size="sm">
                        <IconUpload size={14} />
                      </ThemeIcon>
                      <Text weight={600}>{uploadedDocuments.length + uploadedImages.length} files</Text>
                    </Group>
                  </Box>
                </Group>
              </Stack>
            </Card>

            {isSubmitting && (
              <Card p="lg" withBorder radius="md" ta="center">
                <Progress value={100} animate color="teal" mb="md" />
                <Text weight={600} mb="xs">{t('streaming.title') || 'Creating your course...'}</Text>
                <Text size="sm" color="dimmed">
                  {t('streaming.description') || 'Our AI is analyzing your requirements and building a personalized learning path'}
                </Text>
              </Card>
            )}
          </Stack>
        );
      }

      default:
        return null;
    }
  };

  if (isSubmitting) {
    return (
      <>
        <PremiumModal 
          opened={showPremiumModal} 
          onClose={() => {
            setShowPremiumModal(false);
            setIsLimitReached(false);
          }}
          limitReached={isLimitReached}
        />
        <Container size="lg" py="xl">
          <Paper shadow="md" p="xl" withBorder>
            <Title order={3} align="center" mb="md">{t('streaming.title') || 'Creating Your Course'}</Title>
            <Text align="center" mb="md">{t('streaming.description') || 'Please wait while we generate your personalized course...'}</Text>
            <Progress value={100} animate color="teal" />
          </Paper>
        </Container>
      </>
    );
  }

  // PremiumModal component is now imported and used directly


  return (
    <>
      <PremiumModal 
        opened={showPremiumModal} 
        onClose={() => {
          setShowPremiumModal(false);
          setIsLimitReached(false);
        }} 
        limitReached={isLimitReached}
      />
      <Container size="lg" py="xl">
      
      <Paper 
        radius="lg" 
        withBorder 
        sx={{
          overflow: 'hidden',
          background: theme.colorScheme === 'dark' 
            ? `linear-gradient(135deg, ${theme.colors.dark[7]}, ${theme.colors.dark[6]})`
            : `linear-gradient(135deg, ${theme.white}, ${theme.colors.gray[0]})`,
        }}
      >
        {/* Header */}
        <Box 
          p="lg" 
          sx={{
            background: theme.colorScheme === 'dark' 
              ? `linear-gradient(45deg, ${theme.colors.teal[9]}, ${theme.colors.cyan[8]})`
              : `linear-gradient(45deg, ${theme.colors.teal[6]}, ${theme.colors.cyan[5]})`,
            color: 'white',
            position: 'relative'
          }}
        >
          <Group position="apart" align="flex-start" mb="md">
            <Box>
              <Title order={2} mb={5} style={{ color: 'white' }}>{t('mainTitle') || 'Create a New Learning Course'}</Title>
              <Text color="white">{t('subtitle') || 'Design your personalized learning experience'}</Text>
            </Box>
          </Group>

          {/* Progress indicator */}
          <Progress 
            value={(activeStep + 1) / steps.length * 100} 
            color="white"
            mt="md"
            size="sm"
            radius="xl"
          />
        </Box>

        {/* Content */}
        <Box p="lg" style={{ minHeight: 350 }}>
          {renderStepContent()}
        </Box>

        {/* Error Alert */}
        {error && (
          <Box px="lg">
            <Alert 
              icon={<IconAlertCircle size={16} />}
              title={t('form.error.alertTitle') || 'Error'} 
              color="red" 
              mb="md"
              onClose={() => setError(null)}
              withCloseButton
            >
              {error}
            </Alert>
          </Box>
        )}

        {/* Footer */}
        <Box 
          p="lg" 
          pt="sm"
          sx={{
            borderTop: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0]
          }}
        >
          <Group position="apart">
            <Button
              variant="subtle"
              leftIcon={<IconArrowLeft size={16} />}
              onClick={prevStep}
              disabled={activeStep === 0 || isSubmitting || isUploading}
            >
              {t('buttons.back') || 'Previous'}
            </Button>

            {activeStep < steps.length - 1 ? (
              <Button
                rightIcon={<IconArrowRight size={16} />}
                onClick={nextStep}
                disabled={!isStepValid(activeStep) || isUploading}
                variant="gradient"
                gradient={{ from: 'teal', to: 'cyan' }}
              >
                {t('buttons.nextStep') || 'Next Step'}
              </Button>
            ) : (
              <Button
                leftIcon={<IconSparkles size={16} />}
                onClick={handleSubmit}
                disabled={!isStepValid(activeStep) || isSubmitting || isUploading}
                loading={isSubmitting}
                variant="gradient"
                gradient={{ from: 'green', to: 'teal' }}
                size="md"
              >
                {isSubmitting ? (t('buttons.creating') || 'Creating Course...') : (t('buttons.createCourse') || 'Create Course')}
              </Button>
            )}
          </Group>
        </Box>
      </Paper>
      </Container>
    </>
  );
}

export default CreateCourse;