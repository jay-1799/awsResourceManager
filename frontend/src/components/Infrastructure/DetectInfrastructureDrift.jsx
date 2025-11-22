import React, { useState } from 'react';
import { api } from '../../services/api';
import { useApiCall } from '../../hooks/useApiCall';
import FormWrapper from '../shared/FormWrapper';

const DetectInfrastructureDrift = () => {
  const [directory, setDirectory] = useState('');
  const [driftData, setDriftData] = useState(null);
  const { loading, error, result, execute } = useApiCall();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await execute(
        () => api.detectInfrastructureDrift({ directory }),
        'Failed to detect infrastructure drift. Please try again.'
      );
      setDriftData(data.drift_data);
    } catch (err) {
      setDriftData(null);
    }
  };

  const driftContent = driftData && (
    <div>
      <h2>Drifted Resources:</h2>
      {Object.keys(driftData).map((service) => (
        <div key={service}>
          <h3>{service}</h3>
          <ul>
            <li>
              <strong>Only in AWS:</strong>{' '}
              {driftData[service].only_in_aws.join(', ') || 'None'}
            </li>
            <li>
              <strong>Only in State:</strong>{' '}
              {driftData[service].only_in_state.join(', ') || 'None'}
            </li>
            <li>
              <strong>Differences:</strong>{' '}
              {JSON.stringify(driftData[service].differences) || 'None'}
            </li>
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <FormWrapper
      title="Detect Infrastructure Drift"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      result={result}
      resultContent={driftContent}
    >
      <label>
        Directory Path:
        <input
          type="text"
          value={directory}
          onChange={(e) => setDirectory(e.target.value)}
          required
        />
      </label>
      <br />
      <button type="submit">Detect Drift</button>
    </FormWrapper>
  );
};

export default DetectInfrastructureDrift;
