import { 
  Container, 
  Title, 
  Text, 
  Stack, 
  Paper, 
  Group, 
  Divider, 
  Box, 
  useMantineTheme,
  Transition,
  createStyles
} from '@mantine/core';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  IconBuilding, 
  IconUser, 
  IconMapPin, 
  IconMail, 
  IconWorld, 
  IconScale, 
  IconFileText, 
  IconCertificate 
} from '@tabler/icons-react';

const useStyles = createStyles((theme) => ({
  wrapper: {
    padding: theme.spacing.xl * 2,
    background: theme.colorScheme === 'dark' 
      ? theme.fn.linearGradient(45, theme.colors.dark[6], theme.colors.dark[8])
      : theme.fn.linearGradient(45, theme.colors.gray[0], theme.colors.gray[1]),
    borderRadius: theme.radius.md,
  },
  title: {
    fontFamily: `'Roboto', ${theme.fontFamily}`,
    fontWeight: 900,
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    lineHeight: 1.2,
    fontSize: theme.fontSizes.xl * 2,
    marginBottom: 30,
    marginTop: 120,
  },
  section: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    backdropFilter: 'blur(2px)',
    backgroundColor: theme.colorScheme === 'dark' 
      ? theme.fn.rgba(theme.colors.dark[8], 0.5)
      : theme.fn.rgba(theme.colors.gray[0], 0.7),
    boxShadow: theme.shadows.md,
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
    }
  }
}));

function Impressum() {
  const { classes } = useStyles();
  const { t } = useTranslation('impressum');
  const theme = useMantineTheme();
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <Container size="lg" py="xl">
      <Transition mounted={visible} transition="fade" duration={800} timingFunction="ease">
        {(styles) => (
          <div className={classes.wrapper} style={styles}>
            <Title className={classes.title} align="center">
              {t('mainTitle')}
            </Title>
            
            <Stack spacing="xl">
              <Paper withBorder p="md" radius="md" className={classes.section}>
                <Group spacing="md" mb="xs">
                  <IconBuilding size={24} color={theme.colors.teal[5]} />
                  <Title order={3}>{t('projectPhase.title')}</Title>
                </Group>
                <Divider mb="md" />
                <Text size="lg" weight={700}>{t('projectPhase.info')}</Text>
                <Text>{t('projectPhase.contact')}</Text>
              </Paper>

              <Paper withBorder p="md" radius="md" className={classes.section}>
                <Group spacing="md" mb="xs">
                  <IconCertificate size={24} color={theme.colors.blue[5]} />
                  <Title order={3}>{t('hackathonInfo.title')}</Title>
                </Group>
                <Divider mb="md" />
                <Text>{t('hackathonInfo.text')}</Text>
              </Paper>
              
              <Paper withBorder p="md" radius="md" className={classes.section}>
                <Group spacing="md" mb="xs">
                  <IconScale size={24} color={theme.colors.red[5]} />
                  <Title order={3}>{t('legalInfo.title')}</Title>
                </Group>
                <Divider mb="md" />
                <Text mb="md">{t('legalInfo.disclaimer')}</Text>
                <Text mb="md">{t('legalInfo.noWarranty')}</Text>
                <Text>{t('legalInfo.externalLinks')}</Text>
              </Paper>
              
              <Paper withBorder p="md" radius="md" className={classes.section}>
                <Group spacing="md" mb="xs">
                  <IconCertificate size={24} color={theme.colors.orange[5]} />
                  <Title order={3}>{t('creativeInfo.title')}</Title>
                </Group>
                <Divider mb="md" />
                <Text>{t('creativeInfo.text')}</Text>
              </Paper>
              
              <Box mt="xl">
                <Text color="dimmed" size="sm" align="center">
                  {t('lastUpdated')}
                </Text>
              </Box>
            </Stack>
          </div>
        )}
      </Transition>
    </Container>
  );
}

export default Impressum;
