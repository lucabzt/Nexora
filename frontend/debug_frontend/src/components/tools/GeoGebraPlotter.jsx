import { useState, useEffect } from 'react';
import { Title, Text, useMantineTheme } from '@mantine/core';
import { getToolContainerStyle } from './ToolUtils';

/**
 * GeoGebraPlotter tool component
 * An interactive plotter for math visualization
 */
function GeoGebraPlotter({ isOpen }) {
  const theme = useMantineTheme();
  
  const containerStyle = {
    ...getToolContainerStyle(isOpen),
    overflow: 'auto'
  };

  return (
    <div style={containerStyle}>
      <Title order={3} mb="md">GeoGebra Plotter</Title>
      <Text size="sm" color="dimmed" mb="md">
        Use this interactive GeoGebra plotter to visualize mathematical concepts.
      </Text>
      <iframe 
        src="https://www.geogebra.org/graphing?lang=en" 
        title="GeoGebra Graphing Calculator"
        style={{ 
          width: '100%', 
          height: 'calc(100vh - 220px)', /* Adjusted for header + panel title/description */
          border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : '#e9ecef'}`,
          borderRadius: '4px'
        }}
        allowFullScreen
      ></iframe>
    </div>
  );
}

export default GeoGebraPlotter;
