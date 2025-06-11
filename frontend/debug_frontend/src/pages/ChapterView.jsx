import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Container, 
  Title, 
  Text, 
  Card, 
  Group,
  Button,
  Tabs,
  List,
  Radio,
  Alert,
  Box,
  Loader,
  Paper,
  Badge,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconAlertCircle, IconBookmark, IconQuestionMark } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { courseService } from '../api/courseService';
import ToolbarContainer from '../components/tools/ToolbarContainer';
import { useToolbar } from '../contexts/ToolbarContext';
import AiCodeWrapper from "../components/AiCodeWrapper.jsx";

function ChapterView() {
  const { t } = useTranslation('chapterView');
  const { courseId, chapterId } = useParams(); // This should be the actual DB ID now
  const navigate = useNavigate();
  const { toolbarOpen, toolbarWidth } = useToolbar(); // Get toolbar state from context
  const isMobile = useMediaQuery('(max-width: 768px)'); // Add mobile detection
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [markingComplete, setMarkingComplete] = useState(false);
  // Effect to handle resize when toolbar changes
  useEffect(() => {
    // This will trigger a re-render when toolbar state changes
    console.log("Toolbar state changed:", { open: toolbarOpen, width: toolbarWidth });
    // We could add additional logic here if needed
  }, [toolbarOpen, toolbarWidth]);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true);
        // Using the ID from URL params
        const chapterData = await courseService.getChapter(courseId, chapterId);
        setChapter(chapterData);
        
        // Initialize quiz answers
        if (chapterData.mc_questions) {
          const initialAnswers = {};
          chapterData.mc_questions.forEach((q, index) => {
            initialAnswers[index] = '';
          });
          setQuizAnswers(initialAnswers);
        }
        
        setError(null);
      } catch (error) {
        setError(t('errors.loadFailed'));
        console.error('Error fetching chapter:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [courseId, chapterId]);

  const handleAnswerChange = (questionIndex, value) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  const handleSubmitQuiz = () => {
    if (!chapter?.mc_questions) return;
    
    let correct = 0;
    chapter.mc_questions.forEach((question, index) => {
      if (quizAnswers[index] === question.correct_answer) {
        correct++;
      }
    });
    
    const scorePercentage = Math.round((correct / chapter.mc_questions.length) * 100);
    setQuizScore(scorePercentage);
    setQuizSubmitted(true);
    
    if (scorePercentage >= 70) {
      toast.success(t('toast.quizGreatJob', { scorePercentage }));
    } else {
      toast.info(t('toast.quizReviewContent', { scorePercentage }));
    }
  };

  const markChapterComplete = async () => {
    try {
      setMarkingComplete(true);
      // Using the ID from URL params
      await courseService.markChapterComplete(courseId, chapterId);
      toast.success(t('toast.markedCompleteSuccess'));
      navigate(`/dashboard/courses/${courseId}`);
    } catch (error) {
      toast.error(t('toast.markedCompleteError'));
      console.error('Error marking chapter complete:', error);
    } finally {
      setMarkingComplete(false);
    }  };  // Calculate container width and positioning based on toolbar state and mobile
  const sidebarWidth = isMobile 
    ? (toolbarOpen ? window.innerWidth : 0) // Full screen on mobile when open, hidden when closed
    : (toolbarOpen ? toolbarWidth : 40); // Desktop shows normal width when open, 40px when closed
    return (
    <div style={{ 
      display: 'flex',
      position: 'relative',
      width: '100%',
      height: 'calc(100vh - 70px)', // Adjust for header height
      marginTop: 0,
      overflow: 'hidden' // Prevent page-level scrolling issues
    }}>      {/* Main content with dynamic positioning - centered in available space */}
      <Container size="lg" py="xl" style={{ 
        flexGrow: 1,
        maxWidth: `calc(100% - ${sidebarWidth}px)`, // Limit max width to available space
        width: `calc(100% - ${sidebarWidth}px)`, // Use calculated width
        transition: 'all 0.3s ease',
        marginRight: `${sidebarWidth}px`, // Keep space for toolbar
        paddingLeft: '20px', // Add padding on left
        paddingRight: '20px', // Add padding on right
        overflow: 'auto', // Allow content to scroll if needed
        position: 'relative', // Create stacking context
        height: '100%' // Fill the available height
      }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
            <Loader size="lg" title={t('loading')} />
          </Box>
        )}

        {error && !loading && (
          <Alert 
            icon={<IconAlertCircle size={16} />}
            title={t('errors.genericTitle')} 
            color="red" 
            mb="lg"
          >
            {error}
          </Alert>
        )}

        {!loading && !error && chapter && (
          <>
            <Group position="apart" mb="md">
              <div>
                <Title order={1}>{chapter.caption}</Title>
                <Text color="dimmed">{t('estimatedTime', { minutes: chapter.time_minutes })}</Text>
              </div>
              <Button 
                color="green" 
                onClick={markChapterComplete} 
                loading={markingComplete}
                disabled={markingComplete}
              >
                {t('buttons.markComplete')}
              </Button>
            </Group>

            <Tabs value={activeTab} onTabChange={setActiveTab} mb="xl">
              <Tabs.List>
                <Tabs.Tab value="content" icon={<IconBookmark size={14} />}>{t('tabs.content')}</Tabs.Tab>
                <Tabs.Tab value="quiz" icon={<IconQuestionMark size={14} />}>
                  {t('tabs.quizWithCount', { count: chapter.mc_questions?.length || 0 })}
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="content" pt="xs">
                <Paper shadow="xs" p="md" withBorder>
                  <div className="markdown-content">
                    <AiCodeWrapper>{chapter.content}</AiCodeWrapper>
                  </div>
                </Paper>
              </Tabs.Panel>
              <Tabs.Panel value="quiz" pt="xs">
                <Paper shadow="xs" p="md" withBorder>
                  {quizSubmitted && (
                    <Alert 
                      color={quizScore >= 70 ? "green" : "yellow"}
                      title={quizScore >= 70 ? t('quiz.alert.greatJobTitle') : t('quiz.alert.keepPracticingTitle')} 
                      mb="lg"
                    >
                      <Group>
                        <Text>{t('quiz.alert.scoreText', { quizScore })}</Text>
                        <Badge color={quizScore >= 70 ? "green" : "yellow"}>
                          {quizScore}%
                        </Badge>
                      </Group>
                    </Alert>
                  )}
                  
                  {chapter.mc_questions?.map((question, qIndex) => (
                    <Card key={qIndex} mb="md" withBorder>
                      <Text weight={500} mb="md">{qIndex + 1}. {question.question}</Text>
                      
                      <Radio.Group
                        value={quizAnswers[qIndex]}
                        onChange={(value) => handleAnswerChange(qIndex, value)}
                        name={`question-${qIndex}`}
                        mb="md"
                        disabled={quizSubmitted}
                      >
                        <Radio value="a" label={question.answer_a} mb="xs" />
                        <Radio value="b" label={question.answer_b} mb="xs" />
                        <Radio value="c" label={question.answer_c} mb="xs" />
                        <Radio value="d" label={question.answer_d} mb="xs" />
                      </Radio.Group>
                      
                      {quizSubmitted && (
                        <Alert 
                          color={quizAnswers[qIndex] === question.correct_answer ? "green" : "red"}
                          title={quizAnswers[qIndex] === question.correct_answer ? t('quiz.alert.correctTitle') : t('quiz.alert.incorrectTitle')}
                        >
                          <Text mb="xs">
                            {quizAnswers[qIndex] !== question.correct_answer && (
                              <>{t('quiz.alert.theCorrectAnswerIs')} <strong>
                                {question[`answer_${question.correct_answer}`]}
                              </strong></>
                            )}
                          </Text>
                          <Text>{t('quiz.alert.explanationLabel')} {question.explanation}</Text>
                        </Alert>
                      )}
                    </Card>
                  ))}
                  
                  {!quizSubmitted && (
                    <Button 
                      onClick={handleSubmitQuiz}
                      fullWidth 
                      mt="md"
                      disabled={
                        !chapter.mc_questions || 
                        Object.values(quizAnswers).some(a => a === '')
                      }
                    >
                      {t('buttons.submitQuiz')}
                    </Button>
                  )}
                </Paper>
              </Tabs.Panel>
            </Tabs>

            <Group position="apart">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/dashboard/courses/${courseId}`)}
              >
                {t('buttons.backToCourse')}
              </Button>
              {chapter.is_completed && (
                <Badge color="green" size="lg">{t('badge.completed')}</Badge>
              )}
            </Group>
          </>
        )}      </Container>
      
      {/* Toolbar Container with all interactive tools */}
      <ToolbarContainer courseId={courseId} chapterId={chapterId} />
    </div>
  );
}

export default ChapterView;