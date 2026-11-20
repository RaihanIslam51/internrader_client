// lib/api/organizations.js — government organizations (circular sources)
import API from '../api';

const fail = (err, fallback) => {
  throw new Error(err.response?.data?.message || fallback);
};

export const organizationsApi = {
  async getAll({ page = 1, limit = 20, search = '', status = '', category = '', organizationType = '', lastScrapingStatus = '', sort = '' } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (category) params.set('category', category);
    if (organizationType) params.set('organizationType', organizationType);
    if (lastScrapingStatus) params.set('lastScrapingStatus', lastScrapingStatus);
    if (sort) params.set('sort', sort);
    const { data } = await API.get(`/organizations?${params}`);
    return data;
  },

  async getById(id) {
    const { data } = await API.get(`/organizations/${id}`);
    return data;
  },

  async getStats() {
    const { data } = await API.get('/organizations/stats');
    return data;
  },

  async create(payload) {
    try {
      const { data } = await API.post('/organizations', payload);
      return data;
    } catch (err) {
      fail(err, 'Failed to create organization');
    }
  },

  async update(id, payload) {
    try {
      const { data } = await API.put(`/organizations/${id}`, payload);
      return data;
    } catch (err) {
      fail(err, 'Failed to update organization');
    }
  },

  async deleteById(id) {
    try {
      const { data } = await API.delete(`/organizations/${id}`);
      return data;
    } catch (err) {
      fail(err, 'Failed to delete organization');
    }
  },

  async setStatus(id, status) {
    try {
      const { data } = await API.patch(`/organizations/${id}/status`, { status });
      return data;
    } catch (err) {
      fail(err, 'Failed to update organization status');
    }
  },

  async requestScrape(id) {
    try {
      const { data } = await API.patch(`/organizations/${id}/request-scrape`);
      return data;
    } catch (err) {
      fail(err, 'Failed to queue organization for scraping');
    }
  },

  async test(id) {
    try {
      const { data } = await API.post(`/organizations/${id}/test`);
      return data;
    } catch (err) {
      fail(err, 'Failed to test circular page');
    }
  },
};
