import { useState } from 'react';
import { Outlet, Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  AppShell, 
  Navbar, 
  Header, 
  MediaQuery, 
  Burger, 
  Title,
  UnstyledButton,
  Group,
  Text,
  ThemeIcon,
  Box,
  Menu,
  Avatar,
  useMantineColorScheme,
  Button,
  useMantineTheme,
  Badge,
  Divider,
  Paper,
  Transition,
  Stack
} from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';
import {
  IconHome2,
  IconPlus,
  IconSettings,
  IconSun,
  IconMoonStars,
  IconLogout,
  IconUser,
  IconInfoCircle,
  IconChevronRight,
  IconSparkles
} from '@tabler/icons-react';

const MainLink = ({ icon, color, label, to, isActive }) => {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  
  return (
    <UnstyledButton
      onClick={() => navigate(to)}
      sx={(theme) => ({
        display: 'block',
        width: '100%',
        // Make menu items higher and all the same size
        minHeight: 60,
        height: 64,
        padding: `16px 16px 16px 16px`, // more left and right padding
        borderRadius: theme.radius.md,
        marginBottom: theme.spacing.xs,
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
        backgroundColor: isActive ? 
          (theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1]) :
          'transparent',
        border: `1px solid ${isActive ? 
          (theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]) :
          'transparent'}`,
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      })}
    >
      <Group spacing={18} sx={{ position: 'relative', zIndex: 1, height: '100%', flexWrap: 'nowrap' }}>
        <ThemeIcon 
          color={color} 
          variant="light" 
          size="lg"
          sx={{
            background: `linear-gradient(135deg, ${theme.colors[color][6]}20, ${theme.colors[color][4]}10)`,
            border: `1px solid ${theme.colors[color][6]}30`,
            marginLeft: 4, // extra space left of icon
            marginRight: 8, // extra space right of icon
          }}
        >
          {icon}
        </ThemeIcon>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Text size="md" weight={600} mb={2} sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</Text>
          <Box 
            sx={{ 
              height: 3, 
              background: `linear-gradient(90deg, ${theme.colors[color][6]}, ${theme.colors[color][4]})`,
              borderRadius: 2,
              width: isActive ? '100%' : '0%',
              transition: 'width 0.3s ease',
            }} 
          />
        </Box>
        <IconChevronRight 
          size={18} 
          style={{ 
            opacity: 0.6,
            transition: 'transform 0.2s ease',
            marginLeft: 8
          }}
        />
      </Group>
    </UnstyledButton>
  );
};

function AppLayout() {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  
  // Get current path to determine active link
  const currentPath = window.location.pathname;
  
  // Logic to determine avatar source
  let avatarSrc = null;
  if (user && user.profile_image_base64) {
    if (user.profile_image_base64.startsWith('data:image')) {
      avatarSrc = user.profile_image_base64;
    } else {
      avatarSrc = `data:image/jpeg;base64,${user.profile_image_base64}`;
    }
  }

  const mainLinksData = [
    { icon: <IconHome2 size={18} />, color: 'blue', label: 'Dashboard', to: '/' },
    { icon: <IconPlus size={18} />, color: 'teal', label: 'Create New Course', to: '/create-course' },
    { icon: <IconSettings size={18} />, color: 'gray', label: 'Settings', to: '/settings' },
    { icon: <IconInfoCircle size={18} />, color: 'grape', label: 'About Nexora', to: '/home' }

  ];

  const mainLinksComponents = mainLinksData.map((link) => (
    <MainLink 
      {...link} 
      key={link.label} 
      isActive={currentPath === link.to}
    />
  ));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppShell
      styles={{
        main: {
          background: dark ? theme.colors.dark[8] : theme.colors.gray[0],
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"      header={
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
          })}
        >
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
                mr="xl"
                sx={{
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              />
            </MediaQuery>

            <Group spacing="xs">
              <IconSparkles 
                size={28} 
                style={{ 
                  color: theme.colors.violet[5],
                  filter: 'drop-shadow(0 2px 4px rgba(139, 92, 246, 0.3))',
                }} 
              />
              <Title
                order={1}
                size="1.6rem"
                component={RouterLink}
                to={user ? "/" : "/home"}
                sx={(theme) => ({
                  textDecoration: 'none',
                  background: `linear-gradient(135deg, ${theme.colors.violet[6]}, ${theme.colors.violet[4]})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800,
                  letterSpacing: '-1px',
                  transition: 'all 0.3s ease',
                  filter: 'drop-shadow(0 2px 4px rgba(139, 92, 246, 0.2))',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    filter: 'drop-shadow(0 4px 8px rgba(139, 92, 246, 0.4))',
                  },
                })}
              >
                Nexora
              </Title>
            </Group>
            
            <Box sx={{ flexGrow: 1 }} /> {/* Spacer */}
            
            <Group spacing="xs">
              {user ? (
                <Menu shadow="md" width={220}>
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
                          key={avatarSrc || (user ? user.id : 'app-layout-avatar')}
                          src={avatarSrc}
                          radius="xl"
                          alt={user.username || 'User avatar'}
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
                            Online
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
                    }}
                  >
                    <Menu.Label sx={{ fontSize: theme.fontSizes.xs, color: theme.colors.gray[6] }}>
                      {user.email}
                    </Menu.Label>
                    <Menu.Item 
                      icon={<IconSettings size={14} />} 
                      onClick={() => navigate('/settings')}
                      sx={{
                        '&:hover': {
                          backgroundColor: dark ? theme.colors.dark[6] : theme.colors.gray[1],
                        },
                      }}
                    >
                      Settings
                    </Menu.Item>
                    <Menu.Item 
                      icon={dark ? <IconSun size={14} /> : <IconMoonStars size={14} />} 
                      onClick={() => toggleColorScheme()}
                      sx={{
                        '&:hover': {
                          backgroundColor: dark ? theme.colors.dark[6] : theme.colors.gray[1],
                        },
                      }}
                    >
                      Toggle Theme
                    </Menu.Item>
                    <Divider />
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
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ) : (
                <Button 
                  onClick={() => navigate('/login')}
                  variant="gradient"
                  gradient={{ from: 'violet', to: 'blue' }}
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  Login
                </Button>
              )}
            </Group>
          </div>
        </Header>
      }      navbar={
        <Navbar 
          p="md" 
          hiddenBreakpoint="sm" 
          hidden={!opened} 
          width={{ sm: 250, lg: 300 }}
          sx={(theme) => ({
            background: dark 
              ? `linear-gradient(180deg, ${theme.colors.dark[7]} 0%, ${theme.colors.dark[8]} 100%)`
              : `linear-gradient(180deg, ${theme.white} 0%, ${theme.colors.gray[0]} 100%)`,
            borderRight: `1px solid ${dark ? theme.colors.dark[5] : theme.colors.gray[2]}`,
            boxShadow: dark 
              ? `4px 0 12px ${theme.colors.dark[9]}30`
              : `4px 0 12px ${theme.colors.gray[3]}20`,
          })}
        >
          <Navbar.Section>
            <Paper
              p="md"
              sx={(theme) => ({
                background: dark 
                  ? `linear-gradient(135deg, ${theme.colors.dark[6]}80, ${theme.colors.dark[5]}40)`
                  : `linear-gradient(135deg, ${theme.colors.gray[1]}80, ${theme.white}40)`,
                border: `1px solid ${dark ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                borderRadius: theme.radius.lg,
                marginBottom: theme.spacing.lg,
                backdropFilter: 'blur(8px)',
              })}
            >
              <Group spacing="sm" mb="xs">
                <ThemeIcon 
                  size="lg" 
                  variant="gradient" 
                  gradient={{ from: 'violet', to: 'blue' }}
                  sx={{ boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}
                >
                  <IconSparkles size={20} />
                </ThemeIcon>
                <Box>
                  <Text size="sm" weight={600} mb={2}>Navigation</Text>
                  <Text size="xs" color="dimmed">Choose your destination</Text>
                </Box>
              </Group>
            </Paper>
          </Navbar.Section>
          
          <Navbar.Section grow mt="xs">
            <Stack spacing="xs">
              {mainLinksComponents}
            </Stack>
          </Navbar.Section>
          
          <Navbar.Section>
            <Paper
              p="sm"
              sx={(theme) => ({
                background: dark 
                  ? `linear-gradient(135deg, ${theme.colors.violet[9]}20, ${theme.colors.blue[9]}10)`
                  : `linear-gradient(135deg, ${theme.colors.violet[1]}40, ${theme.colors.blue[1]}20)`,
                border: `1px solid ${dark ? theme.colors.violet[8] : theme.colors.violet[2]}`,
                borderRadius: theme.radius.md,
                textAlign: 'center',
              })}
            >
              <Text size="xs" color="dimmed" mb="xs">
                Powered by AI
              </Text>
              <Group spacing="xs" position="center">
                <IconSparkles size={16} color={theme.colors.violet[5]} />
                <Text size="xs" weight={500} color={theme.colors.violet[6]}>
                  Nexora Learning
                </Text>
              </Group>
            </Paper>
          </Navbar.Section>
        </Navbar>
      }
    >
      <Outlet />
    </AppShell>
  );
}

export default AppLayout;