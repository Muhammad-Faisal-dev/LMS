import React, { useState } from "react";
import axios from "axios";

const DebugPanel = () => {
  const [endpoint, setEndpoint] = useState("/api/auth/login");
  const [method, setMethod] = useState("POST");
  const [requestBody, setRequestBody] = useState(
    JSON.stringify(
      {
        email: "test@example.com",
        password: "password123",
      },
      null,
      2
    )
  );
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");

  const makeRequest = async () => {
    try {
      setResponse("");
      setError("");

      let parsedBody;
      try {
        parsedBody = JSON.parse(requestBody);
      } catch (e) {
        setError("Invalid JSON in request body");
        return;
      }

      let result;
      if (method === "GET") {
        result = await axios.get(endpoint);
      } else if (method === "POST") {
        result = await axios.post(endpoint, parsedBody);
      }

      setResponse(JSON.stringify(result.data, null, 2));
    } catch (err) {
      console.error("Debug request error:", err);
      setError(
        `Error ${err.response?.status || ""}: ${
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message
        }`
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 rounded shadow my-8">
      <h2 className="text-xl font-bold mb-4">API Debug Panel</h2>

      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <label className="block mb-2 font-medium">Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block mb-2 font-medium">Endpoint</label>
          <input
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Request Body (JSON)</label>
        <textarea
          value={requestBody}
          onChange={(e) => setRequestBody(e.target.value)}
          className="w-full p-2 border rounded font-mono text-sm h-40"
        />
      </div>

      <button
        onClick={makeRequest}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        Send Request
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded">
          <p className="font-medium text-red-800">Error:</p>
          <p className="font-mono">{error}</p>
        </div>
      )}

      {response && (
        <div>
          <label className="block mb-2 font-medium">Response:</label>
          <pre className="bg-gray-100 p-2 rounded border font-mono text-sm overflow-auto max-h-60">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
