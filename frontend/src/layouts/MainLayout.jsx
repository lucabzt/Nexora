import { Outlet, useLocation } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';
import { 
  AppShell, 
  Header, 
  Group, 
  Title,
  useMantineTheme,
  ActionIcon,
  Box,
  Button,
  Avatar,
  Menu,
  useMantineColorScheme,
  Badge,
  Divider,
  UnstyledButton,
  Text,
} from '@mantine/core';
import { 
  IconSettings,
  IconSun, 
  IconMoonStars, 
  IconUser, 
  IconLogout,
  IconInfoCircle,
  IconSparkles,
  IconHome2,
  IconChartLine,
  IconShieldCheck
} from '@tabler/icons-react';
import AppFooter from '../components/AppFooter';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';


function MainLayout() {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth(); // Ensure isAuthenticated is destructured
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { t } = useTranslation(['app', 'navigation', 'common']); // Initialize translation hook for app, navigation, and common namespaces
  // Search functionality moved to SearchBar component
  const { pathname } = useLocation();
  const dark = colorScheme === 'dark';
  const isMobile = useMediaQuery('(max-width: 768px)'); // Add mobile detection

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
    navigate('/auth/login');
  };

  return (
      <AppShell
      styles={{
        main: {
          background: dark ? theme.colors.dark[8] : theme.colors.gray[0],
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100%',
          padding: 0,
          overflowX: 'hidden',
          touchAction: 'manipulation',
          textSizeAdjust: '100%',
        },
      }}
      header={
        <Header 
          height={{ base: 60, md: 70 }} 
          p="md"
          sx={(theme) => ({
            background: dark 
              ? `linear-gradient(135deg, ${theme.colors.dark[7]} 0%, ${theme.colors.dark[8]} 100%)`
              : `linear-gradient(135deg, ${theme.white} 0%, ${theme.colors.gray[0]} 100%)`,
            borderBottom: `1px solid ${dark ? theme.colors.dark[6] : theme.colors.gray[2]}`,
            boxShadow: dark 
              ? `0 4px 12px ${theme.colors.dark[9]}50`
              : `0 4px 12px ${theme.colors.gray[3]}30`,
            zIndex: 200,
            position: 'relative',
          })}
        >
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Group spacing="xs">
              {(!isMobile || isAuthenticated) && (
                <img 
                  src={theme.colorScheme === 'dark' ? "/logo_white.png" : "/logo_black.png"}
                  alt="Logo"
                  style={{ 
                    height: 28,
                    width: 'auto',
                    filter: 'drop-shadow(0 2px 4px rgba(139, 92, 246, 0.3))',
                  }} 
                />
              )}
              <Title
                    order={3}
                    size="1.6rem"
                    component={RouterLink}
                    to={isAuthenticated ? "/dashboard" : "/"}
                    sx={(theme) => ({
                      // gradient text
                      textDecoration: "none",
                      background: `linear-gradient(135deg, ${theme.colors.teal[6]}, ${theme.colors.cyan[4]})`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: 800,
                      letterSpacing: "-1px",

                      // keep the pseudo‐element for hover‐bg if you like
                      display: "inline-block",
                      position: "relative",
                      padding: theme.spacing.xs,

                      // smooth transition
                      transition: "transform 0.2s ease",

                      "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        borderRadius: theme.radius.sm,
                        background: "transparent",
                        zIndex: -1,
                        transition: "background 0.2s ease",
                      },

                      "&:hover": {
                        transform: "scale(1.02)",
                        cursor: "pointer",
                      },

                      
                    })}
                  >
                    {t("title", { ns: "app" })}
                  </Title>
            </Group>
            
            <Box sx={{ flexGrow: 1 }} />
            
            <Box sx={{ flexGrow: 1, '@media (min-width: 769px)': { display: 'none' } }} />
            
            <Group spacing="md">
              {(!isMobile || isAuthenticated) && (
                <ActionIcon
                  variant="outline"
                  color={dark ? 'yellow' : 'blue'}
                  onClick={() => toggleColorScheme()}
                  title={t('colorSchemeToggleTitle', { ns: 'app', defaultValue: 'Toggle color scheme' })}
                  size="lg"
                  radius="md"
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                    display: isMobile && !isAuthenticated ? 'none' : 'flex',
                  }}
                >
                  {dark ? <IconSun size={20} /> : <IconMoonStars size={20} />}
                </ActionIcon>
              )}
              
              {isAuthenticated && user ? (
                <Menu shadow="md" width={220} withinPortal={true} zIndex={300}>
                  <Menu.Target>
                    <UnstyledButton
                      sx={{
                        padding: theme.spacing.xs,
                        borderRadius: theme.radius.md,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: dark ? theme.colors.dark[6] : theme.colors.gray[1],
                          transform: 'scale(1.02)',
                        },
                      }}
                    >
                      <Group spacing="xs">
                        <Avatar
                          key={avatarSrc || user.id}
                          src={avatarSrc}
                          radius="xl"
                          alt={user.username || t('userAvatarAlt', { ns: 'app', defaultValue: 'User avatar' })}
                          color="cyan"
                          sx={{
                            cursor: 'pointer',
                            border: `2px solid ${theme.colors.cyan[5]}40`,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              border: `2px solid ${theme.colors.cyan[5]}`,
                            },
                          }}
                        >
                          {!avatarSrc && user.username ? user.username.substring(0, 2).toUpperCase() : (!avatarSrc ? <IconUser size={18} /> : null)}
                        </Avatar>
                        <Box>
                          <Text size="sm" weight={500}>{user.username}</Text>
                          <Badge 
                            size="xs" 
                            variant="light" 
                            color="cyan"
                            sx={{ textTransform: 'none' }}
                          >
                            {t('onlineStatusBadge', { ns: 'app', defaultValue: 'Online' })}
                          </Badge>
                        </Box>
                      </Group>
                    </UnstyledButton>
                  </Menu.Target>
                  <Menu.Dropdown
                    sx={{
                      border: `1px solid ${dark ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                      boxShadow: dark 
                        ? `0 8px 24px ${theme.colors.dark[9]}70`
                        : `0 8px 24px ${theme.colors.gray[4]}40`,
                      zIndex: 300,
                    }}
                  >
                    <Menu.Item 
                      icon={<IconHome2 size={14} />} 
                      onClick={() => navigate('/dashboard')}
                      sx={{
                        '&:hover': {
                          backgroundColor: dark ? theme.colors.dark[6] : theme.colors.gray[1],
                        },
                      }}
                    >
                      {t('dashboard', { ns: 'navigation' })}
                    </Menu.Item>
                    {/*<Menu.Item 
                      icon={<IconChartLine size={14} />} 
                      onClick={() => navigate('/dashboard/statistics')}
                      sx={{
                        '&:hover': {
                          backgroundColor: dark ? theme.colors.dark[6] : theme.colors.gray[1],
                        },
                      }}
                    >
                      {t('statistics', { ns: 'navigation' })}
                    </Menu.Item>
                    */}
                    <Menu.Item 
                      icon={<IconSettings size={14} />} 
                      onClick={() => navigate('/dashboard/settings')}
                      sx={{
                        '&:hover': {
                          backgroundColor: dark ? theme.colors.dark[6] : theme.colors.gray[1],
                        },
                      }}
                    >
                      {t('settings', { ns: 'navigation' })}
                    </Menu.Item>
                    <Divider />
                    <Menu.Item 
                      icon={<IconInfoCircle size={14} />} 
                      onClick={() => navigate('/about')}
                      sx={{
                        '&:hover': {
                          backgroundColor: dark ? theme.colors.dark[6] : theme.colors.gray[1],
                        },
                      }}
                    >
                      {t('about', { ns: 'navigation' })}
                    </Menu.Item>
                    <Menu.Item 
                      icon={<IconLogout size={14} />} 
                      onClick={handleLogout}
                      color="red"
                      sx={{
                        '&:hover': {
                          backgroundColor: `${theme.colors.red[6]}15`,
                        },
                      }}
                    >
                      {t('logout', { ns: 'navigation' })}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ) : (
                !['/auth/login', '/auth/signup'].includes(pathname) && (
                  <Group spacing="xs">
                    <Button 
                      component={RouterLink}
                      to="/auth/login"
                      variant="outline"
                      radius="md"
                      sx={{
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    >
                      {t('login', { ns: 'navigation' })}
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/auth/signup"
                      variant="gradient"
                      gradient={{ from: 'violet', to: 'blue' }}
                      radius="md"
                      sx={{
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    >
                      {t('register', { ns: 'navigation' })}
                    </Button>
                  </Group>
                )
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