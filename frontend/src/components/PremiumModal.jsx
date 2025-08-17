import {
    Modal,
    Group,
    Title,
    Stack,
    List,
    ThemeIcon,
    Image,
    Text,
    Button,
    createStyles,
    Grid,
    Paper,
    rem,
  } from '@mantine/core';
  import { IconRocket, IconCheck } from '@tabler/icons-react';
  import { useTranslation } from 'react-i18next';
  import { useNavigate } from 'react-router-dom';
  // Import framer-motion for animations
  import { motion } from 'framer-motion';
  
  // --- Styling Hook (Mantine's recommended way for custom styles) ---
  const useStyles = createStyles((theme) => ({
    modalContent: {
      // Adding a subtle background texture or color can make a big difference
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
    },
  
    header: {
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
  
    featuresColumn: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
  
    imageColumn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  
    featurePaper: {
      // Use Paper for a slightly elevated, premium feel
      padding: `calc(${theme.spacing.xl} * 1.5)`,
      borderRadius: theme.radius.lg,
      boxShadow: theme.shadows.md,
      border: `1px solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
      }`,
    },
    
    upgradeButton: {
      // Make the primary call-to-action stand out
      transition: 'transform 150ms ease, box-shadow 150ms ease',
  
      '&:hover': {
        transform: 'scale(1.03)',
        boxShadow: theme.shadows.md,
      },
    },
  
    title: {
      // Use a gradient for the title to make it pop
      background: theme.fn.gradient({ from: 'blue', to: 'cyan', deg: 45 }),
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontSize: rem(34),
      fontWeight: 900,
    },
  }));
  
  // --- Animation Variants for Framer Motion ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Animate children one by one
      },
    },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };
  
  const imageVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0.0, 0.2, 1], // A nice easing curve
      },
    },
  };
  
  
  const PremiumModal = ({ opened, onClose, limitReached = false }) => {
    const { t } = useTranslation('createCourse');
    const navigate = useNavigate();
    const { classes } = useStyles();
  
    // We return null if not opened, this is good practice to prevent unnecessary renders.
    if (!opened) {
      return null;
    }
    
    return (
      <Modal
        opened={opened}
        onClose={onClose}
        size="70%"
        radius="lg"
        // Added a smooth pop-in transition for the modal itself
        transitionProps={{ transition: 'pop', duration: 300, timingFunction: 'ease' }}
        overlayProps={{
          blur: 5,
        }}
        zIndex={1000}
        withCloseButton={false} // Hide default close button for a cleaner look
        centered // Vertically centers the modal
        classNames={{ content: classes.modalContent }}
      >
        {/* Main container for animations */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Stack spacing="xl" p="md">
  
            {/* Animated Header */}
            <motion.div variants={itemVariants} className={classes.header}>
              <Group position="center" spacing="sm">
                <IconRocket size={36} color="var(--mantine-color-blue-5)" />
                <Title className={classes.title}>
                  {limitReached ? t('premiumModal.limitReachedTitle', 'Limit erreicht!') : t('premiumModal.title')}
                </Title>
              </Group>
              <Text size="lg" color={limitReached ? 'red' : 'dimmed'} mt="sm">
                {limitReached 
                  ? t('premiumModal.limitReachedMessage', 'Sie haben Ihr kostenloses Kontingent an Kursen erreicht.') 
                  : t('premiumModal.subtitle')}
              </Text>
            </motion.div>
            
            {/* Using Grid for a better responsive layout */}
            <Grid gutter="xl" align="center">
              <Grid.Col md={6} className={classes.featuresColumn}>
                {/* Wrapped features in a Paper component for better visuals */}
                <motion.div variants={itemVariants}>
                  <Paper withBorder className={classes.featurePaper}>
                    <Title order={4} mb="lg" align="center">
                      {t('premiumModal.featuresTitle')}
                    </Title>
                    <List
                      spacing="md"
                      size="md"
                      center
                      icon={
                        <ThemeIcon color="teal" size={24} radius="xl">
                          <IconCheck size={rem(16)} />
                        </ThemeIcon>
                      }
                    >
                      {/* Animate each list item individually */}
                      <motion.div variants={itemVariants}><List.Item>{t('premiumModal.feature1')}</List.Item></motion.div>
                      <motion.div variants={itemVariants}><List.Item>{t('premiumModal.feature2')}</List.Item></motion.div>
                      <motion.div variants={itemVariants}><List.Item>{t('premiumModal.feature3')}</List.Item></motion.div>
                      <motion.div variants={itemVariants}><List.Item>{t('premiumModal.feature4')}</List.Item></motion.div>
                      <motion.div variants={itemVariants}><List.Item>{t('premiumModal.feature5')}</List.Item></motion.div>
                    </List>
                  </Paper>
                </motion.div>
              </Grid.Col>
              
              <Grid.Col md={6} className={classes.imageColumn}>
                {/* Animate the illustration */}
                <motion.div variants={imageVariants}>
                  <Image
                    src="https://cdn1.iconfinder.com/data/icons/social-messaging-ui-color-shapes/128/diamond-watch-circle-blue-512.png"
                    alt="Premium Features Illustration"
                    width={200}
                    height={200}
                  />
                </motion.div>
              </Grid.Col>
            </Grid>
            
            <motion.div variants={itemVariants}>
              <Group position="right" mt="xl">
                <Button variant="subtle" color="gray" onClick={onClose} radius="md">
                  {t('common.maybeLater', 'Maybe Later')}
                </Button>
                <Button 
                  className={classes.upgradeButton}
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                  size="md"
                  radius="md"
                  onClick={() => {
                    onClose();
                    navigate('/pricing');
                  }}
                  rightIcon={<IconRocket size={rem(18)} />}
                >
                  {t('premiumModal.upgradeButton', 'Upgrade Now')}
                </Button>
              </Group>
            </motion.div>
          </Stack>
        </motion.div>
      </Modal>
    );
  };
  
  export default PremiumModal;