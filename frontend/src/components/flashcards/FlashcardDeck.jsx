import React, { useState, useEffect } from 'react';
import {
  Paper,
  Text,
  Button,
  Group,
  Stack,
  Progress,
  Badge,
  Center,
  Box,
  ActionIcon,
  Divider,
  Title,
  Alert,
  Loader
} from '@mantine/core';
import {
  IconCards,
  IconRefresh,
  IconCheck,
  IconX,
  IconEye,
  IconEyeOff,
  IconChevronLeft,
  IconChevronRight,
  IconTrophy,
  IconBrain
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

const FlashcardDeck = ({ courseId, chapterId }) => {
  const { t } = useTranslation('flashcards');
  
  // Mock data - will be replaced with API calls later
  const [flashcards] = useState([
    {
      id: 1,
      question: "What is React?",
      answer: "React is a JavaScript library for building user interfaces, particularly web applications. It was developed by Facebook and allows developers to create reusable UI components."
    },
    {
      id: 2,
      question: "What are React Hooks?",
      answer: "React Hooks are functions that let you use state and other React features in functional components. Common hooks include useState, useEffect, useContext, and useReducer."
    },
    {
      id: 3,
      question: "What is JSX?",
      answer: "JSX (JavaScript XML) is a syntax extension for JavaScript that allows you to write HTML-like code within JavaScript. It makes React components more readable and easier to write."
    },
    {
      id: 4,
      question: "What is the Virtual DOM?",
      answer: "The Virtual DOM is a JavaScript representation of the actual DOM. React uses it to optimize rendering by comparing the virtual DOM with the previous version and only updating the parts that have changed."
    },
    {
      id: 5,
      question: "What are React Props?",
      answer: "Props (properties) are read-only attributes used to pass data from parent components to child components in React. They help make components reusable and maintainable."
    }
  ]);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studySession, setStudySession] = useState({
    correct: 0,
    incorrect: 0,
    total: 0
  });
  const [sessionStarted, setSessionStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const currentCard = flashcards[currentCardIndex];
  const progress = flashcards.length > 0 ? ((currentCardIndex + 1) / flashcards.length) * 100 : 0;

  const startSession = () => {
    setSessionStarted(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStudySession({ correct: 0, incorrect: 0, total: 0 });
    setShowResults(false);
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = (isCorrect) => {
    const newSession = {
      ...studySession,
      total: studySession.total + 1,
      correct: isCorrect ? studySession.correct + 1 : studySession.correct,
      incorrect: isCorrect ? studySession.incorrect : studySession.incorrect + 1
    };
    setStudySession(newSession);

    // Move to next card or show results
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      setShowResults(true);
    }
  };

  const resetSession = () => {
    setSessionStarted(false);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStudySession({ correct: 0, incorrect: 0, total: 0 });
    setShowResults(false);
  };

  const navigateCard = (direction) => {
    if (direction === 'prev' && currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    } else if (direction === 'next' && currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  if (loading) {
    return (
      <Center style={{ minHeight: 400 }}>
        <Stack align="center" spacing="md">
          <Loader size="lg" />
          <Text>Loading flashcards...</Text>
        </Stack>
      </Center>
    );
  }

  if (flashcards.length === 0) {
    return (
      <Center style={{ minHeight: 400 }}>
        <Stack align="center" spacing="md">
          <IconCards size={64} color="gray" />
          <Title order={3} color="dimmed">No Flashcards Available</Title>
          <Text color="dimmed" align="center">
            Flashcards for this chapter haven't been generated yet.
            <br />
            They will be created automatically based on the chapter content.
          </Text>
        </Stack>
      </Center>
    );
  }

  if (showResults) {
    const accuracy = studySession.total > 0 ? Math.round((studySession.correct / studySession.total) * 100) : 0;
    
    return (
      <Center style={{ minHeight: 400 }}>
        <Stack align="center" spacing="xl" style={{ maxWidth: 400 }}>
          <IconTrophy size={64} color="gold" />
          <Title order={2}>Study Session Complete!</Title>
          
          <Paper p="xl" withBorder style={{ width: '100%' }}>
            <Stack spacing="md">
              <Group position="apart">
                <Text weight={500}>Accuracy:</Text>
                <Badge size="lg" color={accuracy >= 80 ? 'green' : accuracy >= 60 ? 'yellow' : 'red'}>
                  {accuracy}%
                </Badge>
              </Group>
              
              <Group position="apart">
                <Text>Correct:</Text>
                <Badge color="green">{studySession.correct}</Badge>
              </Group>
              
              <Group position="apart">
                <Text>Incorrect:</Text>
                <Badge color="red">{studySession.incorrect}</Badge>
              </Group>
              
              <Group position="apart">
                <Text>Total Cards:</Text>
                <Badge>{studySession.total}</Badge>
              </Group>
            </Stack>
          </Paper>

          <Group spacing="md">
            <Button leftIcon={<IconRefresh size={16} />} onClick={resetSession}>
              Study Again
            </Button>
            <Button variant="outline" onClick={resetSession}>
              Back to Deck
            </Button>
          </Group>
        </Stack>
      </Center>
    );
  }

  if (!sessionStarted) {
    return (
      <Center style={{ minHeight: 400 }}>
        <Stack align="center" spacing="xl" style={{ maxWidth: 500 }}>
          <IconBrain size={64} color="blue" />
          <Title order={2}>Ready to Study?</Title>
          <Text color="dimmed" align="center" size="lg">
            Test your knowledge with {flashcards.length} flashcards from this chapter
          </Text>
          
          <Alert icon={<IconCards size={16} />} title="How it works" color="blue" style={{ width: '100%' }}>
            <Text size="sm">
              • Read each question carefully<br />
              • Think about your answer<br />
              • Flip the card to see the correct answer<br />
              • Mark whether you got it right or wrong
            </Text>
          </Alert>

          <Button 
            size="lg" 
            leftIcon={<IconCards size={20} />} 
            onClick={startSession}
            style={{ minWidth: 200 }}
          >
            Start Studying
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack spacing="md">
      {/* Progress Header */}
      <Paper p="md" withBorder>
        <Stack spacing="xs">
          <Group position="apart">
            <Text weight={500}>
              Card {currentCardIndex + 1} of {flashcards.length}
            </Text>
            <Group spacing="xs">
              <Badge color="green" variant="light">{studySession.correct}</Badge>
              <Badge color="red" variant="light">{studySession.incorrect}</Badge>
            </Group>
          </Group>
          <Progress value={progress} size="sm" />
        </Stack>
      </Paper>

      {/* Flashcard */}
      <Center>
        <Paper
          p="xl"
          withBorder
          style={{
            width: '100%',
            maxWidth: 600,
            minHeight: 300,
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            position: 'relative'
          }}
          onClick={flipCard}
          sx={(theme) => ({
            '&:hover': {
              transform: 'scale(1.02)',
              boxShadow: theme.shadows.md
            }
          })}
        >
          <Stack spacing="md" style={{ minHeight: 200 }}>
            <Group position="apart">
              <Badge color={isFlipped ? 'green' : 'blue'} variant="light">
                {isFlipped ? 'Answer' : 'Question'}
              </Badge>
              <ActionIcon variant="light" color="gray">
                {isFlipped ? <IconEye size={16} /> : <IconEyeOff size={16} />}
              </ActionIcon>
            </Group>

            <Center style={{ flex: 1 }}>
              <Text 
                size="lg" 
                align="center" 
                style={{ lineHeight: 1.6 }}
                weight={isFlipped ? 400 : 500}
              >
                {isFlipped ? currentCard.answer : currentCard.question}
              </Text>
            </Center>

            <Center>
              <Text size="sm" color="dimmed">
                Click to {isFlipped ? 'hide' : 'reveal'} answer
              </Text>
            </Center>
          </Stack>
        </Paper>
      </Center>

      {/* Navigation and Answer Buttons */}
      <Group position="apart">
        <Group spacing="xs">
          <ActionIcon 
            variant="light" 
            onClick={() => navigateCard('prev')}
            disabled={currentCardIndex === 0}
          >
            <IconChevronLeft size={16} />
          </ActionIcon>
          <ActionIcon 
            variant="light" 
            onClick={() => navigateCard('next')}
            disabled={currentCardIndex === flashcards.length - 1}
          >
            <IconChevronRight size={16} />
          </ActionIcon>
        </Group>

        {isFlipped && (
          <Group spacing="md">
            <Button
              leftIcon={<IconX size={16} />}
              color="red"
              variant="light"
              onClick={() => handleAnswer(false)}
            >
              Incorrect
            </Button>
            <Button
              leftIcon={<IconCheck size={16} />}
              color="green"
              onClick={() => handleAnswer(true)}
            >
              Correct
            </Button>
          </Group>
        )}

        <Button variant="subtle" onClick={resetSession}>
          End Session
        </Button>
      </Group>
    </Stack>
  );
};

export default FlashcardDeck;
