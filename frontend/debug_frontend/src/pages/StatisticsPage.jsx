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
  Tabs,
  Container,
  Paper,
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
  IconChartPie,
  IconChartLine
} from '@tabler/icons-react';
import statisticsService from '../api/statisticsService';
import Plot from 'react-plotly.js';

const StatsCard = ({ icon, color, label, value, total, percentage, subtitle }) => {
  return (
    <Card withBorder radius="md" p="md">
      <Group position="apart">
        <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
          {label}
        </Text>
        <Badge color={color} variant="light">
          {subtitle ? subtitle : `${percentage}%`}
        </Badge>
      </Group>
      <Group align="flex-end" spacing="xs" mt="sm">
        <Text size="xl" weight={700}>
          {value}
        </Text>
        {total && (
          <Text color={color} weight={500}>
            / {total}
          </Text>
        )}
      </Group>
      {percentage && !subtitle && (
        <RingProgress
          size={80}
          thickness={8}
          mt="sm"
          sections={[{ value: parseFloat(percentage), color }]}
          label={<Text color={color} weight={700} align="center" size="sm">{percentage}%</Text>}
        />
      )}
    </Card>
  );
};

function StatisticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation('statisticsPage');
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === 'dark';

  useEffect(() => {
    statisticsService.getStatistics().then((data) => {
      setStats(data);
      setLoading(false);
    }).catch(error => {
      console.error("Failed to load statistics:", error);
      setLoading(false);
    });
  }, []);

  const getPlotlyLayout = (title) => ({
    title: {
      text: title,
      font: {
        color: isDark ? '#C1C2C5' : '#333333',
        family: theme.fontFamily,
      },
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: {
      color: isDark ? '#C1C2C5' : '#333333',
      family: theme.fontFamily,
    },
    xaxis: {
      gridcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      zerolinecolor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
    },
    yaxis: {
      gridcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      zerolinecolor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
    },
    legend: {
      orientation: 'h',
      x: 0.5,
      xanchor: 'center',
    },
    margin: { t: 40, b: 40, l: 40, r: 40 },
    autosize: true,
  });

  if (loading) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader size="xl" />
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Text color="red">{t('error.noStatsData', 'Statistics data could not be loaded.')}</Text>
      </Container>
    );
  }

  const { userEngagement } = stats;

  return (
    <Container fluid sx={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Title order={2} mb="lg">{t('pageTitle', 'Statistics Overview')}</Title>

      <SimpleGrid cols={5} spacing="lg" breakpoints={[
        { maxWidth: 'md', cols: 3 },
        { maxWidth: 'sm', cols: 2 },
        { maxWidth: 'xs', cols: 1 }
      ]}>
        <StatsCard 
          icon={<IconUsers size={24} />} 
          color="blue" 
          label={t('keyMetrics.activeUsers', 'Active Users')}
          value={userEngagement.activeUsers} 
          total={userEngagement.totalUsers}
          percentage={(userEngagement.activeUsers / userEngagement.totalUsers * 100).toFixed(0)}
        />
        <StatsCard 
          icon={<IconSchool size={24} />} 
          color="teal" 
          label={t('keyMetrics.completedCourses', 'Completed Courses')}
          value={userEngagement.completedCourses} 
          total={userEngagement.totalCourses}
          percentage={(userEngagement.completedCourses / userEngagement.totalCourses * 100).toFixed(0)}
        />
        <StatsCard 
          icon={<IconBook size={24} />} 
          color="cyan" 
          label={t('keyMetrics.chaptersProgress', 'Chapters Progress')}
          value={userEngagement.completedChapters} 
          total={userEngagement.totalChapters}
          percentage={(userEngagement.completedChapters / userEngagement.totalChapters * 100).toFixed(0)}
        />
        <StatsCard 
          icon={<IconTrophy size={24} />} 
          color="grape" 
          label={t('keyMetrics.quizSuccessRate', 'Quiz Success Rate')}
          value={userEngagement.quizzesPassed} 
          total={userEngagement.quizzesAttempted}
          percentage={(userEngagement.quizzesPassed / userEngagement.quizzesAttempted * 100).toFixed(0)}
        />
        <StatsCard 
          icon={<IconClock size={24} />} 
          color="orange" 
          label={t('keyMetrics.studyTime', 'Total Study Time')}
          value={t('keyMetrics.studyTimeValue', { count: userEngagement.totalStudyTimeHours })}
          subtitle={t('keyMetrics.studyTimeSubtitle', 'Hours')}
        />
      </SimpleGrid>

      <Tabs defaultValue="daily" mt="xl" styles={{
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
      }}>
        <Tabs.List grow>
          <Tabs.Tab value="daily" icon={<IconChartBar size={16} />}>{t('tabs.daily', 'Daily')}</Tabs.Tab>
          <Tabs.Tab value="weekly" icon={<IconChartLine size={16} />}>{t('tabs.weekly', 'Weekly')}</Tabs.Tab>
          <Tabs.Tab value="monthly" icon={<IconCalendar size={16} />}>{t('tabs.monthly', 'Monthly')}</Tabs.Tab>
          <Tabs.Tab value="subjects" icon={<IconChartPie size={16} />}>{t('tabs.subjects', 'Subjects')}</Tabs.Tab>
        </Tabs.List>

        <Box sx={{ minHeight: 450, width: '100%', position: 'relative' }}>
          <Tabs.Panel value="daily" pt="md">
            <Paper p="md" radius="md" withBorder sx={{ backgroundColor: isDark ? theme.colors.dark[7] : theme.white }}>
              <Plot
                data={stats.dailyProgress.datasets.map(d => ({ ...d, type: 'scatter', mode: 'lines+markers', x: stats.dailyProgress.labels, y: d.data }))}
                layout={getPlotlyLayout(t('dailyTab.learningActivityTitle', 'Daily Learning Activity'))}
                style={{ width: '100%', height: '400px' }}
                useResizeHandler
              />
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="weekly" pt="md">
            <Paper p="md" radius="md" withBorder sx={{ backgroundColor: isDark ? theme.colors.dark[7] : theme.white }}>
              <Plot
                data={[
                  {
                    x: stats.weeklyStats.labels,
                    y: stats.weeklyStats.datasets.find(d => d.type === 'bar').data,
                    type: 'bar',
                    name: t('weeklyTab.studyTimeAxis', 'Study Time (hours)'),
                  },
                  {
                    x: stats.weeklyStats.labels,
                    y: stats.weeklyStats.datasets.find(d => d.type === 'line').data,
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: t('weeklyTab.completionRateAxis', 'Completion %'),
                    yaxis: 'y2',
                  },
                ]}
                layout={{
                  ...getPlotlyLayout(t('weeklyTab.title', 'Weekly Statistics')),
                  yaxis: { title: t('weeklyTab.studyTimeAxis', 'Study Time (hours)') },
                  yaxis2: {
                    title: t('weeklyTab.completionRateAxis', 'Completion %'),
                    overlaying: 'y',
                    side: 'right',
                    gridcolor: 'transparent',
                  },
                }}
                style={{ width: '100%', height: '400px' }}
                useResizeHandler
              />
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="monthly" pt="md">
            <Paper p="md" radius="md" withBorder sx={{ backgroundColor: isDark ? theme.colors.dark[7] : theme.white }}>
              <Plot
                data={stats.monthlyProgress.datasets.map(d => ({ ...d, type: 'bar', x: stats.monthlyProgress.labels, y: d.data }))}
                layout={{
                  ...getPlotlyLayout(t('monthlyTab.title', 'Monthly Progress')),
                  barmode: 'group',
                }}
                style={{ width: '100%', height: '400px' }}
                useResizeHandler
              />
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="subjects" pt="md">
            <Paper p="md" radius="md" withBorder sx={{ backgroundColor: isDark ? theme.colors.dark[7] : theme.white }}>
              <Plot
                data={[{
                  values: stats.subjectDistribution.datasets[0].data,
                  labels: stats.subjectDistribution.labels,
                  type: 'pie',
                  hole: .7,
                  textinfo: 'label+percent',
                  insidetextorientation: 'radial',
                }]}
                layout={getPlotlyLayout(t('subjectsTab.title', 'Subject Distribution'))}
                style={{ width: '100%', height: '400px' }}
                useResizeHandler
              />
            </Paper>
          </Tabs.Panel>
        </Box>
      </Tabs>
    </Container>
  );
}

export default StatisticsPage;
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
