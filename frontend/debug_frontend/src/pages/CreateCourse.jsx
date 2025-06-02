import { useState } from 'react';
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
      query: (value) => (!value ? 'Topic is required' : null),
      time_hours: (value) => (value <= 0 ? 'Time must be greater than 0' : null),
    },
  });

  // Handle document upload
  const handleDocumentUpload = async (file) => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      const documentData = await courseService.uploadDocument(file);
      setUploadedDocuments(prev => [...prev, documentData]);
      toast.success(`Document "${file.name}" uploaded successfully`);
      return documentData;
    } catch (err) {
      console.error('Error uploading document:', err);
      toast.error(`Failed to upload document: ${err.message || 'Unknown error'}`);
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
      toast.success(`Image "${file.name}" uploaded successfully`);
      return imageData;
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error(`Failed to upload image: ${err.message || 'Unknown error'}`);
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
      navigate(`/courses/${data.data.course_id}?creating=true`);
    } else if (data.type === 'chapter') {
      // These updates will be handled by the CourseView component
      setChapters(prev => [...prev, data.data]);
    } else if (data.type === 'complete') {
      // Course creation is complete - CourseView will handle final updates
      console.log('Course creation completed');
    } else if (data.type === 'error') {
      console.error('Streaming error:', data.data);
      setError(data.data.message || 'An error occurred during course creation');
      setStreamingProgress({
        status: 'Error occurred during course creation',
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
      status: 'Initializing course creation...',
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
      <Title order={1} mb="lg">Create a New Learning Course</Title>
        {streamingProgress ? (
        <Paper radius="md" p="xl" withBorder>
          <Title order={3} mb="md">Creating Your Course</Title>
          
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
              This may take a few minutes. Our AI is crafting personalized content for your course.
            </Text>
          )}
          
          {courseInfo && (
            <Card shadow="sm" p="lg" mt="md" mb="md" withBorder>
              <Title order={4}>{courseInfo.title}</Title>
              <Text mt="sm" color="dimmed" size="sm">{courseInfo.description}</Text>
              <Text mt="md" size="sm">Time investment: {courseInfo.total_time_hours} hours</Text>
            </Card>
          )}
          
          {chapters.length > 0 && (
            <>
              <Title order={4} mt="xl" mb="md">
                Chapters Created: {chapters.length} 
                {courseInfo?.total_time_hours && 
                  ` (Expected: ~${Math.max(3, Math.ceil(courseInfo.total_time_hours * 1.5))})`
                }
              </Title>
              
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {chapters.map((chapter, idx) => (
                  <Card key={chapter.id || idx} p="sm" mb="xs" withBorder radius="md">
                    <Group position="apart" mb="xs">
                      <Text weight={500} size="sm">{chapter.caption}</Text>
                      <Group spacing="xs">
                        <Badge size="sm">{chapter.time_minutes} min</Badge>
                        <Badge size="sm" color="green">{chapter.mc_questions?.length || 0} questions</Badge>
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
              onClick={() => navigate(`/courses/${courseInfo.course_id}`)}
            >
              Go to Course
            </Button>
          )}
          
          {error && (
            <Alert 
              icon={<IconAlertCircle size={16} />}
              title="Error!" 
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
            <Stepper.Step label="Topic" description="What do you want to learn?">
              <TextInput
                required
                label="Learning Topic"
                placeholder="e.g. Python Programming, Machine Learning, Web Development"
                {...form.getInputProps('query')}
                mb="md"
              />
              <Textarea
                label="Additional Details (Optional)"
                placeholder="Any specific aspects or focus areas?"
                autosize
                minRows={3}
                maxRows={6}
                mb="md"
              />
            </Stepper.Step>
            
            <Stepper.Step label="Time" description="How much time do you have?">
              <NumberInput
                required
                label="Time Investment (hours)"
                placeholder="e.g. 2"
                min={1}
                max={100}
                {...form.getInputProps('time_hours')}
                mb="md"
              />
              <Text size="sm" color="dimmed">
                This helps us structure the course to fit your available time.
              </Text>
            </Stepper.Step>
            
            <Stepper.Step label="Resources" description="Add learning materials">
              <Group grow mb="md">
                <div>
                  <FileInput
                    label="Upload Documents (Optional)"
                    placeholder="Upload PDF, DOC, TXT, etc."
                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    icon={<IconFileText size={14} />}
                    onChange={handleMultipleDocuments}
                    multiple
                    mb="sm"
                    disabled={isUploading || isSubmitting}
                  />
                  {uploadedDocuments.length > 0 && (
                    <>
                      <Text size="sm" weight={500} mb="xs">Uploaded Documents:</Text>
                      <List size="sm" spacing="xs" mb="md">
                        {uploadedDocuments.map((doc) => (
                          <List.Item key={doc.id} icon={<IconFileText size={14} />}>
                            {doc.filename} ({Math.round(doc.size / 1024)} KB)
                          </List.Item>
                        ))}
                      </List>
                    </>
                  )}
                </div>
                
                <div>
                  <FileInput
                    label="Upload Images (Optional)"
                    placeholder="Upload JPG, PNG, etc."
                    accept="image/*"
                    icon={<IconPhoto size={14} />}
                    onChange={handleMultipleImages}
                    multiple
                    mb="sm"
                    disabled={isUploading || isSubmitting}
                  />
                  {uploadedImages.length > 0 && (
                    <>
                      <Text size="sm" weight={500} mb="xs">Uploaded Images:</Text>
                      <List size="sm" spacing="xs" mb="md">
                        {uploadedImages.map((img) => (
                          <List.Item key={img.id} icon={<IconPhoto size={14} />}>
                            {img.filename} ({Math.round(img.size / 1024)} KB)
                          </List.Item>
                        ))}
                      </List>
                    </>
                  )}
                </div>
              </Group>
              
              {(uploadedDocuments.length > 0 || uploadedImages.length > 0) && (
                <Text size="sm" color="dimmed" mb="md">
                  Your uploaded files will be used to generate a more personalized learning experience.
                </Text>
              )}
            </Stepper.Step>
          </Stepper>

          {error && (
            <Alert 
              icon={<IconAlertCircle size={16} />}
              title="Error!" 
              color="red" 
              mb="lg"
            >
              {error}
            </Alert>
          )}

          {isUploading && (
            <Alert 
              icon={<Loader size={16} />}
              title="Uploading File" 
              color="blue" 
              mb="lg"
            >
              Please wait while your file is being uploaded...
            </Alert>
          )}

          <Group position="right" mt="xl">
            {active > 0 && (
              <Button variant="default" onClick={prevStep} disabled={isSubmitting || isUploading}>
                Back
              </Button>
            )}
            {active < 2 ? (
              <Button onClick={nextStep} disabled={isSubmitting || isUploading}>
                Next step
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                loading={isSubmitting} 
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting ? 'Creating...' : 'Create Course'}
              </Button>
            )}
          </Group>
        </Paper>
      )}
    </Container>
  );
}

export default CreateCourse;