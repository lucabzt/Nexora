import { useState, useEffect } from 'react';
import { Title, Text, useMantineTheme } from '@mantine/core';
import { getToolContainerStyle } from './ToolUtils';
import { useTranslation } from 'react-i18next';

/**
 * GeoGebraPlotter tool component
 * An interactive plotter for math visualization
 */
function GeoGebraPlotter({ isOpen }) {
  const { t, i18n } = useTranslation('geoGebraPlotter');
  const theme = useMantineTheme();
  
  const containerStyle = {
    ...getToolContainerStyle(isOpen),
    overflow: 'auto'
  };

  
  return (
    <div style={containerStyle}>
      <Title order={3} mb="md">{t('title')}</Title>
      <Text size="sm" color="dimmed" mb="md">
        {t('description')}
      </Text>
      <iframe 
        src={`https://www.geogebra.org/graphing?lang=${i18n.language}`} 
        title={t('iframeTitle')}
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
