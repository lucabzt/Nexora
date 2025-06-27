import React, {Suspense, lazy} from "react";
import PaperBackground from "./PaperBackground.jsx";
import { ErrorBoundary } from 'react-error-boundary';
const LazyStringToReactComponent = lazy(() => import('string-to-react-component'));
import { useTranslation } from 'react-i18next';


// Plugins/Libraries available to the agent
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
const LazyPlot = lazy(() => import('react-plotly.js'));
import * as Recharts from 'recharts';
import * as RF from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from "motion/react"
import CustomReactFlow from "./ai_helper_components/CustomReactFlow.jsx";
import TestComponent from "./ai_helper_components/playground2.jsx";
import comprehensiveHtmlDecode from "./ai_helper_components/htmlDecoder.js";


// Create a modified RF object with custom ReactFlow defaults
const ModifiedRF = {
  ...RF,
  ReactFlow: CustomReactFlow
};

// Main function that shows the content
function AiCodeWrapper({ children, Background = true }) {
  const plugins = "Latex, Recharts, Plot, SyntaxHighlighter, dark, RF, motion";
  const header = `(props) => 
  { const {${plugins}} = props;`;

  const full_react_component = `${header}${children}`;

  //const decodedString = comprehensiveHtmlDecode(full_react_component);
    const decodedString = full_react_component

  // Get translations
  const { t } = useTranslation('common');

  // Beautiful loading component with animation
  const Loader = () => (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
      <div className="relative w-20 h-20 mb-6">
        {/* Spinner */}
        <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-blue-500 border-r-blue-500 rounded-full animate-spin"></div>
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        {t('loader.loadingContent')}
      </h3>
      <p className="text-gray-500 text-center max-w-md">
        {t('loader.preparingComponents')}
      </p>
      
      {/* Subtle animation */}
      <div className="mt-6 flex space-x-2">
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            className="w-2 h-2 bg-blue-300 rounded-full animate-bounce"
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '1s',
              animationIterationCount: 'infinite'
            }}
          />
        ))}
      </div>
    </div>
  );

  const content = (
    <Suspense fallback={<Loader />}>
      <SafeComponent
        code={decodedString}
        data={{
          Latex,
          Recharts,
          Plot: LazyPlot,
          SyntaxHighlighter,
          dark,
          RF: ModifiedRF,
          motion
        }}
      />
    </Suspense>
  );

  if (Background) {
    return (
        <PaperBackground>
          {content}
        </PaperBackground>
    )
  }
  return content;
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
      <div className="ai-content-wrapper">
        <LazyStringToReactComponent data={data} >
          {code}
        </LazyStringToReactComponent>
      </div>
    </ErrorBoundary>
  );
};

export default AiCodeWrapper
