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
  Loader
} from '@mantine/core';
import { IconUpload, IconAlertCircle } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { toast } from 'react-toastify';
import { courseService } from '../api/courseService';

function CreateCourse() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const form = useForm({
    initialValues: {
      query: '',
      time_hours: 2,
      file: null,
    },
    validate: {
      query: (value) => (!value ? 'Topic is required' : null),
      time_hours: (value) => (value <= 0 ? 'Time must be greater than 0' : null),
    },
  });

  const handleSubmit = async () => {
    if (form.validate().hasErrors) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // For now, we're only using the demo endpoint
      const courseData = await courseService.createDemoCourse({
        query: form.values.query,
        time_hours: form.values.time_hours,
      });
      
      toast.success('Course created successfully!');
      navigate(`/courses/${courseData.course_id}`);
    } catch (err) {
      console.error('Error creating course:', err);
      setError('Failed to create course. Please try again.');
      toast.error('Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setActive((current) => {
    if (form.validate().hasErrors) return current;
    return current < 2 ? current + 1 : current;
  });

  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  return (
    <Container size="md" py="xl">
      <Title order={1} mb="lg">Create a New Learning Course</Title>
      
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
            <FileInput
              label="Upload Document (Optional)"
              placeholder="Upload PDF or document"
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              icon={<IconUpload size={14} />}
              {...form.getInputProps('file')}
              mb="md"
              disabled // Disabled for demo
            />
            <Text size="sm" color="dimmed" mb="md">
              Note: File upload is not available in the demo version.
            </Text>
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

        <Group position="right" mt="xl">
          {active > 0 && (
            <Button variant="default" onClick={prevStep} disabled={isSubmitting}>
              Back
            </Button>
          )}
          {active < 2 ? (
            <Button onClick={nextStep}>Next step</Button>
          ) : (
            <Button onClick={handleSubmit} loading={isSubmitting} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Course'}
            </Button>
          )}
        </Group>
      </Paper>
    </Container>
  );
}

export default CreateCourse;