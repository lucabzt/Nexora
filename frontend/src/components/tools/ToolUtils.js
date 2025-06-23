/**
 * Utility functions and shared components for the toolbar tools
 */

// Common styling for tool containers
export const getToolContainerStyle = (isOpen) => ({
  opacity: isOpen ? 1 : 0,
  transition: 'opacity 0.3s ease',
  padding: isOpen ? '20px' : '0',
  paddingLeft: isOpen ? '50px' : '0',
  paddingTop: '10px', // Allow space at top  
  height: 'auto', // Allow for natural height
  minHeight: '100%', // Ensure it fills the container
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  pointerEvents: isOpen ? 'auto' : 'none',  // Prevent interaction when collapsed
  // We won't set overflow here - parent container handles scrolling
  // This prevents scroll issues with the header
});

// Standard tool tab names - we use string literals directly in the components now
// These are kept for documentation purposes
export const TOOL_TABS = {
  PLOTTER: 'plotter',
  CHAT: 'chat',
  NOTES: 'notes', // Added Notes tab
  POMODORO: 'pomodoro',
};

// Default header styles
export const HEADER_STYLES = {
  marginBottom: '1rem'
};

export default {
  getToolContainerStyle,
  TOOL_TABS,
  HEADER_STYLES
};
