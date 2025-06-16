import React from 'react';
import { Card, Text, Textarea, Button, Alert, Badge, Group, Radio, Paper } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const QuizPanel = ({
  questions = [],
  quizAnswers = {},
  openTextAnswers = {},
  quizSubmitted = false,
  quizScore = 0,
  gradingQuestion = null,
  questionFeedback = {},
  onMCAnswerChange = () => {},
  onOTAnswerChange = () => {},
  onGradeQuestion = () => {},
  onSubmitQuiz = () => {},
}) => {
  const { t } = useTranslation('chapterView');
  
  const mcQuestions = questions.filter(q => q.type === 'MC');
  const otQuestions = questions.filter(q => q.type === 'OT');
  const hasMCQuestions = mcQuestions.length > 0;
  const hasOTQuestions = otQuestions.length > 0;

  return (
    <Paper shadow="xs" p="md" withBorder>
      {quizSubmitted && hasMCQuestions && (
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
            {qIndex + 1}. {question.question} <Badge color="blue" size="sm">{t('quiz.badge.openText')}</Badge>
          </Text>

          <Textarea
            placeholder={t('quiz.openText.placeholder')}
            value={openTextAnswers[question.id] || ''}
            onChange={(e) => onOTAnswerChange(question.id, e.target.value)}
            minRows={3}
            mb="md"
            disabled={!!questionFeedback[question.id]}
          />

          {!questionFeedback[question.id] ? (
            <Button
              onClick={() => onGradeQuestion(question.id)}
              loading={gradingQuestion === question.id}
              disabled={!openTextAnswers[question.id]?.trim()}
              color="blue"
              size="sm"
            >
              {t('quiz.openText.gradeButton')}
            </Button>
          ) : (
            <Alert
              color="blue"
              title={t('quiz.openText.feedbackTitle')}
              mb="sm"
            >
              <Text mb="xs">
                <strong>{t('quiz.openText.pointsReceived')}:</strong> {questionFeedback[question.id].points_received}
              </Text>
              <Text>
                <strong>{t('quiz.openText.feedback')}:</strong> {questionFeedback[question.id].feedback}
              </Text>
              {questionFeedback[question.id].correct_answer && (
                <Text mt="xs">
                  <strong>{t('quiz.openText.expectedAnswer')}:</strong> {questionFeedback[question.id].correct_answer}
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
            {otQuestions.length + qIndex + 1}. {question.question} <Badge color="green" size="sm">{t('quiz.badge.multipleChoice')}</Badge>
          </Text>

          <Radio.Group
            value={quizAnswers[question.id]}
            onChange={(value) => onMCAnswerChange(question.id, value)}
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
              title={quizAnswers[question.id] === question.correct_answer ? 
                t('quiz.alert.correctTitle') : t('quiz.alert.incorrectTitle')}
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

      {/* Submit Quiz Button - Only show if there are MC questions */}
      {hasMCQuestions && !quizSubmitted && (
        <Button
          onClick={onSubmitQuiz}
          fullWidth
          mt="md"
          disabled={Object.values(quizAnswers).some(a => a === '')}
        >
          {t('buttons.submitQuiz')}
        </Button>
      )}

      {/* Info message if only OT questions */}
      {hasOTQuestions && !hasMCQuestions && (
        <Alert color="blue" mt="md">
          <Text>{t('quiz.otOnlyMessage')}</Text>
        </Alert>
      )}
    </Paper>
  );
};

export default QuizPanel;
