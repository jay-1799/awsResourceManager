import React, { useState } from 'react';
import { api } from '../../services/api';
import { useApiCall } from '../../hooks/useApiCall';
import FormWrapper from '../shared/FormWrapper';

const CleanupECRRepos = () => {
  const [retentionPeriod, setRetentionPeriod] = useState('');
  const { loading, error, result, execute } = useApiCall();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute(
      () => api.cleanupECRRepos({ retentionPeriod }),
      'Failed to clean up ECR repositories. Please try again.'
    );
  };

  return (
    <FormWrapper
      title="Cleanup Empty ECR Repositories"
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
      <button type="submit">Cleanup ECR Repositories</button>
    </FormWrapper>
  );
};

export default CleanupECRRepos;
