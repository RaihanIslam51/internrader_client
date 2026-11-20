import API, { getApiUrl } from '../api';

export const collectionApi = {
  start: async (data) => {
    const res = await API.post('/collection/start', data);
    return res.data;
  },
  getStatus: async (id) => {
    const res = await API.get(`/collection/status/${id}`);
    return res.data;
  },
  stop: async (id) => {
    const res = await API.post(`/collection/stop/${id}`);
    return res.data;
  },
  pause: async (id) => {
    const res = await API.post(`/collection/pause/${id}`);
    return res.data;
  },
  resume: async (id) => {
    const res = await API.post(`/collection/resume/${id}`);
    return res.data;
  },
  getRecentJobs: async () => {
    const res = await API.get('/collection/jobs');
    return res.data;
  },
};

export const leadsApi = {
  getAll: async (params = {}) => {
    const res = await API.get('/leads', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await API.get(`/leads/${id}`);
    return res.data;
  },
  update: async (id, data) => {
    const res = await API.put(`/leads/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await API.delete(`/leads/${id}`);
    return res.data;
  },
  bulkDelete: async (ids) => {
    const res = await API.post('/leads/bulk-delete', { ids });
    return res.data;
  },
  getAnalytics: async () => {
    const res = await API.get('/analytics');
    return res.data;
  },
  getExportUrl: (type, params = {}) => {
    const base = getApiUrl();
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
    const qs = query.toString();
    return `${base}/export/${type}${qs ? `?${qs}` : ''}`;
  },
};
