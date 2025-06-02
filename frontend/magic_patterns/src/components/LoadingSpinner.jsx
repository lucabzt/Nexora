// frontend/magic_patterns/src/components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = 'large', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className={`animate-spin mx-auto ${sizeClasses[size]} border-4 border-teal-500 border-t-transparent rounded-full`}></div>
        <p className="mt-4 text-gray-600">{text}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;