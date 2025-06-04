import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
              {t('landingPage.hero.titlePart1')}{' '}
              <Text 
                component="span" 
                variant="gradient" 
                gradient={{ from: 'cyan', to: 'teal', deg: 45 }}
              >
                {t('landingPage.hero.titlePart2')}
              </Text>
            </Title>
            
            <Text size="xl" color="dimmed" mb={30}>
              {t('landingPage.hero.subtitle')}
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
                    {t('landingPage.hero.getStarted')}
                  </Button>
                  <Button 
                    component={Link} 
                    to="/login" 
                    size="lg" 
                    radius="md"
                    variant="outline"
                  >
                    {t('landingPage.hero.login')}
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => navigate('/')} 
                  size="lg" 
                  radius="md"
                  variant="gradient"
                  gradient={{ from: 'cyan', to: 'teal' }}
                  rightIcon={<IconArrowRight size={18} />}
                >
                  {t('landingPage.hero.backToDashboard')}
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
                  caption={t('landingPage.hero.imageCaption')}
                />
              </Box>
            )}
          </Transition>
        </Grid.Col>
      </Grid>
      
      {/* Features Section */}
      <Box className={`${classes.section} ${classes.gradient}`} mb={50}>
        <Title order={2} align="center" mb={50}>{t('landingPage.features.title')}</Title>
        
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
                  
                  <Title order={3} size="h4" mb="xs">{t('landingPage.features.feature1Title')}</Title>
                  
                  <Text size="sm" color="dimmed">
                    {t('landingPage.features.feature1Text')}
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
                  
                  <Title order={3} size="h4" mb="xs">{t('landingPage.features.feature2Title')}</Title>
                  
                  <Text size="sm" color="dimmed">
                    {t('landingPage.features.feature2Text')}
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
                  
                  <Title order={3} size="h4" mb="xs">{t('landingPage.features.feature3Title')}</Title>
                  
                  <Text size="sm" color="dimmed">
                    {t('landingPage.features.feature3Text')}
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
                  
                  <Title order={3} size="h4" mb="xs">{t('landingPage.features.feature4Title')}</Title>
                  
                  <Text size="sm" color="dimmed">
                    {t('landingPage.features.feature4Text')}
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
                    alt={t('landingPage.howItWorks.imageAlt')}
                  />
                </div>
              )}
            </Transition>
          </Grid.Col>
          
          <Grid.Col md={6} order={1} orderMd={2}>
            <Transition mounted={visible} transition="slide-left" duration={800}>
              {(styles) => (
                <Stack spacing="xl" style={styles}>
                  <Title order={2}>{t('landingPage.howItWorks.title')}</Title>
                  
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
                      <Text size="lg" weight={500}>{t('landingPage.howItWorks.step1Title')}</Text>
                      <Text color="dimmed">{t('landingPage.howItWorks.step1Text')}</Text>
                    </List.Item>
                    
                    <List.Item>
                      <Text size="lg" weight={500}>{t('landingPage.howItWorks.step2Title')}</Text>
                      <Text color="dimmed">{t('landingPage.howItWorks.step2Text')}</Text>
                    </List.Item>
                    
                    <List.Item>
                      <Text size="lg" weight={500}>{t('landingPage.howItWorks.step3Title')}</Text>
                      <Text color="dimmed">{t('landingPage.howItWorks.step3Text')}</Text>
                    </List.Item>
                    
                    <List.Item>
                      <Text size="lg" weight={500}>{t('landingPage.howItWorks.step4Title')}</Text>
                      <Text color="dimmed">{t('landingPage.howItWorks.step4Text')}</Text>
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
                      {t('landingPage.howItWorks.cta')}
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
        <Title order={2} align="center" mb={30}>{t('landingPage.testimonials.title')}</Title>
        
        <Grid>
          <Grid.Col sm={12} md={4}>
            <Transition mounted={visible} transition="fade" duration={1000} delay={200}>
              {(styles) => (
                <Card shadow="sm" p="lg" radius="md" withBorder style={styles}>
                  <Text italic size="lg" mb="md">
                    {t('landingPage.testimonials.quote1')}
                  </Text>
                  <Group>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: theme.colors.gray[3], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      JD
                    </div>
                    <div>
                      <Text weight={500}>{t('landingPage.testimonials.name1')}</Text>
                      <Text size="xs" color="dimmed">{t('landingPage.testimonials.role1')}</Text>
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
                    {t('landingPage.testimonials.quote2')}
                  </Text>
                  <Group>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: theme.colors.gray[3], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      JS
                    </div>
                    <div>
                      <Text weight={500}>{t('landingPage.testimonials.name2')}</Text>
                      <Text size="xs" color="dimmed">{t('landingPage.testimonials.role2')}</Text>
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
                    {t('landingPage.testimonials.quote3')}
                  </Text>
                  <Group>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: theme.colors.gray[3], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      RJ
                    </div>
                    <div>
                      <Text weight={500}>{t('landingPage.testimonials.name3')}</Text>
                      <Text size="xs" color="dimmed">{t('landingPage.testimonials.role3')}</Text>
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
              <Title order={2} align="center">{t('landingPage.cta.title')}</Title>
              
              <Text size="xl" align="center" color="dimmed" maw={600} mx="auto">
                {t('landingPage.cta.subtitle')}
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
                    {t('landingPage.cta.getStartedFree')}
                  </Button>
                  <Button 
                    component={Link}
                    to="/login" 
                    size="xl" 
                    variant="outline" 
                    radius="md"
                  >
                    {t('landingPage.hero.login')}
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
                  {t('landingPage.cta.createNextCourse')}
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