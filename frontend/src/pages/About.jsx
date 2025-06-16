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
  createStyles
} from '@mantine/core';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  IconRocket, 
  IconBulb, 
  IconUserCheck, 
  IconWorld, 
  IconBrain, 
  IconDeviceLaptop, 
  IconChartBar, 
  IconHeart 
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
    marginTop: 120,
    marginBottom: 30,
    
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
  
  useEffect(() => {
    setVisible(true);
  }, []);

  const teamMembers = [
    {
      name: 'Markus Huber',
      role: t('team.members.markusHuber.role'),
      bio: t('team.members.markusHuber.bio'),
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3'
    },
    {
      name: 'Luca Bozzetti',
      role: t('team.members.lucaBozzetti.role'),
      bio: t('team.members.lucaBozzetti.bio'),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3'
    },
 /*   {
      name: 'Sebastian Rogg',
      role: t('team.members.sebastianRogg.role'),
      bio: t('team.members.sebastianRogg.bio'),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3'
    },*/
    {
      name: 'Matthias Meierlohr',
      role: t('team.members.matthiasMeierlohr.role'),
      bio: t('team.members.matthiasMeierlohr.bio'),
      avatar: 'https://m.media-amazon.com/images/S/pv-target-images/16627900db04b76fae3b64266ca161511422059cd24062fb5d900971003a0b70._SX1080_FMjpg_.jpg'
    },{
      name: 'Jonas Hörter',
      role: t('team.members.jonasHoerter.role'),
      bio: t('team.members.jonasHoerter.bio'),
      avatar: 'https://m.media-amazon.com/images/S/pv-target-images/16627900db04b76fae3b64266ca161511422059cd24062fb5d900971003a0b70._SX1080_FMjpg_.jpg'
    },
    /*{
      name: 'Paul Vorderbrügge',
      role: t('team.members.paulVorderbruegge.role'),
      bio: t('team.members.paulVorderbruegge.bio'),
      avatar: 'https://cdn.vectorstock.com/i/1000v/73/85/avatar-portrait-bartender-gieen-bier-vector-16227385.jpg'
    },*/
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



        
            <Grid gutter={50} mb={60}>
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
            <Grid gutter={50} mb={60}>
              <Grid.Col md={5}>
                <Title order={2} mb="xl">{t('journey.title')}</Title>
                
                <Timeline active={4} bulletSize={24} lineWidth={2}>
                  <Timeline.Item 
                    bullet={<IconBulb size={12} />} 
                    title={t('journey.event1.title')} 
                  >
                    <Text color="dimmed" size="sm">
                      {t('journey.event1.description')}
                    </Text>
                    <Text size="xs" mt={4}>{t('journey.event1.date')}</Text>
                  </Timeline.Item>
                  
                  <Timeline.Item 
                    bullet={<IconRocket size={12} />} 
                    title={t('journey.event2.title')} 
                  >
                    <Text color="dimmed" size="sm">
                      {t('journey.event2.description')}
                    </Text>
                    <Text size="xs" mt={4}>{t('journey.event2.date')}</Text>
                  </Timeline.Item>
                  
                  <Timeline.Item 
                    bullet={<IconChartBar size={12} />} 
                    title={t('journey.event3.title')} 
                  >
                    <Text color="dimmed" size="sm">
                      {t('journey.event3.description')}
                    </Text>
                    <Text size="xs" mt={4}>{t('journey.event3.date')}</Text>
                  </Timeline.Item>
                  
                  <Timeline.Item 
                    bullet={<IconHeart size={12} />}
                    title={t('journey.event4.title')}
                  >
                    <Text color="dimmed" size="sm">
                      {t('journey.event4.description')}
                    </Text>
                    <Text size="xs" mt={4}>{t('journey.event4.date')}</Text>
                  </Timeline.Item>
                  
                </Timeline>
              </Grid.Col>
              
              <Grid.Col md={7}>
                <Title order={2} mb="xl">{t('team.title')}</Title>
                
                <Grid>
                  {teamMembers.map((member, index) => (
                    <Grid.Col md={6} key={index}>
                      <Card shadow="sm" p="lg" radius="md" withBorder className={classes.card}>
                        <Card.Section sx={{ display: 'flex', justifyContent: 'center', padding: '20px 0 0 0' }}>
                          <Avatar src={member.avatar} size={80} radius="xl" />
                        </Card.Section>
                        
                        <Stack spacing={5} mt="md" align="center">
                          <Text weight={700}>{member.name}</Text>
                          <Badge color="teal" variant="light">
                            {member.role}
                          </Badge>
                        </Stack>
                        
                        <Text size="sm" color="dimmed" mt="sm" align="center">
                          {member.bio}
                        </Text>
                      </Card>
                    </Grid.Col>
                  ))}
                  
             
                </Grid>
              </Grid.Col>
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
