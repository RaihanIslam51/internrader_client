// lib/api/public.js — public government jobs API (no auth)
import API from '../api';

export const publicApi = {
  async getJobs({ page = 1, limit = 20, search = '', jobType = '', jobClass = '', organizationId = '', sort = '' } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (search) params.set('search', search);
    if (jobType) params.set('jobType', jobType);
    if (jobClass) params.set('jobClass', jobClass);
    if (organizationId) params.set('organizationId', organizationId);
    if (sort) params.set('sort', sort);
    const { data } = await API.get(`/public/jobs?${params}`);
    return data;
  },

  async getJob(id) {
    const { data } = await API.get(`/public/jobs/${id}`);
    return data;
  },

  async getStats() {
    const { data } = await API.get('/public/stats');
    return data;
  },

  async getOrganizations({ search = '', organizationType = '' } = {}) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (organizationType) params.set('organizationType', organizationType);
    const { data } = await API.get(`/public/organizations?${params}`);
    return data;
  },
};
