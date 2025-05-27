import { Outlet } from 'react-router-dom';
import { 
  AppShell, 
  Header, 
  Group, 
  Title,
  useMantineTheme,
  ActionIcon,
  Box
} from '@mantine/core';
import { IconSun, IconMoonStars } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import AppFooter from '../components/AppFooter';

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
        },
      }}
      header={
        <Header height={{ base: 60, sm: 70 }} p="md">
          <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'space-between' }}>
            <Title 
              order={2} 
              size={{ base: 'h4', sm: 'h3' }}
              sx={(theme) => ({
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              })}
            >
              Nexora
            </Title>
            
            <ActionIcon
              variant="outline"
              color={dark ? 'yellow' : 'blue'}
              onClick={() => toggleColorScheme()}
              title="Toggle color scheme"
            >
              {dark ? <IconSun size={18} /> : <IconMoonStars size={18} />}
            </ActionIcon>
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