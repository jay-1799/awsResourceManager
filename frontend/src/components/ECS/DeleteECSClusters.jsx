import React from 'react';
import { api } from '../../services/api';
import { useApiCall } from '../../hooks/useApiCall';
import FormWrapper from '../shared/FormWrapper';

const DeleteECSClusters = () => {
  const { loading, error, result, execute } = useApiCall();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute(
      () => api.deleteECSClusters(),
      'Failed to delete ECS clusters. Please try again.'
    );
  };

  return (
    <FormWrapper
      title="Delete Unused ECS Clusters"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      result={result}
    >
      <button type="submit">Delete ECS Clusters</button>
    </FormWrapper>
  );
};

export default DeleteECSClusters;
