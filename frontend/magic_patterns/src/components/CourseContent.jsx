// frontend/magic_patterns/src/components/CourseContent.jsx
import React, { useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon, HelpCircleIcon } from 'lucide-react';

const QuizQuestion = ({ question, index, onAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleAnswerSelect = (answer) => {
    if (showFeedback) return; // Don't allow changing answer after feedback

    setSelectedAnswer(answer);
    setShowFeedback(true);
    onAnswer(index, answer, answer === question.correct_answer);
  };

  const getAnswerStyle = (answer) => {
    if (!showFeedback) {
      return selectedAnswer === answer
        ? 'border-teal-500 bg-teal-50'
        : 'border-gray-200 hover:border-gray-300';
    }

    if (answer === question.correct_answer) {
      return 'border-green-500 bg-green-50';
    } else if (answer === selectedAnswer && answer !== question.correct_answer) {
      return 'border-red-500 bg-red-50';
    } else {
      return 'border-gray-200 bg-gray-50';
    }
  };

  const getAnswerIcon = (answer) => {
    if (!showFeedback) return null;

    if (answer === question.correct_answer) {
      return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
    } else if (answer === selectedAnswer && answer !== question.correct_answer) {
      return <XCircleIcon className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="mb-4">
        <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
        <p className="mt-1 text-gray-700">{question.question}</p>
      </div>

      <div className="space-y-2">
        {['a', 'b', 'c', 'd'].map((option) => (
          <button
            key={option}
            onClick={() => handleAnswerSelect(option)}
            disabled={showFeedback}
            className={`w-full text-left p-3 rounded-md border transition-all ${getAnswerStyle(option)} ${
              showFeedback ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start">
                <span className="font-medium text-gray-600 mr-3">{option.toUpperCase()})</span>
                <span className="text-gray-700">{question[`answer_${option}`]}</span>
              </div>
              {getAnswerIcon(option)}
            </div>
          </button>
        ))}
      </div>

      {showFeedback && (
        <div className={`mt-4 p-3 rounded-md ${
          selectedAnswer === question.correct_answer 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start">
            {selectedAnswer === question.correct_answer ? (
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
            )}
            <div>
              <p className={`font-medium ${
                selectedAnswer === question.correct_answer ? 'text-green-800' : 'text-red-800'
              }`}>
                {selectedAnswer === question.correct_answer ? 'Correct!' : 'Incorrect'}
              </p>
              <p className={`text-sm mt-1 ${
                selectedAnswer === question.correct_answer ? 'text-green-700' : 'text-red-700'
              }`}>
                {question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CourseContent = ({ chapter, onChapterComplete, onChapterIncomplete }) => {
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showQuizSummary, setShowQuizSummary] = useState(false);

  const handleQuizAnswer = (questionIndex, answer, isCorrect) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: { answer, isCorrect }
    }));

    // Show summary if all questions are answered
    const totalQuestions = chapter.mc_questions?.length || 0;
    const answeredQuestions = Object.keys(quizAnswers).length + 1; // +1 for current answer

    if (answeredQuestions === totalQuestions && totalQuestions > 0) {
      setTimeout(() => setShowQuizSummary(true), 500);
    }
  };

  const getQuizScore = () => {
    const totalQuestions = chapter.mc_questions?.length || 0;
    const correctAnswers = Object.values(quizAnswers).filter(a => a.isCorrect).length;
    return { correct: correctAnswers, total: totalQuestions };
  };

  // Parse markdown-like content for basic formatting
  const formatContent = (content) => {
    if (!content) return '';

    return content
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold text-gray-900 mt-6 mb-3">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-semibold text-gray-900 mt-5 mb-2">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-medium text-gray-900 mt-4 mb-2">{line.slice(4)}</h3>;
        }

        // Bold text
        const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Empty lines
        if (line.trim() === '') {
          return <br key={index} />;
        }

        // Regular paragraphs
        return (
          <p
            key={index}
            className="text-gray-700 mb-3 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: boldText }}
          />
        );
      });
  };

  const { correct, total } = getQuizScore();
  const scorePercentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="h-full overflow-y-auto rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">{chapter.caption}</h2>
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="mr-1 h-4 w-4" />
            {chapter.time_minutes} minutes
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            chapter.is_completed 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {chapter.is_completed ? 'Completed' : 'In Progress'}
          </span>
          {chapter.mc_questions && chapter.mc_questions.length > 0 && (
            <span className="inline-flex items-center text-xs text-gray-500">
              <HelpCircleIcon className="mr-1 h-3 w-3" />
              {chapter.mc_questions.length} practice questions
            </span>
          )}
        </div>
      </div>

      <div className="prose max-w-none mb-8">
        {formatContent(chapter.content)}
      </div>

      {/* Practice Questions */}
      {chapter.mc_questions && chapter.mc_questions.length > 0 && (
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Practice Questions</h3>

          <div className="space-y-6">
            {chapter.mc_questions.map((question, index) => (
              <QuizQuestion
                key={index}
                question={question}
                index={index}
                onAnswer={handleQuizAnswer}
              />
            ))}
          </div>

          {/* Quiz Summary */}
          {showQuizSummary && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Quiz Results</h4>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{correct}/{total}</p>
                  <p className="text-sm text-gray-600">Correct answers</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${scorePercentage >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                    {scorePercentage}%
                  </p>
                  <p className="text-sm text-gray-600">Score</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className={`text-sm ${scorePercentage >= 70 ? 'text-green-700' : 'text-red-700'}`}>
                  {scorePercentage >= 70
                    ? '🎉 Great job! You\'ve mastered this chapter.'
                    : '📚 Consider reviewing the material before continuing.'}
                </p>

                <button
                  onClick={chapter.is_completed ? onChapterIncomplete : onChapterComplete}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    chapter.is_completed
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-teal-500 text-white hover:bg-teal-600'
                  }`}
                >
                  {chapter.is_completed ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Complete Chapter Button (if no questions) */}
      {(!chapter.mc_questions || chapter.mc_questions.length === 0) && (
        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={chapter.is_completed ? onChapterIncomplete : onChapterComplete}
            className={`px-6 py-3 rounded-md font-medium ${
              chapter.is_completed
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-teal-500 text-white hover:bg-teal-600'
            }`}
          >
            {chapter.is_completed ? 'Mark as Incomplete' : 'Mark as Complete'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseContent;