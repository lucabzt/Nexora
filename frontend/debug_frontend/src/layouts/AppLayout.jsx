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
  useMantineTheme
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
  IconInfoCircle
} from '@tabler/icons-react';

const MainLink = ({ icon, color, label, to }) => {
  const navigate = useNavigate();
  
  return (
    <UnstyledButton
      onClick={() => navigate(to)}
      sx={(theme) => ({
        display: 'block',
        width: '100%',
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
        '&:hover': {
          backgroundColor:
            theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        },
      })}
    >
      <Group>
        <ThemeIcon color={color} variant="light">
          {icon}
        </ThemeIcon>
        <Text size="sm">{label}</Text>
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
    { icon: <IconInfoCircle size={18} />, color: 'grape', label: 'About Nexora', to: '/home' },
    { icon: <IconSettings size={18} />, color: 'gray', label: 'Settings', to: '/settings' }
  ];

  const mainLinksComponents = mainLinksData.map((link) => <MainLink {...link} key={link.label} />);

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
      asideOffsetBreakpoint="sm"
      header={
        <Header height={{ base: 60, md: 70 }} p="md">
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
                mr="xl"
              />
            </MediaQuery>

            <Title
              order={1}
              size="1.6rem"
              component={RouterLink}
              to={user ? "/" : "/home"}
              sx={(theme) => ({
                textDecoration: 'none',
                color: theme.colorScheme === 'dark' ? theme.white : theme.black,
                fontWeight: 800,
                letterSpacing: '-1px',
                transition: 'color 0.2s',
                '&:hover': {
                  color: theme.colors.violet[5],
                  textDecoration: 'none',
                  cursor: 'pointer',
                },
              })}
            >
              Nexora
            </Title>
            <Box sx={{ flexGrow: 1 }} /> {/* Spacer */}
            <Group spacing="xs">
              {user ? (
                <Menu shadow="md" width={220}>
                  <Menu.Target>
                     <UnstyledButton> 
                    <Group spacing="xs"> 
                      <Avatar
                        key={avatarSrc || (user ? user.id : 'app-layout-avatar')}
                        src={avatarSrc}
                        radius="xl"
                        alt={user.username || 'User avatar'}
                        color="cyan"
                        style={{ cursor: 'pointer' }}
                      >
                        {!avatarSrc && user.username ? user.username.substring(0, 2).toUpperCase() : (!avatarSrc ? <IconUser size={18} /> : null)}
                      </Avatar>
                      <Text size="sm" weight={500}>{user.username}</Text>
                     </Group>
                     </UnstyledButton>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>{user.email}</Menu.Label>
                    <Menu.Item icon={<IconSettings size={14} />} onClick={() => navigate('/settings')}>
                      Settings
                    </Menu.Item>
                    <Menu.Item 
                      icon={dark ? <IconSun size={14} /> : <IconMoonStars size={14} />} 
                      onClick={() => toggleColorScheme()}
                    >
                      Toggle Theme
                    </Menu.Item>
                    <Menu.Item icon={<IconLogout size={14} />} onClick={handleLogout}>
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ) : (
                <Button onClick={() => navigate('/login')}>Login</Button>
              )}
            </Group>
          </div>
        </Header>
      }
      navbar={
        <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 250, lg: 300 }}>
          <Navbar.Section grow mt="xs">
            {mainLinksComponents}
          </Navbar.Section>
        </Navbar>
      }
    >
      <Outlet />
    </AppShell>
  );
}

export default AppLayout;