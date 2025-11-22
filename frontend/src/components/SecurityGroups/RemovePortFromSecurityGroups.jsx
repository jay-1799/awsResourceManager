import React, { useState } from 'react';
import { api } from '../../services/api';
import { useApiCall } from '../../hooks/useApiCall';
import FormWrapper from '../shared/FormWrapper';

const RemovePortFromSecurityGroups = () => {
  const [port, setPort] = useState('');
  const { loading, error, result, execute } = useApiCall();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute(
      () => api.removePortFromSecurityGroups({ port }),
      'Failed to remove port from security groups. Please try again.'
    );
  };

  return (
    <FormWrapper
      title="Remove Port from SGs"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      result={result}
    >
      <label>
        Port Number:
        <input
          type="number"
          value={port}
          onChange={(e) => setPort(e.target.value)}
          required
        />
      </label>
      <br />
      <button type="submit">Remove Port</button>
    </FormWrapper>
  );
};

export default RemovePortFromSecurityGroups;
