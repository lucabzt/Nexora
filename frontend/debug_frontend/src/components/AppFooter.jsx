import { Text, Box } from '@mantine/core';
import LanguageSelector from '../components/LanguageSelector'; // Import LanguageSelector
import { useTranslation } from 'react-i18next';

function AppFooter() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();
  
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
        {t('footer.copyright', { year: currentYear })} {' | '}
        <a href="/impressum" style={{ color: 'inherit', textDecoration: 'underline', margin: '0 8px' }}>{t('navigation.impressum')}</a>
        {' | '}
        <a href="/about" style={{ color: 'inherit', textDecoration: 'underline', margin: '0 8px' }}>{t('navigation.about')}</a>
      </Text>
    </Box>
  );
}

export default AppFooter;