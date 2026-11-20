// lib/api/engine.js — in-server discovery/scraping engine
import API from '../api';

const fail = (err, fallback) => {
  throw new Error(err.response?.data?.message || fallback);
};

export const engineApi = {
  async start(payload = {}) {
    try {
      const { data } = await API.post('/scraper/run', payload);
      return data;
    } catch (err) {
      fail(err, 'Failed to start the discovery engine');
    }
  },

  async stop() {
    try {
      const { data } = await API.post('/scraper/run/stop');
      return data;
    } catch (err) {
      fail(err, 'Failed to stop the engine');
    }
  },

  async status(runId = '') {
    const qs = runId ? `?runId=${encodeURIComponent(runId)}` : '';
    const { data } = await API.get(`/scraper/run/status${qs}`);
    return data;
  },

  async logs(runId, since = 0) {
    const params = new URLSearchParams({ since });
    if (runId) params.set('runId', runId);
    const { data } = await API.get(`/scraper/run/logs?${params}`);
    return data;
  },

  async history() {
    const { data } = await API.get('/scraper/run/history');
    return data;
  },
};
