import React from 'react';
import { api } from '../../services/api';
import { useApiCall } from '../../hooks/useApiCall';
import FormWrapper from '../shared/FormWrapper';

const DeleteUnusedEKSClusters = () => {
  const { loading, error, result, execute } = useApiCall();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute(
      () => api.deleteUnusedEKSClusters(),
      'Failed to delete EKS clusters. Please try again.'
    );
  };

  return (
    <FormWrapper
      title="Delete Unused EKS Clusters"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      result={result}
    >
      <button type="submit">Delete EKS Clusters</button>
    </FormWrapper>
  );
};

export default DeleteUnusedEKSClusters;
