import React from 'react';

const ErrorDisplay = ({ error }) => {
  if (!error) return null;

  return (
    <div className="error">
      <p>{error}</p>
    </div>
  );
};

export default ErrorDisplay;
