import { useState, useEffect } from 'react';
import { useToolbar } from '../contexts/ToolbarContext';
import { ActionIcon, Box } from '@mantine/core';
import { IconMaximize, IconMinimize } from '@tabler/icons-react';

const FullscreenContentWrapper = ({ children }) => {
  const { isFullscreen, setIsFullscreen } = useToolbar();
  const [buttonVisible, setButtonVisible] = useState(true);

  // Make button visible on load, then fade to transparent after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setButtonVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Box
      sx={(theme) => ({
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        bottom: isFullscreen ? 0 : 'auto',
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : 'auto',
        zIndex: isFullscreen ? 9999 : 'auto',
        backgroundColor: isFullscreen ? (theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white) : 'transparent',
        overflow: isFullscreen ? 'auto' : 'visible',
        transition: 'all 0.3s ease',
      })}
    >
      {/* Fullscreen Button */}
      <ActionIcon
        onClick={toggleFullscreen}
        size="md"
        variant="filled"
        color="blue"
        sx={(theme) => ({
          position: 'absolute',
          top: isFullscreen ? 20 : 10,
          right: isFullscreen ? 20 : 10,
          zIndex: 10000,
          opacity: buttonVisible ? 1 : 0.3,
          transition: 'opacity 0.5s ease, transform 0.2s ease',
          '&:hover': {
            opacity: 1,
            transform: 'scale(1.1)',
          },
          boxShadow: theme.shadows.md,
          border: `2px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
        })}
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullscreen ? <IconMinimize size={16} /> : <IconMaximize size={16} />}
      </ActionIcon>

      {/* Content with padding in fullscreen mode */}
      <Box
        sx={{
          padding: isFullscreen ? '0' : '0',
          height: isFullscreen ? '100%' : 'auto',
          overflow: isFullscreen ? 'auto' : 'visible',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default FullscreenContentWrapper;