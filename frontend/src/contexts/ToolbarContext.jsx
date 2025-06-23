import { createContext, useContext, useState, useCallback } from 'react';
import { TOOL_TABS } from '../components/tools/ToolUtils';

// Create a context for toolbar state
const ToolbarContext = createContext();

// Custom hook to use the toolbar context
export const useToolbar = () => {
  const context = useContext(ToolbarContext);
  if (!context) {
    throw new Error('useToolbar must be used within a ToolbarProvider');
  }
  return context;
};

// Provider component to wrap around components that need toolbar state
export function ToolbarProvider({ children }) {
  const [toolbarWidth, setToolbarWidth] = useState(500); // Default expanded width for desktop
  const [toolbarOpen, setToolbarOpen] = useState(false); // Default closed for better mobile UX
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState(TOOL_TABS.CHAT);

  const openToolbarToTab = useCallback((tab) => {
    setToolbarOpen(true);
    setActiveTab(tab);
  }, []);

  // Provide both the toolbar state and update functions
  const value = {
    toolbarWidth,
    setToolbarWidth,
    toolbarOpen,
    setToolbarOpen,
    isFullscreen,
    setIsFullscreen,
    activeTab,
    setActiveTab,
    openToolbarToTab,
  };

  
  
  return (
    <ToolbarContext.Provider value={value}>
      {children}
    </ToolbarContext.Provider>
  );
}

export default ToolbarContext;
