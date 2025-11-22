import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import ResultDisplay from './ResultDisplay';
import ErrorDisplay from './ErrorDisplay';

const FormWrapper = ({ title, onSubmit, loading, error, result, children, resultContent }) => {
  return (
    <div className="App">
      <h1>{title}</h1>
      <form onSubmit={onSubmit}>
        {children}
      </form>
      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay error={error} />}
      {result && <ResultDisplay message={result}>{resultContent}</ResultDisplay>}
    </div>
  );
};

export default FormWrapper;
