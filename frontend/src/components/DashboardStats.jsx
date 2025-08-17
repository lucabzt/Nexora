import React from 'react';
import { Group, Paper, Text, ThemeIcon, useMantineTheme } from '@mantine/core';
import { IconFlame, IconBook, IconClock } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

function DashboardStats({ stats, theme }) {
  const { t } = useTranslation('dashboard');
  const statItems = [
    {
      label: t('stats.currentStreak'),
      value: stats?.loginStreak || 0,
      icon: <IconFlame size={24} />,
      color: 'orange',
      suffix: ` ${t('stats.days')}`,
    },
    {
      label: t('stats.coursesCompleted'),
      value: stats?.totalCourses || 0,
      icon: <IconBook size={24} />,
      color: 'blue',
    },
    {
      label: t('totalLearnTime'),
      value: stats?.totalLearnTime || 0,
      icon: <IconClock size={24} />,
      color: 'teal',
      suffix: ` ${t('stats.hoursUnit')}`,
    },
  ];

  return (
    <Paper p="md" radius="md" withBorder shadow="sm" mb="xl">
      <Group position="apart" spacing="xl" noWrap>
        {statItems.map((stat, index) => (
          <Group key={index} spacing="sm" noWrap>
            <ThemeIcon
              size={48}
              radius="md"
              variant="light"
              color={stat.color}
              sx={{
                minWidth: 48,
                background: theme.colorScheme === 'dark' 
                  ? `${theme.colors[stat.color][9]}22`
                  : `${theme.colors[stat.color][0]}`, 
              }}
            >
              {stat.icon}
            </ThemeIcon>
            <div>
              <Text size="sm" color="dimmed" weight={500}>
                {stat.label}
              </Text>
              <Text size="lg" weight={700}>
                {stat.value}
                {stat.suffix || ''}
              </Text>
            </div>
          </Group>
        ))}
      </Group>
    </Paper>
  );
}

export default DashboardStats;
