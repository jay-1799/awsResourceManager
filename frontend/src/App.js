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
      const response = await fetch("http://localhost:8000/delete_iam_user/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ username }),
      });
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
