import { Text, Box } from '@mantine/core';
import LanguageSelector from '../components/LanguageSelector'; // Import LanguageSelector
import { useTranslation } from 'react-i18next';

function AppFooter() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation(['footer', 'navigation']);
  
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
      <LanguageSelector />
      
      <Text size="sm" color="dimmed">
        {t('copyright', { year: currentYear, ns: 'footer' })} {' | '}
        <a href="/impressum" style={{ color: 'inherit', textDecoration: 'underline', margin: '0 8px' }}>{t('impressum', { ns: 'navigation' })}</a>
        {' | '}
        <a href="/about" style={{ color: 'inherit', textDecoration: 'underline', margin: '0 8px' }}>{t('about', { ns: 'navigation' })}</a>
      </Text>
    </Box>
  );
}

export default AppFooter;