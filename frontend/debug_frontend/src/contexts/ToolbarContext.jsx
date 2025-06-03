import { createContext, useContext, useState } from 'react';

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
  const [toolbarWidth, setToolbarWidth] = useState(500); // Default expanded width
  const [toolbarOpen, setToolbarOpen] = useState(false);

  // Provide both the toolbar state and update functions
  const value = {
    toolbarWidth,
    setToolbarWidth,
    toolbarOpen,
    setToolbarOpen
  };

  
  return (
    <ToolbarContext.Provider value={value}>
      {children}
    </ToolbarContext.Provider>
  );
}

export default ToolbarContext;
