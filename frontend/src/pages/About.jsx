import { 
  Container, 
  Title, 
  Text, 
  Grid, 
  Image, 
  Timeline, 
  Card, 
  Badge, 
  Group, 
  Avatar, 
  Button, 
  Stack,
  ThemeIcon,
  Transition,
  createStyles,
  ActionIcon,
} from '@mantine/core';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  IconRocket, 
  IconBulb, 
  IconUserCheck, 
  IconWorld, 
  IconBrain, 
  IconDeviceLaptop, 
  IconChartBar, 
  IconHeart ,
  IconBrandLinkedin,
  IconBrandGithub
} from '@tabler/icons-react';

const useStyles = createStyles((theme) => ({
  wrapper: {
    paddingTop: theme.spacing.xl * 2,
    paddingBottom: theme.spacing.xl * 2,
  },
  
  title: {
    fontFamily: `'Roboto', ${theme.fontFamily}`,
    fontWeight: 900,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 50,
    
    [theme.fn.smallerThan('sm')]: {
      fontSize: 28,
    },
  },
  
  description: {
    textAlign: 'center',
    maxWidth: 600,
    margin: '0 auto',
    marginBottom: theme.spacing.xl * 1.5,
  },
  
  card: {
    border: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: theme.shadows.md,
    }
  },
  
  timelineTitle: {
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    fontWeight: 700,
  },

  highlight: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.fn.rgba(theme.colors.teal[6], 0.55)
        : theme.colors.teal[0],
    borderRadius: theme.radius.sm,
    padding: '3px 5px',
  },
}));

function About() {
  const { t } = useTranslation('about');
  const { classes } = useStyles();
  const [visible, setVisible] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleButtonClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth/login');
    }
  };
  
  useEffect(() => {
    setVisible(true);
  }, []);

  const teamMembers = [
    {
      name: 'Markus Huber',
      role: t('team.members.markusHuber.role'),
      bio: t('team.members.markusHuber.bio'),
      avatar: 'https://d112y698adiu2z.cloudfront.net/photos/production/user_photos/003/508/125/datas/profile.jpg',
      linkedin: 'https://www.linkedin.com/in/markus-huber-0132282bb/',
      github: 'https://github.com/M4RKUS28'
    },
    {
      name: 'Luca Bozzetti',
      role: t('team.members.lucaBozzetti.role'),
      bio: t('team.members.lucaBozzetti.bio'),
      avatar: 'https://poker-spade.de/static/media/Luca.658c06336387cd26c193.jpeg',
      linkedin: 'https://www.linkedin.com/in/luca-bozzetti-371379282/',
      github: 'https://github.com/lucabzt'
    },
    {
      name: 'Sebastian Rogg',
      role: t('team.members.sebastianRogg.role'),
      bio: t('team.members.sebastianRogg.bio'),
      avatar: 'https://avatars.githubusercontent.com/u/144535689?v=4',
      linkedin: 'https://www.linkedin.com/in/sebastian-rogg/',
    },
    {
      name: 'Matthias Meierlohr',
      role: t('team.members.matthiasMeierlohr.role'),
      bio: t('team.members.matthiasMeierlohr.bio'),
      avatar: 'TODO',
      linkedin: 'https://www.linkedin.com/in/matthias-meierlohr',
      github: 'https://github.com/Maths24'
    },
    {
      name: 'Jonas Hörter',
      role: t('team.members.jonasHoerter.role'),
      bio: t('team.members.jonasHoerter.bio'),
      avatar: 'https://poker-spade.de/static/media/Jonas.2327447cc8a67b962465.jpeg',
      linkedin: 'https://www.linkedin.com/in/jonas-hörter-4b22562bb/',
    },
  ];

  return (
    <Container size="xl" className={classes.wrapper}>
      <Transition mounted={visible} transition="fade" duration={800} timingFunction="ease">
        {(styles) => (
          <div style={styles} >
            <Title
              className={classes.title}
              variant="gradient"
              gradient={{ from: 'cyan', to: 'teal' }}
              order={1}
              size="2.6rem"
            >
              {t('mainTitle.about')} {t('mainTitle.nexora')}
            </Title>

            <Grid position="center" align='center' gutter={50} mb={60}>
              <Grid.Col md={6}>
                <Stack spacing="xl">
                  <Text size="xl">
                    {t('mainDescription')}
                  </Text>

                  <Text>
                    {t('learningApproach')}
                  </Text>

                  <Group>
                    <Button
                      variant="gradient"
                      gradient={{ from: 'cyan', to: 'teal' }}
                      size="lg"
                      radius="md"
                      leftIcon={<IconRocket size={20} />}
                      onClick={handleButtonClick}
                    >
                      {t('buttons.startYourJourney')}
                    </Button>
                  </Group>
                </Stack>
              </Grid.Col>

              <Grid.Col md={6}>
                <Image
                  src="https://images.unsplash.com/photo-1522881451255-f59ad836fdfb"
                  radius="md"
                  alt={t('imageAlt')}
                  caption={t('imageCaption')}
                />
              </Grid.Col>
            </Grid>

            {/* Our Mission */}
            <Card p="xl" radius="md" mb={60} withBorder>
              <Group position="center" mb="lg">
                <ThemeIcon size={60} radius="md" variant="light" color="teal">
                  <IconBulb size={34} />
                </ThemeIcon>
              </Group>

              <Title order={2} align="center" mb="md">{t('mission.title')}</Title>

              <Text size="lg" align="center" mb="xl">
                {t('mission.description')}
              </Text>

              <Grid>
                <Grid.Col sm={6} md={3}>
                  <Card shadow="sm" p="md" radius="md" className={classes.card}>
                    <ThemeIcon size={40} radius="md" color="teal">
                      <IconUserCheck size={24} />
                    </ThemeIcon>
                    <Text weight={700} mt="sm">{t('mission.item1Title')}</Text>
                    <Text size="sm" color="dimmed">
                      {t('mission.item1Description')}
                    </Text>
                  </Card>
                </Grid.Col>

                <Grid.Col sm={6} md={3}>
                  <Card shadow="sm" p="md" radius="md" className={classes.card}>
                    <ThemeIcon size={40} radius="md" color="cyan">
                      <IconWorld size={24} />
                    </ThemeIcon>
                    <Text weight={700} mt="sm">{t('mission.item2Title')}</Text>
                    <Text size="sm" color="dimmed">
                      {t('mission.item2Description')}
                    </Text>
                  </Card>
                </Grid.Col>

                <Grid.Col sm={6} md={3}>
                  <Card shadow="sm" p="md" radius="md" className={classes.card}>
                    <ThemeIcon size={40} radius="md" color="blue">
                      <IconBrain size={24} />
                    </ThemeIcon>
                    <Text weight={700} mt="sm">{t('mission.item3Title')}</Text>
                    <Text size="sm" color="dimmed">
                      {t('mission.item3Description')}
                    </Text>
                  </Card>
                </Grid.Col>

                <Grid.Col sm={6} md={3}>
                  <Card shadow="sm" p="md" radius="md" className={classes.card}>
                    <ThemeIcon size={40} radius="md" color="indigo">
                      <IconDeviceLaptop size={24} />
                    </ThemeIcon>
                    <Text weight={700} mt="sm">{t('mission.item4Title')}</Text>
                    <Text size="sm" color="dimmed">
                      {t('mission.item4Description')}
                    </Text>
                  </Card>
                </Grid.Col>
              </Grid>
            </Card>

            {/* Our Story */}

            <Grid gutter={50} mx="xl" my="xl">


                <Grid>
                  {teamMembers.map((member, index) => (
                    <Grid.Col md={6} key={index}>
                      <Card shadow="sm" p="lg" radius="md" withBorder className={classes.card}>
                        <Card.Section sx={{ display: 'flex', justifyContent: 'center', padding: '20px 0 0 0' }}>
                          <Avatar src={member.avatar} size={80} radius="xl" />
                        </Card.Section>

                        <Stack spacing={5} mt="md" align="center">
                        <Text weight={700}>{member.name}</Text>
                        <Badge color="teal" variant="light">{member.role}</Badge>
                        <Group spacing={5}>
                          <ActionIcon
                            component="a"
                            href={member.linkedin}
                            target="_blank"

                            size="sm"
                            color="blue"
                          >
                            <IconBrandLinkedin size={18} />
                          </ActionIcon>
                          <ActionIcon
                            component="a"
                            href={member.github}
                            target="_blank"

                            size="sm"
                            color="blue"
                          >
                            <IconBrandGithub size={18} />
                          </ActionIcon>
                        </Group>
                      </Stack>

                        <Text size="sm" color="dimmed" mt="sm" align="center">
                          {member.bio}
                        </Text>
                      </Card>
                    </Grid.Col>
                  ))}


                </Grid>

            </Grid>

            {/* Contact CTA */}
            <Card
              p="xl"
              radius="lg"
              sx={(theme) => ({
                backgroundImage: theme.fn.gradient({ from: 'cyan', to: 'teal', deg: 45 }),
              })}
            >
              <Grid align="center">
                <Grid.Col md={8}>
                  <Title order={2} color="white">{t('cta.title')}</Title>
                  <Text color="white" size="lg" mt="xs">
                    {t('cta.subtitle')}
                  </Text>
                </Grid.Col>

                <Grid.Col md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="white"
                    color="dark"
                    size="lg"
                    radius="md"
                    onClick={handleButtonClick}
                  >
                    {t('cta.button')}
                  </Button>
                </Grid.Col>
              </Grid>
            </Card>
          </div>
        )}
      </Transition>
    </Container>
  );
}

export default About;
