import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Group,
  Avatar,
  FileButton,
  Text,
  Alert,
  Space,
  Divider,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconUpload, IconPhoto, IconSettings, IconLock } from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import userService from '../api/userService';
import { toast } from 'react-toastify';
import { useState, useEffect, useRef } from 'react';

const MAX_FILE_SIZE_MB = 12;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function SettingsPage() {
  const { user, setUser, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(user?.profile_image_base64 || null);
  const resetRef = useRef(null);

  const generalForm = useForm({
    initialValues: {
      username: user?.username || '',
      email: user?.email || '',
    },
    validate: {
      username: (value) => (value && value.length < 3 ? 'Username must be at least 3 characters' : null),
    },
  });

  const passwordForm = useForm({
    initialValues: {
      old_password: '',
      new_password: '',
      confirm_new_password: '',
    },
    validate: {
      old_password: (value) => (value ? null : 'Old password is required'),
      new_password: (value) =>
        value.length < 3 ? 'New password must be at least 3 characters' : null,
      confirm_new_password: (value, values) =>
        value !== values.new_password ? 'Passwords do not match' : null,
    },
  });

  useEffect(() => {
    if (user) {
      if (!generalForm.values.username && !generalForm.values.email) {
        generalForm.setValues({
          username: user.username || '',
          email: user.email || '',
        });
      }
      if (!profileImageFile && !previewImage) {
        setPreviewImage(user.profile_image_base64 || null);
      }
    }
  }, [user, profileImageFile, previewImage, generalForm]);

  const handleFileChange = (file) => {
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
        if (resetRef.current) {
          resetRef.current();
        }
        setProfileImageFile(null);
        return;
      }
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProfileImageFile(null);
      setPreviewImage(user?.profile_image_base64 || null);
      if (resetRef.current) {
        resetRef.current();
      }
    }
  };

  const handleRemoveImage = () => {
    setProfileImageFile(null);
    setPreviewImage(null);
    if (resetRef.current) {
      resetRef.current();
    }
  };

  const handleGeneralSubmit = async (formValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const userDataToUpdate = {
        username: formValues.username,
      };

      // Ensure user and user.id are available
      if (!user || !user.id) {
        throw new Error("User ID is missing, please log in again.");
      }

      if (profileImageFile || previewImage !== user.profile_image_base64) {
        userDataToUpdate.profile_image_base64 = previewImage;
      }

      const updatedUser = await userService.updateUser(user.id, userDataToUpdate);
      
      // Update user context with the full updated user object from the backend
      setUser(updatedUser); 
      toast.success('Profile updated successfully!');
      setProfileImageFile(null); // Clear the selected file state
      // No need to setPreviewImage here, it's handled by the updatedUser in context
      
    } catch (err) {
      console.error("Error updating profile:", err);
      let errorMessage = err.message || 'Failed to update profile.';
      if (err.response && err.response.data) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail) && err.response.data.detail.length > 0) {
          // Handle cases where detail might be an array of error objects (e.g., Pydantic validation errors)
          errorMessage = err.response.data.detail.map(e => e.msg || JSON.stringify(e)).join(', ');
        } else if (typeof err.response.data.detail === 'object') {
            errorMessage = JSON.stringify(err.response.data.detail);
        }
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    setIsLoading(true);
    setPasswordError(null);
    try {
      await userService.changePassword(user.id, values.old_password, values.new_password);
      toast.success('Password changed successfully!');
      passwordForm.reset();
    } catch (err) {
      console.error("Error changing password:", err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to change password.';
      setPasswordError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <Container><Text>Loading user settings...</Text></Container>;
  }

  // Add a check for user.id as well, as it's crucial for API calls
  if (!user || !user.id) {
    return <Container><Text>User not found or incomplete user data. Please login again.</Text></Container>;
  }

  return (
    <Container size="md" my="xl">
      <Title order={2} align="center" mb="xl">
        Account Settings
      </Title>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Update Error" color="red" withCloseButton onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Space h="md" />

      <Paper withBorder shadow="md" p="lg" radius="md">
        <Title order={3} mb="lg" icon={<IconSettings size={20} />}>
          <Group spacing="xs">
            <IconSettings size={24} stroke={1.5} />
            <Text>General Information</Text>
          </Group>
        </Title>
        <form onSubmit={generalForm.onSubmit(handleGeneralSubmit)}>
          <Group position="center" direction="column" mb="lg">
            <Avatar src={previewImage} size={120} radius={120} alt="Profile Preview">
              {!previewImage && user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <FileButton resetRef={resetRef} onChange={handleFileChange} accept="image/png,image/jpeg,image/gif">
              {(props) => <Button {...props} leftIcon={<IconUpload size={16} />}>Upload New Image</Button>}
            </FileButton>
            {profileImageFile && (
              <Text size="sm" color="dimmed">Selected: {profileImageFile.name}</Text>
            )}
            {previewImage && (
              <Button variant="subtle" color="red" size="xs" onClick={handleRemoveImage}>
                Remove Image
              </Button>
            )}
          </Group>

          <TextInput
            label="Username"
            placeholder="Your username"
            {...generalForm.getInputProps('username')}
            mb="md"
          />
          <TextInput
            label="Email"
            placeholder="Your email"
            disabled
            {...generalForm.getInputProps('email')}
            mb="md"
          />
          <Button type="submit" loading={isLoading} fullWidth mt="md">
            Save Changes
          </Button>
        </form>
      </Paper>

      <Divider my="xl" label="Security" labelPosition="center" />

      <Paper withBorder shadow="md" p="lg" radius="md">
        <Title order={3} mb="lg">
           <Group spacing="xs">
            <IconLock size={24} stroke={1.5} />
            <Text>Change Password</Text>
          </Group>
        </Title>
        {passwordError && (
          <Alert icon={<IconAlertCircle size={16} />} title="Password Error" color="red" withCloseButton onClose={() => setPasswordError(null)} mb="md">
            {passwordError}
          </Alert>
        )}
        <form onSubmit={passwordForm.onSubmit(handleChangePassword)}>
          <PasswordInput
            label="Old Password"
            placeholder="Your current password"
            {...passwordForm.getInputProps('old_password')}
            mb="md"
          />
          <PasswordInput
            label="New Password"
            placeholder="Your new password"
            {...passwordForm.getInputProps('new_password')}
            mb="md"
          />
          <PasswordInput
            label="Confirm New Password"
            placeholder="Confirm your new password"
            {...passwordForm.getInputProps('confirm_new_password')}
            mb="md"
          />
          <Button type="submit" loading={isLoading} fullWidth mt="md">
            Change Password
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default SettingsPage;
