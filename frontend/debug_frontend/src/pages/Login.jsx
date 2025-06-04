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
const DiscordIcon = (props) => (
  <img
    src={discordGif}
    alt={t('auth.discordAltText')}
    width={32}
    height={32}
    style={{ display: 'block' }}
    {...props}
  />
);

function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => !value ? t('auth.usernameRequired') || 'Username is required' : null,
      password: (value) => !value ? t('auth.passwordRequired') || 'Password is required' : 
                           value.length < 3 ? t('auth.passwordLength') || 'Password must be at least 3 characters' : null,
    },
  });

  const handleSubmit = async (values) => {
    setIsLoading(true);
    
    try {
      const result = await login(values.username, values.password);
      
      if (result.success) {
        navigate('/');
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
        {t('auth.loginTitle')}
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

          <PasswordInput
            label={t('auth.password')}
            placeholder={t('auth.passwordPlaceholder')}
            required
            {...form.getInputProps('password')}
            mb="xl"
          />

          <Button fullWidth type="submit" loading={isLoading}>
            {t('auth.signIn')}
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
          </Group>
          
          <Text align="center" mt="md">
            {t('auth.noAccount')}{' '}
            <Anchor component={Link} to="/register">
              {t('auth.signUp')}
            </Anchor>
          </Text>
        </form>
      </Paper>
    </Container>
  );
}

export default Login;