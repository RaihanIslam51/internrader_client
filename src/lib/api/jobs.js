// lib/api/jobs.js — scraped government job circulars
import API from '../api';

const fail = (err, fallback) => {
  throw new Error(err.response?.data?.message || fallback);
};

export const jobsApi = {
  async getAll({
    page = 1,
    limit = 20,
    search = '',
    status = '',
    country = '',
    category = '',
    adStatus = '',
    hasEmail = '',
    hasPhone = '',
    jobType = '',
    jobClass = '',
    workMode = '',
    organizationId = '',
    companyId = '',
    isTargeted = '',
    outreachStatus = '',
    sort = '',
  } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (country) params.set('country', country);
    if (category) params.set('category', category);
    if (adStatus) params.set('adStatus', adStatus);
    if (hasEmail) params.set('hasEmail', hasEmail);
    if (hasPhone) params.set('hasPhone', hasPhone);
    if (jobType) params.set('jobType', jobType);
    if (jobClass) params.set('jobClass', jobClass);
    if (workMode) params.set('workMode', workMode);
    if (isTargeted !== '' && isTargeted !== undefined) params.set('isTargeted', String(isTargeted));
    if (outreachStatus) params.set('outreachStatus', outreachStatus);
    const orgId = organizationId || companyId;
    if (orgId) params.set('organizationId', orgId);
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

  async updateOutreachStatus(id, outreachStatus) {
    try {
      const { data } = await API.put(`/jobs/${id}`, { outreachStatus });
      return data;
    } catch (err) {
      fail(err, 'Failed to update outreach status');
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

  async toggleTarget(id) {
    try {
      const { data } = await API.post(`/jobs/${id}/target`);
      return data;
    } catch (err) {
      fail(err, 'Failed to toggle target status');
    }
  },

  async bulkTarget({ ids = [], isTargeted = true, all = false } = {}) {
    try {
      const { data } = await API.post('/jobs/bulk-target', { ids, isTargeted, all });
      return data;
    } catch (err) {
      fail(err, 'Failed to bulk update target status');
    }
  },
};
