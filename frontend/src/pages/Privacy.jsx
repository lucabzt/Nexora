import { 
  Container, 
  Title, 
  Text, 
  Paper, 
  Divider, 
  Box, 
  List,
  Space,
  ThemeIcon,
  useMantineTheme
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { 
  IconShieldLock,
  IconUser,
  IconListDetails,
  IconScale,
  IconUsers,
  IconClock,
  IconShield,
  IconAlertCircle,
  IconFileAnalytics,
  IconBuilding
} from '@tabler/icons-react';

const Privacy = () => {
  const { t } = useTranslation('privacy');
  const theme = useMantineTheme();

  const sectionIcons = {
    responsibleParty: <IconBuilding size={20} />,
    dataProtectionOfficer: <IconUser size={20} />,
    processingPurposes: <IconListDetails size={20} />,
    legalBasis: <IconScale size={20} />,
    dataRecipients: <IconUsers size={20} />,
    storagePeriod: <IconClock size={20} />,
    yourRights: <IconShield size={20} />,
    supervisoryAuthority: <IconShieldLock size={20} />,
    dataProvisionRequirement: <IconAlertCircle size={20} />,
    automatedDecisionMaking: <IconFileAnalytics size={20} />
  };

  const renderContent = (content) => {
    if (Array.isArray(content)) {
      return (
        <List spacing="xs" size="md" mb="xl">
          {content.map((item, index) => (
            <List.Item key={index}>
              {item}
            </List.Item>
          ))}
        </List>
      );
    }
    return <Text mb="xl">{content}</Text>;
  };

  return (
    <Container size="md" py="xl">
      <Title order={1} mb="md" ta="center">
        {t('mainTitle')}
      </Title>
      
      <Paper p="md" shadow="sm" radius="md">
        {/* Introduction */}
        <Text mb="xl" style={{ whiteSpace: 'pre-line' }}>
          {t('introduction')}
        </Text>
        
        <Space h="md" />
        
        {/* Sections */}
        {Object.entries(t('sections', { returnObjects: true })).map(([key, section]) => (
          <Box key={key} mb="xl">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <ThemeIcon
                size={36}
                radius="md"
                variant="light"
                color={theme.primaryColor}
                mr="sm"
              >
                {sectionIcons[key] || <IconListDetails size={20} stroke={1.5} />}
              </ThemeIcon>
              <Title order={3} style={{ margin: 0 }}>{section.title}</Title>
            </div>
            
            {renderContent(section.content)}
            
            <Divider my="xl" />
          </Box>
        ))}
        
        <Text size="sm" c="dimmed" mt="md" ta="right">
          {t('lastUpdated')}
        </Text>
      </Paper>
    </Container>
  );
};

export default Privacy;
