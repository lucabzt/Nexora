import { Outlet, Link } from 'react-router-dom';
import { 
  AppShell, 
  Header, 
  Group, 
  Title,
  useMantineTheme,
  ActionIcon,
  Box,
  Button,
  Avatar, // Added Avatar
  Menu,
  Text, // Ensure Text is imported
  useMantineColorScheme // Import here directly
} from '@mantine/core';
import { 
  IconSettings,
  IconSun, 
  IconMoonStars, 
  IconUser, 
  IconLogout 
} from '@tabler/icons-react'; // Added IconLogout and IconUser
import AppFooter from '../components/AppFooter';
import { Link as RouterLink, useNavigate } from 'react-router-dom'; // Added useNavigate
import { useAuth } from '../contexts/AuthContext'; // Added useAuth
import { useTranslation } from 'react-i18next'; // Import useTranslation hook

function MainLayout() {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth(); // Ensure isAuthenticated is destructured
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { t } = useTranslation(['app', 'navigation']); // Initialize translation hook for app and navigation namespaces
  const dark = colorScheme === 'dark';

  // Logic to determine avatar source
  let avatarSrc = null;
  if (user && user.profile_image_base64) {
    if (user.profile_image_base64.startsWith('data:image')) {
      avatarSrc = user.profile_image_base64;
    } else {
      avatarSrc = `data:image/jpeg;base64,${user.profile_image_base64}`;
    }
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <AppShell
      styles={{
        main: {
          background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          padding: 0, // Remove padding for full-width landing page
        },
      }}
      header={
        <Header height={{ base: 70, sm: 80 }} p="md">
          <div style={{  display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'space-between' }}>              <Title 
              order={2} 
              size="1.6rem"
              component={Link}
              to="/home"
              
              sx={(theme) => ({
                fontWeight: 800,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textDecoration: 'none',
                color: theme.colorScheme === 'dark' ? theme.white : theme.black,
              })}
            >
              {t('title', { ns: 'app' })}
            </Title>
              <Group spacing="md">
              <ActionIcon
                variant="outline"
                color={dark ? 'yellow' : 'teal'}
                onClick={() => toggleColorScheme()}
                title={t('colorSchemeToggleTitle', { ns: 'app', defaultValue: 'Toggle color scheme' })}
                size="lg"
                radius="md"
              >
                {dark ? <IconSun size={20} /> : <IconMoonStars size={20} />}
              </ActionIcon>
              {isAuthenticated && user ? ( // Added user check for safety
                <Menu shadow="md" width={200} position="bottom-end">
                  <Menu.Target>
                    <Group spacing="xs" sx={{ cursor: 'pointer' }}>
                      <Avatar
                        key={avatarSrc || user.id}
                        src={avatarSrc}
                        alt={user.username || t('userAvatarFallbackAlt', { ns: 'navigation', defaultValue: 'User' })}
                        radius="xl"
                        size="sm"
                        color="cyan" // Added color for consistency if image fails
                      >
                        {!avatarSrc && user.username ? user.username.substring(0, 2).toUpperCase() : (!avatarSrc ? <IconUser size={14} /> : null)}
                      </Avatar>
                      {user && (
                        <Text size="sm" fw={500}>
                          {user.username}
                        </Text>
                      )}
                    </Group>
                  </Menu.Target>
                  <Menu.Dropdown>                    <Menu.Item icon={<IconUser size={14} />} onClick={() => navigate('/')}>
                      {t('dashboard', { ns: 'navigation' })}
                    </Menu.Item>
                    <Menu.Item icon={<IconSettings size={14} />} onClick={() => navigate('/settings')}>
                      {t('settings', { ns: 'navigation' })}
                    </Menu.Item>
                    <Menu.Item icon={<IconLogout size={14} />} onClick={handleLogout}>
                      {t('logout', { ns: 'navigation' })}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ) : (
                <>                  <Button 
                    component={RouterLink} 
                    to="/login" 
                    variant="outline"
                    radius="md"
                    sx={(theme) => ({
                      [theme.fn.smallerThan('sm')]: {
                        paddingLeft: theme.spacing.xs,
                        paddingRight: theme.spacing.xs,
                        fontSize: theme.fontSizes.xs,
                      },
                    })}
                  >
                    {t('login', { ns: 'navigation' })}
                  </Button>
                  
                  <Button 
                    component={RouterLink} 
                    to="/register" 
                    variant="filled"
                    radius="md"
                    color="teal"
                    sx={(theme) => ({
                      [theme.fn.smallerThan('sm')]: {
                        paddingLeft: theme.spacing.xs,
                        paddingRight: theme.spacing.xs,
                        fontSize: theme.fontSizes.xs,
                      },
                    })}
                  >
                    {t('register', { ns: 'navigation' })}
                  </Button>
                  {/* Theme toggle for non-authenticated users is removed from here */}
                </>
              )}
            </Group>
          </div>
        </Header>
      }
    >
      <Box sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <AppFooter />
    </AppShell>
  );
}

export default MainLayout;