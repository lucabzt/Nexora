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
                  <Title order={3}>{t('companyInfo.title')}</Title>
                </Group>
                <Divider mb="md" />
                <Stack spacing="xs">
                  <Text size="lg" weight={700}>{t('companyInfo.name')}</Text>
                  <Text>{t('companyInfo.tagline')}</Text>
                  <Text color="dimmed">{t('companyInfo.registration')}</Text>
                  <Text color="dimmed">{t('companyInfo.vatId')}</Text>
                </Stack>
              </Paper>
              
              <Group grow align="stretch">
                <Paper withBorder p="md" radius="md" className={classes.section}>
                  <Group spacing="md" mb="xs">
                    <IconUser size={24} color={theme.colors.blue[5]} />
                    <Title order={3}>{t('legalRepresentative.title')}</Title>
                  </Group>
                  <Divider mb="md" />
                  <Text>{t('legalRepresentative.name')}</Text>
                  <Text color="dimmed">{t('legalRepresentative.role')}</Text>
                </Paper>
                
                <Paper withBorder p="md" radius="md" className={classes.section}>
                  <Group spacing="md" mb="xs">
                    <IconMapPin size={24} color={theme.colors.red[5]} />
                    <Title order={3}>{t('address.title')}</Title>
                  </Group>
                  <Divider mb="md" />
                  <Text>{t('address.street')}</Text>
                  <Text>{t('address.city')}</Text>
                  <Text>{t('address.country')}</Text>
                </Paper>
              </Group>
              
              <Group grow align="stretch">
                <Paper withBorder p="md" radius="md" className={classes.section}>
                  <Group spacing="md" mb="xs">
                    <IconMail size={24} color={theme.colors.violet[5]} />
                    <Title order={3}>{t('contact.title')}</Title>
                  </Group>
                  <Divider mb="md" />
                  <Text>{t('contact.email')}</Text>
                  <Text>{t('contact.phone')}</Text>
                </Paper>
                
                <Paper withBorder p="md" radius="md" className={classes.section}>
                  <Group spacing="md" mb="xs">
                    <IconWorld size={24} color={theme.colors.cyan[5]} />
                    <Title order={3}>{t('onlinePresence.title')}</Title>
                  </Group>
                  <Divider mb="md" />
                  <Text>{t('onlinePresence.website')}</Text>
                  <Text>{t('onlinePresence.socialMedia')}</Text>
                </Paper>
              </Group>
              
              <Paper withBorder p="md" radius="md" className={classes.section}>
                <Group spacing="md" mb="xs">
                  <IconScale size={24} color={theme.colors.yellow[5]} />
                  <Title order={3}>{t('legalDisclaimer.title')}</Title>
                </Group>
                <Divider mb="md" />
                <Text mb="md">
                  {t('legalDisclaimer.externalLinks')}
                </Text>
                <Text>
                  {t('legalDisclaimer.copyright')}
                </Text>
              </Paper>
              
              <Group grow align="stretch">
                <Paper withBorder p="md" radius="md" className={classes.section}>
                  <Group spacing="md" mb="xs">
                    <IconFileText size={24} color={theme.colors.green[5]} />
                    <Title order={3}>{t('contentResponsibility.title')}</Title>
                  </Group>
                  <Divider mb="md" />
                  <Text>
                    {t('contentResponsibility.details')}
                  </Text>
                </Paper>
                
                <Paper withBorder p="md" radius="md" className={classes.section}>
                  <Group spacing="md" mb="xs">
                    <IconCertificate size={24} color={theme.colors.orange[5]} />
                    <Title order={3}>{t('dataProtection.title')}</Title>
                  </Group>
                  <Divider mb="md" />
                  <Text>
                    {t('dataProtection.info')}
                  </Text>
                </Paper>
              </Group>
              
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
