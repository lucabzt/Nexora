import { Outlet, Link } from 'react-router-dom';
import { 
  AppShell, 
  Header, 
  Group, 
  Title,
  useMantineTheme,
  ActionIcon,
  Box,
  Button
} from '@mantine/core';
import { IconSun, IconMoonStars, IconUser } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import AppFooter from '../components/AppFooter';
import { Link as RouterLink } from 'react-router-dom';

function MainLayout() {
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  
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