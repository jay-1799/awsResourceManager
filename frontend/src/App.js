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
          <StopEC2Instances />
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

function TerminateInstances() {
  const [tagKey, setTagKey] = useState("");
  const [tagValue, setTagValue] = useState("");
  const [result, setResult] = useState("");
  const csrfToken = getCookie("csrftoken");

  const handleTerminateInstances = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8000/terminate_instances/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({ tagKey, tagValue }),
        }
      );
      const data = await response.json();
      setResult(data.message);
    } catch (error) {
      setResult("Failed to terminate instances. Please try again.");
    }
  };

  return (
    <div>
      <h2>Terminate EC2 Instances</h2>
      <form onSubmit={handleTerminateInstances}>
        <label>
          Tag Key:
          <input
            type="text"
            value={tagKey}
            onChange={(e) => setTagKey(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Tag Value:
          <input
            type="text"
            value={tagValue}
            onChange={(e) => setTagValue(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Terminate Instances</button>
      </form>

      {result && (
        <div style={{ marginTop: "10px" }}>
          <p>{result}</p>
        </div>
      )}
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
    <div>
      <h2>Cleanup Unused Elastic IPs</h2>
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
        <div style={{ marginTop: "10px" }}>
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
    <div>
      <h2>Cleanup Unused AMIs</h2>
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
      {result && <p>{result}</p>}
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
    <div>
      <h2>Delete CloudWatch Log Groups</h2>
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
      {result && <p>{result}</p>}
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
    <div>
      <h2>Delete IAM User</h2>
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
      {result && <div className="result">{result}</div>}
    </div>
  );
}

function StopEC2Instances() {
  const [tagKey, setTagKey] = useState("");
  const [tagValue, setTagValue] = useState("");
  const [result, setResult] = useState("");
  const csrfToken = getCookie("csrftoken");

  const handleStopEC2Instances = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8000/stop_ec2_instances/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({ tagKey, tagValue }),
        }
      );
      const data = await response.json();
      setResult(data.message);
    } catch (error) {
      setResult("Failed to stop EC2 instances. Please try again.");
    }
  };

  return (
    <div>
      <h2>Stop EC2 Instances</h2>
      <form onSubmit={handleStopEC2Instances}>
        <label>
          Tag Key:
          <input
            type="text"
            value={tagKey}
            onChange={(e) => setTagKey(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Tag Value:
          <input
            type="text"
            value={tagValue}
            onChange={(e) => setTagValue(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Stop Instances</button>
      </form>
      {result && <div className="result">{result}</div>}
    </div>
  );
}

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
    <div>
      <h2>Remove Port from SGs</h2>
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
      {result && <div className="result">{result}</div>}
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
    <div>
      <h2>Detect Infrastructure Drift</h2>
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
      {result && <div className="result">{result}</div>}
    </div>
  );
}

function CleanupS3Objects() {
  const [bucketName, setBucketName] = useState("");
  const [retentionPeriod, setRetentionPeriod] = useState("");
  const [result, setResult] = useState("");
  const csrfToken = getCookie("csrftoken"); // Function to get CSRF token if needed

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
    <div>
      <h2>Cleanup S3 Objects</h2>
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
        <br />
        <label>
          Retention Period (in days):
          <input
            type="number"
            value={retentionPeriod}
            onChange={(e) => setRetentionPeriod(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Cleanup S3 Objects</button>
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
