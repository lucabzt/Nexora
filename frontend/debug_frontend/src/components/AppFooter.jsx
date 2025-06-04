import { Text, Box } from '@mantine/core';

function AppFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box 
      sx={(theme) => ({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.md,
        marginTop: 'auto',
        borderTop: `1px solid ${
          theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
        }`,
      })}
    >
      <Text size="sm" color="dimmed">
        © {currentYear} Nexora Learning Platform. All rights reserved. {' | '}
        <a href="/impressum" style={{ color: 'inherit', textDecoration: 'underline', margin: '0 8px' }}>Impressum</a>
        {' | '}
        <a href="/about" style={{ color: 'inherit', textDecoration: 'underline', margin: '0 8px' }}>About</a>
      </Text>
    </Box>
  );
}

export default AppFooter;