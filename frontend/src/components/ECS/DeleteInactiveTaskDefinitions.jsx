import React from 'react';
import { api } from '../../services/api';
import { useApiCall } from '../../hooks/useApiCall';
import FormWrapper from '../shared/FormWrapper';

const DeleteInactiveTaskDefinitions = () => {
  const { loading, error, result, execute } = useApiCall();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute(
      () => api.deleteInactiveTaskDefinitions(),
      'Failed to delete task definitions. Please try again.'
    );
  };

  return (
    <FormWrapper
      title="Delete Inactive ECS Task Definitions"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      result={result}
    >
      <button type="submit">Delete Task Definitions</button>
    </FormWrapper>
  );
};

export default DeleteInactiveTaskDefinitions;
