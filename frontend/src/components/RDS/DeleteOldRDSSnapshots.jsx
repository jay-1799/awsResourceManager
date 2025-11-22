import React, { useState } from 'react';
import { api } from '../../services/api';
import { useApiCall } from '../../hooks/useApiCall';
import FormWrapper from '../shared/FormWrapper';

const DeleteOldRDSSnapshots = () => {
  const [retentionPeriod, setRetentionPeriod] = useState('');
  const { loading, error, result, execute } = useApiCall();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute(
      () => api.deleteRDSSnapshots({ retentionPeriod }),
      'Failed to delete RDS snapshots. Please try again.'
    );
  };

  return (
    <FormWrapper
      title="Delete Old RDS Snapshots"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      result={result}
    >
      <label>
        Retention Period (in days):
        <input
          type="number"
          value={retentionPeriod}
          onChange={(e) => setRetentionPeriod(e.target.value)}
          required
        />
      </label>
      <button type="submit">Delete RDS Snapshots</button>
    </FormWrapper>
  );
};

export default DeleteOldRDSSnapshots;
