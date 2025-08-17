import { apiWithCookies } from './baseApi';

// Create mock data for different periods
const generateMockData = () => {
  // Demo data
  // Daily progress data (hourly)
  const generateHourlyData = () => {
    const hours = [];
    const quizCompleted = [];
    const chaptersStudied = [];
    
    for (let i = 0; i < 24; i++) {
      hours.push(`${i}:00`);
      // Generate more activity during day hours (9-17)
      if (i >= 9 && i <= 17) {
        quizCompleted.push(Math.floor(Math.random() * 8) + 2); // 2-10 quizzes per hour
        chaptersStudied.push(Math.floor(Math.random() * 3) + 1); // 1-4 chapters per hour
      } else {
        quizCompleted.push(Math.floor(Math.random() * 3)); // 0-3 quizzes per hour
        chaptersStudied.push(Math.floor(Math.random() * 2)); // 0-2 chapters per hour
      }
    }
    
    return {
      labels: hours,
      datasets: [
        {
          label: 'Quizzes Completed',
          data: quizCompleted,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.3
        },
        {
          label: 'Chapters Studied',
          data: chaptersStudied,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.3
        }
      ]
    };
  };
  
  // Weekly data
  const generateWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const studyTime = days.map(() => Math.floor(Math.random() * 180) + 20); // 20-200 minutes
    const completionRate = days.map(() => Math.floor(Math.random() * 40) + 60); // 60-100%
    
    return {
      labels: days,
      datasets: [
        {
          type: 'line',
          label: 'Study Time (minutes)',
          borderColor: 'rgb(53, 162, 235)',
          borderWidth: 2,
          fill: false,
          data: studyTime,
          yAxisID: 'y',
        },
        {
          type: 'bar',
          label: 'Completion Rate (%)',
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          data: completionRate,
          borderColor: 'white',
          borderWidth: 2,
          yAxisID: 'y1',
        }
      ]
    };
  };
  
  // Monthly progress data
  const generateMonthlyData = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const coursesCompleted = monthNames.map(() => Math.floor(Math.random() * 3)); // 0-3 courses per month
    const newTopics = monthNames.map(() => Math.floor(Math.random() * 6) + 1); // 1-7 topics per month
    
    return {
      labels: monthNames,
      datasets: [
        {
          label: 'Courses Completed',
          data: coursesCompleted,
          backgroundColor: 'rgba(255, 159, 64, 0.7)',
          borderColor: 'rgb(255, 159, 64)',
          borderWidth: 1
        },
        {
          label: 'New Topics Explored',
          data: newTopics,
          backgroundColor: 'rgba(153, 102, 255, 0.7)',
          borderColor: 'rgb(153, 102, 255)',
          borderWidth: 1
        }
      ]
    };
  };
  
  // Subject distribution data
  const generateSubjectDistribution = () => {
    return {
      labels: ['Mathematics', 'Programming', 'Languages', 'Science', 'History', 'Arts'],
      datasets: [
        {
          label: 'Time Spent (hours)',
          data: [12, 19, 8, 5, 7, 3],
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  // User engagement metrics
  const userEngagement = {
    totalUsers: 42,
    activeUsers: 28,
    totalCourses: 7,
    completedCourses: 4,
    totalChapters: 23,
    completedChapters: 18,
    quizzesAttempted: 124,
    quizzesPassed: 112,
    averageScore: 87,
    totalStudyTimeHours: 156,
    messagesExchanged: 342
  };
  
  return {
    dailyProgress: generateHourlyData(),
    weeklyStats: generateWeeklyData(),
    monthlyProgress: generateMonthlyData(),
    subjectDistribution: generateSubjectDistribution(),
    userEngagement
  };
};

const postUsage = async (url, user_id, courseId = null, chapterId = null, isVisible = true) => {
  try {
    await apiWithCookies.post('/statistics/usage', {
      user_id: user_id,
      url: url,
      course_id: courseId,
      chapter_id: chapterId,
      visible: isVisible
    });
  } catch (error) {
    console.error('Error posting usage data:', error);
  }
};

const getStatistics = async () => {
  // For demo, return mock data by simulating an async API call
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(generateMockData());
    }, 500); // 500ms delay to simulate network latency
  });
};

const getTotalLearnTime = async (userId) => {
  try {
    const response = await apiWithCookies.get(`/statistics/${userId}/total_learn_time`);
    console.log("Total Learn Time: ", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching total learn time:', error);
    throw error;
  }
};

const statisticsService = {
  getStatistics,
  postUsage,
  getTotalLearnTime,
};

export default statisticsService;
