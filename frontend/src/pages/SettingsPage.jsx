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
  createStyles,
  Transition,
  ActionIcon,
  Tooltip,
  Card,
  Badge,
  SimpleGrid,
  useMantineTheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { 
  IconAlertCircle, 
  IconUpload, 
  IconPhoto, 
  IconSettings, 
  IconLock, 
  IconTrash, 
  IconUser,
  IconAt,
  IconKey,
  IconDeviceFloppy,
  IconArrowUpRight
} from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import userService from '../api/userService';
import { toast } from 'react-toastify';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IconLanguage, IconSun, IconMoonStars } from '@tabler/icons-react';
import LanguageSettingsCard from '../components/LanguageSettingsCard';
import { Switch, useMantineColorScheme } from '@mantine/core';

// Create styles for the SettingsPage components
const useStyles = createStyles((theme) => ({
  settingsContainer: {
    maxWidth: '900px', // Make it wider
    width: '100%',
    padding: theme.spacing.md,
  },
  cardContainer: {
    // Removed hover effects
    boxShadow: theme.shadows.sm,
  },
  avatarContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: theme.spacing.xl, // Increased spacing
    marginTop: theme.spacing.md,
  },
  avatar: {
    boxShadow: theme.shadows.md,
    border: `3px solid ${theme.colors[theme.primaryColor][5]}`,
  },
  buttonGradient: {
    background: theme.fn.gradient({ from: 'blue', to: 'cyan', deg: 45 }),
  },
  sectionTitle: {
    borderBottom: `2px solid ${theme.colors[theme.primaryColor][5]}`, // Better contrast
    paddingBottom: theme.spacing.xs,
    marginBottom: theme.spacing.xl, // Increased spacing
  },
  formField: {
    marginTop: theme.spacing.md,
  },
  submitButton: {
    marginTop: theme.spacing.lg,
  },
}));

const MAX_FILE_SIZE_MB = 12;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function SettingsPage() {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const { user, setUser, loading: authLoading } = useAuth();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  const { t, i18n } = useTranslation('settings');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(user?.profile_image_base64 || null);
  const resetRef = useRef(null);

  const generalForm = useForm({
    initialValues: {
      username: user?.username || '',
      email: user?.email || '',
    },
    validate: {
      username: (value) => (value && value.length < 3 ? t('validation.usernameMinLength', 'Username must be at least 3 characters') : null),
    },
  });

  const passwordForm = useForm({
    initialValues: {
      old_password: '',
      new_password: '',
      confirm_new_password: '',
    },
    validate: {
      old_password: (value) => (value ? null : t('validation.oldPasswordRequired', 'Old password is required')),
      new_password: (value) =>
        value.length < 3 ? t('validation.newPasswordMinLength', 'New password must be at least 3 characters') : null,
      confirm_new_password: (value, values) =>
        value !== values.new_password ? t('validation.passwordsDoNotMatch', 'Passwords do not match') : null,
    },
  });
  useEffect(() => {
    // Update form values from user context, but only when component mounts or user object changes
    if (user) {
      // Only update the form if the form values are empty or if they're different from the user context
      // This prevents overwriting user input during typing
      const currentUsername = generalForm.values.username;
      const currentEmail = generalForm.values.email;
      
      if (!currentUsername || (currentUsername !== user.username && currentUsername === '')) {
        generalForm.setFieldValue('username', user.username || '');
      }
      if (!currentEmail || (currentEmail !== user.email && currentEmail === '')) {
        generalForm.setFieldValue('email', user.email || '');
      }
    }

    // Handle preview image logic
    if (profileImageFile) { // A new local file is selected, this takes precedence for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result); // This is a data URI
      };
      reader.readAsDataURL(profileImageFile);
    } else if (user && user.profile_image_base64) { // No local file, but user has an image in context (from DB)
      const rawBase64FromDB = user.profile_image_base64;
      // Convert raw base64 string from DB to a data URI. Assuming JPEG as a common default.
      // A more robust solution would involve storing/retrieving the MIME type from the backend.
      if (rawBase64FromDB && !rawBase64FromDB.startsWith('data:image')) {
        setPreviewImage(`data:image/jpeg;base64,${rawBase64FromDB}`);
      } else if (rawBase64FromDB) { // It might already be a data URI (less likely with current backend)
        setPreviewImage(rawBase64FromDB);
      } else {
        setPreviewImage(null);
      }
    } else { // No local file, and no image in user context (or no user)
      setPreviewImage(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profileImageFile]); // Removed generalForm from dependencies to prevent form reset during typing

  const handleFileChange = (file) => {
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(t('toast.fileTooLarge', { maxSize: MAX_FILE_SIZE_MB }));
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
        throw new Error(t('authError.userIdMissing', "User ID is missing, please log in again."));
      }

      if (profileImageFile || previewImage !== user.profile_image_base64) {
        userDataToUpdate.profile_image_base64 = previewImage;
      }

      const updatedUser = await userService.updateUser(user.id, userDataToUpdate);
      
      // Update user context with the full updated user object from the backend
      setUser(updatedUser); 
      toast.success(t('toast.profileUpdateSuccess', 'Profile updated successfully!'));
      setProfileImageFile(null); // Clear the selected file state
      // No need to setPreviewImage here, it's handled by the updatedUser in context
      
    } catch (err) {
      console.error("Error updating profile:", err);
      let errorMessage = err.message || t('toast.profileUpdateErrorFallback', 'Failed to update profile.');
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
      toast.success(t('toast.passwordChangeSuccess', 'Password changed successfully!'));
      passwordForm.reset();
    } catch (err) {
      console.error("Error changing password:", err);
      const errorMessage = err.response?.data?.detail || err.message || t('toast.passwordChangeErrorFallback', 'Failed to change password.');
      setPasswordError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  if (authLoading) {
    return (
      <Container className={classes.settingsContainer} size="xl" px="xs">
        <Title order={2} className={classes.sectionTitle}>
          <Group spacing="sm">
            <IconSettings size={24} />
            {t('appearanceSettings', 'Appearance')}
          </Group>
        </Title>
        
        <Paper withBorder p="md" radius="md" className={classes.cardContainer} mb="xl">
          <Group position="apart">
            <div>
              <Text weight={600}>{t('darkMode', 'Dark Mode')}</Text>
              <Text size="sm" color="dimmed">
                {dark ? t('darkModeOn', 'Dark theme is enabled') : t('darkModeOff', 'Light theme is enabled')}
              </Text>
            </div>
            <Switch
              checked={dark}
              onChange={() => toggleColorScheme()}
              size="lg"
              onLabel={<IconSun size={16} stroke={2.5} color={theme.colors.yellow[4]} />}
              offLabel={<IconMoonStars size={16} stroke={2.5} color={theme.colors.blue[6]} />}
            />
          </Group>
        </Paper>
        
        <Title order={2} className={classes.sectionTitle} mt="xl">
          <Group spacing="sm">
            <IconSettings size={24} />
            {t('generalSettings', 'General Settings')}
          </Group>
        </Title>
        
        <Paper withBorder shadow="md" p="xl" radius="md">
          <Group position="center">
            <Text size="lg" weight={500}>{t('loadingUserSettings', 'Loading user settings...')}</Text>
          </Group>
        </Paper>
      </Container>
    );
  }

  // Add a check for user.id as well, as it's crucial for API calls
  if (!user || !user.id) {
    return (
      <Container className={classes.settingsContainer} size="xl" px="xs">
        <Paper withBorder shadow="md" p="xl" radius="md">
          <Alert icon={<IconAlertCircle size={20} />} title={t('authError.title', 'Authentication Error')} color="red">
            {t('authError.userNotFound', 'User not found or incomplete user data. Please login again.')}
          </Alert>
        </Paper>
      </Container>
    );
  }
  return (
    <Container className={classes.settingsContainer} size="xl" px="xs">
      <Title order={1} align="center" mb="xl" className={classes.sectionTitle}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <IconUser size={28} stroke={1.5} color={theme.colors[theme.primaryColor][6]} />
          <Text gradient={{ from: theme.primaryColor, to: theme.colors[theme.primaryColor][4], deg: 45 }} 
                inherit variant="gradient">{t('pageTitle', 'Account Settings')}</Text>
        </Box>
      </Title>

      {error && (
        <Alert 
          icon={<IconAlertCircle size={18} />} 
          title={t('updateErrorAlertTitle', 'Update Error')} 
          color="red" 
          withCloseButton 
          onClose={() => setError(null)}
          mb="lg"
          radius="md"
        >
          {error}
        </Alert>
      )}

      <SimpleGrid cols={1} spacing="xl" breakpoints={[{ minWidth: 'md', cols: 1 }]}>
        {/* Appearance Settings Card */}
        <Card shadow="sm" padding="lg" radius="md" withBorder className={classes.cardContainer}>
          <Card.Section p="md" bg={theme.colorScheme === 'dark' ? theme.fn.rgba(theme.colors.blue[9], 0.2) : theme.colors.blue[0]}>
            <Group position="apart">
              <Group spacing="xs">
                <IconSettings size={24} stroke={1.5} color={theme.colors.blue[theme.colorScheme === 'dark' ? 4 : 6]} />
                <Title order={3}>{t('appearance.title', 'Appearance')}</Title>
              </Group>
              <Badge color="blue" variant="light">{t('appearance.theme', 'Theme')}</Badge>
            </Group>
          </Card.Section>
          
          <Box mt="md" p="md">
            <Group position="apart">
              <div>
                <Text weight={600}>{t('appearance.darkMode', 'Dark Mode')}</Text>
                <Text size="sm" color="dimmed">
                  {dark 
                    ? t('appearance.darkModeOn', 'Dark theme is enabled') 
                    : t('appearance.darkModeOff', 'Light theme is enabled')}
                </Text>
              </div>
              <Switch
                checked={dark}
                onChange={() => toggleColorScheme()}
                size="lg"
                onLabel={<IconSun size={16} stroke={2.5} color={theme.colors.yellow[4]} />}
                offLabel={<IconMoonStars size={16} stroke={2.5} color={theme.colors.blue[6]} />}
              />
            </Group>
          </Box>
        </Card>

        {/* General Information Card */}
        <Card shadow="sm" padding="lg" radius="md" withBorder className={classes.cardContainer}>
          <Card.Section p="md" bg={theme.colorScheme === 'dark' ? theme.fn.rgba(theme.colors[theme.primaryColor][9], 0.2) : theme.colors[theme.primaryColor][0]}>
            <Group position="apart">
              <Group spacing="xs">
                <IconSettings size={24} stroke={1.5} color={theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]} />
                <Title order={3}>{t('general.cardTitle', 'General Information')}</Title>
              </Group>
              <Badge color={theme.primaryColor} variant="light">{t('general.badge', 'Profile')}</Badge>
            </Group>
          </Card.Section>
          
          <form onSubmit={generalForm.onSubmit(handleGeneralSubmit)}>
            <Box className={classes.avatarContainer}>              <Transition mounted={true} transition="pop" duration={300} timingFunction="ease">
                {(styles) => (
                  <Avatar 
                    src={previewImage} 
                    size={150} 
                    radius={150} 
                    mx="auto"
                    style={{ ...styles }}
                    alt={t('general.avatarAlt', 'Profile Preview')}
                    className={classes.avatar}
                  >
                    {!previewImage && user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                )}
              </Transition>
                <Group position="center" spacing="sm" mt="md">
                <FileButton resetRef={resetRef} onChange={handleFileChange} accept="image/png,image/jpeg,image/gif">
                  {(props) => (
                    <Button 
                      {...props} 
                      leftIcon={<IconUpload size={16} />}
                      variant="light"
                      className={classes.buttonGradient}
                      size="sm"
                      radius="md"
                    >
                      {t('general.uploadImageButton', 'Upload Image')}
                    </Button>
                  )}
                </FileButton>
                
                {previewImage && (
                  <Button 
                    variant="light"
                    color="red" 
                    size="sm" 
                    radius="md"
                    onClick={handleRemoveImage}
                    leftIcon={<IconTrash size={16} />}
                  >
                    {t('general.removeImageButton', 'Remove')}
                  </Button>
                )}
              </Group>
              
              {profileImageFile && (
                <Text size="sm" color="dimmed" align="center" mt="xs">
                  {t('general.imageSelectedPrefix', 'Selected:')} {profileImageFile.name}
                </Text>
              )}
            </Box>            <Box mt="xl">
              <TextInput
                label={t('general.usernameLabel', 'Username')}
                placeholder={t('general.usernamePlaceholder', 'Your username')}
                icon={<IconUser size={16} />}
                {...generalForm.getInputProps('username')}
                className={classes.formField}
                radius="md"
                size="md"
              />
              
              <TextInput
                label={t('general.emailLabel', 'Email')}
                placeholder={t('general.emailPlaceholder', 'Your email')}
                icon={<IconAt size={16} />}
                disabled
                {...generalForm.getInputProps('email')}
                className={classes.formField}
                radius="md"
                size="md"
              />
            </Box>
              <Button 
              type="submit" 
              loading={isLoading} 
              fullWidth 
              mt="xl"
              size="md"
              leftIcon={<IconDeviceFloppy size={18} />}
              className={classes.buttonGradient}
              radius="md"
            >
              {t('general.saveButton', 'Save Changes')}
            </Button>          </form>
        </Card>

        <LanguageSettingsCard className={classes.cardContainer} />

        <Card shadow="sm" padding="lg" radius="md" withBorder className={classes.cardContainer}>
          <Card.Section p="md" bg={theme.colorScheme === 'dark' ? theme.fn.rgba(theme.colors.orange[9], 0.2) : theme.colors.orange[0]}>
            <Group position="apart">
              <Group spacing="xs">
                <IconLock size={24} stroke={1.5} color={theme.colors.orange[theme.colorScheme === 'dark' ? 4 : 6]} />
                <Title order={3}>{t('security.cardTitle', 'Security Settings')}</Title>
              </Group>
              <Badge color="orange" variant="light">{t('security.badge', 'Password')}</Badge>
            </Group>
          </Card.Section>
          
          {passwordError && (
            <Alert 
              icon={<IconAlertCircle size={18} />} 
              title={t('passwordErrorAlertTitle', 'Password Error')} 
              color="red" 
              withCloseButton 
              onClose={() => setPasswordError(null)} 
              my="md"
              radius="md"
            >
              {passwordError}
            </Alert>
          )}
          
          <form onSubmit={passwordForm.onSubmit(handleChangePassword)}>            <Box mt="xl">
              <PasswordInput
                label={t('security.currentPasswordLabel', 'Current Password')}
                placeholder={t('security.currentPasswordPlaceholder', 'Enter your current password')}
                icon={<IconKey size={16} />}
                {...passwordForm.getInputProps('old_password')}
                className={classes.formField}
                radius="md"
                size="md"
              />
              
              <PasswordInput
                label={t('security.newPasswordLabel', 'New Password')}
                placeholder={t('security.newPasswordPlaceholder', 'Choose a new password')}
                icon={<IconKey size={16} />}
                {...passwordForm.getInputProps('new_password')}
                className={classes.formField}
                radius="md"
                size="md"
              />
              
              <PasswordInput
                label={t('security.confirmNewPasswordLabel', 'Confirm New Password')}
                placeholder={t('security.confirmNewPasswordPlaceholder', 'Confirm your new password')}
                icon={<IconKey size={16} />}
                {...passwordForm.getInputProps('confirm_new_password')}
                className={classes.formField}
                radius="md"
                size="md"
              />
            </Box>
              <Button 
              type="submit" 
              loading={isLoading} 
              fullWidth 
              mt="xl"
              size="md"
              leftIcon={<IconLock size={18} />}
              color="orange"
              variant="filled"
              radius="md"
            >
              {t('security.updatePasswordButton', 'Update Password')}
            </Button>
          </form>
        </Card>
      </SimpleGrid>
    </Container>
  );
}

export default SettingsPage;
