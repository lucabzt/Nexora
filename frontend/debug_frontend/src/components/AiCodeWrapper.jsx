import React, {Suspense, lazy, useState} from "react";
import PaperBackground from "./PaperBackground.jsx";
import { ErrorBoundary } from 'react-error-boundary';
const LazyStringToReactComponent = lazy(() => import('string-to-react-component'));

// Plugins/Libraries available to the agent
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import { CopyBlock, dracula } from 'react-code-blocks';
const LazyPlot = lazy(() => import('react-plotly.js'));
import * as Recharts from 'recharts';


// Main function that shows the content
function AiCodeWrapper({ children }) {
  const plugins = "Latex, Recharts, Plot, CopyBlock, dracula";
  const header = `(props) => 
  { const {${plugins}} = props;`;

  const full_react_component = `${header}${children}`;

  return (
    <PaperBackground>
      <Suspense fallback={<div>Loading...</div>}>
        <SafeComponent
          code={full_react_component}
          data={{
            Latex,
            Recharts,
            Plot: LazyPlot,
            CopyBlock,
            dracula
          }}
        />
      </Suspense>
    </PaperBackground>
  );
}


// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div style={{
    padding: '20px',
    border: '2px solid #ff6b6b',
    borderRadius: '8px',
    backgroundColor: '#ffe0e0'
  }}>
    <h3>❌ Code Error</h3>
    <p>{error.message}</p>
    <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
      <summary>Error Details</summary>
      {error.stack}
    </details>
    <button
      onClick={resetErrorBoundary}
      style={{
        padding: '8px 16px',
        backgroundColor: '#ff6b6b',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        marginTop: '10px'
      }}
    >
      Try Again
    </button>
  </div>
);


const SafeComponent = ({ code, data }) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Code execution error:', error, errorInfo);
      }}
      onReset={() => {
        // Optional: any cleanup logic when retrying
      }}
    >
      <LazyStringToReactComponent data={data}>
        {code}
      </LazyStringToReactComponent>
    </ErrorBoundary>
  );
};

export default AiCodeWrapper
