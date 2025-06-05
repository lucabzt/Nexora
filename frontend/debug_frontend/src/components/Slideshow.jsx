// frontend/debug_frontend/src/components/Slideshow.jsx
import React, { useState, useEffect } from 'react';
import parse from 'html-react-parser';
import {
  Box,
  ActionIcon,
  Text,
  useMantineTheme
} from '@mantine/core';
import {
  IconChevronLeft,
  IconChevronRight
} from '@tabler/icons-react';

/**
 * Minimal HTML Slideshow Component
 * Parses HTML strings and displays them as interactive slides
 */
const Slideshow = ({ slides }) => {
  // Get Mantine theme for consistent styling
  const theme = useMantineTheme();

  // Track current slide index (starts at 0)
  const [currentIndex, setCurrentIndex] = useState(0);

  // Calculate total number of slides, handle empty/null slides array
  const totalSlides = slides?.length || 0;

  // Navigation function: go to previous slide
  const goToPrevious = () => {
    // Use Math.max to prevent going below 0
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  // Navigation function: go to next slide
  const goToNext = () => {
    // Use Math.min to prevent going beyond last slide
    setCurrentIndex(prev => Math.min(totalSlides - 1, prev + 1));
  };

  // Keyboard navigation effect
  useEffect(() => {
    // Function to handle keyboard events
    const handleKeyPress = (event) => {
      // Only handle arrow keys, ignore if user is typing in input/textarea
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      // Left arrow or backspace: previous slide
      if (event.key === 'ArrowLeft') {
        event.preventDefault(); // Prevent browser back navigation
        goToPrevious();
      }
      // Right arrow or space: next slide
      else if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault(); // Prevent page scroll on space
        goToNext();
      }
    };

    // Add event listener when component mounts
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup: remove event listener when component unmounts
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [totalSlides]); // Re-run effect if totalSlides changes

  // Handle empty slides
  if (!slides || totalSlides === 0) {
    return (
      <Box
        sx={{
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${theme.colors.gray[3]}`,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.gray[0]
        }}
      >
        <Text color="dimmed">No slides available</Text>
      </Box>
    );
  }

  // Get current slide HTML string
  const currentSlideHTML = slides[currentIndex];

  // Parse HTML string into React elements using html-react-parser
  const parsedSlide = parse(currentSlideHTML);

  return (
    <Box
      sx={{
        position: 'relative', // Enable absolute positioning for controls
        width: '100%',
        height: '600px', // Fixed height for consistent layout
        border: `1px solid ${theme.colors.gray[3]}`,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        overflow: 'auto' // Hide any content that overflows
      }}
    >
      {/* Main slide content area */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center', // Center content vertically
          justifyContent: 'center', // Center content horizontally
          padding: theme.spacing.xl, // Add padding around content
          boxSizing: 'border-box', // Include padding in total size
          overflow: 'auto' // Allow scrolling if content is too large
        }}
      >
        {/* Render the parsed HTML slide */}
        {parsedSlide}
      </Box>

      {/* Left navigation button */}
      <ActionIcon
        onClick={goToPrevious}
        disabled={currentIndex === 0} // Disable on first slide
        size="lg"
        variant="filled"
        color="blue"
        sx={{
          position: 'absolute', // Position over the slide content
          left: theme.spacing.md, // 16px from left edge
          top: '50%', // Center vertically
          transform: 'translateY(-50%)', // Adjust for button height
          zIndex: 10 // Ensure button appears above content
        }}
      >
        <IconChevronLeft size={20} />
      </ActionIcon>

      {/* Right navigation button */}
      <ActionIcon
        onClick={goToNext}
        disabled={currentIndex === totalSlides - 1} // Disable on last slide
        size="lg"
        variant="filled"
        color="blue"
        sx={{
          position: 'absolute', // Position over the slide content
          right: theme.spacing.md, // 16px from right edge
          top: '50%', // Center vertically
          transform: 'translateY(-50%)', // Adjust for button height
          zIndex: 10 // Ensure button appears above content
        }}
      >
        <IconChevronRight size={20} />
      </ActionIcon>

      {/* Slide counter */}
      <Box
        sx={{
          position: 'absolute', // Position over the slide content
          bottom: theme.spacing.md, // 16px from bottom
          right: theme.spacing.md, // 16px from right
          backgroundColor: theme.colorScheme === 'dark'
            ? 'rgba(0, 0, 0, 0.7)'  // Semi-transparent dark background
            : 'rgba(255, 255, 255, 0.9)', // Semi-transparent light background
          padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`, // 8px vertical, 12px horizontal
          borderRadius: theme.radius.sm, // Rounded corners
          zIndex: 10 // Ensure counter appears above content
        }}
      >
        <Text size="sm" weight={500}>
          {currentIndex + 1} / {totalSlides}
        </Text>
      </Box>

      {/* Progress bar */}
      <Box
        sx={{
          position: 'absolute', // Position at top of slide
          top: 0,
          left: 0,
          right: 0,
          height: '4px', // Thin progress bar
          backgroundColor: theme.colors.gray[2] // Light gray background
        }}
      >
        {/* Progress indicator */}
        <Box
          sx={{
            height: '100%',
            width: `${((currentIndex + 1) / totalSlides) * 100}%`, // Calculate progress percentage
            backgroundColor: theme.colors.blue[6], // Blue progress color
            transition: 'width 0.3s ease' // Smooth animation when changing slides
          }}
        />
      </Box>
    </Box>
  );
};

export default Slideshow;