import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TextInput, 
  PasswordInput, 
  Paper, 
  Title, 
  Container, 
  Button, 
  Text, 
  Anchor,
  Divider, // Import Divider
  Box, // Import Box for spacing if needed
  Group // Import Group for button grouping
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../contexts/AuthContext';
import authService from '../api/authService'; // Import authService
import { IconBrandGoogle, IconBrandGithub } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import discordGif from '../assets/wired-flat-2566-logo-discord-hover-wink.gif'; // Import local Discord GIF

// Use Discord GIF icon from local asset
const DiscordIcon = (props) => (
  <img
    src={discordGif}
    alt="Discord"
    width={32}
    height={32}
    style={{ display: 'block' }}
    {...props}
  />
);

function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const { t } = useTranslation();

  const form = useForm({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      username: (value) => !value ? t('auth.usernameRequired') : 
                          value.length < 3 ? t('auth.usernameLength', 'Username must be at least 3 characters') : null,
      email: (value) => !/^\S+@\S+$/.test(value) ? t('auth.emailInvalid', 'Invalid email address') : null,
      password: (value) => !value ? t('auth.passwordRequired') : 
                           value.length < 3 ? t('auth.passwordLength') : null,
      confirmPassword: (value, values) => value !== values.password ? t('auth.passwordsDoNotMatch', 'Passwords do not match') : null,
    },
  });

  const handleSubmit = async (values) => {
    setIsLoading(true);
    
    try {
      const result = await register(values.username, values.email, values.password);
      
      if (result.success) {
        // Automatically log in after registration
        const loginResult = await login(values.username, values.password);
        if (loginResult.success) {
          navigate('/'); // Redirect to dashboard/home
        } else {
          // fallback: show error or fallback to login page
          // toast.error(loginResult.message || 'Login failed after registration.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    authService.redirectToGoogleOAuth();
  };

  const handleGithubLogin = () => {
    authService.redirectToGithubOAuth();
  };

  const handleDiscordLogin = () => {
    authService.redirectToDiscordOAuth();
  };

  return (
    <Container
      size="xs"
      py="xl"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >      <Title align="center" mb="lg">
        {t('auth.registerTitle')}
      </Title>

      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label={t('auth.username')}
            placeholder={t('auth.usernamePlaceholder')}
            required
            {...form.getInputProps('username')}
            mb="md"
          />

          <TextInput
            label={t('auth.email')}
            placeholder={t('auth.emailPlaceholder', 'Your email')}
            required
            {...form.getInputProps('email')}
            mb="md"
          />

          <PasswordInput
            label={t('auth.password')}
            placeholder={t('auth.passwordPlaceholder')}
            required
            {...form.getInputProps('password')}
            mb="md"
          />

          <PasswordInput
            label={t('auth.confirmPassword')}
            placeholder={t('auth.confirmPasswordPlaceholder', 'Confirm your password')}
            required
            {...form.getInputProps('confirmPassword')}
            mb="xl"
          />

          <Button fullWidth type="submit" loading={isLoading}>
            {t('auth.signUp')}
          </Button>

          <Divider label={t('auth.continueWith')} labelPosition="center" my="lg" />

          <Group position="center" spacing="md" mb="xl">
            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              px="md"
              style={{ width: 48, height: 48, padding: 0 }}
            >
              <IconBrandGoogle size={24} />
            </Button>
            <Button
              variant="outline"
              onClick={handleGithubLogin}
              px="md"
              style={{ width: 48, height: 48, padding: 0 }}
            >
              <IconBrandGithub size={24} />
            </Button>
            <Button
              variant="outline"
              onClick={handleDiscordLogin}
              px="md"
              style={{ width: 48, height: 48, padding: 0 }}
            >
              <DiscordIcon />
            </Button>
          </Group>          <Text align="center" mt="md">
            {t('auth.haveAccount')}{' '}
            <Anchor component={Link} to="/login">
              {t('auth.signIn')}
            </Anchor>
          </Text>
        </form>
      </Paper>
    </Container>
  );
}

export default Register;