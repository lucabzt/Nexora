import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

const Mermaid = ({ children, theme = 'default', width = '100%' }) => {
  const mermaidRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize mermaid once
  useEffect(() => {
    if (!isInitialized) {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: theme,
          securityLevel: 'loose',
          fontFamily: 'inherit',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true
          }
        });
        setIsInitialized(true);
      } catch (err) {
        setError('Failed to initialize Mermaid');
        console.error('Mermaid initialization error:', err);
      }
      setIsLoading(false);
    }
  }, [isInitialized, theme]);

  // Render diagram when content changes
  useEffect(() => {
    if (isInitialized && mermaidRef.current && children) {
      const renderDiagram = async () => {
        try {
          setError(null);
          setIsLoading(true);

          // Convert children to string and clean it
          const diagramText = String(children)
            .trim()
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');

          console.log('Mermaid diagram text:', diagramText);

          if (!diagramText) {
            setError('No diagram content provided');
            setIsLoading(false);
            return;
          }

          // Generate a unique ID for this diagram
          const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          // Clear previous content
          mermaidRef.current.innerHTML = '';

          // Validate and render the mermaid diagram
          const { svg } = await mermaid.render(id, diagramText);
          mermaidRef.current.innerHTML = svg;
          setIsLoading(false);
        } catch (err) {
          console.error('Mermaid rendering error:', err);
          setError(err.message || 'Failed to render diagram');
          setIsLoading(false);
        }
      };

      renderDiagram();
    }
  }, [isInitialized, children]);

  // Loading state
  if (isLoading && !error) {
    return (
      <div style={{
        padding: '32px',
        textAlign: 'center',
        color: '#6c757d',
        border: '1px dashed #dee2e6',
        borderRadius: '8px',
        margin: '16px 0',
        fontSize: '14px'
      }}>
        🔄 Rendering diagram...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        padding: '16px',
        border: '2px solid #dc3545',
        borderRadius: '8px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        margin: '16px 0'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          ⚠️ Mermaid Diagram Error
        </div>
        <div style={{ marginBottom: '12px', fontSize: '14px' }}>
          {error}
        </div>
        <details style={{ fontSize: '12px' }}>
          <summary style={{
            cursor: 'pointer',
            padding: '4px',
            backgroundColor: '#f1f3f4',
            borderRadius: '4px',
            border: '1px solid #d1d5db'
          }}>
            Show diagram source
          </summary>
          <pre style={{
            background: '#f8f9fa',
            padding: '12px',
            borderRadius: '4px',
            marginTop: '8px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            border: '1px solid #e9ecef',
            overflow: 'auto'
          }}>
            {children}
          </pre>
        </details>
      </div>
    );
  }

  // Successful render
  return (
    <div
      ref={mermaidRef}
      style={{
        width: width,
        textAlign: 'center',
        margin: '16px 0',
        overflow: 'auto',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#ffffff'
      }}
    />
  );
};

export default Mermaid;