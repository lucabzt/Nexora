/**
 * Utility functions and shared components for the toolbar tools
 */

// Common styling for tool containers
export const getToolContainerStyle = (isOpen) => ({
  opacity: isOpen ? 1 : 0,
  transition: 'opacity 0.3s ease',
  padding: isOpen ? '20px' : '0',
  paddingLeft: isOpen ? '50px' : '0',
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  pointerEvents: isOpen ? 'auto' : 'none'  // Prevent interaction when collapsed
});

// Standard tool icon configurations
export const TOOL_ICONS = {
  PLOTTER: 'plotter',
  CHAT: 'chat',
};

// Default header styles
export const HEADER_STYLES = {
  marginBottom: '1rem'
};

export default {
  getToolContainerStyle,
  TOOL_ICONS,
  HEADER_STYLES
};
