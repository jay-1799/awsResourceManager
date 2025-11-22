import React from 'react';
import { api } from '../../services/api';
import { useApiCall } from '../../hooks/useApiCall';
import FormWrapper from '../shared/FormWrapper';

const DeleteEC2KeyPairs = () => {
  const { loading, error, result, execute } = useApiCall();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute(
      () => api.deleteKeyPairs(),
      'Failed to delete EC2 key pairs. Please try again.'
    );
  };

  return (
    <FormWrapper
      title="Delete Unused EC2 Key Pairs"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      result={result}
    >
      <button type="submit">Delete Key Pairs</button>
    </FormWrapper>
  );
};

export default DeleteEC2KeyPairs;
