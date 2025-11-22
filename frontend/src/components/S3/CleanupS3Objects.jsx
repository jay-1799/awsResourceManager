import React, { useState } from 'react';
import { api } from '../../services/api';
import { useApiCall } from '../../hooks/useApiCall';
import FormWrapper from '../shared/FormWrapper';

const CleanupS3Objects = () => {
  const [bucketName, setBucketName] = useState('');
  const [retentionPeriod, setRetentionPeriod] = useState('');
  const { loading, error, result, execute } = useApiCall();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute(
      () => api.cleanupS3Objects({ bucketName, retentionPeriod }),
      'Failed to clean up S3 objects. Please try again.'
    );
  };

  return (
    <FormWrapper
      title="Cleanup S3 Objects"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      result={result}
    >
      <label>
        S3 Bucket Name:
        <input
          type="text"
          value={bucketName}
          onChange={(e) => setBucketName(e.target.value)}
          required
        />
      </label>
      <label>
        Retention Period (in days):
        <input
          type="number"
          value={retentionPeriod}
          onChange={(e) => setRetentionPeriod(e.target.value)}
          required
        />
      </label>
      <button type="submit">Cleanup S3 Objects</button>
    </FormWrapper>
  );
};

export default CleanupS3Objects;
