import { useEffect, useState } from 'react';
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
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === 'dark';

  // Set chart colors based on theme
  const chartColors = {
    gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    textColor: isDark ? '#C1C2C5' : '#333333',
  };

  useEffect(() => {
    statisticsService.getStatistics().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

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
          text: 'Study Time (minutes)',
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
          text: 'Completion Rate (%)',
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

  return (
    <Container fluid>
      <Title order={2} mb="lg">Learning Statistics & Analytics</Title>
      
      {/* Key Metrics Section */}
      <SimpleGrid cols={5} spacing="lg" breakpoints={[
        { maxWidth: 'md', cols: 3 },
        { maxWidth: 'sm', cols: 2 },
        { maxWidth: 'xs', cols: 1 }
      ]}>
        <StatsCard 
          icon={<IconUsers size={24} />} 
          color="blue" 
          label="Active Users"
          value={userEngagement.activeUsers} 
          total={userEngagement.totalUsers}
          percentage={(userEngagement.activeUsers / userEngagement.totalUsers * 100).toFixed(0)}
        />
        <StatsCard 
          icon={<IconSchool size={24} />} 
          color="teal" 
          label="Completed Courses"
          value={userEngagement.completedCourses} 
          total={userEngagement.totalCourses}
          percentage={(userEngagement.completedCourses / userEngagement.totalCourses * 100).toFixed(0)}
        />
        <StatsCard 
          icon={<IconBook size={24} />} 
          color="cyan" 
          label="Chapters Progress"
          value={userEngagement.completedChapters} 
          total={userEngagement.totalChapters}
          percentage={(userEngagement.completedChapters / userEngagement.totalChapters * 100).toFixed(0)}
        />
        <StatsCard 
          icon={<IconTrophy size={24} />} 
          color="grape" 
          label="Quiz Success Rate"
          value={userEngagement.quizzesPassed} 
          total={userEngagement.quizzesAttempted}
          percentage={(userEngagement.quizzesPassed / userEngagement.quizzesAttempted * 100).toFixed(0)}
        />
        <StatsCard 
          icon={<IconClock size={24} />} 
          color="orange" 
          label="Study Time"
          value={`${userEngagement.totalStudyTimeHours} hrs`} 
          subtitle="Total time studying"
        />
      </SimpleGrid>
      
      {/* Tabs for different time periods */}
      <Tabs defaultValue="daily" mt="xl">
        <Tabs.List>
          <Tabs.Tab value="daily" icon={<IconChartBar size={16} />}>Daily Progress</Tabs.Tab>
          <Tabs.Tab value="weekly" icon={<IconChartLine size={16} />}>Weekly Stats</Tabs.Tab>
          <Tabs.Tab value="monthly" icon={<IconCalendar size={16} />}>Monthly Trends</Tabs.Tab>
          <Tabs.Tab value="subjects" icon={<IconChartPie size={16} />}>Subject Analysis</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="daily" pt="md">
          <Grid>
            <Grid.Col span={12}>
              <Paper p="md" radius="md" withBorder sx={{ 
                height: 400, 
                borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
                backgroundColor: isDark ? theme.colors.dark[7] : theme.white
              }}>
                <Title order={3} mb="md">Today's Learning Activity</Title>
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
                  <Title order={3}>Quiz Performance</Title>
                  <Badge size="lg" color="green">{userEngagement.averageScore}% avg score</Badge>
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
                <Title order={3} mb="lg">Active Hours Today</Title>
                <Box sx={{ height: 200 }}>
                  <PolarArea 
                    data={{
                      labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
                      datasets: [
                        {
                          label: 'Hours Spent',
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
          <Grid>
            <Grid.Col span={12}>
              <Paper p="md" radius="md" withBorder sx={{ 
                height: 400, 
                borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
                backgroundColor: isDark ? theme.colors.dark[7] : theme.white
              }}>
                <Title order={3} mb="md">Weekly Learning Progress</Title>
                <Box sx={{ height: 300 }}>
                  <Bar 
                    data={stats.weeklyStats} 
                    options={weeklyChartOptions}
                  />
                </Box>
              </Paper>
            </Grid.Col>
            <Grid.Col md={6} mt="md">
              <Paper p="md" radius="md" withBorder sx={{ 
                height: 300, 
                borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
                backgroundColor: isDark ? theme.colors.dark[7] : theme.white
              }}>
                <Title order={3} mb="md">Weekly Engagement</Title>
                <Box sx={{ height: 200 }}>
                  <Radar
                    data={{
                      labels: ['Quizzes', 'Reading', 'Videos', 'Practice', 'Discussion', 'Review'],
                      datasets: [
                        {
                          label: 'This Week',
                          data: [65, 78, 55, 70, 40, 50],
                          backgroundColor: 'rgba(53, 162, 235, 0.2)',
                          borderColor: 'rgb(53, 162, 235)',
                          pointBackgroundColor: 'rgb(53, 162, 235)',
                          pointBorderColor: '#fff',
                          pointHoverBackgroundColor: '#fff',
                          pointHoverBorderColor: 'rgb(53, 162, 235)'
                        },
                        {
                          label: 'Last Week',
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
                  />
                </Box>
              </Paper>
            </Grid.Col>
            <Grid.Col md={6} mt="md">
              <Paper p="md" radius="md" withBorder sx={{ 
                height: 300, 
                borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
                backgroundColor: isDark ? theme.colors.dark[7] : theme.white
              }}>
                <Title order={3} mb="md">Course Activity</Title>
                <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                  <Doughnut 
                    data={{
                      labels: ['Active Courses', 'Completed This Week', 'On Hold'],
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
        </Tabs.Panel>

        <Tabs.Panel value="monthly" pt="md">
          <Paper p="md" radius="md" withBorder sx={{ 
            height: 400, 
            borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
            backgroundColor: isDark ? theme.colors.dark[7] : theme.white
          }}>
            <Title order={3} mb="md">Monthly Learning Progress</Title>
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
              <Title order={3} mb="md">Monthly Learning Hours</Title>
              <Box sx={{ height: 200 }}>
                <Line 
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [
                      {
                        label: 'Hours Studied',
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
              <Title order={3} mb="md">Achievement Growth</Title>
              <Box sx={{ height: 200 }}>
                <Line 
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [
                      {
                        label: 'Achievements',
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
                <Title order={3} mb="md">Subject Distribution</Title>
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
                <Title order={3} mb="md">Performance by Subject</Title>
                <Box sx={{ height: 340 }}>
                  <Bar 
                    data={{
                      labels: ['Mathematics', 'Programming', 'Languages', 'Science', 'History', 'Arts'],
                      datasets: [
                        {
                          label: 'Average Score (%)',
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
            {['Mathematics', 'Programming', 'Languages'].map((subject) => (
              <Paper key={subject} p="md" radius="md" withBorder sx={{ 
                borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
                backgroundColor: isDark ? theme.colors.dark[7] : theme.white
              }}>
                <Group position="apart">
                  <Text weight={700} size="lg">{subject}</Text>
                  <Badge color={subject === 'Programming' ? 'green' : 'blue'}>
                    {subject === 'Programming' ? 'Excellent' : 'Good'}
                  </Badge>
                </Group>
                <Divider my="sm" />
                <Group>
                  <IconBooks size={18} />
                  <Text size="sm">
                    {subject === 'Programming' ? '4 courses completed' : 
                     subject === 'Mathematics' ? '2 courses completed' : 
                     '1 course completed'}
                  </Text>
                </Group>
                <Group mt="xs">
                  <IconTrophy size={18} />
                  <Text size="sm">
                    {subject === 'Programming' ? '95% average score' : 
                     subject === 'Mathematics' ? '82% average score' : 
                     '76% average score'}
                  </Text>
                </Group>
                <Group mt="xs">
                  <IconClock size={18} />
                  <Text size="sm">
                    {subject === 'Programming' ? '19 hours spent' : 
                     subject === 'Mathematics' ? '12 hours spent' : 
                     '8 hours spent'}
                  </Text>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}

// Reusable stat card component
function StatsCard({ icon, color, label, value, total, percentage, subtitle }) {
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
        <Text size="xs" color="dimmed">of {total} total</Text>
      )}
      
      {subtitle && (
        <Text size="xs" color="dimmed">{subtitle}</Text>
      )}
      
      <Text size="sm" weight={500} mt="md">{label}</Text>
    </Card>
  );
}

export default StatisticsPage;
