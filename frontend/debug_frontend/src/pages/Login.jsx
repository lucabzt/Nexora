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
  Group,
  Divider, // Import Divider
  Box // Import Box for spacing if needed
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../contexts/AuthContext';
import authService from '../api/authService'; // Import authService
import { IconBrandGoogle, IconBrandGithub } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next'; // Import useTranslation hook
import discordGif from '../assets/wired-flat-2566-logo-discord-hover-wink.gif'; // Import local Discord GIF

// Use Discord GIF icon from local asset
const DiscordIcon = (props) => {
  const { t } = useTranslation('auth');
  return (
    <img
      src={discordGif}
      alt={t('discordAltText')}
      width={32}
      height={32}
      style={{ display: 'block' }}
      {...props}
    />
  );
}

function Login() {
  const { t } = useTranslation('auth');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => !value ? t('usernameRequired') || 'Username is required' : null,
      password: (value) => !value ? t('passwordRequired') || 'Password is required' : 
                           value.length < 3 ? t('passwordLength') || 'Password must be at least 3 characters' : null,
    },
  });

  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      // The login function from AuthContext now returns the user object on success
      // or throws an error on failure.
      const user = await login(values.username, values.password);
      
      // If login is successful and returns a user object, navigate.
      if (user) {
        navigate('/dashboard'); // Navigate to the dashboard
      }
      // No explicit 'else' needed here because if 'user' is not returned,
      // an error would have been thrown by the login() function and caught below.
    } catch (error) {
      // Errors (e.g., invalid credentials, network issues) are already handled by 
      // the login function in AuthContext (it shows a toast).
      // You can add additional error handling specific to this page if needed.
      console.error("Login page: Login failed", error);
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
        {t('loginTitle')}
      </Title>
      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label={t('username')}
            placeholder={t('usernamePlaceholder')}
            required
            {...form.getInputProps('username')}
            mb="md"
          />

          <PasswordInput
            label={t('password')}
            placeholder={t('passwordPlaceholder')}
            required
            {...form.getInputProps('password')}
            mb="xl"
          />

          <Button fullWidth type="submit" loading={isLoading}>
            {t('signIn')}
          </Button>

          <Divider label={t('continueWith')} labelPosition="center" my="lg" />

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
          </Group>
          
          <Text align="center" mt="md">
            {t('noAccount')}{' '}
            <Anchor component={Link} to="/register">
              {t('signUp')}
            </Anchor>
          </Text>
        </form>
      </Paper>
    </Container>
  );
}

export default Login;