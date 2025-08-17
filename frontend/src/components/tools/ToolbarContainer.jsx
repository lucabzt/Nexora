import { useEffect } from 'react';
import { ActionIcon, Box, Tabs, useMantineTheme, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@mantine/hooks';
import { IconX, IconPencil } from '@tabler/icons-react';
import { Resizable } from 're-resizable';
import ChatTool from './ChatTool';
import NotesTool from './NotesTool';
import GeoGebraPlotter from './GeoGebraPlotter';
import PomodoroTimer from './PomodoroTimer';
import { useToolbar } from '../../contexts/ToolbarContext';
import { TOOL_TABS } from './ToolUtils';

function ToolbarContainer({ courseId, chapterId }) {
  const { t } = useTranslation('toolbarContainer');
  const theme = useMantineTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const { toolbarOpen, setToolbarOpen, toolbarWidth, setToolbarWidth, isFullscreen, activeTab, setActiveTab } = useToolbar();

  useEffect(() => {
    if (toolbarOpen) {
      if (isMobile) {
        // On mobile, always use full viewport width for the toolbar
        setToolbarWidth(window.innerWidth);
      } else if (!isMobile && toolbarWidth < 300) {
        setToolbarWidth(500);
      }
    }
  }, [toolbarOpen, isMobile, toolbarWidth, setToolbarWidth]);

  const handleToggleToolbar = () => {
    setToolbarOpen(!toolbarOpen);
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    if (!toolbarOpen) {
      setToolbarOpen(true);
    }
  };

  if (isFullscreen) {
    return null;
  }

  if (!toolbarOpen) {
    return (
        <ActionIcon
          size="xl"
          variant="filled"
          color="blue"
          onClick={handleToggleToolbar}
          sx={{
            position: 'fixed',
            bottom: '70px',
            right: '30px',
            zIndex: 1001,
            borderRadius: '50%',
            boxShadow: theme.shadows.md,
          }}
        >
          <IconPencil size={24} />
        </ActionIcon>
    );
  }

  return (
    <Resizable
      size={{ width: isMobile ? '100vw' : toolbarWidth, height: '100%' }}
      onResizeStop={(e, direction, ref, d) => {
        if (!isMobile) {
          setToolbarWidth(toolbarWidth + d.width);
        }
      }}
      minWidth={isMobile ? '100vw' : 400}
      maxWidth={isMobile ? '100vw' : 800}
      enable={{ right: false, left: !isMobile }}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        // On mobile, end above the bottom navigation bar by pinning bottom offset
        bottom: isMobile ? 'calc(96px + env(safe-area-inset-bottom))' : 0,
        height: isMobile ? 'auto' : '100vh',
        // Keep toolbar below the fixed bottom navigation on mobile
        zIndex: isMobile ? 900 : 1000,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
        borderLeft: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[3]}`, 
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px',
          borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[3]}`, 
        }}
      >
        <Tabs value={activeTab} onTabChange={handleTabChange} variant="pills">
          <Tabs.List>
            <Tabs.Tab value={TOOL_TABS.CHAT}>Chat</Tabs.Tab>
            <Tabs.Tab value={TOOL_TABS.NOTES}>Notes</Tabs.Tab>
            <Tabs.Tab value={TOOL_TABS.PLOTTER}>Plotter</Tabs.Tab>
            <Tabs.Tab value={TOOL_TABS.POMODORO}>Pomodoro</Tabs.Tab>
          </Tabs.List>
        </Tabs>
        <Tooltip label={t('buttons.closeToolbar')} withArrow>
          <ActionIcon onClick={handleToggleToolbar}>
            <IconX size={20} />
          </ActionIcon>
        </Tooltip>
      </Box>

      <Box sx={{
        flex: 1, 
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        // extra bottom padding on mobile so input areas (e.g., chat composer) are not clipped
        paddingBottom: isMobile ? '80px' : 0,

        scrollbarWidth: 'thin',
        scrollbarColor: `${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4]} transparent`,
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4],
          borderRadius: '4px',
        },
      }}>
        {activeTab === TOOL_TABS.CHAT && <ChatTool isOpen={toolbarOpen} courseId={courseId} chapterId={chapterId} />}
        {activeTab === TOOL_TABS.NOTES && <NotesTool isOpen={toolbarOpen} courseId={courseId} chapterId={chapterId} />}
        {activeTab === TOOL_TABS.PLOTTER && <GeoGebraPlotter isOpen={toolbarOpen} />}
        {activeTab === TOOL_TABS.POMODORO && <PomodoroTimer />}
      </Box>
    </Resizable>
  );
}

export default ToolbarContainer;