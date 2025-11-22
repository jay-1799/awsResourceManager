import React, { useState } from 'react';
import { api } from '../../services/api';
import { useApiCall } from '../../hooks/useApiCall';
import FormWrapper from '../shared/FormWrapper';

const CleanupAMIs = () => {
  const [retentionDays, setRetentionDays] = useState(30);
  const { loading, error, result, execute } = useApiCall();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute(
      () => api.cleanupAMIs({ retentionDays }),
      'Failed to clean up AMIs. Please try again.'
    );
  };

  return (
    <FormWrapper
      title="Cleanup Unused AMIs"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      result={result}
    >
      <label>
        Retention Days for Unused AMIs:
        <input
          type="number"
          value={retentionDays}
          onChange={(e) => setRetentionDays(e.target.value)}
          min="1"
          required
        />
      </label>
      <br />
      <button type="submit">Cleanup AMIs</button>
    </FormWrapper>
  );
};

export default CleanupAMIs;
