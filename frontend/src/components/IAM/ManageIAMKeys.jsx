import React, { useState } from 'react';
import { api } from '../../services/api';
import ResultDisplay from '../shared/ResultDisplay';

const ManageIAMKeys = () => {
  const [username, setUsername] = useState('');
  const [action, setAction] = useState('create');
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await api.manageIAMKeys({ username, action });
      setMessage(data.message);

      if (action === 'create') {
        setAccessKey(data.accessKey);
        setSecretKey(data.secretKey);
      }
    } catch (error) {
      setMessage(error.message || 'Failed to perform action. Please try again.');
      setAccessKey('');
      setSecretKey('');
    }
  };

  return (
    <div>
      <h1>Manage IAM Keys</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          Action:
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            required
          >
            <option value="create">Create</option>
            <option value="disable">Disable</option>
            <option value="delete">Delete</option>
          </select>
        </label>
        <button type="submit">Submit</button>
      </form>
      {message && (
        <ResultDisplay message={message}>
          {action === 'create' && accessKey && secretKey && (
            <div>
              <h2>New Access Key Details</h2>
              <p>
                <strong>Access Key:</strong> {accessKey}
              </p>
              <p>
                <strong>Secret Key:</strong> {secretKey}
              </p>
              <p style={{ color: 'red' }}>
                **Please copy the secret key now. It won't be shown again.**
              </p>
            </div>
          )}
        </ResultDisplay>
      )}
    </div>
  );
};

export default ManageIAMKeys;
