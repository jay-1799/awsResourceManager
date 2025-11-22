import React from 'react';

const ResultDisplay = ({ message, children }) => {
  if (!message && !children) return null;

  return (
    <div className="result">
      {message && <p>{message}</p>}
      {children}
    </div>
  );
};

export default ResultDisplay;
