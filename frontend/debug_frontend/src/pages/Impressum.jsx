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
              Impressum
            </Title>
            
            <Stack spacing="xl">
              <Paper withBorder p="md" radius="md" className={classes.section}>
                <Group spacing="md" mb="xs">
                  <IconBuilding size={24} color={theme.colors.teal[5]} />
                  <Title order={3}>Company Information</Title>
                </Group>
                <Divider mb="md" />
                <Stack spacing="xs">
                  <Text size="lg" weight={700}>Nexora GmbH</Text>
                  <Text>Innovative AI-Powered Learning Solutions</Text>
                  <Text color="dimmed">Registration: HRB 123456 B (Amtsgericht Berlin)</Text>
                  <Text color="dimmed">VAT ID: DE123456789</Text>
                </Stack>
              </Paper>
              
              <Group grow align="stretch">
                <Paper withBorder p="md" radius="md" className={classes.section}>
                  <Group spacing="md" mb="xs">
                    <IconUser size={24} color={theme.colors.blue[5]} />
                    <Title order={3}>Legal Representative</Title>
                  </Group>
                  <Divider mb="md" />
                  <Text>Markus Example</Text>
                  <Text color="dimmed">Managing Director</Text>
                </Paper>
                
                <Paper withBorder p="md" radius="md" className={classes.section}>
                  <Group spacing="md" mb="xs">
                    <IconMapPin size={24} color={theme.colors.red[5]} />
                    <Title order={3}>Address</Title>
                  </Group>
                  <Divider mb="md" />
                  <Text>Example Street 1</Text>
                  <Text>12345 Example City</Text>
                  <Text>Germany</Text>
                </Paper>
              </Group>
              
              <Group grow align="stretch">
                <Paper withBorder p="md" radius="md" className={classes.section}>
                  <Group spacing="md" mb="xs">
                    <IconMail size={24} color={theme.colors.violet[5]} />
                    <Title order={3}>Contact</Title>
                  </Group>
                  <Divider mb="md" />
                  <Text>Email: info@nexora.ai</Text>
                  <Text>Phone: +49 (0) 30 123 45678</Text>
                </Paper>
                
                <Paper withBorder p="md" radius="md" className={classes.section}>
                  <Group spacing="md" mb="xs">
                    <IconWorld size={24} color={theme.colors.cyan[5]} />
                    <Title order={3}>Online Presence</Title>
                  </Group>
                  <Divider mb="md" />
                  <Text>Website: www.nexora.ai</Text>
                  <Text>Social Media: @nexoralearning</Text>
                </Paper>
              </Group>
              
              <Paper withBorder p="md" radius="md" className={classes.section}>
                <Group spacing="md" mb="xs">
                  <IconScale size={24} color={theme.colors.yellow[5]} />
                  <Title order={3}>Legal Disclaimer</Title>
                </Group>
                <Divider mb="md" />
                <Text mb="md">
                  Despite careful content control, we assume no liability for the content of external links. 
                  The operators of the linked pages are solely responsible for their content.
                </Text>
                <Text>
                  All content on this website is protected by copyright. Reproduction or use without 
                  explicit permission is prohibited.
                </Text>
              </Paper>
              
              <Group grow align="stretch">
                <Paper withBorder p="md" radius="md" className={classes.section}>
                  <Group spacing="md" mb="xs">
                    <IconFileText size={24} color={theme.colors.green[5]} />
                    <Title order={3}>Content Responsibility</Title>
                  </Group>
                  <Divider mb="md" />
                  <Text>
                    Responsible for the content according to § 55 Abs. 2 RStV: Markus Example, 
                    Example Street 1, 12345 Example City
                  </Text>
                </Paper>
                
                <Paper withBorder p="md" radius="md" className={classes.section}>
                  <Group spacing="md" mb="xs">
                    <IconCertificate size={24} color={theme.colors.orange[5]} />
                    <Title order={3}>Data Protection</Title>
                  </Group>
                  <Divider mb="md" />
                  <Text>
                    For details on how we process your data, please refer to our Privacy Policy.
                  </Text>
                </Paper>
              </Group>
              
              <Box mt="xl">
                <Text color="dimmed" size="sm" align="center">
                  This impressum page was last updated: June 2025
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
