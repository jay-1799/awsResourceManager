import { useState } from 'react';

export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  const execute = async (apiFunction, errorMessage = 'An error occurred. Please try again.') => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      const data = await apiFunction();
      setResult(data.message || 'Operation completed successfully');
      return data;
    } catch (err) {
      setError(err.message || errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError('');
    setResult('');
  };

  return {
    loading,
    error,
    result,
    execute,
    reset,
    setError,
    setResult,
  };
};
