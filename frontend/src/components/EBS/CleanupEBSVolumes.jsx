import React, { useState } from 'react';
import { api } from '../../services/api';
import { useApiCall } from '../../hooks/useApiCall';
import FormWrapper from '../shared/FormWrapper';

const CleanupEBSVolumes = () => {
  const [retentionPeriod, setRetentionPeriod] = useState('');
  const { loading, error, result, execute } = useApiCall();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute(
      () => api.cleanupEBSVolumes({ retentionPeriod }),
      'Failed to clean up EBS volumes. Please try again.'
    );
  };

  return (
    <FormWrapper
      title="Cleanup Unused EBS Volumes"
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
      <button type="submit">Cleanup EBS Volumes</button>
    </FormWrapper>
  );
};

export default CleanupEBSVolumes;
