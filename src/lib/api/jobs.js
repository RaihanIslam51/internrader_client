// lib/api/jobs.js — scraped jobs & internships
import API from '../api';

const fail = (err, fallback) => {
  throw new Error(err.response?.data?.message || fallback);
};

export const jobsApi = {
  async getAll({ page = 1, limit = 20, search = '', status = '', jobType = '', workMode = '', companyId = '', sort = '' } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (jobType) params.set('jobType', jobType);
    if (workMode) params.set('workMode', workMode);
    if (companyId) params.set('companyId', companyId);
    if (sort) params.set('sort', sort);
    const { data } = await API.get(`/jobs?${params}`);
    return data;
  },

  async getById(id) {
    const { data } = await API.get(`/jobs/${id}`);
    return data;
  },

  async getStats() {
    const { data } = await API.get('/jobs/stats');
    return data;
  },

  async update(id, payload) {
    try {
      const { data } = await API.put(`/jobs/${id}`, payload);
      return data;
    } catch (err) {
      fail(err, 'Failed to update job');
    }
  },

  async deleteById(id) {
    try {
      const { data } = await API.delete(`/jobs/${id}`);
      return data;
    } catch (err) {
      fail(err, 'Failed to delete job');
    }
  },

  async deleteMany({ ids = [], all = false, filters = {} } = {}) {
    try {
      const { data } = await API.post('/jobs/bulk-delete', { ids, all, filters });
      return data;
    } catch (err) {
      fail(err, 'Failed to delete jobs');
    }
  },
};
