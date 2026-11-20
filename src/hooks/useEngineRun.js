'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { engineApi } from '../lib/api/engine';

const LOG_POLL_MS = 1000;

/**
 * Drives the in-server discovery engine: starts a run and streams log lines
 * into React state by polling the status/logs endpoints while a run is active.
 */
export function useEngineRun() {
  const [running, setRunning] = useState(false);
  const [run, setRun] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');

  const seqRef = useRef(0);
  const runIdRef = useRef(null);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);
  const pollRef = useRef(null);

  const poll = useCallback(async () => {
    try {
      const statusRes = await engineApi.status(runIdRef.current || undefined);
      if (!mountedRef.current) return;

      const activeRun = statusRes.data?.run || null;
      const isRunning = Boolean(statusRes.data?.running);
      if (activeRun) {
        runIdRef.current = activeRun.id;
        setRun(activeRun);
      }

      const logsRes = await engineApi.logs(runIdRef.current, seqRef.current);
      if (!mountedRef.current) return;
      const fresh = logsRes.data?.logs || [];
      if (fresh.length) {
        seqRef.current += fresh.length;
        setLogs((prev) => [...prev, ...fresh]);
      }

      setRunning(isRunning);
      if (isRunning) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => pollRef.current && pollRef.current(), LOG_POLL_MS);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setRunning(false);
      setError(err.message || 'Lost connection to the engine');
    }
  }, []);

  useEffect(() => {
    pollRef.current = poll;
  }, [poll]);

  // Reflect an already-running engine on mount.
  useEffect(() => {
    mountedRef.current = true;
    poll();
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [poll]);

  const start = useCallback(
    async (payload = {}) => {
      setError('');
      setLogs([]);
      seqRef.current = 0;
      try {
        const res = await engineApi.start(payload);
        const newRun = res.data;
        runIdRef.current = newRun?.id || null;
        setRun(newRun);
        setRunning(true);
        poll();
      } catch (err) {
        setError(err.message || 'Failed to start the engine');
      }
    },
    [poll]
  );

  const stop = useCallback(async () => {
    try {
      await engineApi.stop();
      setRunning(false);
      poll();
    } catch (err) {
      setError(err.message || 'Failed to stop the engine');
    }
  }, [poll]);

  return { running, run, logs, error, start, stop, refresh: poll };
}
