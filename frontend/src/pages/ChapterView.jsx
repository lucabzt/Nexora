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
  SimpleGrid,
  Image,
  Textarea
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconAlertCircle, IconBookmark, IconQuestionMark, IconPhoto, IconFileText } from '@tabler/icons-react';
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
  const [questions, setQuestions] = useState([]); // Separate state for questions
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('content');

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({}); // For MC questions
  const [openTextAnswers, setOpenTextAnswers] = useState({}); // For OT questions
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [gradingQuestion, setGradingQuestion] = useState(null); // Track which OT question is being graded
  const [questionFeedback, setQuestionFeedback] = useState({}); // Store feedback for OT questions
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    console.log("Toolbar state changed:", { open: toolbarOpen, width: toolbarWidth });
    // We could add additional logic here if needed
  }, [toolbarOpen, toolbarWidth]);

  useEffect(() => {
    const fetchChapterAndMedia = async () => {
      try {
        setLoading(true);
        // Fetch chapter data, questions, images, and files separately
        const [chapterData, questionsData, imagesData, filesData] = await Promise.all([
          courseService.getChapter(courseId, chapterId),
          courseService.getChapterQuestions(courseId, chapterId),
          courseService.getImages(courseId),
          courseService.getFiles(courseId)
        ]);

        setChapter(chapterData);
        setQuestions(questionsData || []);
        setImages(imagesData);
        setFiles(filesData);

        // Initialize quiz answers based on question types
        if (questionsData && questionsData.length > 0) {
          const initialMCAnswers = {};
          const initialOTAnswers = {};

          questionsData.forEach((question) => {
            if (question.type === 'MC') {
              initialMCAnswers[question.id] = '';
            } else if (question.type === 'OT') {
              initialOTAnswers[question.id] = question.users_answer || '';
            }
          });

          setQuizAnswers(initialMCAnswers);
          setOpenTextAnswers(initialOTAnswers);
        }

        setError(null);
      } catch (error) {
        setError(t('errors.loadFailed'));
        console.error('Error fetching chapter, questions, images, or files:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapterAndMedia();
  }, [courseId, chapterId, t]);

  const handleMCAnswerChange = (questionId, value) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleOTAnswerChange = (questionId, value) => {
    setOpenTextAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleGradeOpenTextQuestion = async (questionId) => {
    const userAnswer = openTextAnswers[questionId];
    if (!userAnswer || !userAnswer.trim()) {
      toast.error('Please provide an answer before grading.');
      return;
    }

    try {
      setGradingQuestion(questionId);
      const feedback = await courseService.getQuestionFeedback(
        courseId,
        chapterId,
        questionId,
        userAnswer
      );

      setQuestionFeedback(prev => ({
        ...prev,
        [questionId]: feedback
      }));

      toast.success('Your answer has been graded!');
    } catch (error) {
      console.error('Error grading question:', error);
      toast.error('Failed to grade your answer. Please try again.');
    } finally {
      setGradingQuestion(null);
    }
  };

  const handleSubmitQuiz = () => {
    if (!questions || questions.length === 0) return;

    let correct = 0;
    let totalMCQuestions = 0;

    // Only count MC questions for the score calculation
    questions.forEach((question) => {
      if (question.type === 'MC') {
        totalMCQuestions++;
        if (quizAnswers[question.id] === question.correct_answer) {
          correct++;
        }
      }
    });

    if (totalMCQuestions > 0) {
      const scorePercentage = Math.round((correct / totalMCQuestions) * 100);
      setQuizScore(scorePercentage);
      setQuizSubmitted(true);

      if (scorePercentage >= 70) {
        toast.success(t('toast.quizGreatJob', { scorePercentage }));
      } else {
        toast.info(t('toast.quizReviewContent', { scorePercentage }));
      }
    } else {
      // If there are no MC questions, just mark as submitted
      setQuizSubmitted(true);
      toast.info('Quiz completed! Check your open text question feedback above.');
    }
  };

  const markChapterComplete = async () => {
    try {
      setMarkingComplete(true);
      await courseService.markChapterComplete(courseId, chapterId);
      toast.success(t('toast.markedCompleteSuccess'));
      navigate(`/dashboard/courses/${courseId}`);
    } catch (error) {
      toast.error(t('toast.markedCompleteError'));
      console.error('Error marking chapter complete:', error);
    } finally {
      setMarkingComplete(false);
    }
  };

  const sidebarWidth = isMobile
    ? (toolbarOpen ? window.innerWidth : 0) // Full screen on mobile when open, hidden when closed
    : (toolbarOpen ? toolbarWidth : 40); // Desktop shows normal width when open, 40px when closed

  const mcQuestions = questions.filter(q => q.type === 'MC');
  const otQuestions = questions.filter(q => q.type === 'OT');
  const hasQuestions = questions.length > 0;

  return (
    <div style={{
      display: 'flex',
      position: 'relative',
      width: '100%',
      height: 'calc(100vh - 70px)', // Adjust for header height
      marginTop: 0,
      overflow: 'hidden' // Prevent page-level scrolling issues
    }}>
      {/* Main content with dynamic positioning - centered in available space */}
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
                {images.length > 0 && (
                    <Tabs.Tab value="images" icon={<IconPhoto size={14} />}>{t('tabs.images')}</Tabs.Tab>
                )}
                {files.length > 0 && (
                    <Tabs.Tab value="files" icon={<IconFileText size={14} />}>{t('tabs.files')}</Tabs.Tab>
                )}
                {hasQuestions && (
                  <Tabs.Tab value="quiz" icon={<IconQuestionMark size={14} />}>
                    {t('tabs.quiz', { count: questions.length })}
                  </Tabs.Tab>
                )}
              </Tabs.List>

              <Tabs.Panel value="content" pt="xs">
                <Paper shadow="xs" p="md" withBorder>
                  <div className="markdown-content">
                    <AiCodeWrapper>{chapter.content}</AiCodeWrapper>
                  </div>
                </Paper>
              </Tabs.Panel>

              <Tabs.Panel value="images" pt="xs">
                <Paper shadow="xs" p="md" withBorder>
                  <SimpleGrid cols={isMobile ? 1 : 3} spacing="md">
                    {images.map((image) => (
                      <Card key={image.id} shadow="sm" padding="lg" radius="md" withBorder>
                        <Card.Section>
                          <Image
                            src={image.url}
                            height={160}
                            alt={image.filename}
                          />
                        </Card.Section>
                        <Text weight={500} mt="md">{image.filename}</Text>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Paper>
              </Tabs.Panel>

              <Tabs.Panel value="files" pt="xs">
                <Paper shadow="xs" p="md" withBorder>
                  <List spacing="xs" size="sm" center>
                    {files.map((file) => (
                      <List.Item key={file.id}>
                        <a href={file.url} target="_blank" rel="noopener noreferrer">{file.filename}</a>
                        {file.filename.endsWith('.pdf') && (
                           <Paper withBorder radius="md" mt="sm">
                             <iframe src={file.url} style={{ width: '100%', height: '500px', border: 'none' }} title={file.filename} />
                           </Paper>
                        )}
                      </List.Item>
                    ))}
                  </List>
                </Paper>
              </Tabs.Panel>

              <Tabs.Panel value="quiz" pt="xs">
                <Paper shadow="xs" p="md" withBorder>
                  {quizSubmitted && mcQuestions.length > 0 && (
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

                  {/* Open Text Questions */}
                  {otQuestions.map((question, qIndex) => (
                    <Card key={`ot-${question.id}`} mb="md" withBorder>
                      <Text weight={500} mb="md">
                        {qIndex + 1}. {question.question} <Badge color="blue" size="sm">Open Text</Badge>
                      </Text>

                      <Textarea
                        placeholder="Type your answer here..."
                        value={openTextAnswers[question.id] || ''}
                        onChange={(e) => handleOTAnswerChange(question.id, e.target.value)}
                        minRows={3}
                        mb="md"
                        disabled={questionFeedback[question.id]}
                      />

                      {!questionFeedback[question.id] && (
                        <Button
                          onClick={() => handleGradeOpenTextQuestion(question.id)}
                          loading={gradingQuestion === question.id}
                          disabled={!openTextAnswers[question.id]?.trim()}
                          color="blue"
                          size="sm"
                        >
                          Grade Answer
                        </Button>
                      )}

                      {questionFeedback[question.id] && (
                        <Alert
                          color="blue"
                          title="AI Feedback"
                          mb="sm"
                        >
                          <Text mb="xs">
                            <strong>Points received:</strong> {questionFeedback[question.id].points_received}
                          </Text>
                          <Text>
                            <strong>Feedback:</strong> {questionFeedback[question.id].feedback}
                          </Text>
                          {questionFeedback[question.id].correct_answer && (
                            <Text mt="xs">
                              <strong>Expected answer:</strong> {questionFeedback[question.id].correct_answer}
                            </Text>
                          )}
                        </Alert>
                      )}
                    </Card>
                  ))}

                  {/* Multiple Choice Questions */}
                  {mcQuestions.map((question, qIndex) => (
                    <Card key={`mc-${question.id}`} mb="md" withBorder>
                      <Text weight={500} mb="md">
                        {otQuestions.length + qIndex + 1}. {question.question} <Badge color="green" size="sm">Multiple Choice</Badge>
                      </Text>

                      <Radio.Group
                        value={quizAnswers[question.id]}
                        onChange={(value) => handleMCAnswerChange(question.id, value)}
                        name={`question-${question.id}`}
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
                          color={quizAnswers[question.id] === question.correct_answer ? "green" : "red"}
                          title={quizAnswers[question.id] === question.correct_answer ? t('quiz.alert.correctTitle') : t('quiz.alert.incorrectTitle')}
                        >
                          <Text mb="xs">
                            {quizAnswers[question.id] !== question.correct_answer && (
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

                  {/* Submit Quiz Button - only show if there are MC questions and not submitted yet */}
                  {mcQuestions.length > 0 && !quizSubmitted && (
                    <Button
                      onClick={handleSubmitQuiz}
                      fullWidth
                      mt="md"
                      disabled={
                        Object.values(quizAnswers).some(a => a === '')
                      }
                    >
                      {t('buttons.submitQuiz')}
                    </Button>
                  )}

                  {/* Info message if only OT questions */}
                  {otQuestions.length > 0 && mcQuestions.length === 0 && (
                    <Alert color="blue" mt="md">
                      <Text>Grade each of your answers above to receive feedback from our AI tutor.</Text>
                    </Alert>
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
              <Button
                color="green"
                onClick={markChapterComplete}
                loading={markingComplete}
                disabled={markingComplete}
              >
                {t('buttons.markComplete')}
              </Button>
              {chapter.is_completed && (
                <Badge color="green" size="lg">{t('badge.completed')}</Badge>
              )}
            </Group>
          </>
        )}      
      </Container>
      
      {/* Toolbar Container with all interactive tools */}
      <ToolbarContainer courseId={courseId} chapterId={chapterId} />
    </div>
  );
}

export default ChapterView;