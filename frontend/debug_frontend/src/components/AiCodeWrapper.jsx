import React, {Suspense, lazy} from "react";
import PaperBackground from "./PaperBackground.jsx";
import { ErrorBoundary } from 'react-error-boundary';
const LazyStringToReactComponent = lazy(() => import('string-to-react-component'));
import he from 'he';

// Plugins/Libraries available to the agent
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
const LazyPlot = lazy(() => import('react-plotly.js'));
import * as Recharts from 'recharts';
import mermaid from 'mermaid';
import '@xyflow/react/dist/style.css';


// Main function that shows the content
function AiCodeWrapper({ children }) {
  const plugins = "Latex, Recharts, Plot, SyntaxHighlighter, dark, mermaid";
  const header = `(props) => 
  { const {${plugins}} = props;`;

  const full_react_component = `${header}${children}`;

  const decodedString = he.decode(full_react_component);

  return (
    <PaperBackground>
      <Suspense fallback={<div>Loading...</div>}>
        <SafeComponent
          code={decodedString}
          data={{
            Latex,
            Recharts,
            Plot: LazyPlot,
            SyntaxHighlighter,
            dark,
            mermaid
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
