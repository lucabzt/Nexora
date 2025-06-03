import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container,
  Title, 
  Text, 
  Button,
  Grid,
  Card,
  Group,
  Image,
  Stack,
  List,
  ThemeIcon,
  Transition,
  Box,
  useMantineTheme,
  keyframes,
  createStyles
} from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { IconCheck, IconBrain, IconChartBar, IconUser, IconArrowRight } from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';

const fadeIn = keyframes({
  from: { opacity: 0, transform: 'translateY(20px)' },
  to: { opacity: 1, transform: 'translateY(0)' }
});

const floatAnimation = keyframes({
  '0%': { transform: 'translateY(0px)' },
  '50%': { transform: 'translateY(-10px)' },
  '100%': { transform: 'translateY(0px)' }
});

const useStyles = createStyles((theme) => ({
  hero: {
    position: 'relative',
    paddingTop: theme.spacing.xl * 5, // Increase top padding to make room for header
    paddingBottom: theme.spacing.xl * 3,
  },
  
  heroContent: {
    animation: `${fadeIn} 1s ease-out`,
  },
  
  heroImage: {
    animation: `${floatAnimation} 4s ease-in-out infinite`,
  },
  
  featureCard: {
    height: '100%',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: theme.shadows.md,
    }
  },
  
  section: {
    paddingTop: theme.spacing.xl * 2,
    paddingBottom: theme.spacing.xl * 2,
  },
  
  gradient: {
    backgroundImage: theme.colorScheme === 'dark' 
      ? 'linear-gradient(60deg, rgba(0, 144, 158, 0.2), rgba(0, 179, 196, 0.1))'
      : 'linear-gradient(60deg, rgba(0, 144, 158, 0.1), rgba(0, 179, 196, 0.05))',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
  }
}));

function LandingPage() {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const { height, width } = useViewportSize();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  
  // Animation trigger
  useEffect(() => {
    setVisible(true);
  }, []);
  
  return (
    <Container size="xl" px="xs" mt={100}> {/* Add marginTop to match header height */}
      {/* Hero Section */}
      <Grid gutter={50} className={classes.hero}>
        <Grid.Col md={6}>
          <div className={classes.heroContent}>
            <Title
              order={1}
              size="3.5rem"
              weight={900}
              sx={(theme) => ({ 
                color: theme.colorScheme === 'dark' ? theme.white : theme.black,
                lineHeight: 1.2,
              })}
              mb="md"
            >
              Personalized Learning with{' '}
              <Text 
                component="span" 
                variant="gradient" 
                gradient={{ from: 'cyan', to: 'teal', deg: 45 }}
              >
                AI-Powered Courses
              </Text>
            </Title>
            
            <Text size="xl" color="dimmed" mb={30}>
              Nexora is a next-generation AI learning assistant that creates personalized courses
              tailored to your learning style, goals, and schedule.
            </Text>
            
            <Group>
              {!isAuthenticated ? (
                <>
                  <Button 
                    component={Link} 
                    to="/register" 
                    size="lg" 
                    radius="md"
                    variant="gradient"
                    gradient={{ from: 'cyan', to: 'teal' }}
                  >
                    Get Started
                  </Button>
                  <Button 
                    component={Link} 
                    to="/login" 
                    size="lg" 
                    radius="md"
                    variant="outline"
                  >
                    Log In
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => navigate('/create-course')} 
                  size="lg" 
                  radius="md"
                  variant="gradient"
                  gradient={{ from: 'cyan', to: 'teal' }}
                  rightIcon={<IconArrowRight size={18} />}
                >
                  Create a New Course
                </Button>
              )}
            </Group>
          </div>
        </Grid.Col>
        
        <Grid.Col md={6}>
          <Transition mounted={visible} transition="fade" duration={1000} timingFunction="ease">
            {(styles) => (
              <Box className={classes.heroImage} style={styles}>
                <Image
                  radius="md"
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644"
                  alt="AI Learning Illustration"
                  caption="Next-gen learning, powered by AI"
                />
              </Box>
            )}
          </Transition>
        </Grid.Col>
      </Grid>
      
      {/* Features Section */}
      <Box className={`${classes.section} ${classes.gradient}`} mb={50}>
        <Title order={2} align="center" mb={50}>How Nexora Transforms Your Learning</Title>
        
        <Grid>
          <Grid.Col sm={6} md={3}>
            <Transition mounted={visible} transition="pop" duration={600} delay={200}>
              {(styles) => (
                <Card shadow="sm" p="lg" radius="md" withBorder className={classes.featureCard} style={styles}>
                  <Card.Section p="md">
                    <ThemeIcon size={50} radius="md" variant="light" color="cyan">
                      <IconBrain size={30} />
                    </ThemeIcon>
                  </Card.Section>
                  
                  <Title order={3} size="h4" mb="xs">Personalized Curriculum</Title>
                  
                  <Text size="sm" color="dimmed">
                    AI-generated content tailored specifically to your goals and learning style.
                  </Text>
                </Card>
              )}
            </Transition>
          </Grid.Col>
          
          <Grid.Col sm={6} md={3}>
            <Transition mounted={visible} transition="pop" duration={600} delay={400}>
              {(styles) => (
                <Card shadow="sm" p="lg" radius="md" withBorder className={classes.featureCard} style={styles}>
                  <Card.Section p="md">
                    <ThemeIcon size={50} radius="md" variant="light" color="teal">
                      <IconChartBar size={30} />
                    </ThemeIcon>
                  </Card.Section>
                  
                  <Title order={3} size="h4" mb="xs">Progress Tracking</Title>
                  
                  <Text size="sm" color="dimmed">
                    Monitor your learning journey with detailed progress analytics and insights.
                  </Text>
                </Card>
              )}
            </Transition>
          </Grid.Col>
          
          <Grid.Col sm={6} md={3}>
            <Transition mounted={visible} transition="pop" duration={600} delay={600}>
              {(styles) => (
                <Card shadow="sm" p="lg" radius="md" withBorder className={classes.featureCard} style={styles}>
                  <Card.Section p="md">
                    <ThemeIcon size={50} radius="md" variant="light" color="blue">
                      <IconUser size={30} />
                    </ThemeIcon>
                  </Card.Section>
                  
                  <Title order={3} size="h4" mb="xs">Adaptive Learning</Title>
                  
                  <Text size="sm" color="dimmed">
                    Content difficulty adjusts based on your performance and comprehension.
                  </Text>
                </Card>
              )}
            </Transition>
          </Grid.Col>
          
          <Grid.Col sm={6} md={3}>
            <Transition mounted={visible} transition="pop" duration={600} delay={800}>
              {(styles) => (
                <Card shadow="sm" p="lg" radius="md" withBorder className={classes.featureCard} style={styles}>
                  <Card.Section p="md">
                    <ThemeIcon size={50} radius="md" variant="light" color="grape">
                      <IconCheck size={30} />
                    </ThemeIcon>
                  </Card.Section>
                  
                  <Title order={3} size="h4" mb="xs">Interactive Quizzes</Title>
                  
                  <Text size="sm" color="dimmed">
                    Test your knowledge with smart quizzes that reinforce your understanding.
                  </Text>
                </Card>
              )}
            </Transition>
          </Grid.Col>
        </Grid>
      </Box>
      
      {/* How It Works Section */}
      <Box className={classes.section}>
        <Grid gutter={50} align="center">
          <Grid.Col md={6} order={2} orderMd={1}>
            <Transition mounted={visible} transition="slide-right" duration={800}>
              {(styles) => (
                <div style={styles}>
                  <Image
                    radius="md"
                    src="https://images.unsplash.com/photo-1695473507908-ff60e604c113"
                    alt="How Nexora Works"
                  />
                </div>
              )}
            </Transition>
          </Grid.Col>
          
          <Grid.Col md={6} order={1} orderMd={2}>
            <Transition mounted={visible} transition="slide-left" duration={800}>
              {(styles) => (
                <Stack spacing="xl" style={styles}>
                  <Title order={2}>How Nexora Works</Title>
                  
                  <List
                    spacing="lg"
                    size="lg"
                    center
                    icon={
                      <ThemeIcon color="teal" size={28} radius="xl">
                        <IconCheck size={18} />
                      </ThemeIcon>
                    }
                  >
                    <List.Item>
                      <Text size="lg" weight={500}>Tell us what you want to learn</Text>
                      <Text color="dimmed">Specify your learning goals and time commitment</Text>
                    </List.Item>
                    
                    <List.Item>
                      <Text size="lg" weight={500}>AI generates your personal curriculum</Text>
                      <Text color="dimmed">Our AI creates a structured learning path just for you</Text>
                    </List.Item>
                    
                    <List.Item>
                      <Text size="lg" weight={500}>Learn at your own pace</Text>
                      <Text color="dimmed">Complete lessons, take quizzes, and track your progress</Text>
                    </List.Item>
                    
                    <List.Item>
                      <Text size="lg" weight={500}>Master new skills</Text>
                      <Text color="dimmed">Apply your knowledge with confidence</Text>
                    </List.Item>
                  </List>
                  
                  {!isAuthenticated && (
                    <Button 
                      component={Link} 
                      to="/register" 
                      size="lg" 
                      radius="md" 
                      variant="filled"
                      color="teal"
                      mt="md"
                    >
                      Start Learning Today
                    </Button>
                  )}
                </Stack>
              )}
            </Transition>
          </Grid.Col>
        </Grid>
      </Box>
      
      {/* Testimonial Section */}
      <Box py={50} className={classes.gradient}>
        <Title order={2} align="center" mb={30}>What Our Learners Say</Title>
        
        <Grid>
          <Grid.Col sm={12} md={4}>
            <Transition mounted={visible} transition="fade" duration={1000} delay={200}>
              {(styles) => (
                <Card shadow="sm" p="lg" radius="md" withBorder style={styles}>
                  <Text italic size="lg" mb="md">
                    "Nexora helped me learn Python in half the time it would have taken me with traditional courses. The personalized approach made all the difference."
                  </Text>
                  <Group>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: theme.colors.gray[3], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      JD
                    </div>
                    <div>
                      <Text weight={500}>John Doe</Text>
                      <Text size="xs" color="dimmed">Software Developer</Text>
                    </div>
                  </Group>
                </Card>
              )}
            </Transition>
          </Grid.Col>
          
          <Grid.Col sm={12} md={4}>
            <Transition mounted={visible} transition="fade" duration={1000} delay={400}>
              {(styles) => (
                <Card shadow="sm" p="lg" radius="md" withBorder style={styles}>
                  <Text italic size="lg" mb="md">
                    "The interactive quizzes and adaptive content really helped me understand machine learning concepts that I had struggled with before."
                  </Text>
                  <Group>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: theme.colors.gray[3], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      JS
                    </div>
                    <div>
                      <Text weight={500}>Jane Smith</Text>
                      <Text size="xs" color="dimmed">Data Scientist</Text>
                    </div>
                  </Group>
                </Card>
              )}
            </Transition>
          </Grid.Col>
          
          <Grid.Col sm={12} md={4}>
            <Transition mounted={visible} transition="fade" duration={1000} delay={600}>
              {(styles) => (
                <Card shadow="sm" p="lg" radius="md" withBorder style={styles}>
                  <Text italic size="lg" mb="md">
                    "As a busy professional, I appreciate how Nexora fits learning into my schedule. The bite-sized lessons are perfect for my limited time."
                  </Text>
                  <Group>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: theme.colors.gray[3], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      RJ
                    </div>
                    <div>
                      <Text weight={500}>Robert Johnson</Text>
                      <Text size="xs" color="dimmed">Marketing Manager</Text>
                    </div>
                  </Group>
                </Card>
              )}
            </Transition>
          </Grid.Col>
        </Grid>
      </Box>
      
      {/* CTA Section */}
      <Box py={100} className={classes.section}>
        <Transition mounted={visible} transition="fade" duration={800}>
          {(styles) => (
            <Stack align="center" spacing="xl" style={styles}>
              <Title order={2} align="center">Ready to Transform Your Learning Journey?</Title>
              
              <Text size="xl" align="center" color="dimmed" maw={600} mx="auto">
                Join thousands of learners who have accelerated their skills development with Nexora's AI-powered learning platform.
              </Text>
              
              {!isAuthenticated ? (
                <Group mt="xl">
                  <Button 
                    component={Link}
                    to="/register" 
                    size="xl" 
                    radius="md"
                    variant="gradient"
                    gradient={{ from: 'cyan', to: 'teal', deg: 60 }}
                  >
                    Get Started for Free
                  </Button>
                  <Button 
                    component={Link}
                    to="/login" 
                    size="xl" 
                    variant="outline" 
                    radius="md"
                  >
                    Log In
                  </Button>
                </Group>
              ) : (
                <Button
                  onClick={() => navigate('/create-course')}
                  size="xl"
                  radius="md"
                  variant="gradient"
                  gradient={{ from: 'cyan', to: 'teal', deg: 60 }}
                  mt="xl"
                >
                  Create Your Next Course
                </Button>
              )}
            </Stack>
          )}
        </Transition>
      </Box>
    </Container>
  );
}

export default LandingPage;