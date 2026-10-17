// lib/api/scraping.js — scraping runs / reports
import API from '../api';

export const scrapingApi = {
  async getLogs({ page = 1, limit = 20, status = '', companyId = '' } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.set('status', status);
    if (companyId) params.set('companyId', companyId);
    const { data } = await API.get(`/scraper/logs?${params}`);
    return data;
  },

  async getCompanyLogs(companyId) {
    const { data } = await API.get(`/scraper/logs/${companyId}`);
    return data;
  },

  async getFailedCompanies() {
    const { data } = await API.get('/scraper/failed-companies');
    return data;
  },
};
