import React from 'react';
import { Box, Button, Group, Text, Progress, Paper, Title, useMantineTheme } from '@mantine/core';
import { IconPlayerPlay, IconPlayerPause, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { usePomodoro } from '../../contexts/PomodoroContext';

const PomodoroTimer = () => {
  const { t } = useTranslation('pomodoro');
  const theme = useMantineTheme();
  const {
    time,
    isActive,
    isBreak,
    toggleTimer,
    resetTimer,
    workDuration,
    breakDuration,
  } = usePomodoro();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalDuration = isBreak ? breakDuration : workDuration;
  const progress = ((totalDuration - time) / totalDuration) * 100;

  return (
    <Paper p="xl" withBorder shadow="sm" sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Title order={2} mb="md">{isBreak ? t('break_title', 'Break') : t('work_title', 'Pomodoro')}</Title>
      <Text size="xl" weight={700} style={{ fontSize: '4rem', fontFamily: 'monospace' }}>
        {formatTime(time)}
      </Text>
      <Progress
        value={progress}
        size="lg"
        radius="xl"
        sx={{
          width: '100%',
          maxWidth: 300,
          margin: '20px 0',
          '& .mantine-Progress-bar': {
            background: theme.fn.gradient({ from: 'cyan', to: 'blue' }),
          },
        }}
      />
      <Group position="center" mt="md">
        <Button 
          onClick={toggleTimer} 
          leftIcon={isActive ? <IconPlayerPause size={18} /> : <IconPlayerPlay size={18} />}
          variant="gradient"
          gradient={{ from: 'cyan', to: 'blue' }}
        >
          {isActive ? t('pause', 'Pause') : t('start', 'Start')}
        </Button>
        <Button onClick={resetTimer} variant="outline" leftIcon={<IconRefresh size={18} />}>
          {t('reset', 'Reset')}
        </Button>
      </Group>
    </Paper>
  );
};

export default PomodoroTimer;
