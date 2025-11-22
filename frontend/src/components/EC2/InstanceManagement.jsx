import React, { useState } from 'react';
import { api } from '../../services/api';
import ErrorDisplay from '../shared/ErrorDisplay';
import ResultDisplay from '../shared/ResultDisplay';

const InstanceManagement = ({ actionType }) => {
  const [tagKey, setTagKey] = useState('');
  const [tagValue, setTagValue] = useState('');
  const [instances, setInstances] = useState([]);
  const [selectedInstances, setSelectedInstances] = useState([]);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleFetchInstances = async (e) => {
    e.preventDefault();
    setError('');
    setResult('');

    try {
      const data = await api.fetchInstances({ tagKey, tagValue });
      setInstances(data.instances);
    } catch (err) {
      setError(err.message || 'Failed to fetch instances. Please try again.');
    }
  };

  const handleCheckboxChange = (instanceId) => {
    setSelectedInstances((prevSelected) => {
      if (prevSelected.includes(instanceId)) {
        return prevSelected.filter((id) => id !== instanceId);
      } else {
        return [...prevSelected, instanceId];
      }
    });
  };

  const handleConfirmAction = async () => {
    setError('');
    setResult('');

    try {
      const apiFunction = actionType === 'terminate'
        ? api.terminateInstances
        : api.stopInstances;

      const data = await apiFunction({ instanceIds: selectedInstances });
      setResult(data.message);
      setInstances([]);
      setSelectedInstances([]);
    } catch (err) {
      setError(err.message || `Failed to ${actionType} instances. Please try again.`);
    }
  };

  return (
    <div className="App">
      <h1>{actionType === 'terminate' ? 'Terminate' : 'Stop'} Instances</h1>
      <form onSubmit={handleFetchInstances}>
        <label htmlFor="tagKey">Tag Key</label>
        <input
          type="text"
          id="tagKey"
          value={tagKey}
          onChange={(e) => setTagKey(e.target.value)}
          required
        />

        <label htmlFor="tagValue">Tag Value</label>
        <input
          type="text"
          id="tagValue"
          value={tagValue}
          onChange={(e) => setTagValue(e.target.value)}
          required
        />

        <button type="submit">Fetch Instances</button>
      </form>

      {instances.length > 0 && (
        <div className="component-container">
          <h2>
            Select Instances to {actionType === 'terminate' ? 'Terminate' : 'Stop'}:
          </h2>
          {instances.map((instance) => (
            <div key={instance.InstanceId} className="component">
              <input
                type="checkbox"
                checked={selectedInstances.includes(instance.InstanceId)}
                onChange={() => handleCheckboxChange(instance.InstanceId)}
              />
              <span className="instance-info">
                {instance.InstanceId} - {instance.State.Name}
              </span>
            </div>
          ))}
          <button onClick={handleConfirmAction}>
            {actionType === 'terminate' ? 'Terminate Selected' : 'Stop Selected'}
          </button>
        </div>
      )}

      <ResultDisplay message={result} />
      <ErrorDisplay error={error} />
    </div>
  );
};

export default InstanceManagement;
