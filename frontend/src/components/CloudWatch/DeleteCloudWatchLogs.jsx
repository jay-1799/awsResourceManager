import React, { useState } from 'react';
import { api } from '../../services/api';
import { useApiCall } from '../../hooks/useApiCall';
import FormWrapper from '../shared/FormWrapper';

const DeleteCloudWatchLogs = () => {
  const [age, setAge] = useState(30);
  const { loading, error, result, execute } = useApiCall();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute(
      () => api.deleteCloudWatchLogs({ age }),
      'Failed to delete CloudWatch logs. Please try again.'
    );
  };

  return (
    <FormWrapper
      title="Delete CloudWatch Log Groups"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      result={result}
    >
      <label>
        Age (Days):
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          min="1"
          required
        />
      </label>
      <br />
      <button type="submit">Delete Log Groups</button>
    </FormWrapper>
  );
};

export default DeleteCloudWatchLogs;
