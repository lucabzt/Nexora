import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
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
  createStyles,
} from "@mantine/core";

import {
  IconCheck,
  IconBrain,
  IconChartBar,
  IconUser,
  IconArrowRight,
  IconTrophy, // Added for the new award section
} from "@tabler/icons-react";
import { useAuth } from "../contexts/AuthContext";

import { useMediaQuery } from '@mantine/hooks';

// ... other imports
import { HeroAnimation } from "../components/HeroAnimation"; // <-- ADD THIS LINE

const fadeIn = keyframes({
  from: { opacity: 0, transform: "translateY(20px)" },
  to: { opacity: 1, transform: "translateY(0)" },
});

const slideInFromRight = keyframes({
  '0%': { transform: 'translateX(100px) scale(0.98)', opacity: 0 },
  '100%': { transform: 'translateX(0) scale(1)', opacity: 1 }
});

const float = keyframes({
  '0%, 100%': { transform: 'translateY(0)' },
  '50%': { transform: 'translateY(-10px)' }
});

const pulse = keyframes({
  '0%': { boxShadow: '0 0 0 0 rgba(0, 144, 158, 0.4)' },
  '70%': { boxShadow: '0 0 0 15px rgba(0, 144, 158, 0)' },
  '100%': { boxShadow: '0 0 0 0 rgba(0, 144, 158, 0)' }
});

const useStyles = createStyles((theme) => ({
  hero: {
    position: 'relative',
    paddingTop: theme.spacing.xl * 8,
    paddingBottom: theme.spacing.xl * 8,
    minHeight: 'calc(100vh - 80px)',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: theme.colorScheme === 'dark' 
        ? 'radial-gradient(ellipse at top, rgba(12, 20, 44, 0.8) 0%, rgba(6, 11, 26, 0.9) 100%)' 
        : 'radial-gradient(ellipse at top, rgba(255, 255, 255, 0.9) 0%, rgba(240, 249, 255, 0.9) 100%)',
      zIndex: -1,
    },
  },
  
  heroContent: {
    position: 'relative',
    zIndex: 2,
    animation: `${fadeIn} 0.8s ease-out`,
    [theme.fn.smallerThan('md')]: {
      textAlign: 'center',
    },
  },
  
  heroImage: {
    position: 'relative',
    zIndex: 1,
    '&::before': {
      content: '""',
      position: 'absolute',
      width: '120%',
      height: '120%',
      top: '-10%',
      left: '-10%',
      background: 'radial-gradient(circle, rgba(0,144,158,0.2) 0%, rgba(0,144,158,0) 70%)',
      borderRadius: '50%',
      zIndex: -1,
      animation: `${pulse} 4s infinite`,
    },
    [theme.fn.smallerThan('md')]: {
      marginTop: theme.spacing.xl * 2,
    },
  },

  featureCard: {
    height: '100%',
    background: theme.colorScheme === 'dark' 
      ? 'rgba(17, 25, 40, 0.5)' 
      : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid',
    borderColor: theme.colorScheme === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.05)',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-8px) scale(1.01)',
      boxShadow: theme.shadows.xl,
      borderColor: theme.colorScheme === 'dark' 
        ? theme.colors.teal[7] 
        : theme.colors.teal[3],
      '& .featureIcon': {
        transform: 'scale(1.1)',
        background: theme.fn.linearGradient(45, theme.colors.teal[6], theme.colors.cyan[5]),
      },
    },
  },

  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    transition: 'all 0.3s ease',
    background: theme.fn.linearGradient(45, 
      theme.colorScheme === 'dark' ? theme.colors.teal[9] : theme.colors.teal[1], 
      theme.colorScheme === 'dark' ? theme.colors.cyan[8] : theme.colors.cyan[0]
    ),
  },

  section: {
    padding: '60px 0',
    position: 'relative',
    overflow: 'hidden',
    '& + &': {
      marginTop: '60px',
    },
    [theme.fn.smallerThan('sm')]: {
      padding: '40px 0',
      '& + &': {
        marginTop: '40px',
      },
    },
    '&:nth-of-type(even)': {
      background: theme.colorScheme === 'dark' 
        ? 'linear-gradient(180deg, rgba(12, 20, 44, 0.9) 0%, rgba(6, 11, 26, 0.95) 100%)' 
        : 'linear-gradient(180deg, rgba(240, 249, 255, 0.9) 0%, rgba(255, 255, 255, 0.9) 100%)',
      padding: `${theme.spacing.xl * 8}px 0`,
      [theme.fn.smallerThan('sm')]: {
        padding: `${theme.spacing.xl * 4}px 0`,
      },
    },
  },

  gradient: {
    position: 'relative',
    background: theme.colorScheme === 'dark'
      ? 'linear-gradient(135deg, rgba(0, 144, 158, 0.15) 0%, rgba(0, 179, 196, 0.1) 100%)'
      : 'linear-gradient(135deg, rgba(0, 144, 158, 0.08) 0%, rgba(0, 179, 196, 0.05) 100%)',
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl * 2,
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: theme.colorScheme === 'dark' ? 0.2 : 0.1,
      zIndex: 0,
    },
  },

  ctaButton: {
    position: 'relative',
    overflow: 'hidden',
    padding: '12px 28px',
    borderRadius: theme.radius.xl,
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows.md,
    },
  },

  primaryButton: {
    background: theme.fn.linearGradient(45, theme.colors.teal[6], theme.colors.cyan[5]),
    color: 'white',
    '&:hover': {
      background: theme.fn.linearGradient(45, theme.colors.teal[7], theme.colors.cyan[6]),
    },
  },

  secondaryButton: {
    border: '2px solid',
    borderColor: theme.colorScheme === 'dark' ? theme.colors.teal[7] : theme.colors.teal[5],
    color: theme.colorScheme === 'dark' ? theme.colors.teal[2] : theme.colors.teal[7],
    '&:hover': {
      background: theme.colorScheme === 'dark' 
        ? 'rgba(0, 199, 181, 0.1)' 
        : 'rgba(0, 184, 217, 0.05)',
    },
  },

  floatingShape: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(40px)',
    opacity: 0.1,
    zIndex: 0,
  },

  shape1: {
    width: '400px',
    height: '400px',
    background: theme.colors.teal[6],
    top: '-100px',
    right: '-100px',
    animation: `${float} 8s ease-in-out infinite`,
  },

  shape2: {
    width: '300px',
    height: '300px',
    background: theme.colors.cyan[5],
    bottom: '50px',
    left: '-100px',
    animation: `${float} 10s ease-in-out 1s infinite`,
  },

  // NEW: Styles for the product demo video
  videoContainer: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    paddingTop: '56.25%', // 16:9 Aspect Ratio
    borderRadius: theme.radius.lg,
    boxShadow: theme.shadows.xl,
    border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[3]}`,
    marginTop: theme.spacing.xl * 2,
  },

  videoIframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
    border: 'none',
  },
}));

function LandingPage() {
  const { t } = useTranslation("landingPage");
  const { classes, cx } = useStyles();
  const theme = useMantineTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Animation trigger on mount
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100); // Small delay to ensure mount
    return () => clearTimeout(timer);
  }, []);

  // Scroll to section helper
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Box style={{ position: 'relative', overflowX: 'hidden' }}>
      {/* Floating shapes for visual interest */}
      <Box className={cx(classes.floatingShape, classes.shape1)} />
      <Box className={cx(classes.floatingShape, classes.shape2)} />
      
      {/* Hero Section */}
      <Box 
        className={classes.hero} 
        id="home"
        sx={{
          paddingTop: isMobile ? '6rem !important' : undefined,
        }}
      >
        <Container size="xl" px="md">
          <Grid gutter={50} align="center">
            <Grid.Col md={6} className={classes.heroContent}>
                <Transition mounted={visible} transition="slide-up" duration={600} delay={200}>
                  {(styles) => (
                    <div style={styles}>
                      <Text 
                        size="sm" 
                        weight={700} 
                        color="teal" 
                        mb="sm"
                        style={{ letterSpacing: '2px' }}
                      >
                        {t('hero.pretitle', 'NEXT-GENERATION AI LEARNING')}
                      </Text>
                      <Title 
                        order={1} 
                        size={56} 
                        weight={800} 
                        mb="md"
                        sx={{
                          lineHeight: 1.2,
                          background: theme.colorScheme === 'dark' 
                            ? 'linear-gradient(90deg, #fff 0%, #a5d8ff 100%)' 
                            : 'linear-gradient(90deg, #1a1b1e 0%, #4dabf7 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          backgroundSize: '100%',
                          backgroundRepeat: 'no-repeat',
                          transition: 'background 0.3s ease',
                          display: 'inline-block' // Ensures the gradient is properly contained
                        }}
                      >
                        {t('hero.title', 'Unlock Your Potential with AI-Powered Learning')}
                      </Title>
                      <Text 
                        size="xl" 
                        color={theme.colorScheme === 'dark' ? 'dimmed' : 'gray.7'} 
                        mb="xl"
                        style={{ maxWidth: '90%', lineHeight: 1.6 }}
                      >
                        {t('hero.subtitle', 'Create, manage, and deliver engaging courses with intelligent tools designed for modern educators and learners.')}
                      </Text>
                      <Group spacing="md">
                        <Button
                          size={isMobile ? "md" : "lg"}
                          rightIcon={<IconArrowRight size={isMobile ? 16 : 20} />}
                          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth/signup')}
                          className={cx(classes.ctaButton, classes.primaryButton)}
                          radius="xl"
                        >
                          {isAuthenticated ? t('goToDashboard', 'Go to Dashboard') : t('getStarted', 'Get Started Free')}
                        </Button>
                        <Button
                          variant="outline"
                          size={isMobile ? "md" : "lg"}
                          onClick={() => scrollToSection('features')}
                          className={cx(classes.ctaButton, classes.secondaryButton)}
                          radius="xl"
                        >
                          {t('learnMore', 'Learn More')}
                        </Button>
                      </Group>
                    </div>
                  )}
                </Transition>
            </Grid.Col>




            <Grid.Col md={6}>
              <Transition mounted={visible} transition="pop" duration={800} delay={400}>
                {(styles) => (
                  <div 
                    className={classes.heroImage} 
                    style={{
                      ...styles,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 350 // Ensures container has height for centering
                    }}
                  >
                    <HeroAnimation />
                  </div>
                )}
              </Transition>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" className={classes.section}>
        <Container>
          <Title order={2} align="center" mb="xl" fz="2.25rem">
            {t("features.title", "Why Choose Our Platform?")}
          </Title>

          <Grid gutter="xl">
            <Grid.Col sm={6} md={3}>
              <Transition mounted={visible} transition="pop" duration={600} delay={200}>
                {(styles) => (
                  <Card shadow="sm" p="xl" radius="md" withBorder className={classes.featureCard} style={styles}>
                    <Stack spacing="lg">
                      <ThemeIcon size={50} radius="md" variant="light" color="cyan">
                        <IconBrain size={30} />
                      </ThemeIcon>
                      <Stack spacing={8}>
                        <Title order={3} fz="lg" fw={600}>{t("features.feature1Title", "AI Content Generation")}</Title>
                        <Text size="sm" c="dimmed" lh={1.55}>{t("features.feature1Text", "Instantly create lesson plans, quizzes, and course materials with our advanced AI.")}</Text>
                      </Stack>
                    </Stack>
                  </Card>
                )}
              </Transition>
            </Grid.Col>

            <Grid.Col sm={6} md={3}>
              <Transition mounted={visible} transition="pop" duration={600} delay={400}>
                {(styles) => (
                  <Card shadow="sm" p="xl" radius="md" withBorder className={classes.featureCard} style={styles}>
                    <Stack spacing="lg">
                      <ThemeIcon size={50} radius="md" variant="light" color="teal">
                        <IconChartBar size={30} />
                      </ThemeIcon>
                      <Stack spacing={8}>
                        <Title order={3} fz="lg" fw={600}>{t("features.feature2Title", "Insightful Analytics")}</Title>
                        <Text size="sm" c="dimmed" lh={1.55}>{t("features.feature2Text", "Track student progress and engagement with powerful, easy-to-understand dashboards.")}</Text>
                      </Stack>
                    </Stack>
                  </Card>
                )}
              </Transition>
            </Grid.Col>

            <Grid.Col sm={6} md={3}>
              <Transition mounted={visible} transition="pop" duration={600} delay={600}>
                {(styles) => (
                  <Card shadow="sm" p="xl" radius="md" withBorder className={classes.featureCard} style={styles}>
                    <Stack spacing="lg">
                      <ThemeIcon size={50} radius="md" variant="light" color="blue">
                        <IconUser size={30} />
                      </ThemeIcon>
                      <Stack spacing={8}>
                        <Title order={3} fz="lg" fw={600}>{t("features.feature3Title", "Personalized Learning")}</Title>
                        <Text size="sm" c="dimmed" lh={1.55}>{t("features.feature3Text", "Adapt learning paths for each student, providing a unique and effective educational experience.")}</Text>
                      </Stack>
                    </Stack>
                  </Card>
                )}
              </Transition>
            </Grid.Col>

            <Grid.Col sm={6} md={3}>
              <Transition mounted={visible} transition="pop" duration={600} delay={800}>
                {(styles) => (
                  <Card shadow="sm" p="xl" radius="md" withBorder className={classes.featureCard} style={styles}>
                    <Stack spacing="lg">
                      <ThemeIcon size={50} radius="md" variant="light" color="grape">
                        <IconCheck size={30} />
                      </ThemeIcon>
                      <Stack spacing={8}>
                        <Title order={3} fz="lg" fw={600}>{t("features.feature4Title", "Effortless Management")}</Title>
                        <Text size="sm" c="dimmed" lh={1.55}>{t("features.feature4Text", "A simple, intuitive interface makes course creation and administration a breeze.")}</Text>
                      </Stack>
                    </Stack>
                  </Card>
                )}
              </Transition>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>
      
      {/* Award Section */}
      <Box id="award" className={classes.section}>
        <Container>
          <Transition mounted={visible} transition="fade" duration={800} delay={400}>
            {(styles) => (
              <Box className={classes.gradient} style={styles}>
                <Stack align="center" spacing="lg" sx={{ textAlign: 'center' }}>
                  <ThemeIcon size={80} radius="xl" variant="gradient" gradient={{ from: 'yellow', to: 'orange' }}>
                    <IconTrophy size={40} />
                  </ThemeIcon>
                  <Title order={2} size="2.5rem">
                    {t('award.title', 'EMEA Regional Winner')}
                  </Title>
                  <Title order={3} size="1.5rem" weight={500} color="dimmed" mt={-15}>
                    {t('award.subtitle', 'Google Cloud Agent Development Kit Hackathon')}
                  </Title>
                  <Text size="lg" maw={700}>
                    {t('award.body', 'Out of 10,000+ global participants, our platform was recognized for excellence in building innovative multi-agent AI systems. This award highlights our commitment to pushing the boundaries of automated content creation and data analysis.')}
                  </Text>
                </Stack>
              </Box>
            )}
          </Transition>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box id="how-it-works" className={classes.section}>
        <Container>
          <Grid gutter={50} align="center">
            <Grid.Col md={6}>
              <Transition mounted={visible} transition="slide-right" duration={800}>
                {(styles) => (
                  <div style={styles}>
                    <Image
                      radius="md"
                      src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                      alt={t("howItWorks.imageAlt", "People collaborating on a project")}
                    />
                  </div>
                )}
              </Transition>
            </Grid.Col>
            <Grid.Col md={6}>
              <Transition mounted={visible} transition="slide-left" duration={800}>
                {(styles) => (
                  <Stack spacing="xl" style={styles}>
                    <Title order={2}>{t("howItWorks.title", "Get Started in Minutes")}</Title>
                    <List spacing="lg" size="lg" center icon={<ThemeIcon color="teal" size={28} radius="xl"><IconCheck size={18} /></ThemeIcon>}>
                      <List.Item>
                        <Text size="lg" weight={500}>{t("howItWorks.step1Title", "Sign Up")}</Text>
                        <Text color="dimmed">{t("howItWorks.step1Text", "Create your free account to get started.")}</Text>
                      </List.Item>
                      <List.Item>
                        <Text size="lg" weight={500}>{t("howItWorks.step2Title", "Create Your Course")}</Text>
                        <Text color="dimmed">{t("howItWorks.step2Text", "Use our AI assistant to build your curriculum.")}</Text>
                      </List.Item>
                      <List.Item>
                        <Text size="lg" weight={500}>{t("howItWorks.step3Title", "Enroll Students")}</Text>
                        <Text color="dimmed">{t("howItWorks.step3Text", "Invite learners to join your course.")}</Text>
                      </List.Item>
                      <List.Item>
                        <Text size="lg" weight={500}>{t("howItWorks.step4Title", "Analyze & Grow")}</Text>
                        <Text color="dimmed">{t("howItWorks.step4Text", "Use analytics to improve and expand.")}</Text>
                      </List.Item>
                    </List>
                  </Stack>
                )}
              </Transition>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>
      
      {/* NEW: Product Demo Section */}
      <Box id="demo" className={classes.section}>
        <Container>
          <Stack align="center" spacing="md" sx={{ textAlign: 'center' }}>
            <Title order={2} fz="2.25rem">
              {t("demo.title", "See Our Platform in Action")}
            </Title>
            <Text size="xl" color="dimmed" maw={700}>
              {t("demo.subtitle", "Watch a quick walkthrough to see how our AI-powered tools can streamline your workflow and enhance the learning experience.")}
            </Text>
          </Stack>
          
          <Transition mounted={visible} transition="pop" duration={800} delay={400}>
            {(styles) => (
              <Box className={classes.videoContainer} style={styles}>
                <iframe
                  className={classes.videoIframe}
                  src="https://www.youtube.com/embed/JImJJ9RcCog?si=lxImpxOlKnm3VAAV" // IMPORTANT: Replace with your actual video ID
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </Box>
            )}
          </Transition>
        </Container>
      </Box>

      {/* Testimonial Section */}
      <Box id="testimonials" className={classes.section}>
          <Container>
            <Title order={2} align="center" mb={30}>
              {t("testimonials.title", "Loved by Educators & Learners")}
            </Title>
            <Grid>
              <Grid.Col sm={12} md={4}>
                <Transition mounted={visible} transition="fade" duration={1000} delay={200}>
                  {(styles) => (
                    <Card shadow="sm" p="lg" radius="md" withBorder style={styles}>
                      <Text italic size="lg" mb="md">{t("testimonials.quote1", "This platform transformed how I create content. The AI saves me hours of work every week!")}</Text>
                      <Group>
                        <div style={{width: 40, height: 40, borderRadius: "50%", backgroundColor: theme.colors.gray[2], display: "flex", alignItems: "center", justifyContent: "center"}}>JD</div>
                        <div>
                          <Text weight={500}>{t("testimonials.name1", "Jane Doe")}</Text>
                          <Text size="xs" color="dimmed">{t("testimonials.role1", "University Professor")}</Text>
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
                      <Text italic size="lg" mb="md">{t("testimonials.quote2", "As a student, the personalized feedback is incredible. I feel like I have a personal tutor.")}</Text>
                      <Group>
                        <div style={{width: 40, height: 40, borderRadius: "50%", backgroundColor: theme.colors.gray[3], display: "flex", alignItems: "center", justifyContent: "center"}}>JS</div>
                        <div>
                          <Text weight={500}>{t("testimonials.name2", "John Smith")}</Text>
                          <Text size="xs" color="dimmed">{t("testimonials.role2", "Online Learner")}</Text>
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
                      <Text italic size="lg" mb="md">{t("testimonials.quote3", "The analytics dashboard is a game-changer for understanding student engagement.")}</Text>
                      <Group>
                        <div style={{width: 40, height: 40, borderRadius: "50%", backgroundColor: theme.colors.gray[3], display: "flex", alignItems: "center", justifyContent: "center"}}>RJ</div>
                        <div>
                          <Text weight={500}>{t("testimonials.name3", "Robert Johnson")}</Text>
                          <Text size="xs" color="dimmed">{t("testimonials.role3", "Corporate Trainer")}</Text>
                        </div>
                      </Group>
                    </Card>
                  )}
                </Transition>
              </Grid.Col>
            </Grid>
          </Container>
      </Box>

      {/* CTA Section */}
      <Box id="cta" py={100} className={classes.section}>
        <Container>
          <Transition mounted={visible} transition="fade" duration={800}>
            {(styles) => (
              <Stack align="center" spacing="xl" style={styles}>
                <Title order={2} align="center">
                  {t("cta.title", "Ready to Revolutionize Your Teaching?")}
                </Title>
                <Text size="xl" align="center" color="dimmed" maw={600} mx="auto">
                  {t("cta.subtitle", "Join thousands of educators and learners who are shaping the future of education. Get started today for free.")}
                </Text>
                <Button
                    onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth/signup')}
                    size="lg"
                    radius="xl"
                    className={cx(classes.ctaButton, classes.primaryButton)}
                    px="2rem"
                    py="0.75rem"
                    fw={600}
                    fz="1rem"
                  >
                  {isAuthenticated ? t('cta.createNextCourse', 'Create Your Next Course') : t("cta.getStarted", "Start for Free")}
                </Button>
              </Stack>
            )}
          </Transition>
        </Container>
      </Box>
    </Box>
  );
}

export default LandingPage;