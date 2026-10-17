// lib/api/companies.js — career-page companies
import API from '../api';

const fail = (err, fallback) => {
  throw new Error(err.response?.data?.message || fallback);
};

export const companiesApi = {
  async getAll({ page = 1, limit = 20, search = '', status = '', country = '', category = '', lastScrapingStatus = '', sort = '' } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (country) params.set('country', country);
    if (category) params.set('category', category);
    if (lastScrapingStatus) params.set('lastScrapingStatus', lastScrapingStatus);
    if (sort) params.set('sort', sort);
    const { data } = await API.get(`/companies?${params}`);
    return data;
  },

  async getById(id) {
    const { data } = await API.get(`/companies/${id}`);
    return data;
  },

  async getStats() {
    const { data } = await API.get('/companies/stats');
    return data;
  },

  async create(payload) {
    try {
      const { data } = await API.post('/companies', payload);
      return data;
    } catch (err) {
      fail(err, 'Failed to create company');
    }
  },

  async update(id, payload) {
    try {
      const { data } = await API.put(`/companies/${id}`, payload);
      return data;
    } catch (err) {
      fail(err, 'Failed to update company');
    }
  },

  async deleteById(id) {
    try {
      const { data } = await API.delete(`/companies/${id}`);
      return data;
    } catch (err) {
      fail(err, 'Failed to delete company');
    }
  },

  async setStatus(id, status) {
    try {
      const { data } = await API.patch(`/companies/${id}/status`, { status });
      return data;
    } catch (err) {
      fail(err, 'Failed to update company status');
    }
  },

  async requestScrape(id) {
    try {
      const { data } = await API.patch(`/companies/${id}/request-scrape`);
      return data;
    } catch (err) {
      fail(err, 'Failed to queue company for scraping');
    }
  },

  async test(id) {
    try {
      const { data } = await API.post(`/companies/${id}/test`);
      return data;
    } catch (err) {
      fail(err, 'Failed to test career page');
    }
  },
};
