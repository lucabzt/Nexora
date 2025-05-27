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
  Text // Ensure Text is imported
} from '@mantine/core';
import { IconSun, IconMoonStars, IconUser, IconLogout } from '@tabler/icons-react'; // Added IconLogout and IconUser
import { useMantineColorScheme } from '@mantine/core';
import AppFooter from '../components/AppFooter';
import { Link as RouterLink, useNavigate } from 'react-router-dom'; // Added useNavigate
import { useAuth } from '../contexts/AuthContext'; // Added useAuth

function MainLayout() {
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  const { isAuthenticated, user, logout } = useAuth(); // Get auth state and user info
  const navigate = useNavigate(); // Added for logout navigation

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
          <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'space-between' }}>
            <Title 
              order={2} 
              size={{ base: 'h4', sm: 'h3' }}
              component={Link}
              to="/home"
              sx={(theme) => ({
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textDecoration: 'none',
                color: theme.colorScheme === 'dark' ? theme.white : theme.black,
              })}
            >
              Nexora
            </Title>
            
            <Group spacing="md">
              {isAuthenticated && user ? (
                <Menu shadow="md" width={200} position="bottom-end">
                  <Menu.Target>
                    <Group spacing="xs" sx={{ cursor: 'pointer' }}>
                      <Avatar src={user.avatar_url} alt={user.username} radius="xl" size="sm" />
                      <Text size="sm" fw={500}>
                        {user.username}
                      </Text>
                    </Group>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item icon={<IconUser size={14} />} onClick={() => navigate('/')}>
                      Dashboard
                    </Menu.Item>
                    <Menu.Item icon={<IconLogout size={14} />} onClick={handleLogout}>
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ) : (
                <>
                  <Button 
                    component={RouterLink} 
                    to="/login" 
                    variant="outline"
                    radius="md"
                  >
                    Log In
                  </Button>
                  
                  <Button 
                    component={RouterLink} 
                    to="/register" 
                    variant="filled"
                    radius="md"
                    color="teal"
                  >
                    Sign Up
                  </Button>
                </>
              )}

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

export default MainLayout;