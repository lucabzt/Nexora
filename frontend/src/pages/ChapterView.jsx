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
} from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';

import { useMediaQuery } from '@mantine/hooks';
import { IconAlertCircle, IconBookmark, IconQuestionMark, IconPhoto, IconFileText } from '@tabler/icons-react';
import { MediaGallery } from '../components/media/MediaGallery';
import { FileList } from '../components/media/FileList';
import { toast } from 'react-toastify';
import { courseService } from '../api/courseService';
import ToolbarContainer from '../components/tools/ToolbarContainer';
import { useToolbar } from '../contexts/ToolbarContext';
import AiCodeWrapper from "../components/AiCodeWrapper.jsx";
import { downloadChapterContentAsPDF, prepareElementForPDF } from '../utils/pdfDownload';

function ChapterView() {
  const { t } = useTranslation('chapterView');
  const { courseId, chapterId } = useParams(); // This should be the actual DB ID now
  const navigate = useNavigate();
  const { toolbarOpen, toolbarWidth } = useToolbar(); // Get toolbar state from context
  const isMobile = useMediaQuery('(max-width: 768px)'); // Add mobile detection
  const [chapter, setChapter] = useState(null);
  const [images, setImages] = useState([]); // This will store image info + object URLs
  const [files, setFiles] = useState([]); // This will store file info + object URLs
  const [loading, setLoading] = useState(true);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null); // Track which item is being deleted

  // Ref for the content area that we want to download as PDF
  const contentRef = useRef(null);

  useEffect(() => {
    console.log("Toolbar state changed:", { open: toolbarOpen, width: toolbarWidth });
    // We could add additional logic here if needed
  }, [toolbarOpen, toolbarWidth]);

  // Fetch chapter data and media info
  useEffect(() => {
    const fetchChapterAndMediaInfo = async () => {
      try {
        setLoading(true);
        // Fetch chapter data and media info
        const [chapterData, imagesData, filesData] = await Promise.all([
          courseService.getChapter(courseId, chapterId),
          courseService.getImages(courseId),
          courseService.getFiles(courseId)
        ]);

        setChapter(chapterData);
        
        // Set initial media state with empty URLs (will be populated in next effect)
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
        console.error('Error fetching chapter or media info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapterAndMediaInfo();
  }, [courseId, chapterId, t]);

  // Track if this is the initial load
  const initialLoad = useRef(true);

  // Fetch actual media files
  useEffect(() => {
    if (loading) return; // Wait for initial data to load
    
    // Only run on initial load or when media data changes
    if (!initialLoad.current && images.every(img => img.objectUrl || img.error) && 
        files.every(file => file.objectUrl || file.error)) {
      return;
    }
    
    const fetchMedia = async () => {
      console.log('Starting media fetch...');
      try {
        setMediaLoading(true);
        
        // Process images
        console.log('Processing images...', images);
        const updatedImages = await Promise.all(
          images.map(async (image) => {
            if (image.objectUrl || image.error) {
              console.log(`Skipping image ${image.id} - already ${image.objectUrl ? 'loaded' : 'errored'}`);
              return image;
            }
            
            try {
              console.log(`Downloading image ${image.id}...`);
              const imageBlob = await courseService.downloadImage(image.id);
              console.log(`Downloaded image ${image.id}, creating object URL...`);
              const objectUrl = URL.createObjectURL(
                new Blob([imageBlob], { type: image.content_type || 'application/octet-stream' })
              );
              console.log(`Created object URL for image ${image.id}:`, objectUrl.substring(0, 50) + '...');
              return { ...image, objectUrl, loading: false, error: null };
            } catch (err) {
              console.error(`Error loading image ${image.id} (${image.filename}):`, err);
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
        console.log('Processing files...', files);
        const updatedFiles = await Promise.all(
          files.map(async (file) => {
            if (file.objectUrl || file.error) {
              console.log(`Skipping file ${file.id} - already ${file.objectUrl ? 'loaded' : 'errored'}`);
              return file;
            }
            
            try {
              console.log(`Downloading file ${file.id}...`);
              const fileBlob = await courseService.downloadFile(file.id);
              console.log(`Downloaded file ${file.id}, creating object URL...`);
              const objectUrl = URL.createObjectURL(
                new Blob([fileBlob], { type: file.content_type || 'application/octet-stream' })
              );
              console.log(`Created object URL for file ${file.id}:`, objectUrl.substring(0, 50) + '...');
              return { ...file, objectUrl, loading: false, error: null };
            } catch (err) {
              console.error(`Error loading file ${file.id} (${file.filename}):`, err);
              return { 
                ...file, 
                error: t('errors.mediaLoadFailed'), 
                loading: false,
                errorDetails: err.message
              };
            }
          })
        );
        
        console.log('Media fetch complete, updating state...');
        setImages(updatedImages);
        setFiles(updatedFiles);
        initialLoad.current = false;
      } catch (error) {
        console.error('Unexpected error in media fetch:', error);
        toast.error(t('errors.mediaLoadFailed'));
      } finally {
        console.log('Media fetch completed, setting loading to false');
        setMediaLoading(false);
      }
    };

    fetchMedia();
  }, [loading, t]); // Removed images and files from dependencies

  // Separate effect for cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('Cleaning up media URLs on unmount...');
      const allMedia = [...images, ...files];
      allMedia.forEach(item => {
        if (item?.objectUrl) {
          console.log(`Revoking URL for ${item.id} (${item.filename})`);
          URL.revokeObjectURL(item.objectUrl);
        }
      });
    };
  }, []); // Empty dependency array means this only runs on unmount

  const handleDeleteImage = async (imageId) => {
    try {
      setDeletingItem(`image-${imageId}`);
      await courseService.deleteImage(imageId);
      
      // Optimistically update the UI
      setImages(prevImages => prevImages.filter(img => img.id !== imageId));
      
      // Clean up the object URL
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
      
      // Optimistically update the UI
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
      
      // Clean up the object URL
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
    }
  };

  const handleDownloadPDF = async () => {
    if (!contentRef.current || !chapter) {
      toast.error('Content not available for download');
      return;
    }

    try {
      setDownloadingPDF(true);

      // Prepare element for PDF generation (temporarily adjust styles)
      const cleanup = prepareElementForPDF(contentRef.current);

      // Give the browser a moment to apply the style changes
      await new Promise(resolve => setTimeout(resolve, 100));

      // Download the PDF
      await downloadChapterContentAsPDF(contentRef.current, chapter.caption || 'Chapter');

      // Cleanup styles
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
                {chapter?.mc_questions?.length > 0 && (
                  <Tabs.Tab value="quiz" icon={<IconQuestionMark size={14} />}>
                    {t('tabs.quiz', { count: chapter.mc_questions.length })}
                  </Tabs.Tab>
                )}
              </Tabs.List>

              <Tabs.Panel value="content" pt="xs">
                <Paper shadow="xs" p="md" withBorder ref={contentRef}>
                  <div className="markdown-content">
                    <AiCodeWrapper>{chapter.content}</AiCodeWrapper>
                  </div>
                </Paper>
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
      
      {/* Toolbar Container with all interactive tools */}
      <ToolbarContainer courseId={courseId} chapterId={chapterId} />
    </div>
  );
}

export default ChapterView;