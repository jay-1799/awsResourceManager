import React, { useState } from 'react';
import { api } from '../../services/api';
import { useApiCall } from '../../hooks/useApiCall';
import FormWrapper from '../shared/FormWrapper';

const CleanupIPs = () => {
  const [retentionDays, setRetentionDays] = useState(7);
  const { loading, error, result, execute } = useApiCall();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute(
      () => api.cleanupElasticIPs({ retentionDays }),
      'Failed to cleanup EIPs. Please try again.'
    );
  };

  return (
    <FormWrapper
      title="Cleanup Unused Elastic IPs"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      result={result}
    >
      <label>
        Retention Days for Unused EIPs:
        <input
          type="number"
          value={retentionDays}
          onChange={(e) => setRetentionDays(e.target.value)}
          min="1"
          required
        />
      </label>
      <br />
      <button type="submit">Cleanup EIPs</button>
    </FormWrapper>
  );
};

export default CleanupIPs;
