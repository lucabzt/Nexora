import { Container, Title, Text, SimpleGrid, Button, Group, Box, ThemeIcon, Badge } from '@mantine/core';
import { IconCheck, IconRocket } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@mantine/hooks';
import { useEffect } from 'react';

const PricingPage = () => {
  const { t, i18n, ready } = useTranslation('pricing');
  const navigate = useNavigate();

  useDocumentTitle(t('pageTitle') || 'Pricing - TeachAI');

  // Helper function to safely get translations
  const getTranslation = (key, options = {}) => {
    const fullKey = `pricing:${key}`;
    const translation = t(fullKey, options);
    return translation === fullKey ? key : translation;
  };

  const freeFeatures = [
    getTranslation('features.unlimitedCourses'),
    getTranslation('features.testCourses'),
    getTranslation('features.limitedChatRequests'),
    getTranslation('features.activeCourses', { count: 3 }),
    getTranslation('features.advancedAI')
  ];

  const premiumFeatures = [
    getTranslation('features.unlimitedCourses'),
    getTranslation('features.activeCourses', { count: 100 }),
    getTranslation('features.advancedAI'),
    getTranslation('features.higherUploads'),
    getTranslation('features.prioritySupport')
  ];

  const enterpriseFeatures = [
    getTranslation('features.unlimitedCourses'),
    getTranslation('features.activeCourses', { count: 0 }),
    getTranslation('features.advancedAI'),
    getTranslation('features.higherUploads'),
    getTranslation('features.prioritySupport'),
    getTranslation('features.dedicatedSupport'),
    getTranslation('features.customFeatures')
  ];

  return (
    <Container size="lg" py="xl">
      <Box mb={50}>
        <Title order={1} align="center" mb="md">
          {getTranslation('title')}
        </Title>
        <Text color="dimmed" size="lg" align="center" mb={40}>
          {getTranslation('subtitle')}
        </Text>
      </Box>

      <SimpleGrid
        cols={3}
        spacing="lg"
        breakpoints={[
          { maxWidth: 'md', cols: 2, spacing: 'md' },
          { maxWidth: 'sm', cols: 1, spacing: 'sm' },
        ]}
      >
        {/* Free Plan */}
        <Box
          p="xl"
          sx={(theme) => ({
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
            borderRadius: theme.radius.md,
            boxShadow: theme.shadows.md,
            border: `1px solid ${
              theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
            }`,
          })}
        >
          <Text size="sm" color="dimmed" mb="xs">
            {getTranslation('free.planName')}
          </Text>
          <Title order={2} mb="xs">
            {getTranslation('free.price')}
          </Title>
          <Text size="sm" color="dimmed" mb="md">
            {getTranslation('free.description')}
          </Text>
          <Button
            fullWidth
            variant="outline"
            mt="md"
            onClick={() => navigate('/dashboard?plan=free')}
          >
            {getTranslation('getStarted')}
          </Button>
          <Box mt="xl">
            {freeFeatures.map((feature, index) => (
              <Group key={index} mb="xs">
                <ThemeIcon color="teal" size={24} radius="xl">
                  <IconCheck size={16} />
                </ThemeIcon>
                <Text size="sm">
                  {feature}
                  {index === 0 && <Badge ml="sm" color="gray" variant="outline">{getTranslation('free.limited')}</Badge>}
                </Text>
              </Group>
            ))}
          </Box>
        </Box>

        {/* Premium Plan */}
        <Box
          p="xl"
          sx={(theme) => ({
            backgroundColor: theme.fn.variant({ variant: 'light', color: 'blue' }).background,
            borderRadius: theme.radius.md,
            boxShadow: theme.shadows.lg,
            border: `2px solid ${theme.colors.blue[6]}`,
            position: 'relative',
            overflow: 'hidden',
          })}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              backgroundColor: 'blue',
              color: 'white',
              padding: '2px 16px',
              transform: 'translateY(-50%) rotate(45deg) translateX(30%)',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {getTranslation('popular')}
          </Box>
          <Text size="sm" color="blue" mb="xs">
            {getTranslation('premium.planName')}
          </Text>
          <Title order={2} mb="xs">
            {getTranslation('premium.price')}
          </Title>
          <Text size="sm" color="dimmed" mb="md">
            {getTranslation('premium.description')}
          </Text>
          <Button
            fullWidth
            color="blue"
            mt="md"
            rightIcon={<IconRocket size={18} />}
            onClick={() => navigate('/dashboard?plan=premium')}
          >
            {getTranslation('upgradeNow')}
          </Button>
          <Box mt="xl">
            {premiumFeatures.map((feature, index) => (
              <Group key={index} mb="xs">
                <ThemeIcon color="teal" size={24} radius="xl">
                  <IconCheck size={16} />
                </ThemeIcon>
                <Text size="sm">{feature}</Text>
              </Group>
            ))}
          </Box>
        </Box>

        {/* Enterprise Plan */}
        <Box
          p="xl"
          sx={(theme) => ({
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
            borderRadius: theme.radius.md,
            boxShadow: theme.shadows.md,
            border: `1px solid ${
              theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
            }`,
          })}
        >
          <Text size="sm" color="dimmed" mb="xs">
            {getTranslation('enterprise.planName')}
          </Text>
          <Title order={2} mb="xs">
            {getTranslation('enterprise.price')}
          </Title>
          <Text size="sm" color="dimmed" mb="md">
            {getTranslation('enterprise.description')}
          </Text>
          <Button
            fullWidth
            variant="outline"
            mt="md"
            onClick={() => navigate('/contact')}
          >
            {getTranslation('contactUs')}
          </Button>
          <Box mt="xl">
            {enterpriseFeatures.map((feature, index) => (
              <Group key={index} mb="xs">
                <ThemeIcon color="teal" size={24} radius="xl">
                  <IconCheck size={16} />
                </ThemeIcon>
                <Text size="sm">
                  {feature}
                  {index === 0 && <Badge ml="sm" color="blue">{getTranslation('unlimited')}</Badge>}
                </Text>
              </Group>
            ))}
          </Box>
        </Box>
      </SimpleGrid>
    </Container>
  );
};

export default PricingPage;
