import { useState, useEffect } from 'react';
import { ActionIcon, Box, Tabs, useMantineTheme } from '@mantine/core';
import { IconChartLine, IconMessage, IconChevronLeft } from '@tabler/icons-react';
import { Resizable } from 're-resizable';
import GeoGebraPlotter from './GeoGebraPlotter';
import ChatTool from './ChatTool';
import { useToolbar } from '../../contexts/ToolbarContext';
import { TOOL_TABS } from './ToolUtils';
import './Toolbar.css';

/**
 * ToolbarContainer component
 * Container for interactive learning tools with a resizable sidebar
 */
function ToolbarContainer({ courseId, chapterId }) {  
  const theme = useMantineTheme();  
  const { toolbarOpen, setToolbarOpen, toolbarWidth, setToolbarWidth } = useToolbar();
  const [activeTab, setActiveTab] = useState(TOOL_TABS.PLOTTER); // Use constant for tab value
    useEffect(() => {
    // Only change width if toolbar is open
    // When closed, we maintain the previous width in state but display at 40px
    if (!toolbarOpen) {
      // We don't change the actual stored width, just the display
      console.log('Toolbar closed, maintaining width at:', toolbarWidth);
    } else {
      // Ensure width is at least 500px when opened
      if (toolbarWidth <= 40) {
        setToolbarWidth(500);
      }
      console.log('Toolbar open with width:', toolbarWidth);
    }
  }, [toolbarOpen, toolbarWidth, setToolbarWidth]);

  const handleToggleToolbar = () => {
    setToolbarOpen(!toolbarOpen);
  };  const handleTabChange = (value) => {
    console.log('Tab change requested:', value);
    setActiveTab(value);
    
    // Always ensure toolbar is open when changing tabs
    if (!toolbarOpen) {
      setToolbarOpen(true);
    }
    
    // Make sure we're using the correct tab value
    if (value !== TOOL_TABS.PLOTTER && value !== TOOL_TABS.CHAT) {
      console.warn('Unknown tab value:', value);
    } else {
      console.log('Changed tab to:', value); 
    }
  };

  return (    <Resizable
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
        topLeft: false,      }}        onResizeStart={() => {
        // Set a resize class on body to disable transitions during resize
        document.body.classList.add('resizing-toolbar');
      }}
      onResize={() => {
        // Do nothing during resize to prevent erratic behavior
        // We'll only update at the end of resize
      }}
      onResizeStop={(e, direction, ref) => {
        // Update width once at the end of resizing to prevent erratic behavior
        const newWidth = Math.max(40, Math.min(800, parseInt(ref.style.width, 10)));
        setToolbarWidth(newWidth);
        document.body.classList.remove('resizing-toolbar');
        console.log('Toolbar width updated to:', newWidth);
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
        >          {toolbarOpen            ? <IconChevronLeft size={20} /> 
            : activeTab === TOOL_TABS.PLOTTER ? <IconChartLine size={20} /> : <IconMessage size={20} />}
        </ActionIcon>        {toolbarOpen && (
          <Tabs 
            value={activeTab} 
            onTabChange={handleTabChange} 
            orientation="vertical"
            sx={{ 
              position: 'absolute',
              top: '70px', // Position below toggle button
              left: 0,
              zIndex: 11
            }}
          >
            <Tabs.List>                <Tabs.Tab 
                value={TOOL_TABS.PLOTTER}
                icon={<IconChartLine size={16} />}
                sx={{
                  borderRadius: '0 4px 4px 0',
                  marginBottom: '5px'
                }}
              />
              <Tabs.Tab 
                value={TOOL_TABS.CHAT}
                icon={<IconMessage size={16} />}
                sx={{
                  borderRadius: '0 4px 4px 0'
                }}
              />
            </Tabs.List>
          </Tabs>
        )}</Box>      
      
      {/* Tool Content Area */}        <div style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        paddingTop: '40px', // Add space for the toggle button
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : '#f8f9fa',
      }}>{activeTab === TOOL_TABS.PLOTTER && (
          <GeoGebraPlotter isOpen={toolbarOpen} />
        )}
        
        {activeTab === TOOL_TABS.CHAT && (
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
