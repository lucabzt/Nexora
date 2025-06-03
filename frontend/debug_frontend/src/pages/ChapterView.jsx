import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Divider,
  Badge,
  Collapse,
  ActionIcon,
  useMantineTheme,
  Burger
} from '@mantine/core';
import { IconAlertCircle, IconBookmark, IconQuestionMark, IconChartLine, IconChevronLeft, IconMenu2 } from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-toastify';
import { courseService } from '../api/courseService';
import { Resizable } from 're-resizable';

function ChapterView() {
  const theme = useMantineTheme();
  const { courseId, chapterId } = useParams(); // This should be the actual DB ID now
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [plotterOpen, setPlotterOpen] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(true);
  const [toolbarWidth, setToolbarWidth] = useState(plotterOpen ? 500 : 40);

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
        setError('Failed to load chapter. Please try again later.');
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
      toast.success(`Great job! You scored ${scorePercentage}%`);
    } else {
      toast.info(`You scored ${scorePercentage}%. Try reviewing the content again.`);
    }
  };

  const markChapterComplete = async () => {
    try {
      setMarkingComplete(true);
      // Using the ID from URL params
      await courseService.markChapterComplete(courseId, chapterId);
      toast.success('Chapter marked as complete!');
      navigate(`/courses/${courseId}`);
    } catch (error) {
      toast.error('Failed to mark chapter as complete');
      console.error('Error marking chapter complete:', error);
    } finally {
      setMarkingComplete(false);
    }
  };
  // Update toolbar width when plotter opens/closes
  useEffect(() => {
    // Set a sensible toolbar width when open (500px) but maintain enough width for the toggle button (40px) when closed
    setToolbarWidth(plotterOpen ? 500 : 40);
  }, [plotterOpen]);
  return (
    <div style={{ 
      display: 'flex',
      position: 'relative',
      width: '100%',
      height: '100vh'
    }}>
      {/* Fixed navbar sidebar - controlled by navbarOpen */}
      <div style={{ 
        position: 'fixed', 
        top: 70, // Header height
        left: 0, 
        bottom: 0,
        width: navbarOpen ? 250 : 0,
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        borderRight: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
        overflow: 'hidden',
        transition: 'width 0.3s ease',
        zIndex: 150
      }}>
        {/* Navbar content can be added here */}
        <Box p="md" style={{ opacity: navbarOpen ? 1 : 0, transition: 'opacity 0.3s ease' }}>
          <Title order={4} mb="md">Navigation</Title>
          {/* Add navigation items here */}
        </Box>
      </div>
      
      {/* Navbar toggle button - fixed position */}
      <div style={{ 
        position: 'fixed', 
        top: 80, 
        left: navbarOpen ? 260 : 10, 
        zIndex: 200,
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
        borderRadius: theme.radius.md,
        padding: 4,
        transition: 'left 0.3s ease'
      }}>
        <Burger
          opened={navbarOpen}
          onClick={() => setNavbarOpen(o => !o)}
          size="sm"
          color={theme.colors.blue[6]}
        />
      </div>

      {/* Main content - dynamically positioned between navbar and toolbar */}
      <Container size="lg" py="xl" style={{ 
        flexGrow: 1,
        marginLeft: navbarOpen ? 250 : 0,
        marginRight: plotterOpen ? toolbarWidth : 0,
        maxWidth: '100%',
        transition: 'margin 0.3s ease',
        width: `calc(100% - ${navbarOpen ? 250 : 0}px - ${plotterOpen ? toolbarWidth : 0}px)`,
      }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
            <Loader size="lg" />
          </Box>
        )}

        {error && !loading && (
          <Alert 
            icon={<IconAlertCircle size={16} />}
            title="Error!" 
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
                <Text color="dimmed">Estimated time: {chapter.time_minutes} minutes</Text>
              </div>
              <Button 
                color="green" 
                onClick={markChapterComplete} 
                loading={markingComplete}
                disabled={markingComplete}
              >
                Mark as Complete
              </Button>
            </Group>

            <Tabs value={activeTab} onTabChange={setActiveTab} mb="xl">
              <Tabs.List>
                <Tabs.Tab value="content" icon={<IconBookmark size={14} />}>Content</Tabs.Tab>
                <Tabs.Tab value="quiz" icon={<IconQuestionMark size={14} />}>
                  Quiz ({chapter.mc_questions?.length || 0} Questions)
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="content" pt="xs">
                <Paper shadow="xs" p="md" withBorder>
                  <div className="markdown-content">
                    <ReactMarkdown>{chapter.content}</ReactMarkdown>
                  </div>
                </Paper>
              </Tabs.Panel>

              <Tabs.Panel value="quiz" pt="xs">
                <Paper shadow="xs" p="md" withBorder>
                  {quizSubmitted && (
                    <Alert 
                      color={quizScore >= 70 ? "green" : "yellow"}
                      title={quizScore >= 70 ? "Great job!" : "Keep practicing!"} 
                      mb="lg"
                    >
                      <Group>
                        <Text>You scored {quizScore}% on the quiz</Text>
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
                          title={quizAnswers[qIndex] === question.correct_answer ? "Correct" : "Incorrect"}
                        >
                          <Text mb="xs">
                            {quizAnswers[qIndex] !== question.correct_answer && (
                              <>The correct answer is: <strong>
                                {question[`answer_${question.correct_answer}`]}
                              </strong></>
                            )}
                          </Text>
                          <Text>Explanation: {question.explanation}</Text>
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
                      Submit Quiz
                    </Button>
                  )}
                </Paper>
              </Tabs.Panel>
            </Tabs>

            <Group position="apart">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/courses/${courseId}`)}
              >
                Back to Course
              </Button>
              {chapter.is_completed && (
                <Badge color="green" size="lg">Completed</Badge>
              )}
            </Group>
          </>
        )}      </Container>
      
      {/* Collapsible Plotter Panel with Resizable Splitter */}      <Resizable
        style={{
          position: 'fixed',
          top: 70, /* Match the header height (70px for md size) */
          right: 0,
          borderLeft: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : '#e9ecef'}`,
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : '#f8f9fa',
          overflow: 'hidden',
          height: 'calc(100vh - 70px)', /* Adjust height to account for header */
          zIndex: 100,
          display: 'flex',
          boxShadow: plotterOpen ? (theme.colorScheme === 'dark' 
            ? '-2px 0 10px rgba(0, 0, 0, 0.3)' 
            : '-2px 0 10px rgba(0, 0, 0, 0.1)')
            : 'none',
          transition: plotterOpen ? 'none' : 'width 0.3s ease', // Only animate when closing
        }}
        size={{ 
          width: plotterOpen ? toolbarWidth : 40, 
          height: 'calc(100vh - 70px)' 
        }}
        minWidth={40}
        maxWidth={800}
        enable={{
          top: false,
          right: false,
          bottom: false,
          left: plotterOpen,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
        onResizeStop={(e, direction, ref, d) => {
          setToolbarWidth(toolbarWidth + d.width);
        }}
        handleStyles={{
          left: {
            width: '6px',
            left: '0',
            height: '100%',
            cursor: 'col-resize',
            backgroundColor: theme.colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            '&:hover': {
              backgroundColor: theme.colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
            },
          }
        }}
        handleClasses={{
          left: 'splitter-handle-left'
        }}
      >        {/* Toggle button for the plotter panel */}
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          left: '0', 
          zIndex: 10 
        }}>
          <ActionIcon
            size="lg"
            variant="filled"
            color="blue"
            onClick={() => setPlotterOpen(!plotterOpen)}
            style={{ 
              borderRadius: '0 4px 4px 0',
              width: '40px',
              height: '40px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {plotterOpen 
              ? <IconChevronLeft size={20} /> 
              : <IconChartLine size={20} />}
          </ActionIcon>
        </div>

        {/* Plotter panel content */}
        <div style={{ 
          opacity: plotterOpen ? 1 : 0,
          transition: 'opacity 0.3s ease',
          padding: '20px',
          paddingLeft: '40px',
          height: '100%',
          width: '100%',
          overflow: 'auto'
        }}>
          <Title order={3} mb="md">GeoGebra Plotter</Title>
          <Text size="sm" color="dimmed" mb="md">
            Use this interactive GeoGebra plotter to visualize mathematical concepts.
          </Text>
          <iframe 
            src="https://www.geogebra.org/graphing?lang=en" 
            title="GeoGebra Graphing Calculator"
            style={{ 
              width: '100%', 
              height: 'calc(100vh - 220px)', /* Adjusted for header + panel title/description */
              border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : '#e9ecef'}`,
              borderRadius: '4px'
            }}
            allowFullScreen
          ></iframe>
        </div>
      </Resizable>
    </div>
  );
}

export default ChapterView;