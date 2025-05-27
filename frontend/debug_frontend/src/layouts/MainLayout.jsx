import { Outlet } from 'react-router-dom';
import { 
  AppShell, 
  Header, 
  Group, 
  Title,
  useMantineTheme,
  ActionIcon,
  Footer,
  Text,
  Box
} from '@mantine/core';
import { IconSun, IconMoonStars } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';

function MainLayout() {
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  
  const currentYear = new Date().getFullYear();
  
  return (
    <AppShell
      styles={{
        main: {
          background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      }}
      footer={
        <Footer height={60} p="md">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Text size="sm" color="dimmed">
              © {currentYear} TeachAI Learning Platform. All rights reserved.
            </Text>
          </Box>
        </Footer>
      }
      header={
        <Header height={60} p="md">
          <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'space-between' }}>
            <Group>
              <Title order={2}>TeachAI Learning Platform</Title>
            </Group>
            
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
      <Outlet />
    </AppShell>
  );
}

export default MainLayout;