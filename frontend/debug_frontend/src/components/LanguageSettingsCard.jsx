import { 
  Card, 
  Group, 
  Title, 
  Badge, 
  Select, 
  Box, 
  Text,
  useMantineTheme
} from '@mantine/core';
import { IconLanguage } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

function LanguageSettingsCard({ className }) {
  const { t, i18n } = useTranslation();
  const theme = useMantineTheme();

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder className={className}>
      <Card.Section p="md" bg={theme.colorScheme === 'dark' ? 
        theme.fn.rgba(theme.colors.violet[9], 0.2) : 
        theme.colors.violet[0]}>
        <Group position="apart">
          <Group spacing="xs">
            <IconLanguage size={24} stroke={1.5} 
              color={theme.colors.violet[theme.colorScheme === 'dark' ? 4 : 6]} />
            <Title order={3}>{t('settings.languageSettings')}</Title>
          </Group>
          <Badge color="violet" variant="light">{t('settings.preferences')}</Badge>
        </Group>
      </Card.Section>
      
      <Box p="md" pt="xl">
        <Text mb="md">{t('settings.languageDescription')}</Text>
        
        <Box mt="md">
          <Select
            size="md"
            label={t('settings.selectLanguage')}
            value={i18n.language}
            onChange={(value) => i18n.changeLanguage(value)}
            data={[
              { value: 'en', label: t('language.english') },
              { value: 'de', label: t('language.german') },
            ]}
            icon={<IconLanguage size={18} />}
            radius="md"
          />
        </Box>
      </Box>
    </Card>
  );
}

export default LanguageSettingsCard;
