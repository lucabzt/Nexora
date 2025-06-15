import { useState, useEffect, useRef } from 'react';
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
import { IconDownload } from '@tabler/icons-react';

import { useMediaQuery } from '@mantine/hooks';
import { IconAlertCircle, IconBookmark, IconQuestionMark, IconPhoto, IconFileText } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { courseService } from '../api/courseService';
import ToolbarContainer from '../components/tools/ToolbarContainer';
import { useToolbar } from '../contexts/ToolbarContext';
import AiCodeWrapper from "../components/AiCodeWrapper.jsx";

// Note: These components would need to be created or imported from the correct path
// For now, I'll create simple placeholder components to prevent import errors
const MediaGallery = ({ images, onDelete, deletingItem, isMobile }) => (
  <SimpleGrid cols={isMobile ? 1 : 3} spacing="md">
    {images.map((image) => (
      <Card key={image.id} shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section>
          {image.objectUrl ? (
            <Image
              src={image.objectUrl}
              height={160}
              alt={image.filename}
            />
          ) : (
            <Box sx={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {image.loading ? <Loader size="sm" /> : <Text color="red">Failed to load</Text>}
            </Box>
          )}
        </Card.Section>
        <Group position="apart" mt="md">
          <Text weight={500}>{image.filename}</Text>
          <Button
            size="xs"
            color="red"
            variant="outline"
            onClick={() => onDelete(image.id)}
            loading={deletingItem === `image-${image.id}`}
          >
            Delete
          </Button>
        </Group>
      </Card>
    ))}
  </SimpleGrid>
);

const FileList = ({ files, onDelete, deletingItem, mediaLoading }) => (
  <List spacing="xs" size="sm">
    {files.map((file) => (
      <List.Item key={file.id}>
        <Group position="apart">
          <Box>
            {file.objectUrl ? (
              <a href={file.objectUrl} target="_blank" rel="noopener noreferrer">
                {file.filename}
              </a>
            ) : (
              <Text color={file.error ? "red" : "dimmed"}>
                {file.loading ? "Loading..." : file.filename}
              </Text>
            )}
            {file.filename?.endsWith('.pdf') && file.objectUrl && (
              <Paper withBorder radius="md" mt="sm">
                <iframe
                  src={file.objectUrl}
                  style={{ width: '100%', height: '500px', border: 'none' }}
                  title={file.filename}
                />
              </Paper>
            )}
          </Box>
          <Button
            size="xs"
            color="red"
            variant="outline"
            onClick={() => onDelete(file.id)}
            loading={deletingItem === `file-${file.id}`}
          >
            Delete
          </Button>
        </Group>
      </List.Item>
    ))}
  </List>
);

const FullscreenContentWrapper = ({ children }) => (
  <div style={{ position: 'relative' }}>
    {children}
  </div>
);

// Placeholder PDF download functions - these would need to be implemented
const downloadChapterContentAsPDF = async (element, title) => {
  console.log('PDF download not implemented');
  throw new Error('PDF download functionality not implemented');
};

const prepareElementForPDF = (element) => {
  return () => {}; // cleanup function
};

function ChapterView() {
  const { t } = useTranslation('chapterView');
  const { courseId, chapterId } = useParams();
  const navigate = useNavigate();
  const { toolbarOpen, toolbarWidth } = useToolbar();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [chapter, setChapter] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('content');

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [openTextAnswers, setOpenTextAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [gradingQuestion, setGradingQuestion] = useState(null);
  const [questionFeedback, setQuestionFeedback] = useState({});
  const [markingComplete, setMarkingComplete] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  const contentRef = useRef(null);

  useEffect(() => {
    console.log("Toolbar state changed:", { open: toolbarOpen, width: toolbarWidth });
  }, [toolbarOpen, toolbarWidth]);

  // Fetch chapter data and media info
  useEffect(() => {
    const fetchChapterAndMediaInfo = async () => {
      try {
        setLoading(true);
        // Note: These service methods would need to be implemented in courseService
        const [chapterData, questionsData, imagesData, filesData] = await Promise.all([
          courseService.getChapter(courseId, chapterId),
          courseService.getChapterQuestions ? courseService.getChapterQuestions(courseId, chapterId) : Promise.resolve([]),
          courseService.getImages(courseId),
          courseService.getFiles(courseId)
        ]);

        setChapter(chapterData);
        setQuestions(questionsData || []);
        setImages(imagesData);
        setFiles(filesData);

        // Set initial media state with empty URLs
        setImages(imagesData.map(img => ({
          ...img,
          objectUrl: null,
          loading: true,
          error: null
        })));

        setFiles(filesData.map(file => ({
          ...file,
          objectUrl: null,
          loading: true,
          error: null
        })));

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

    fetchChapterAndMediaInfo();
  }, [courseId, chapterId, t]);

  const initialLoad = useRef(true);

  // Fetch actual media files
  useEffect(() => {
    if (loading) return;

    if (!initialLoad.current && images.every(img => img.objectUrl || img.error) &&
        files.every(file => file.objectUrl || file.error)) {
      return;
    }

    const fetchMedia = async () => {
      console.log('Starting media fetch...');
      try {
        setMediaLoading(true);

        // Process images
        const updatedImages = await Promise.all(
          images.map(async (image) => {
            if (image.objectUrl || image.error) {
              return image;
            }

            try {
              // Note: These download methods would need to be implemented
              const imageBlob = await courseService.downloadImage(image.id);
              const objectUrl = URL.createObjectURL(
                new Blob([imageBlob], { type: image.content_type || 'application/octet-stream' })
              );
              return { ...image, objectUrl, loading: false, error: null };
            } catch (err) {
              console.error(`Error loading image ${image.id}:`, err);
              return {
                ...image,
                error: t('errors.mediaLoadFailed'),
                loading: false,
                errorDetails: err.message
              };
            }
          })
        );

        // Process files
        const updatedFiles = await Promise.all(
          files.map(async (file) => {
            if (file.objectUrl || file.error) {
              return file;
            }

            try {
              const fileBlob = await courseService.downloadFile(file.id);
              const objectUrl = URL.createObjectURL(
                new Blob([fileBlob], { type: file.content_type || 'application/octet-stream' })
              );
              return { ...file, objectUrl, loading: false, error: null };
            } catch (err) {
              console.error(`Error loading file ${file.id}:`, err);
              return {
                ...file,
                error: t('errors.mediaLoadFailed'),
                loading: false,
                errorDetails: err.message
              };
            }
          })
        );

        setImages(updatedImages);
        setFiles(updatedFiles);
        initialLoad.current = false;
      } catch (error) {
        console.error('Unexpected error in media fetch:', error);
        toast.error(t('errors.mediaLoadFailed'));
      } finally {
        setMediaLoading(false);
      }
    };

    fetchMedia();
  }, [loading, t, images, files]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('Cleaning up media URLs on unmount...');
      const allMedia = [...images, ...files];
      allMedia.forEach(item => {
        if (item?.objectUrl) {
          URL.revokeObjectURL(item.objectUrl);
        }
      });
    };
  }, [images, files]);

  const handleDeleteImage = async (imageId) => {
    try {
      setDeletingItem(`image-${imageId}`);
      await courseService.deleteImage(imageId);

      setImages(prevImages => prevImages.filter(img => img.id !== imageId));

      const imageToDelete = images.find(img => img.id === imageId);
      if (imageToDelete?.objectUrl) {
        URL.revokeObjectURL(imageToDelete.objectUrl);
      }

      toast.success(t('imageDeleted'));
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error(t('errors.deleteFailed'));
    } finally {
      setDeletingItem(null);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      setDeletingItem(`file-${fileId}`);
      await courseService.deleteDocument(fileId);

      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));

      const fileToDelete = files.find(file => file.id === fileId);
      if (fileToDelete?.objectUrl) {
        URL.revokeObjectURL(fileToDelete.objectUrl);
      }

      toast.success(t('fileDeleted'));
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error(t('errors.deleteFailed'));
    } finally {
      setDeletingItem(null);
    }
  };

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

  const handleDownloadPDF = async () => {
    if (!contentRef.current || !chapter) {
      toast.error('Content not available for download');
      return;
    }

    try {
      setDownloadingPDF(true);

      const cleanup = prepareElementForPDF(contentRef.current);
      await new Promise(resolve => setTimeout(resolve, 100));
      await downloadChapterContentAsPDF(contentRef.current, chapter.caption || 'Chapter');
      cleanup();

      toast.success('Chapter content downloaded as PDF');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const sidebarWidth = isMobile
    ? (toolbarOpen ? window.innerWidth : 0)
    : (toolbarOpen ? toolbarWidth : 40);

  const mcQuestions = questions.filter(q => q.type === 'MC');
  const otQuestions = questions.filter(q => q.type === 'OT');
  const hasQuestions = questions.length > 0;

  return (
    <div style={{
      display: 'flex',
      position: 'relative',
      width: '100%',
      height: 'calc(100vh - 70px)',
      marginTop: 0,
      overflow: 'hidden'
    }}>
      <Container size="lg" py="xl" style={{
        flexGrow: 1,
        maxWidth: `calc(100% - ${sidebarWidth}px)`,
        width: `calc(100% - ${sidebarWidth}px)`,
        transition: 'all 0.3s ease',
        marginRight: `${sidebarWidth}px`,
        paddingLeft: '20px',
        paddingRight: '20px',
        overflow: 'auto',
        position: 'relative',
        height: '100%'
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
              <Group spacing="sm">
                <Button
                  variant="outline"
                  color="blue"
                  leftIcon={<IconDownload size={16} />}
                  onClick={handleDownloadPDF}
                  loading={downloadingPDF}
                  disabled={downloadingPDF || activeTab !== 'content'}
                >
                  Download PDF
                </Button>
                <Button
                  color="green"
                  onClick={markChapterComplete}
                  loading={markingComplete}
                  disabled={markingComplete}
                >
                  {t('buttons.markComplete')}
                </Button>
              </Group>
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
                <FullscreenContentWrapper>
                  <Paper shadow="xs" p="md" withBorder ref={contentRef}>
                    <div className="markdown-content">
                      <AiCodeWrapper>{chapter.content}</AiCodeWrapper>
                    </div>
                  </Paper>
                </FullscreenContentWrapper>
              </Tabs.Panel>

              <Tabs.Panel value="images" pt="xs">
                <Paper shadow="xs" p="md" withBorder>
                  <MediaGallery
                    images={images}
                    onDelete={handleDeleteImage}
                    deletingItem={deletingItem}
                    isMobile={isMobile}
                  />
                </Paper>
              </Tabs.Panel>

              <Tabs.Panel value="files" pt="xs">
                <Paper shadow="xs" p="md" withBorder>
                  <FileList
                    files={files}
                    onDelete={handleDeleteFile}
                    deletingItem={deletingItem}
                    mediaLoading={mediaLoading}
                  />
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

                  {/* Submit Quiz Button */}
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
              <Group spacing="sm">
                <Button
                  variant="outline"
                  color="blue"
                  leftIcon={<IconDownload size={16} />}
                  onClick={handleDownloadPDF}
                  loading={downloadingPDF}
                  disabled={downloadingPDF || activeTab !== 'content'}
                >
                  Download PDF
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
            </Group>
          </>
        )}
      </Container>

      <ToolbarContainer courseId={courseId} chapterId={chapterId} />
    </div>
  );
}

export default ChapterView;