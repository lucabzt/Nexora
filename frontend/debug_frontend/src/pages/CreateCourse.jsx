import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Title, 
  TextInput, 
  NumberInput, 
  Button, 
  Text, 
  Paper, 
  Stepper,
  Group,
  Textarea,
  FileInput,
  Alert,
  Loader,
  Progress,
  Card,
  List,
  Badge,
  SimpleGrid
} from '@mantine/core';
import { IconUpload, IconAlertCircle, IconCheck, IconPhoto, IconFileText } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { toast } from 'react-toastify';
import { courseService } from '../api/courseService';


function CreateCourse() {
  const navigate = useNavigate();
  const { t } = useTranslation('createCourse');
  const [active, setActive] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [streamingProgress, setStreamingProgress] = useState(null);
  const [courseInfo, setCourseInfo] = useState(null);
  const [chapters, setChapters] = useState([]);

  const form = useForm({
    initialValues: {
      query: '',
      time_hours: 2,
      documents: [],
      images: [],
    },
    validate: {
      query: (value) => (!value ? t('form.validation.topicRequired') : null),
      time_hours: (value) => (value <= 0 ? t('form.validation.timePositive') : null),
    },
  });

  // Handle document upload
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

  // Handle image upload
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
  };  // Handle streaming progress updates
  const handleStreamProgress = (data) => {
    console.log('Streaming progress:', data); // Debug log
    
    if (data.type === 'course_info') {
      setCourseInfo(data.data);
      // Immediately redirect to course view
      navigate(`/dashboard/courses/${data.data.course_id}?creating=true`);
    } else if (data.type === 'chapter') {
      // These updates will be handled by the CourseView component
      setChapters(prev => [...prev, data.data]);
    } else if (data.type === 'complete') {
      // Course creation is complete - CourseView will handle final updates
      console.log('Course creation completed');
    } else if (data.type === 'error') {
      console.error('Streaming error:', data.data);
      setError(data.data.message || t('streaming.error.generic'));
      setStreamingProgress({
        status: t('streaming.status.errorOccurred'),
        progress: 0,
        phase: 'error'
      });
      setIsSubmitting(false);
    }
  };
  const handleSubmit = async () => {
    if (form.validate().hasErrors) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setCourseInfo(null);
    setChapters([]);
    setStreamingProgress({
      status: t('streaming.status.initializing'),
      progress: 5,
    });

    try {
      // Collect document and image IDs
      const documentIds = uploadedDocuments.map(doc => doc.id);
      const imageIds = uploadedImages.map(img => img.id);

      // Show preparation status
      setStreamingProgress({
        status: 'Preparing course materials and connecting to AI agents...',
        progress: 8,
      });

      // Create course with streaming response
      await courseService.createCourse({
        query: form.values.query,
        time_hours: form.values.time_hours,
        document_ids: documentIds,
        picture_ids: imageIds,
      }, handleStreamProgress);
      
      // Success notification is shown after complete signal is received
    } catch (err) {
      console.error('Error creating course:', err);
      setError('Failed to create course. Please try again.');
      toast.error('Failed to create course');
      setStreamingProgress(null);
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setActive((current) => {
    if (form.validate().hasErrors) return current;
    return current < 2 ? current + 1 : current;
  });

  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  // Handle multiple document uploads
  const handleMultipleDocuments = async (files) => {
    if (!files || !files.length) return;
    
    for (const file of files) {
      await handleDocumentUpload(file);
    }
  };

  // Handle multiple image uploads
  const handleMultipleImages = async (files) => {
    if (!files || !files.length) return;
    
    for (const file of files) {
      await handleImageUpload(file);
    }
  };

  return (
    <Container size="md" py="xl">
      <Title order={1} mb="lg">{t('mainTitle')}</Title>
        {streamingProgress ? (
        <Paper radius="md" p="xl" withBorder>
          <Title order={2} align="center" mb="xl">{t('streaming.title')}</Title>
          
          <Progress 
            value={streamingProgress.progress} 
            mb="md" 
            size="lg" 
            radius="xl" 
            color={streamingProgress.progress === 100 ? 'green' : 'blue'}
            animate={streamingProgress.progress > 0 && streamingProgress.progress < 100}
          />
          
          <Text align="center" mb="xl" size="lg" weight={500}>
            {streamingProgress.status}
          </Text>
          
          {streamingProgress.progress > 0 && streamingProgress.progress < 100 && (
            <Text color="dimmed" size="sm" align="center" mb="md">
              {t('streaming.description')}
            </Text>
          )}
          
          {courseInfo && (
            <Card shadow="sm" p="lg" mt="md" mb="md" withBorder>
              <Title order={4}>{courseInfo.title}</Title>
              <Text mt="sm" color="dimmed" size="sm">{courseInfo.description}</Text>
              <Text mt="md" size="sm">{t('streaming.courseInfo.time')} {courseInfo.total_time_hours} {t('streaming.courseInfo.hours')}</Text>
            </Card>
          )}
          
          {chapters.length > 0 && (
            <>
              <Title order={4} mt="xl" mb="md">
                {t('streaming.chapters.title')} {chapters.length} 
                {courseInfo?.total_time_hours && 
                  ` (${t('streaming.chapters.expected')} ~${Math.max(3, Math.ceil(courseInfo.total_time_hours * 1.5))})`
                }
              </Title>
              
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {chapters.map((chapter, idx) => (
                  <Card key={chapter.id || idx} p="sm" mb="xs" withBorder radius="md">
                    <Group position="apart" mb="xs">
                      <Text weight={500} size="sm">{chapter.caption}</Text>
                      <Group spacing="xs">
                        <Badge size="sm">{chapter.time_minutes} {t('streaming.chapters.minutes')}</Badge>
                        <Badge size="sm" color="green">{chapter.mc_questions?.length || 0} {t('streaming.chapters.questions')}</Badge>
                      </Group>
                    </Group>
                    <Text size="xs" color="dimmed" lineClamp={1}>
                      {chapter.summary}
                    </Text>
                  </Card>
                ))}
              </div>
            </>
          )}
          
          {streamingProgress.progress === 100 && (
            <Button 
              fullWidth 
              color="green" 
              mt="xl"
              onClick={() => navigate(`/dashboard/courses/${courseInfo.course_id}`)}
            >
              {t('streaming.button.goToCourse')}
            </Button>
          )}
          
          {error && (
            <Alert 
              icon={<IconAlertCircle size={16} />}
              title={t('streaming.error.title')} 
              color="red" 
              mt="lg"
            >
              {error}
            </Alert>
          )}
        </Paper>
      ) : (
        <Paper radius="md" p="xl" withBorder>
          <Stepper active={active} breakpoint="sm" mb="xl">
            <Stepper.Step label={t('stepper.details.label')} description={t('stepper.details.description')}>
              <TextInput
                required
                label={t('form.topic.label')}
                placeholder={t('form.topic.placeholder')}
                {...form.getInputProps('query')}
                mb="md"
              />
              <Textarea
                label={t('form.topic.descriptionLabel')}
                placeholder={t('form.topic.descriptionPlaceholder')}
                autosize
                minRows={3}
                maxRows={6}
                mb="md"
              />
            </Stepper.Step>
            
            <Stepper.Step label={t('stepper.time.label')} description={t('stepper.time.description')}>
              <NumberInput
                required
                label={t('form.time.label')}
                placeholder={t('form.time.placeholder')}
                min={1}
                max={100}
                {...form.getInputProps('time_hours')}
                mb="md"
              />
              <Text size="sm" color="dimmed">
                {t('form.time.description')}
              </Text>
            </Stepper.Step>
            
            <Stepper.Step label={t('stepper.uploads.label')} description={t('stepper.uploads.description')}>
              <Group grow mb="md">
                <div>
                  <FileInput
                    label={t('form.documents.label')}
                    placeholder={t('form.documents.placeholder')}
                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    icon={<IconFileText size={14} />}
                    onChange={handleMultipleDocuments}
                    multiple
                    mb="sm"
                    disabled={isUploading || isSubmitting}
                  />
                  {uploadedDocuments.length > 0 && (
                    <>
                      <Text size="sm" weight={500} mb="xs">{t('form.documents.uploadedTitle')}</Text>
                      <List size="sm" spacing="xs" mb="md">
                        {uploadedDocuments.map((doc) => (
                          <List.Item key={doc.id} icon={<IconFileText size={14} />}>
                            {t('form.documents.fileEntry', { fileName: doc.filename, sizeKB: Math.round(doc.size / 1024) })}
                          </List.Item>
                        ))}
                      </List>
                    </>
                  )}
                </div>
                
                <div>
                  <FileInput
                    label={t('form.images.label')}
                    placeholder={t('form.images.placeholder')}
                    accept="image/*"
                    icon={<IconPhoto size={14} />}
                    onChange={handleMultipleImages}
                    multiple
                    mb="sm"
                    disabled={isUploading || isSubmitting}
                  />
                  {uploadedImages.length > 0 && (
                    <>
                      <Text size="sm" weight={500} mb="xs">{t('form.images.uploadedTitle')}</Text>
                      <List size="sm" spacing="xs" mb="md">
                        {uploadedImages.map((img) => (
                          <List.Item key={img.id} icon={<IconPhoto size={14} />}>
                            {t('form.images.fileEntry', { fileName: img.filename, sizeKB: Math.round(img.size / 1024) })}
                          </List.Item>
                        ))}
                      </List>
                    </>
                  )}
                </div>
              </Group>
              
              {(uploadedDocuments.length > 0 || uploadedImages.length > 0) && (
                <Text size="sm" color="dimmed" mb="md">
                  {t('form.uploads.personalizedExperience')}
                </Text>
              )}
            </Stepper.Step>
          </Stepper>

          {error && (
            <Alert 
              icon={<IconAlertCircle size={16} />}
              title={t('form.error.alertTitle')} 
              color="red" 
              mb="lg"
            >
              {error}
            </Alert>
          )}

          {isUploading && (
            <Alert 
              icon={<Loader size={16} />}
              title={t('alert.uploading.title')} 
              color="blue" 
              mb="lg"
            >
              {t('alert.uploading.message')}
            </Alert>
          )}

          <Group position="right" mt="xl">
            {active > 0 && (
              <Button variant="default" onClick={prevStep} disabled={isSubmitting || isUploading}>
                {t('buttons.back')}
              </Button>
            )}
            {active < 2 ? (
              <Button onClick={nextStep} disabled={isSubmitting || isUploading}>
                {t('buttons.nextStep')}
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                loading={isSubmitting} 
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting ? t('buttons.creating') : t('buttons.createCourse')}
              </Button>
            )}
          </Group>
        </Paper>
      )}
    </Container>
  );
}

export default CreateCourse;