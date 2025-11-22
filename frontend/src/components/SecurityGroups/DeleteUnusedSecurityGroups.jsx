import React, { useState } from 'react';
import { api } from '../../services/api';
import { useApiCall } from '../../hooks/useApiCall';
import FormWrapper from '../shared/FormWrapper';

const DeleteUnusedSecurityGroups = () => {
  const [region, setRegion] = useState('');
  const { loading, error, result, execute } = useApiCall();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute(
      () => api.deleteUnusedSecurityGroups({ region }),
      'Failed to delete unused security groups. Please try again.'
    );
  };

  return (
    <FormWrapper
      title="Delete Unused Security Groups"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      result={result}
    >
      <label>
        AWS Region:
        <input
          type="text"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="e.g., us-west-2"
          required
        />
      </label>
      <button type="submit">Delete Unused Security Groups</button>
    </FormWrapper>
  );
};

export default DeleteUnusedSecurityGroups;
