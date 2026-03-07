// RootIB: RB-20260307022444-4FBB6259
import React, { useEffect, useState } from "react";
import axios from "axios";

// When running via Vite proxy the base is empty; for production set VITE_API_BASE
const API_BASE = import.meta.env.VITE_API_BASE || "";

function PageCard({ page }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 16,
        marginBottom: 16
      }}
    >
      <h2 style={{ margin: "0 0 4px" }}>{page.name}</h2>
      <p style={{ fontSize: 12, color: "#666", margin: "0 0 8px" }}>{page.path}</p>
      {page.summary && (
        <p style={{ margin: "0 0 6px" }}>
          <strong>Summary:</strong> {page.summary}
        </p>
      )}
      {page.enhanced_description && (
        <p style={{ margin: "0 0 6px" }}>
          <strong>Enhanced:</strong> {page.enhanced_description}
        </p>
      )}
      {page.video_url ? (
        <div style={{ marginTop: 10 }}>
          <video
            src={page.video_url}
            controls
            style={{ maxWidth: "100%", borderRadius: 8 }}
          />
        </div>
      ) : (
        <p style={{ color: "#999", margin: "8px 0 0" }}>No video yet.</p>
      )}
    </div>
  );
}

function App() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/pages`);
      setPages(res.data);
    } catch (err) {
      setError("Failed to load pages. Is the backend running?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function runPipeline() {
    setRunning(true);
    setError(null);
    try {
      // 10-minute timeout — large repos can take a while
      await axios.post(`${API_BASE}/api/pipeline/run`, null, { timeout: 600_000 });
      await fetchPages();
    } catch (err) {
      setError(`Pipeline failed: ${err.response?.data?.error || err.message}`);
      console.error(err);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: "system-ui", maxWidth: 900, margin: "0 auto" }}>
      <h1>RepoTalker – Repo Guide</h1>

      <button
        onClick={runPipeline}
        disabled={running || loading}
        style={{ padding: "10px 20px", fontSize: 14, cursor: running ? "not-allowed" : "pointer" }}
      >
        {running ? "Running pipeline…" : "Run full pipeline (scan + describe + video)"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: 12 }}>{error}</p>
      )}

      {loading ? (
        <div style={{ padding: 20 }}>Loading pages…</div>
      ) : (
        <div style={{ marginTop: 20 }}>
          {pages.length === 0 ? (
            <p style={{ color: "#666" }}>
              No pages found. Click <strong>Run full pipeline</strong> to scan the repository.
            </p>
          ) : (
            pages.map((page) => <PageCard key={page.id} page={page} />)
          )}
        </div>
      )}
    </div>
  );
}

export default App;
