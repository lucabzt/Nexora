import { 
  Container, 
  Title, 
  Text, 
  Stack, 
  Paper, 
  Divider, 
  Box, 
  createStyles,
  List,
  ThemeIcon
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { 
  IconShieldLock,
  IconDatabase,
  IconGavel,
  IconClock,
  IconShare,
  IconShieldCheck,
  IconUserCheck,
  IconAlertCircle
} from '@tabler/icons-react';

const useStyles = createStyles((theme) => ({
  wrapper: {
    padding: theme.spacing.xl * 2,
    background: theme.colorScheme === 'dark' 
      ? theme.fn.linearGradient(45, theme.colors.dark[6], theme.colors.dark[8])
      : theme.fn.linearGradient(45, theme.colors.gray[0], theme.colors.gray[1]),
    borderRadius: theme.radius.md,
    minHeight: 'calc(100vh - 60px)',
    paddingTop: '100px',
  },
  title: {
    fontFamily: `'Roboto', ${theme.fontFamily}`,
    fontWeight: 900,
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    lineHeight: 1.2,
    fontSize: theme.fontSizes.xl * 2,
    marginBottom: 30,
  },
  section: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colorScheme === 'dark' 
      ? theme.fn.rgba(theme.colors.dark[8], 0.5)
      : theme.fn.rgba(theme.colors.gray[0], 0.7),
    boxShadow: theme.shadows.md,
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
    }
  },
  list: {
    listStyle: 'none',
    padding: 0,
    marginTop: theme.spacing.sm,
  },
  listItem: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
    '&:last-child': {
      marginBottom: 0,
    },
  },
  listIcon: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  lastUpdated: {
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    color: theme.colorScheme === 'dark' ? theme.colors.gray[5] : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
  },
}));

const sectionIcons = {
  responsibleParty: <IconShieldLock size={24} />,
  dataCollection: <IconDatabase size={24} />,
  purpose: <IconGavel size={24} />,
  storage: <IconClock size={24} />,
  dataSharing: <IconShare size={24} />,
  dataSecurity: <IconShieldCheck size={24} />,
  yourRights: <IconUserCheck size={24} />,
  changes: <IconAlertCircle size={24} />,
};

function Privacy() {
  const { classes } = useStyles();
  const { t } = useTranslation('privacy');

  return (
    <Box className={classes.wrapper}>
      <Container size="md">
        <Title className={classes.title} align="center">
          {t('mainTitle')}
        </Title>

        <Paper className={classes.section}>
          {Object.entries(t('sections', { returnObjects: true })).map(([key, section]) => (
            <div key={key} style={{ marginBottom: '2rem' }}>
              <Title order={2} size="h3" mb="md" style={{ display: 'flex', alignItems: 'center' }}>
                <ThemeIcon mr="sm" size="lg" variant="light">
                  {sectionIcons[key]}
                </ThemeIcon>
                {section.title}
              </Title>
              <Divider mb="md" />
              <List spacing="xs" className={classes.list}>
                {Array.isArray(section.content) ? (
                  section.content.map((item, index) => (
                    <List.Item key={index} className={classes.listItem}>
                      {item}
                    </List.Item>
                  ))
                ) : (
                  <Text>{section.content}</Text>
                )}
              </List>
            </div>
          ))}
        </Paper>

        <Text className={classes.lastUpdated}>
          {t('lastUpdated')}
        </Text>
      </Container>
    </Box>
  );
}

export default Privacy;
