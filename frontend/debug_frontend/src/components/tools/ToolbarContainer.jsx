import { useState, useEffect } from 'react';
import { ActionIcon, Box, Tabs, useMantineTheme } from '@mantine/core';
import { IconChartLine, IconMessage, IconChevronLeft } from '@tabler/icons-react';
import { Resizable } from 're-resizable';
import GeoGebraPlotter from './GeoGebraPlotter';
import ChatTool from './ChatTool';
import { TOOL_ICONS } from './ToolUtils';

/**
 * ToolbarContainer component
 * Container for interactive learning tools with a resizable sidebar
 */
function ToolbarContainer({ courseId, chapterId }) {
  const theme = useMantineTheme();
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [toolbarWidth, setToolbarWidth] = useState(500);
  const [activeTab, setActiveTab] = useState('plotter'); // Use direct string
  useEffect(() => {
    // Only change width if toolbar is open
    // When closed, we maintain the previous width in state but display at 40px
    console.log('Current active tab:', activeTab);
    console.log('TOOL_ICONS values:', TOOL_ICONS);
  }, [toolbarOpen, activeTab]);

  const handleToggleToolbar = () => {
    setToolbarOpen(!toolbarOpen);
  };
  const handleTabChange = (value) => {
    setActiveTab(value);
    if (!toolbarOpen) {
      setToolbarOpen(true);
    }
    console.log('Changed tab to:', value); // For debugging
  };

  return (
    <Resizable
      style={{
        position: 'fixed',
        top: 70, /* Match the header height (70px for md size) */
        right: 0,
        borderLeft: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : '#e9ecef'}`,
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : '#f8f9fa',
        overflow: 'hidden',
        height: 'calc(100vh - 70px)', /* Adjust height to account for header */
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: toolbarOpen ? (theme.colorScheme === 'dark' 
          ? '-2px 0 10px rgba(0, 0, 0, 0.3)' 
          : '-2px 0 10px rgba(0, 0, 0, 0.1)')
          : 'none',
        transition: 'width 0.3s ease', // Always animate for consistency
      }}
      size={{ 
        width: toolbarOpen ? toolbarWidth : 40, 
        height: 'calc(100vh - 70px)' 
      }}
      minWidth={40}
      maxWidth={800}
      enable={{
        top: false,
        right: false,
        bottom: false,
        left: toolbarOpen,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      onResizeStop={(e, direction, ref, d) => {
        setToolbarWidth(toolbarWidth + d.width);
      }}
      handleStyles={{
        left: {
          width: '6px',
          left: '0',
          height: '100%',
          cursor: 'col-resize',
          backgroundColor: theme.colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          '&:hover': {
            backgroundColor: theme.colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
          },
        }
      }}
      handleClasses={{
        left: 'splitter-handle-left'
      }}
    >
      {/* Toggle button and tab selection */}
      <Box sx={{ 
        position: 'absolute', 
        top: '20px', 
        left: '0', 
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '10px',
      }}>
        <ActionIcon
          size="lg"
          variant="filled"
          color="blue"
          onClick={handleToggleToolbar}
          sx={{ 
            borderRadius: '0 4px 4px 0',
            width: '40px',
            height: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: (theme.colorScheme === 'dark' 
              ? '-2px 0 5px rgba(0, 0, 0, 0.3)' 
              : '-2px 0 5px rgba(0, 0, 0, 0.1)')
          }}
        >          {toolbarOpen 
            ? <IconChevronLeft size={20} /> 
            : activeTab === 'plotter' ? <IconChartLine size={20} /> : <IconMessage size={20} />}
        </ActionIcon>        {toolbarOpen && (
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            orientation="vertical"
            sx={{ 
              position: 'absolute',
              top: '70px', // Position below toggle button
              left: 0,
              zIndex: 11
            }}
          >
            <Tabs.List>              <Tabs.Tab 
                value="plotter" 
                icon={<IconChartLine size={16} />}
                sx={{
                  borderRadius: '0 4px 4px 0',
                  marginBottom: '5px'
                }}
                onClick={() => handleTabChange('plotter')}
              />
              <Tabs.Tab 
                value="chat" 
                icon={<IconMessage size={16} />}
                sx={{
                  borderRadius: '0 4px 4px 0'
                }}
                onClick={() => handleTabChange('chat')}
              />
            </Tabs.List>
          </Tabs>
        )}
      </Box>

      {/* Tool Content Area */}
      <div style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative'
      }}>        {activeTab === TOOL_ICONS.PLOTTER && (
          <GeoGebraPlotter isOpen={toolbarOpen} />
        )}
        
        {activeTab === TOOL_ICONS.CHAT && (
          <ChatTool 
            isOpen={toolbarOpen} 
            courseId={courseId} 
            chapterId={chapterId} 
          />
        )}
      </div>
    </Resizable>
  );
}

export default ToolbarContainer;
