import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Title,
  Group,
  Text,
  Loader,
  SimpleGrid,
  Badge,
  Box,
  useMantineTheme,
  Divider,
  Tabs,
  Container,
  Paper,
  Grid,
  RingProgress
} from '@mantine/core';
import {
  IconClock,
  IconTrophy,
  IconUsers,
  IconBook,
  IconSchool,
  IconChartBar,
  IconCalendar,
  IconBooks,
  IconChartPie,
  IconChartLine
} from '@tabler/icons-react';
import statisticsService from '../api/statisticsService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Doughnut, Radar, PolarArea } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  ChartTitle,
  Tooltip,
  Legend
);

function StatisticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation('statisticsPage');
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === 'dark';

  // Fetch statistics when component mounts
  useEffect(() => {
    console.log("Fetching statistics...");
    
    statisticsService.getStatistics()
      .then(data => {
        setStats(data);
      })
      .catch(error => {
        console.error("Failed to fetch statistics:", error);
        // Optionally set an error state here to show a message to the user
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Set chart colors based on theme

  // Early return if data is loading
  if (loading) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader size="xl" />
      </Container>
    );
  }

  const chartColors = {
    gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    textColor: isDark ? '#C1C2C5' : '#333333',
  };

  if (loading) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader size="xl" />
      </Container>
    );
  }

  if (!stats || !stats.userEngagement) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Text color="orange">{t('error.noUserEngagementData', 'User engagement data is not available.')}</Text>
      </Container>
    );
  }

  // For all charts
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: chartColors.textColor,
          font: {
            family: theme.fontFamily
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? '#2C2E33' : 'white',
        titleColor: isDark ? '#C1C2C5' : '#333333',
        bodyColor: isDark ? '#C1C2C5' : '#333333',
        borderColor: isDark ? '#5C5F66' : '#CED4DA',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: chartColors.gridColor
        },
        ticks: {
          color: chartColors.textColor
        }
      },
      y: {
        grid: {
          color: chartColors.gridColor
        },
        ticks: {
          color: chartColors.textColor
        },
        beginAtZero: true
      }
    }
  };

  // For the weekly chart with dual y-axes
  const weeklyChartOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: {
          color: chartColors.gridColor
        },
        ticks: {
          color: chartColors.textColor
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: {
          color: chartColors.gridColor
        },
        ticks: {
          color: chartColors.textColor
        },
        beginAtZero: true,
        title: {
          display: true,
          text: t('weeklyTab.studyTimeAxis'),
          color: chartColors.textColor
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: chartColors.textColor
        },
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: t('weeklyTab.completionRateAxis'),
          color: chartColors.textColor
        }
      }
    }
  };

  // Custom options for doughnut chart
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: chartColors.textColor,
          font: {
            family: theme.fontFamily
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Loader size="xl" variant="dots" />
      </Box>
    );
  }

  const { userEngagement } = stats;
  const subjectKeysForCards = ['mathematics', 'programming', 'languages'];

  return (
    <Container fluid sx={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Title order={2} mb="lg">{t('pageTitle')}</Title>
      
      {/* Key Metrics Section */}
      <SimpleGrid cols={5} spacing="lg" breakpoints={[
        { maxWidth: 'md', cols: 3 },
        { maxWidth: 'sm', cols: 2 },
        { maxWidth: 'xs', cols: 1 }
      ]}>
        <StatsCard 
          icon={<IconUsers size={24} />} 
          color="blue" 
          label={t('keyMetrics.activeUsers')}
          value={userEngagement.activeUsers} 
          total={userEngagement.totalUsers}
          percentage={(userEngagement.activeUsers / userEngagement.totalUsers * 100).toFixed(0)}
        />
        <StatsCard 
          icon={<IconSchool size={24} />} 
          color="teal" 
          label={t('keyMetrics.completedCourses')}
          value={userEngagement.completedCourses} 
          total={userEngagement.totalCourses}
          percentage={(userEngagement.completedCourses / userEngagement.totalCourses * 100).toFixed(0)}
        />
        <StatsCard 
          icon={<IconBook size={24} />} 
          color="cyan" 
          label={t('keyMetrics.chaptersProgress')}
          value={userEngagement.completedChapters} 
          total={userEngagement.totalChapters}
          percentage={(userEngagement.completedChapters / userEngagement.totalChapters * 100).toFixed(0)}
        />
        <StatsCard 
          icon={<IconTrophy size={24} />} 
          color="grape" 
          label={t('keyMetrics.quizSuccessRate')}
          value={userEngagement.quizzesPassed} 
          total={userEngagement.quizzesAttempted}
          percentage={(userEngagement.quizzesPassed / userEngagement.quizzesAttempted * 100).toFixed(0)}
        />
        <StatsCard 
          icon={<IconClock size={24} />} 
          color="orange" 
          label={t('keyMetrics.studyTime')}
          value={t('keyMetrics.studyTimeValue', { count: userEngagement.totalStudyTimeHours })} 
          subtitle={t('keyMetrics.studyTimeSubtitle')}
        />
      </SimpleGrid>
      
      {/* Tabs for different time periods */}      <Tabs defaultValue="daily" mt="xl" styles={{
        tabsList: {
          borderBottom: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[3]}`,
        },
        tab: {
          fontWeight: 500,
          height: 38,
          backgroundColor: 'transparent',
          '&[data-active]': {
            borderColor: theme.colors.blue[isDark ? 5 : 7],
          },
        },
        panel: {
          width: '100%',
        }
      }}>
        <Tabs.List grow>
          <Tabs.Tab value="daily" icon={<IconChartBar size={16} />}>{t('tabs.daily')}</Tabs.Tab>
          <Tabs.Tab value="weekly" icon={<IconChartLine size={16} />}>{t('tabs.weekly')}</Tabs.Tab>
          <Tabs.Tab value="monthly" icon={<IconCalendar size={16} />}>{t('tabs.monthly')}</Tabs.Tab>
          <Tabs.Tab value="subjects" icon={<IconChartPie size={16} />}>{t('tabs.subjects')}</Tabs.Tab>
        </Tabs.List>        {/* Fixed size wrapper to prevent layout shifts */}
        <Box sx={{ 
          minHeight: 800, 
          width: '100%',
          maxWidth: '100%', 
          margin: '0 auto',
          position: 'relative'
        }}>
          <Tabs.Panel value="daily" pt="md">
            <Grid>
              <Grid.Col span={12}>
                <Paper p="md" radius="md" withBorder sx={{ 
                  height: 400, 
                  borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
                  backgroundColor: isDark ? theme.colors.dark[7] : theme.white
                }}>
                  <Title order={3} mb="md">{t('dailyTab.learningActivityTitle')}</Title>
                  <Box sx={{ height: 300 }}>
                    <Line 
                      data={stats.dailyProgress} 
                      options={chartOptions}
                    />
                  </Box>
                </Paper>
              </Grid.Col>
            </Grid>
            
            <Grid mt="md">
              <Grid.Col md={6}>
                <Paper p="md" radius="md" withBorder sx={{ 
                  height: 300, 
                  borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
                  backgroundColor: isDark ? theme.colors.dark[7] : theme.white
                }}>
                  <Group position="apart" mb="lg">
                    <Title order={3}>{t('dailyTab.quizPerformanceTitle')}</Title>
                    <Badge size="lg" color="green">{userEngagement.averageScore}{t('dailyTab.avgScoreSuffix')}</Badge>
                  </Group>
                  <Box sx={{ height: 200 }}>
                    <RingProgress
                      sections={[
                        { value: userEngagement.quizzesPassed / userEngagement.quizzesAttempted * 100, color: 'green' },
                      ]}
                      label={
                        <Text size="xl" align="center" weight={700}>
                          {(userEngagement.quizzesPassed / userEngagement.quizzesAttempted * 100).toFixed(0)}%
                        </Text>
                      }
                    />
                  </Box>
                </Paper>
              </Grid.Col>
              
              <Grid.Col md={6}>
                <Paper p="md" radius="md" withBorder sx={{ 
                  height: 300, 
                  borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
                  backgroundColor: isDark ? theme.colors.dark[7] : theme.white
                }}>
                  <Title order={3} mb="lg">{t('dailyTab.activeHoursTitle')}</Title>
                  <Box sx={{ height: 200 }}>
                    <PolarArea 
                      data={{
                        labels: [t('dailyTab.polarArea.morning'), t('dailyTab.polarArea.afternoon'), t('dailyTab.polarArea.evening'), t('dailyTab.polarArea.night')],
                        datasets: [
                          {
                            label: t('dailyTab.polarArea.hoursSpentLabel'),
                            data: [3.5, 2.1, 1.8, 0.5],
                            backgroundColor: [
                              'rgba(255, 206, 86, 0.7)',
                              'rgba(75, 192, 192, 0.7)',
                              'rgba(153, 102, 255, 0.7)',
                              'rgba(255, 159, 64, 0.7)'
                            ],
                          },
                        ],
                      }}
                    />
                  </Box>
                </Paper>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="weekly" pt="md">
            <Grid align="center" justify="center">
              <Grid.Col md={6} sm={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Paper p="md" radius="md" withBorder sx={{ 
                  height: 300, // Match other chart heights
                  width: '100%',
                  maxWidth: 600,
                  margin: '0 auto',
                  borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
                  backgroundColor: isDark ? theme.colors.dark[7] : theme.white,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Title order={3} mb="md">{t('weeklyTab.weeklyProgressTitle')}</Title>
                  <Box sx={{ height: 200, width: '100%' }}>
                    <Bar 
                      data={stats.weeklyStats} 
                      options={{
                        ...weeklyChartOptions,
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  </Box>
                </Paper>
              </Grid.Col>
              <Grid.Col md={6} sm={12}>
                <Grid gutter="lg">
                  <Grid.Col span={12} md={12} sm={12}>
                    <Paper p="md" radius="md" withBorder sx={{ 
                      height: 140, 
                      borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
                      backgroundColor: isDark ? theme.colors.dark[7] : theme.white,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 12
                    }}>
                      <Title order={3} mb="md" size="h5">{t('weeklyTab.engagementTitle')}</Title>
                      <Box sx={{ height: 80, width: '100%' }}>
                        <Radar
                          data={{
                            labels: [t('weeklyTab.radarLabels.quizzes'), t('weeklyTab.radarLabels.reading'), t('weeklyTab.radarLabels.videos'), t('weeklyTab.radarLabels.practice'), t('weeklyTab.radarLabels.discussion'), t('weeklyTab.radarLabels.review')],
                            datasets: [
                              {
                                label: t('weeklyTab.radarDatasetThisWeek'),
                                data: [65, 78, 55, 70, 40, 50],
                                backgroundColor: 'rgba(53, 162, 235, 0.2)',
                                borderColor: 'rgb(53, 162, 235)',
                                pointBackgroundColor: 'rgb(53, 162, 235)',
                                pointBorderColor: '#fff',
                                pointHoverBackgroundColor: '#fff',
                                pointHoverBorderColor: 'rgb(53, 162, 235)'
                              },
                              {
                                label: t('weeklyTab.radarDatasetLastWeek'),
                                data: [50, 65, 40, 60, 35, 45],
                                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                borderColor: 'rgb(255, 99, 132)',
                                pointBackgroundColor: 'rgb(255, 99, 132)',
                                pointBorderColor: '#fff',
                                pointHoverBackgroundColor: '#fff',
                                pointHoverBorderColor: 'rgb(255, 99, 132)'
                              }
                            ],
                          }}
                          options={{ ...chartOptions, maintainAspectRatio: false }}
                        />
                      </Box>
                    </Paper>
                  </Grid.Col>
                  <Grid.Col span={12} md={12} sm={12}>
                    <Paper p="md" radius="md" withBorder sx={{ 
                      height: 140, 
                      borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
                      backgroundColor: isDark ? theme.colors.dark[7] : theme.white,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <Title order={3} mb="md" size="h5">{t('weeklyTab.courseActivityTitle')}</Title>
                      <Box sx={{ height: 80, width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <Doughnut 
                          data={{
                            labels: [t('weeklyTab.doughnutLabels.active'), t('weeklyTab.doughnutLabels.completedThisWeek'), t('weeklyTab.doughnutLabels.onHold')],
                            datasets: [
                              {
                                data: [3, 1, 2],
                                backgroundColor: [
                                  'rgba(75, 192, 192, 0.7)',
                                  'rgba(153, 102, 255, 0.7)',
                                  'rgba(255, 159, 64, 0.7)'
                                ],
                                borderColor: [
                                  'rgb(75, 192, 192)',
                                  'rgb(153, 102, 255)',
                                  'rgb(255, 159, 64)'
                                ],
                                borderWidth: 1
                              }
                            ]
                          }}
                          options={doughnutOptions}
                        />
                      </Box>
                    </Paper>
                  </Grid.Col>
                </Grid>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="monthly" pt="md">
            <Paper p="md" radius="md" withBorder sx={{ 
              height: 400, 
              borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
              backgroundColor: isDark ? theme.colors.dark[7] : theme.white
            }}>
              <Title order={3} mb="md">{t('monthlyTab.monthlyProgressTitle')}</Title>
              <Box sx={{ height: 300 }}>
                <Bar 
                  data={stats.monthlyProgress} 
                  options={chartOptions}
                />
              </Box>
            </Paper>
            <SimpleGrid cols={2} mt="md" spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
              <Paper p="md" radius="md" withBorder sx={{ 
                height: 300, 
                borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
                backgroundColor: isDark ? theme.colors.dark[7] : theme.white
              }}>
                <Title order={3} mb="md">{t('monthlyTab.learningHoursTitle')}</Title>
                <Box sx={{ height: 200 }}>
                  <Line 
                    data={{
                      labels: [t('monthlyTab.months.jan'), t('monthlyTab.months.feb'), t('monthlyTab.months.mar'), t('monthlyTab.months.apr'), t('monthlyTab.months.may'), t('monthlyTab.months.jun'), t('monthlyTab.months.jul'), t('monthlyTab.months.aug'), t('monthlyTab.months.sep'), t('monthlyTab.months.oct'), t('monthlyTab.months.nov'), t('monthlyTab.months.dec')],
                      datasets: [
                        {
                          label: t('monthlyTab.hoursStudiedLabel'),
                          data: [12, 15, 10, 14, 18, 20, 17, 12, 15, 19, 22, 16],
                          borderColor: 'rgb(53, 162, 235)',
                          backgroundColor: 'rgba(53, 162, 235, 0.5)',
                          tension: 0.3
                        }
                      ]
                    }}
                    options={chartOptions}
                  />
                </Box>
              </Paper>
              <Paper p="md" radius="md" withBorder sx={{ 
                height: 300, 
                borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
                backgroundColor: isDark ? theme.colors.dark[7] : theme.white
              }}>
                <Title order={3} mb="md">{t('monthlyTab.achievementGrowthTitle')}</Title>
                <Box sx={{ height: 200 }}>
                  <Line 
                    data={{
                      labels: [t('monthlyTab.months.jan'), t('monthlyTab.months.feb'), t('monthlyTab.months.mar'), t('monthlyTab.months.apr'), t('monthlyTab.months.may'), t('monthlyTab.months.jun'), t('monthlyTab.months.jul'), t('monthlyTab.months.aug'), t('monthlyTab.months.sep'), t('monthlyTab.months.oct'), t('monthlyTab.months.nov'), t('monthlyTab.months.dec')],
                      datasets: [
                        {
                          label: t('monthlyTab.achievementsLabel'),
                          data: [5, 7, 4, 8, 10, 13, 11, 9, 12, 15, 18, 14],
                          borderColor: 'rgb(255, 99, 132)',
                          backgroundColor: 'rgba(255, 99, 132, 0.5)',
                          tension: 0.3
                        }
                      ]
                    }}
                    options={chartOptions}
                  />
                </Box>
              </Paper>
            </SimpleGrid>
          </Tabs.Panel>

          <Tabs.Panel value="subjects" pt="md">
            <Grid>
              <Grid.Col md={6}>
                <Paper p="md" radius="md" withBorder sx={{ 
                  height: 400, 
                  borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
                  backgroundColor: isDark ? theme.colors.dark[7] : theme.white
                }}>
                  <Title order={3} mb="md">{t('subjectsTab.distributionTitle')}</Title>
                  <Box sx={{ height: 340, display: 'flex', justifyContent: 'center' }}>
                    <Doughnut 
                      data={stats.subjectDistribution}
                      options={{
                        ...doughnutOptions,
                        plugins: {
                          ...doughnutOptions.plugins,
                          legend: {
                            ...doughnutOptions.plugins.legend,
                            position: 'bottom'
                          }
                        }
                      }}
                    />
                  </Box>
                </Paper>
              </Grid.Col>
              <Grid.Col md={6}>
                <Paper p="md" radius="md" withBorder sx={{ 
                  height: 400,
                  borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
                  backgroundColor: isDark ? theme.colors.dark[7] : theme.white
                }}>
                  <Title order={3} mb="md">{t('subjectsTab.performanceTitle')}</Title>
                  <Box sx={{ height: 340 }}>
                    <Bar 
                      data={{
                        labels: [t('subjectsTab.subjectNames.mathematics'), t('subjectsTab.subjectNames.programming'), t('subjectsTab.subjectNames.languages'), t('subjectsTab.subjectNames.science'), t('subjectsTab.subjectNames.history'), t('subjectsTab.subjectNames.arts')],
                        datasets: [
                          {
                            label: t('subjectsTab.averageScoreLabel'),
                            data: [82, 95, 76, 88, 70, 85],
                            backgroundColor: [
                              'rgba(255, 99, 132, 0.7)',
                              'rgba(54, 162, 235, 0.7)',
                              'rgba(255, 206, 86, 0.7)',
                              'rgba(75, 192, 192, 0.7)',
                              'rgba(153, 102, 255, 0.7)',
                              'rgba(255, 159, 64, 0.7)'
                            ],
                            borderWidth: 1
                          }
                        ]
                      }}
                      options={chartOptions}
                    />
                  </Box>
                </Paper>
              </Grid.Col>
            </Grid>
            <SimpleGrid cols={3} mt="md" spacing="lg" breakpoints={[
              { maxWidth: 'md', cols: 2 },
              { maxWidth: 'xs', cols: 1 }
            ]}>
              {subjectKeysForCards.map((subjectKey) => {
                  const subject = t(`subjectsTab.subjectNames.${subjectKey}`);
                  let coursesCompleted, averageScore, hoursSpent, badgeText;
                  if (subjectKey === 'programming') {
                    coursesCompleted = t('subjectsTab.subjectCard.coursesCompleted_other', { count: 4 });
                    averageScore = t('subjectsTab.subjectCard.averageScore', { score: 95 });
                    hoursSpent = t('subjectsTab.subjectCard.hoursSpent_other', { count: 19 });
                    badgeText = t('subjectsTab.subjectCard.badgeExcellent');
                  } else if (subjectKey === 'mathematics') {
                    coursesCompleted = t('subjectsTab.subjectCard.coursesCompleted_other', { count: 2 });
                    averageScore = t('subjectsTab.subjectCard.averageScore', { score: 82 });
                    hoursSpent = t('subjectsTab.subjectCard.hoursSpent_other', { count: 12 });
                    badgeText = t('subjectsTab.subjectCard.badgeGood');
                  } else { // languages
                    coursesCompleted = t('subjectsTab.subjectCard.coursesCompleted_one', { count: 1 });
                    averageScore = t('subjectsTab.subjectCard.averageScore', { score: 76 });
                    hoursSpent = t('subjectsTab.subjectCard.hoursSpent_other', { count: 8 });
                    badgeText = t('subjectsTab.subjectCard.badgeGood');
                  }
                  const subjectCard = (
                <Paper key={subject} p="md" radius="md" withBorder sx={{ 
                  borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
                  backgroundColor: isDark ? theme.colors.dark[7] : theme.white
                }}>
                  <Group position="apart">
                    <Text weight={700} size="lg">{subject}</Text>
                    <Badge color={subjectKey === 'programming' ? 'green' : 'blue'}>
                      {badgeText}
                    </Badge>
                  </Group>
                  <Divider my="sm" />
                  <Group>
                    <IconBooks size={18} />
                    <Text size="sm">
                      {coursesCompleted}
                    </Text>
                  </Group>
                  <Group mt="xs">
                    <IconTrophy size={18} />
                    <Text size="sm">
                      {averageScore}
                    </Text>
                  </Group>
                  <Group mt="xs">
                    <IconClock size={18} />
                    <Text size="sm">
                      {hoursSpent}
                    </Text>
                  </Group>
                </Paper>
              );
              return subjectCard;
            })}
             </SimpleGrid>
          </Tabs.Panel>
        </Box>
      </Tabs>
    </Container>
  );
}

// Reusable stat card component
function StatsCard({ icon, color, label, value, total, percentage, subtitle }) {
  const { t } = useTranslation('statisticsPage'); // Add hook here for StatsCard
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === 'dark';
  
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder sx={{
      borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
      backgroundColor: isDark ? theme.colors.dark[7] : theme.white
    }}>
      <Group position="apart" mb="xs">
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: 42, 
          height: 42,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors[color][isDark ? 9 : 0],
          color: theme.colors[color][isDark ? 2 : 6]
        }}>
          {icon}
        </Box>
        {percentage && (
          <Badge color={percentage > 75 ? 'green' : percentage > 50 ? 'yellow' : 'red'}>
            {percentage}%
          </Badge>
        )}
      </Group>
      
      <Text size="xl" weight={700}>{value}</Text>
      
      {total && (
        <Text size="xs" color="dimmed">{t('statsCard.ofTotal', { total })}</Text>
      )}
      
      {subtitle && (
        <Text size="xs" color="dimmed">{subtitle}</Text>
      )}
      
      <Text size="sm" weight={500} mt="md">{label}</Text>
    </Card>
  );
}

export default StatisticsPage;
