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

      let parsedBody = {};
      if (method !== "GET") {
        try {
          parsedBody = JSON.parse(requestBody);
        } catch {
          setError("Invalid JSON in request body");
          return;
        }
      }

      const result =
        method === "GET"
          ? await axios.get(endpoint)
          : await axios.post(endpoint, parsedBody);

      setResponse(JSON.stringify(result.data, null, 2));
    } catch (err) {
      setError(
        `Error ${err.response?.status || ""}: ${
          err.response?.data?.message || err.response?.data?.error || err.message
        }`
      );
    }
  };

  return (
    <div className="mx-auto my-8 max-w-4xl rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <h2 className="text-2xl font-semibold text-white">API Debug Panel</h2>
      <p className="mt-2 text-sm text-slate-400">Use this utility for quick manual API checks during development.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-medium text-slate-200">Method</span>
          <select value={method} onChange={(event) => setMethod(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none">
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-medium text-slate-200">Endpoint</span>
          <input value={endpoint} onChange={(event) => setEndpoint(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-medium text-slate-200">Request body (JSON)</span>
        <textarea value={requestBody} onChange={(event) => setRequestBody(event.target.value)} className="h-48 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white outline-none" />
      </label>

      <button onClick={makeRequest} className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
        Send request
      </button>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>
      ) : null}

      {response ? (
        <pre className="mt-4 overflow-auto rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-200">{response}</pre>
      ) : null}
    </div>
  );
};

export default DebugPanel;
