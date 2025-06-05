// Slideshow.jsx
import React, { useState, useEffect, useCallback } from 'react';

const Slideshow = ({ slides }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const totalSlides = slides ? slides.length : 0;

  const goToNextSlide = useCallback(() => {
    if (totalSlides > 0) {
      setCurrentSlideIndex((prevIndex) => Math.min(prevIndex + 1, totalSlides - 1));
    }
  }, [totalSlides]);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlideIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') {
        goToNextSlide();
      } else if (event.key === 'ArrowLeft') {
        goToPrevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNextSlide, goToPrevSlide]);

  if (!slides || totalSlides === 0) {
    return (
      <div style={styles.slideshowContainer}>
        <div style={styles.slideContent}>
          <p>No slides to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.slideshowContainer}>
      <div style={styles.slideContent}>
        <div style={styles.slideInnerWrapper}>
          {slides[currentSlideIndex]}
          {slides[currentSlideIndex]}
        </div>
      </div>

      <div style={styles.controlsContainer}>
        <button
          onClick={goToPrevSlide}
          disabled={currentSlideIndex === 0}
          style={{ ...styles.controlButton, ...(currentSlideIndex === 0 ? styles.disabledButton : {}) }}
        >
            &lt;
        </button>
        <span style={styles.slideCounter}>
          {currentSlideIndex + 1} / {totalSlides}
        </span>
        <button
          onClick={goToNextSlide}
          disabled={currentSlideIndex === totalSlides - 1}
          style={{ ...styles.controlButton, ...(currentSlideIndex === totalSlides - 1 ? styles.disabledButton : {}) }}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

const styles = {
  slideshowContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    backgroundColor: '#2c3e50',
    color: '#ecf0f1',
    border: '1px solid #34495e',
    boxSizing: 'border-box',
  },
  slideContent: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  slideInnerWrapper: {
    maxWidth: '100%',
    maxHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    // Example: border: '1px dashed yellow', // For debugging
  },
  controlsContainer: {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '8px 12px',
    borderRadius: '5px',
    zIndex: 10,
  },
  controlButton: {
    padding: '8px 15px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s ease',
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
    cursor: 'not-allowed',
  },
  slideCounter: {
    fontSize: '14px',
    color: '#ecf0f1',
    minWidth: '50px',
    textAlign: 'center',
  },
};

export default Slideshow;