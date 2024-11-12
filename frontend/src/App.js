import React, { useState } from "react";

function App() {
  return (
    <div className="App">
      <h1>Manage AWS Resources</h1>
      <div className="component-container">
        <div className="component">
          <TerminateInstances />
        </div>
        <div className="component">
          <StopInstances />
        </div>
        <div className="component">
          <CleanupS3Objects />
        </div>
        <div className="component">
          <CleanupIPs />
        </div>
        <div className="component">
          <CleanupAMIs />
        </div>
        <div className="component">
          <DeleteCloudWatchLogs />
        </div>
        <div className="component">
          <DeleteIAMUser />
        </div>
        <div className="component">
          <RemovePortFromSecurityGroups />
        </div>
        <div className="component">
          <DetectInfrastructureDrift />
        </div>
        <div className="component">
          <CleanupEBSVolumes />
        </div>
        <div className="component">
          <CleanupECRRepos />
        </div>
        <div className="component">
          <DeleteECSClusters />
        </div>
        <div className="component">
          <DeleteInactiveTaskDefinitions />
        </div>
        <div className="component">
          <DeleteUnusedEKSClusters />
        </div>
        <div className="component">
          <DeleteEC2KeyPairs />
        </div>
        <div className="component">
          <DeleteOldRDSSnapshots />
        </div>
        <div className="component">
          <DeleteUnusedSecurityGroups />
        </div>
      </div>
    </div>
  );
}

const InstanceManagement = ({ actionType }) => {
  const [tagKey, setTagKey] = useState("");
  const [tagValue, setTagValue] = useState("");
  const [instances, setInstances] = useState([]);
  const [selectedInstances, setSelectedInstances] = useState([]);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const csrfToken = getCookie("csrftoken");

  const handleFetchInstances = async (e) => {
    e.preventDefault();
    setError(""); // Reset error state
    setResult(""); // Reset result state

    try {
      const response = await fetch("http://localhost:8000/fetch_instances/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ tagKey, tagValue }),
      });

      const data = await response.json();
      if (response.ok) {
        setInstances(data.instances);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Failed to fetch instances. Please try again.");
    }
  };

  const handleCheckboxChange = (instanceId) => {
    setSelectedInstances((prevSelected) => {
      if (prevSelected.includes(instanceId)) {
        return prevSelected.filter((id) => id !== instanceId); // Remove if already selected
      } else {
        return [...prevSelected, instanceId]; // Add if not selected
      }
    });
  };

  const handleConfirmAction = async () => {
    setError(""); // Reset error state
    setResult(""); // Reset result state

    const endpoint =
      actionType === "terminate"
        ? "http://localhost:8000/terminate_selected_instances/"
        : "http://localhost:8000/stop_selected_instances/";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ instanceIds: selectedInstances }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data.message);
        setInstances([]); // Clear instances after action
        setSelectedInstances([]); // Clear selected instances
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError(
        `Failed to ${
          actionType === "terminate" ? "terminate" : "stop"
        } instances. Please try again.`
      );
    }
  };

  return (
    <div className="App">
      <h1>{actionType === "terminate" ? "Terminate" : "Stop"} Instances</h1>
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
            Select Instances to{" "}
            {actionType === "terminate" ? "Terminate" : "Stop"}:
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
            {actionType === "terminate"
              ? "Terminate Selected"
              : "Stop Selected"}
          </button>
        </div>
      )}

      {result && <div className="result">{result}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export const TerminateInstances = () => (
  <InstanceManagement actionType="terminate" />
);
export const StopInstances = () => <InstanceManagement actionType="stop" />;

function CleanupS3Objects() {
  const [bucketName, setBucketName] = useState("");
  const [retentionPeriod, setRetentionPeriod] = useState("");
  const [result, setResult] = useState("");
  const csrfToken = getCookie("csrftoken");

  const handleCleanupS3Objects = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8000/cleanup_s3_objects/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({ bucketName, retentionPeriod }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete objects");
      }

      const data = await response.json();
      setResult(data.message);
    } catch (error) {
      setResult("Failed to clean up S3 objects. Please try again.");
    }
  };

  return (
    <div className="App">
      <h1>Cleanup S3 Objects</h1>
      <form onSubmit={handleCleanupS3Objects}>
        <label>
          S3 Bucket Name:
          <input
            type="text"
            value={bucketName}
            onChange={(e) => setBucketName(e.target.value)}
            required
          />
        </label>
        {/* <br /> */}
        <label>
          Retention Period (in days):
          <input
            type="number"
            value={retentionPeriod}
            onChange={(e) => setRetentionPeriod(e.target.value)}
            required
          />
        </label>
        {/* <br /> */}
        <button type="submit">Cleanup S3 Objects</button>
      </form>
      {result && <div className="result">{result}</div>}
    </div>
  );
}

function CleanupIPs() {
  const [retentionDays, setRetentionDays] = useState(7);
  const [result, setResult] = useState("");
  const csrfToken = getCookie("csrftoken");

  const handleCleanupIPs = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8000/cleanup_elastic_ips/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({ retentionDays }),
        }
      );
      const data = await response.json();
      setResult(data.message);
    } catch (error) {
      setResult("Failed to cleanup EIPs. Please try again.");
    }
  };

  return (
    <div className="App">
      <h1>Cleanup Unused Elastic IPs</h1>
      <form onSubmit={handleCleanupIPs}>
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
      </form>

      {result && (
        <div className="result">
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}

function CleanupAMIs() {
  const [retentionDays, setRetentionDays] = useState(30); // Default retention period
  const [result, setResult] = useState("");
  const csrfToken = getCookie("csrftoken");

  const handleCleanupAMIs = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/cleanup_amis/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ retentionDays }),
      });
      const data = await response.json();
      setResult(data.message);
    } catch (error) {
      setResult("Failed to clean up AMIs. Please try again.");
    }
  };

  return (
    <div className="App">
      <h1>Cleanup Unused AMIs</h1>
      <form onSubmit={handleCleanupAMIs}>
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
      </form>
      {result && (
        <div className="result">
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}

function DeleteCloudWatchLogs() {
  const [age, setAge] = useState(30); // Default age
  const [result, setResult] = useState("");
  const csrfToken = getCookie("csrftoken");

  const handleDeleteLogs = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8000/delete_cloudwatch_logs/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({ age }),
        }
      );
      const data = await response.json();
      setResult(data.message);
    } catch (error) {
      setResult("Failed to delete CloudWatch logs. Please try again.");
    }
  };

  return (
    <div className="App">
      <h1>Delete CloudWatch Log Groups</h1>
      <form onSubmit={handleDeleteLogs}>
        <label>
          Age (Days):
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min="1"
            required
          />
        </label>
        <br />
        <button type="submit">Delete Log Groups</button>
      </form>
      {result && (
        <div className="result">
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}

function DeleteIAMUser() {
  const [username, setUsername] = useState("");
  const [result, setResult] = useState("");
  const csrfToken = getCookie("csrftoken");

  const handleDeleteIAMUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8000/delete_iam_user_complete/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({ username }),
        }
      );
      const data = await response.json();
      setResult(data.message);
    } catch (error) {
      setResult("Failed to delete IAM user. Please try again.");
    }
  };

  return (
    <div className="App">
      <h1>Delete IAM User</h1>
      <form onSubmit={handleDeleteIAMUser}>
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
      </form>
      {result && (
        <div className="result">
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}

// function StopEC2Instances() {
//   const [tagKey, setTagKey] = useState("");
//   const [tagValue, setTagValue] = useState("");
//   const [result, setResult] = useState("");
//   const csrfToken = getCookie("csrftoken");

//   const handleStopEC2Instances = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch(
//         "http://localhost:8000/stop_ec2_instances/",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "X-Requested-With": "XMLHttpRequest",
//             "X-CSRFToken": csrfToken,
//           },
//           body: JSON.stringify({ tagKey, tagValue }),
//         }
//       );
//       const data = await response.json();
//       setResult(data.message);
//     } catch (error) {
//       setResult("Failed to stop EC2 instances. Please try again.");
//     }
//   };

//   return (
//     <div>
//       <h2>Stop EC2 Instances</h2>
//       <form onSubmit={handleStopEC2Instances}>
//         <label>
//           Tag Key:
//           <input
//             type="text"
//             value={tagKey}
//             onChange={(e) => setTagKey(e.target.value)}
//             required
//           />
//         </label>
//         <br />
//         <label>
//           Tag Value:
//           <input
//             type="text"
//             value={tagValue}
//             onChange={(e) => setTagValue(e.target.value)}
//             required
//           />
//         </label>
//         <br />
//         <button type="submit">Stop Instances</button>
//       </form>
//       {result && <div className="result">{result}</div>}
//     </div>
//   );
// }

function RemovePortFromSecurityGroups() {
  const [port, setPort] = useState("");
  const [result, setResult] = useState("");
  const csrfToken = getCookie("csrftoken");

  const handleRemovePort = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8000/remove_port_from_security_groups/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({ port }),
        }
      );
      const data = await response.json();
      setResult(data.message);
    } catch (error) {
      setResult(
        "Failed to remove port from security groups. Please try again."
      );
    }
  };

  return (
    <div className="App">
      <h1>Remove Port from SGs</h1>
      <form onSubmit={handleRemovePort}>
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
      </form>
      {result && (
        <div className="result">
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}

function DetectInfrastructureDrift() {
  const [directory, setDirectory] = useState("");
  const [result, setResult] = useState("");
  const [driftData, setDriftData] = useState(null);
  const csrfToken = getCookie("csrftoken");

  const handleDetectDrift = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8000/detect_infrastructure_drift/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({ directory }),
        }
      );
      const data = await response.json();
      setResult(data.message);
      setDriftData(data.drift_data);
    } catch (error) {
      setResult("Failed to detect infrastructure drift. Please try again.");
    }
  };

  return (
    <div className="App">
      <h1>Detect Infrastructure Drift</h1>
      <form onSubmit={handleDetectDrift}>
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
      </form>
      {result && (
        <div className="result">
          <p>{result}</p>
        </div>
      )}
      {driftData && (
        <div className="result">
          <h2>Drifted Resources:</h2>
          {Object.keys(driftData).map((service) => (
            <div key={service}>
              <h3>{service}</h3>
              <ul>
                <li>
                  <strong>Only in AWS:</strong>{" "}
                  {driftData[service].only_in_aws.join(", ") || "None"}
                </li>
                <li>
                  <strong>Only in State:</strong>{" "}
                  {driftData[service].only_in_state.join(", ") || "None"}
                </li>
                <li>
                  <strong>Differences:</strong>{" "}
                  {JSON.stringify(driftData[service].differences) || "None"}
                </li>
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CleanupEBSVolumes() {
  const [retentionPeriod, setRetentionPeriod] = useState("");
  const [result, setResult] = useState("");
  const csrfToken = getCookie("csrftoken");

  const handleCleanupEBSVolumes = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8000/cleanup_ebs_volumes/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({ retentionPeriod }),
        }
      );
      const data = await response.json();
      setResult(data.message);
    } catch (error) {
      setResult("Failed to clean up EBS volumes. Please try again.");
    }
  };

  return (
    <div className="App">
      <h1>Cleanup Unused EBS Volumes</h1>
      <form onSubmit={handleCleanupEBSVolumes}>
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
      </form>
      {result && <div className="result">{result}</div>}
    </div>
  );
}

function CleanupECRRepos() {
  const [retentionPeriod, setRetentionPeriod] = useState("");
  const [result, setResult] = useState("");
  const csrfToken = getCookie("csrftoken");

  const handleCleanupECRRepos = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/cleanup_ecr_repos/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ retentionPeriod }),
      });
      const data = await response.json();
      setResult(data.message);
    } catch (error) {
      setResult("Failed to clean up ECR repositories. Please try again.");
    }
  };

  return (
    <div className="App">
      <h1>Cleanup Empty ECR Repositories</h1>
      <form onSubmit={handleCleanupECRRepos}>
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
      </form>
      {result && <div className="result">{result}</div>}
    </div>
  );
}

function DeleteECSClusters() {
  const [result, setResult] = useState("");
  const csrfToken = getCookie("csrftoken");

  const handleDeleteECSClusters = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8000/delete_ecs_clusters/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": csrfToken,
          },
        }
      );
      const data = await response.json();
      setResult(data.message);
    } catch (error) {
      setResult("Failed to delete ECS clusters. Please try again.");
    }
  };

  return (
    <div className="App">
      <h1>Delete Unused ECS Clusters</h1>
      <form onSubmit={handleDeleteECSClusters}>
        <button type="submit">Delete ECS Clusters</button>
      </form>
      {result && <div className="result">{result}</div>}
    </div>
  );
}

function DeleteInactiveTaskDefinitions() {
  const [result, setResult] = useState("");
  const csrfToken = getCookie("csrftoken");

  const handleDeleteTaskDefinitions = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8000/delete_task_definitions/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": csrfToken,
          },
        }
      );
      const data = await response.json();
      setResult(data.message);
    } catch (error) {
      setResult("Failed to delete task definitions. Please try again.");
    }
  };

  return (
    <div className="App">
      <h1>Delete Inactive ECS Task Definitions</h1>
      <form onSubmit={handleDeleteTaskDefinitions}>
        <button type="submit">Delete Task Definitions</button>
      </form>
      {result && <div className="result">{result}</div>}
    </div>
  );
}

function DeleteUnusedEKSClusters() {
  const [result, setResult] = useState("");
  const csrfToken = getCookie("csrftoken");

  const handleDeleteEKSClusters = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8000/delete_eks_clusters/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": csrfToken,
          },
        }
      );
      const data = await response.json();
      setResult(data.message);
    } catch (error) {
      setResult("Failed to delete EKS clusters. Please try again.");
    }
  };

  return (
    <div className="App">
      <h1>Delete Unused EKS Clusters</h1>
      <form onSubmit={handleDeleteEKSClusters}>
        <button type="submit">Delete EKS Clusters</button>
      </form>
      {result && <div className="result">{result}</div>}
    </div>
  );
}

function DeleteEC2KeyPairs() {
  const [result, setResult] = useState("");
  const csrfToken = getCookie("csrftoken");

  const handleDeleteKeyPairs = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/delete_key_pairs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRFToken": csrfToken,
        },
      });
      const data = await response.json();
      setResult(data.message);
    } catch (error) {
      setResult("Failed to delete EC2 key pairs. Please try again.");
    }
  };

  return (
    <div className="App">
      <h1>Delete Unused EC2 Key Pairs</h1>
      <form onSubmit={handleDeleteKeyPairs}>
        <button type="submit">Delete Key Pairs</button>
      </form>
      {result && <div className="result">{result}</div>}
    </div>
  );
}

function DeleteOldRDSSnapshots() {
  const [retentionPeriod, setRetentionPeriod] = useState("");
  const [result, setResult] = useState("");
  const csrfToken = getCookie("csrftoken");

  const handleDeleteRDSSnapshots = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8000/delete_rds_snapshots/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({ retentionPeriod }),
        }
      );
      const data = await response.json();
      setResult(data.message);
    } catch (error) {
      setResult("Failed to delete RDS snapshots. Please try again.");
    }
  };

  return (
    <div className="App">
      <h1>Delete Old RDS Snapshots</h1>
      <form onSubmit={handleDeleteRDSSnapshots}>
        <label>
          Retention Period (in days):
          <input
            type="number"
            value={retentionPeriod}
            onChange={(e) => setRetentionPeriod(e.target.value)}
            required
          />
        </label>
        <button type="submit">Delete RDS Snapshots</button>
      </form>
      {result && <div className="result">{result}</div>}
    </div>
  );
}

function DeleteUnusedSecurityGroups() {
  const [region, setRegion] = useState("");
  const [result, setResult] = useState("");
  const csrfToken = getCookie("csrftoken");

  const handleDeleteSecurityGroups = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8000/delete_security_groups/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({ region }),
        }
      );
      const data = await response.json();
      setResult(data.message);
    } catch (error) {
      setResult("Failed to delete unused security groups. Please try again.");
    }
  };

  return (
    <div className="App">
      <h1>Delete Unused Security Groups</h1>
      <form onSubmit={handleDeleteSecurityGroups}>
        <label>
          AWS Region:
          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="e.g., us-west-2"
            required
          />
        </label>
        <button type="submit">Delete Unused Security Groups</button>
      </form>
      {result && <div className="result">{result}</div>}
    </div>
  );
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export default App;
