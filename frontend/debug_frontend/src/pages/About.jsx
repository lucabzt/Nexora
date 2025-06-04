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
    marginBottom: theme.spacing.xl,
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
  const { classes } = useStyles();
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    setVisible(true);
  }, []);

  const teamMembers = [
    {
      name: 'Markus Huber',
      role: 'Software Architect & Full-Stack Developer',
      bio: 'AI expert with 15+ years experience in machine learning and adaptive education systems.',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3'
    },
    {
      name: 'Luca Bozzetti',
      role: 'AI Researcher & Agent Developer',
      bio: 'Former professor with a passion for innovating education through technology.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3'
    },
    {
      name: 'Sebastian Rogg',
      role: 'Still in progress',
      bio: 'Full-stack engineer specializing in AI integration and responsive learning systems.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3'
    },
    {
      name: 'Matthias Meierlohr',
      role: 'Frontend Designer & UX Specialist',
      bio: 'Swift UI designer focused on creating intuitive, user-friendly interfaces for AI applications.',
      avatar: 'https://m.media-amazon.com/images/S/pv-target-images/16627900db04b76fae3b64266ca161511422059cd24062fb5d900971003a0b70._SX1080_FMjpg_.jpg'
    },{
      name: 'Jonas Hörter',
      role: 'Eierlecker & Backend Developer',
      bio: 'Swift UI designer focused on creating intuitive, user-friendly interfaces for AI applications.',
      avatar: 'https://m.media-amazon.com/images/S/pv-target-images/16627900db04b76fae3b64266ca161511422059cd24062fb5d900971003a0b70._SX1080_FMjpg_.jpg'
    },{
      name: 'Paul Vorderbrügge',
      role: 'Beer Lover & Backend Specialist',
      bio: 'Swift UI designer focused on creating intuitive, user-friendly interfaces for AI applications.',
      avatar: 'https://cdn.vectorstock.com/i/1000v/73/85/avatar-portrait-bartender-gieen-bier-vector-16227385.jpg'
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
              Revolutionizing Learning Through AI
            </Title>



        
            <Grid gutter={50} mb={60}>
              <Grid.Col md={6}>
                <Stack spacing="xl">
                  <Text size="xl">
                    Nexora is not just another learning platform — it's a <span className={classes.highlight}>revolutionary approach</span> to 
                    education that harnesses the power of artificial intelligence to create truly personalized 
                    learning pathways that evolve with you.
                  </Text>
                  
                  <Text>
                    Our AI-powered system analyzes your learning style, strengths, weaknesses, and goals to 
                    craft custom courses that adapt in real-time as you progress. Whether you're picking up a new skill, 
                    deepening your expertise, or exploring entirely new fields of knowledge, Nexora is your 
                    AI learning companion on the journey.
                  </Text>
                  
                  <Group>
                    <Button 
                      variant="gradient" 
                      gradient={{ from: 'cyan', to: 'teal' }}
                      size="lg"
                      radius="md"
                      leftIcon={<IconRocket size={20} />}
                    >
                      Start Your Journey
                    </Button>
                  </Group>
                </Stack>
              </Grid.Col>
              
              <Grid.Col md={6}>
                <Image 
                  src="https://images.unsplash.com/photo-1522881451255-f59ad836fdfb"
                  radius="md"
                  alt="AI Learning"
                  caption="Neural networks learning patterns, just like our AI learns about you"
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
              
              <Title order={2} align="center" mb="md">Our Mission</Title>
              
              <Text size="lg" align="center" mb="xl">
                To democratize high-quality education by creating AI-powered learning experiences 
                that are as unique as each learner, making mastery of any subject accessible to everyone.
              </Text>
              
              <Grid>
                <Grid.Col sm={6} md={3}>
                  <Card shadow="sm" p="md" radius="md" className={classes.card}>
                    <ThemeIcon size={40} radius="md" color="teal">
                      <IconUserCheck size={24} />
                    </ThemeIcon>
                    <Text weight={700} mt="sm">Personalization</Text>
                    <Text size="sm" color="dimmed">
                      Every learning path uniquely tailored to individual needs
                    </Text>
                  </Card>
                </Grid.Col>
                
                <Grid.Col sm={6} md={3}>
                  <Card shadow="sm" p="md" radius="md" className={classes.card}>
                    <ThemeIcon size={40} radius="md" color="cyan">
                      <IconWorld size={24} />
                    </ThemeIcon>
                    <Text weight={700} mt="sm">Accessibility</Text>
                    <Text size="sm" color="dimmed">
                      Quality education available to anyone, anywhere
                    </Text>
                  </Card>
                </Grid.Col>
                
                <Grid.Col sm={6} md={3}>
                  <Card shadow="sm" p="md" radius="md" className={classes.card}>
                    <ThemeIcon size={40} radius="md" color="blue">
                      <IconBrain size={24} />
                    </ThemeIcon>
                    <Text weight={700} mt="sm">Innovation</Text>
                    <Text size="sm" color="dimmed">
                      Continuously advancing the frontier of AI in education
                    </Text>
                  </Card>
                </Grid.Col>
                
                <Grid.Col sm={6} md={3}>
                  <Card shadow="sm" p="md" radius="md" className={classes.card}>
                    <ThemeIcon size={40} radius="md" color="indigo">
                      <IconDeviceLaptop size={24} />
                    </ThemeIcon>
                    <Text weight={700} mt="sm">Technology</Text>
                    <Text size="sm" color="dimmed">
                      Leveraging cutting-edge AI to enhance human learning
                    </Text>
                  </Card>
                </Grid.Col>
              </Grid>
            </Card>
            
            {/* Our Story */}
            <Grid gutter={50} mb={60}>
              <Grid.Col md={5}>
                <Title order={2} mb="xl">Our Journey</Title>
                
                <Timeline active={4} bulletSize={24} lineWidth={2}>
                  <Timeline.Item 
                    bullet={<IconBulb size={12} />} 
                    title="The Idea" 
                    titleClassName={classes.timelineTitle}
                  >
                    <Text color="dimmed" size="sm">
                      We developed the concept for adaptive AI learning while researching neural networks
                    </Text>
                    <Text size="xs" mt={4}>January 2022</Text>
                  </Timeline.Item>
                  
                  <Timeline.Item 
                    bullet={<IconRocket size={12} />} 
                    title="Foundation" 
                    titleClassName={classes.timelineTitle}
                  >
                    <Text color="dimmed" size="sm">
                      Nexora was officially launched with seed funding from education technology investors
                    </Text>
                    <Text size="xs" mt={4}>June 2023</Text>
                  </Timeline.Item>
                  
                  <Timeline.Item 
                    bullet={<IconChartBar size={12} />} 
                    title="First Users" 
                    titleClassName={classes.timelineTitle}
                  >
                    <Text color="dimmed" size="sm">
                      Beta platform welcomed 500 early users who helped shape our learning algorithms
                    </Text>
                    <Text size="xs" mt={4}>March 2024</Text>
                  </Timeline.Item>
                  
                  <Timeline.Item 
                    bullet={<IconHeart size={12} />}
                    title="Where We Are Today"
                    titleClassName={classes.timelineTitle}
                  >
                    <Text color="dimmed" size="sm">
                      Serving thousands of learners with continuously improving AI-powered curriculum
                    </Text>
                    <Text size="xs" mt={4}>June 2025</Text>
                  </Timeline.Item>

                   <Timeline.Item 
                    bullet={<IconHeart size={12} />}
                    title="Where We Want to Go"
                    titleClassName={classes.timelineTitle}
                  >
                    <Text color="dimmed" size="sm">
                        Expanding our platform to support more languages and subjects, with global reach
                    </Text>
                    <Text size="xs" mt={4}>June 2026</Text>
                  </Timeline.Item>
                  
                </Timeline>
              </Grid.Col>
              
              <Grid.Col md={7}>
                <Title order={2} mb="xl">Meet Our Team</Title>
                
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
                  <Title order={2} color="white">Ready to Transform Your Learning Journey?</Title>
                  <Text color="white" size="lg" mt="xs">
                    Join thousands who are already experiencing the future of education.
                  </Text>
                </Grid.Col>
                
                <Grid.Col md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button 
                    variant="white" 
                    color="dark" 
                    size="lg" 
                    radius="md"
                  >
                    Get Started For Free
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
