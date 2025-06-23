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
import ReactCountryFlag from 'react-country-flag';
import { forwardRef } from 'react';

const SelectItem = forwardRef(({ label, countryCode, ...others }, ref) => (
  <div ref={ref} {...others}>
    <Group noWrap>
      <ReactCountryFlag
        countryCode={countryCode}
        svg
        style={{
          width: '1.5em',
          height: '1.5em',
        }}
        title={countryCode}
      />
      <Text size="sm">{label}</Text>
    </Group>
  </div>
));

function LanguageSettingsCard({ className }) {
  const { t, i18n } = useTranslation(['settings', 'language']);
  const theme = useMantineTheme();

  const languageData = [
    { value: 'en', label: t('english', { ns: 'language' }), countryCode: 'US' },
    { value: 'de', label: t('german', { ns: 'language' }), countryCode: 'DE' },
  ];

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder className={className}>
      <Card.Section p="md" bg={theme.colorScheme === 'dark' ? 
        theme.fn.rgba(theme.colors.violet[9], 0.2) : 
        theme.colors.violet[0]}>
        <Group position="apart">
          <Group spacing="xs">
            <IconLanguage size={24} stroke={1.5} 
              color={theme.colors.violet[theme.colorScheme === 'dark' ? 4 : 6]} />
            <Title order={3}>{t('languageSettings', { ns: 'settings' })}</Title>
          </Group>
          <Badge color="violet" variant="light">{t('preferences', { ns: 'settings' })}</Badge>
        </Group>
      </Card.Section>
      
      <Box p="md" pt="xl">
        <Text mb="md">{t('languageDescription', { ns: 'settings' })}</Text>
        
        <Box mt="md">
          <Select
            size="md"
            label={t('selectLanguage', { ns: 'settings' })}
            value={i18n.language}
            onChange={(value) => i18n.changeLanguage(value)}
            data={languageData}
            itemComponent={SelectItem}
            icon={<IconLanguage size={18} />}
            radius="md"
          />
        </Box>
      </Box>
    </Card>
  );
}

export default LanguageSettingsCard;
