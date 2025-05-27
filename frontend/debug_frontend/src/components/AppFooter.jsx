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
        © {currentYear} TeachAI Learning Platform. All rights reserved.
      </Text>
    </Box>
  );
}

export default AppFooter;