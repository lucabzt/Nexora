import { useState, useEffect } from 'react';
import { ActionIcon, Box, Tabs, useMantineTheme, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@mantine/hooks';
import { IconX, IconPencil } from '@tabler/icons-react';
import { Resizable } from 're-resizable';
import ChatTool from './ChatTool';
import NotesTool from './NotesTool';
import GeoGebraPlotter from './GeoGebraPlotter';
import { useToolbar } from '../../contexts/ToolbarContext';
import { TOOL_TABS } from './ToolUtils';

function ToolbarContainer({ courseId, chapterId }) {
  const { t } = useTranslation('toolbarContainer');
  const theme = useMantineTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const { toolbarOpen, setToolbarOpen, toolbarWidth, setToolbarWidth, isFullscreen } = useToolbar();
  const [activeTab, setActiveTab] = useState(TOOL_TABS.CHAT);

  useEffect(() => {
    if (toolbarOpen) {
      if (isMobile && toolbarWidth > window.innerWidth * 0.8) {
        setToolbarWidth(window.innerWidth * 0.8);
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
      <Tooltip label={t('buttons.openToolbar')} withArrow position="left">
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
      </Tooltip>
    );
  }

  return (
    <Resizable
      size={{ width: toolbarWidth, height: '100%' }}
      onResizeStop={(e, direction, ref, d) => {
        setToolbarWidth(toolbarWidth + d.width);
      }}
      minWidth={isMobile ? 280 : 400}
      maxWidth={isMobile ? '90%' : 800}
      enable={{ right: false, left: !isMobile }}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        zIndex: 1000,
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
      </Box>
    </Resizable>
  );
}

export default ToolbarContainer;