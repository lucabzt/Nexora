import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Title, Text, Button, Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';

function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <Container style={{ textAlign: 'center', paddingTop: '50px' }}>
      <Title order={1} style={{ fontSize: '10rem', marginBottom: '0px' }}>
        404
      </Title>
      <Text size="xl" weight={500} style={{ marginBottom: '20px' }}>
        {t('notFound.title', 'Oops! Page not found.')}
      </Text>
      <Text color="dimmed" style={{ marginBottom: '30px' }}>
        {t('notFound.message', "We can't seem to find the page you're looking for.")}
      </Text>
      <Group position="center">
        <Button component={Link} to="/" variant="light">
          {t('notFound.goHome', 'Go to Homepage')}
        </Button>
      </Group>
    </Container>
  );
}

export default NotFoundPage;
