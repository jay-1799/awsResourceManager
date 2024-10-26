import React, { useState } from "react";

function App() {
  return (
    <div className="App">
      <h1>Manage AWS Resources</h1>
      <TerminateInstances />
      <CleanupIPs />
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
        "http://127.0.0.1:8000/terminate_instances/",
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
      const response = await fetch("/cleanup_elastic_ips/", {
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
