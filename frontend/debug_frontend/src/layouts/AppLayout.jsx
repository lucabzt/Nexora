import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
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
  useMantineTheme,
  Avatar,
  ActionIcon,
  Stack
} from '@mantine/core';
import { 
  IconHome2, 
  IconPlus, 
  IconBookmarks, 
  IconUser,
  IconLogout,
  IconSettings,
  IconSun,
  IconMoonStars
} from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import { useMantineColorScheme } from '@mantine/core';
import AppFooter from '../components/AppFooter';

const MainLink = ({ icon, color, label, to }) => {
  const theme = useMantineTheme();
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
  
  const links = [
    { icon: <IconHome2 size={18} />, color: 'blue', label: 'Dashboard', to: '/' },
    { icon: <IconPlus size={18} />, color: 'teal', label: 'Create New Course', to: '/create-course' },
  ];

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
        },
      }}
      navbarOffsetBreakpoint="sm"
      navbar={
        <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 200, lg: 250 }}>
          <Navbar.Section grow mt="md">
            {links.map((link, index) => (
              <MainLink 
                {...link}
                key={index}
              />
            ))}
          </Navbar.Section>
          <Navbar.Section>
            <Box
              sx={(theme) => ({
                paddingTop: theme.spacing.sm,
                borderTop: `1px solid ${
                  theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
                }`,
              })}
            >
              <Menu position="top" withArrow>
                <Menu.Target>
                  <UnstyledButton
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
                      <Avatar color="cyan" radius="xl">{user?.username?.charAt(0).toUpperCase()}</Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Text size="sm" weight={500}>
                          {user?.username || 'User'}
                        </Text>
                        <Text color="dimmed" size="xs">
                          {user?.is_admin ? 'Administrator' : 'User'}
                        </Text>
                      </Box>
                    </Group>
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Account</Menu.Label>
                  <Menu.Item icon={<IconSettings size={14} />}>Settings</Menu.Item>
                  <Menu.Item 
                    color="red" 
                    icon={<IconLogout size={14} />}
                    onClick={handleLogout}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Box>
          </Navbar.Section>
        </Navbar>
      }
      header={
        <Header height={{ base: 60, sm: 70 }} p="md">
          <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'space-between' }}>
            <Group spacing="xs">
              <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                <Burger
                  opened={opened}
                  onClick={() => setOpened((o) => !o)}
                  size="sm"
                  color={theme.colors.gray[6]}
                />
              </MediaQuery>
              <Title 
                order={2} 
                size={{ base: 'h4', sm: 'h3' }}
                sx={(theme) => ({
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                })}
              >
                TeachAI
              </Title>
            </Group>
            
            <Group spacing="xs">
              <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
                <Text size="sm">Welcome, {user?.username || 'User'}</Text>
              </MediaQuery>
              <ActionIcon
                variant="outline"
                color={dark ? 'yellow' : 'blue'}
                onClick={() => toggleColorScheme()}
                title="Toggle color scheme"
              >
                {dark ? <IconSun size={18} /> : <IconMoonStars size={18} />}
              </ActionIcon>
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

export default AppLayout;