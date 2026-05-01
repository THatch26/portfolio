import { useState, useCallback, useRef } from 'react';
import CollapsibleJSON from './CollapsibleJSON';
import styles from './ApiExplorer.module.css';

const ENDPOINTS = [
  { path: '/api/health', description: 'API health check and status' },
  { path: '/api/profile', description: 'Personal profile information' },
  { path: '/api/skills', description: 'Technical skills and proficiencies' },
  { path: '/api/timeline', description: 'Career timeline and experience' },
  { path: '/api/projects', description: 'GitHub projects and repositories' },
];

function ApiExplorer() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0]);
  const [response, setResponse] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const sendRequest = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setResponse(null);
    setStatusCode(null);
    setResponseTime(null);
    setError(null);

    const start = performance.now();

    try {
      const res = await fetch(selectedEndpoint.path, { signal: controller.signal });
      const elapsed = Math.round(performance.now() - start);
      setStatusCode(res.status);
      setResponseTime(elapsed);

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        setResponse(json);
      } else {
        const text = await res.text();
        setResponse(text);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        setResponseTime(Math.round(performance.now() - start));
      }
    } finally {
      setLoading(false);
    }
  }, [selectedEndpoint]);

  const handleSelectChange = useCallback((e) => {
    const found = ENDPOINTS.find((ep) => ep.path === e.target.value);
    if (found) setSelectedEndpoint(found);
    setResponse(null);
    setStatusCode(null);
    setResponseTime(null);
    setError(null);
  }, []);

  const statusClass = statusCode
    ? statusCode >= 500
      ? styles.statusError
      : statusCode >= 400
        ? styles.statusWarn
        : styles.statusOk
    : '';

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>API Explorer</h2>
      <p className={styles.subtitle}>Explore the portfolio API endpoints live</p>

      <div className={styles.controls}>
        <select
          className={styles.select}
          value={selectedEndpoint.path}
          onChange={handleSelectChange}
          aria-label="Select API endpoint"
        >
          {ENDPOINTS.map((ep) => (
            <option key={ep.path} value={ep.path}>
              {ep.path}
            </option>
          ))}
        </select>

        <button
          className={styles.sendBtn}
          onClick={sendRequest}
          disabled={loading}
          type="button"
        >
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      </div>

      <p className={styles.endpointDesc}>{selectedEndpoint.description}</p>

      {(statusCode || responseTime !== null) && (
        <div className={styles.meta}>
          {statusCode && (
            <span className={`${styles.statusBadge} ${statusClass}`}>
              {statusCode}
            </span>
          )}
          {responseTime !== null && (
            <span className={styles.timeBadge}>{responseTime} ms</span>
          )}
        </div>
      )}

      {loading && (
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner} />
          <span>Requesting...</span>
        </div>
      )}

      {error && (
        <div className={styles.responsePanel}>
          <div className={styles.errorMessage}>{error}</div>
        </div>
      )}

      {response && !loading && (
        <div className={styles.responsePanel}>
          <CollapsibleJSON data={response} depth={0} maxExpandDepth={2} />
        </div>
      )}
    </div>
  );
}

export default ApiExplorer;
