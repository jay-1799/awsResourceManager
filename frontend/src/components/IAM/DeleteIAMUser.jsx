import React, { useState } from 'react';
import { api } from '../../services/api';
import { useApiCall } from '../../hooks/useApiCall';
import FormWrapper from '../shared/FormWrapper';

const DeleteIAMUser = () => {
  const [username, setUsername] = useState('');
  const { loading, error, result, execute } = useApiCall();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute(
      () => api.deleteIAMUser({ username }),
      'Failed to delete IAM user. Please try again.'
    );
  };

  return (
    <FormWrapper
      title="Delete IAM User"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      result={result}
    >
      <label>
        IAM Username:
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </label>
      <br />
      <button type="submit">Delete IAM User</button>
    </FormWrapper>
  );
};

export default DeleteIAMUser;
