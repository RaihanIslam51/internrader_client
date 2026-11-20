// lib/api/scraping.js — scraping runs / reports
import API from '../api';

export const scrapingApi = {
  async getLogs({ page = 1, limit = 20, status = '', organizationId = '', companyId = '' } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.set('status', status);
    const orgId = organizationId || companyId;
    if (orgId) params.set('organizationId', orgId);
    const { data } = await API.get(`/scraper/logs?${params}`);
    return data;
  },

  async getOrganizationLogs(organizationId) {
    const { data } = await API.get(`/scraper/logs/${organizationId}`);
    return data;
  },

  async getFailedOrganizations() {
    const { data } = await API.get('/scraper/failed-organizations');
    return data;
  },

  // legacy aliases
  async getCompanyLogs(organizationId) {
    return this.getOrganizationLogs(organizationId);
  },
  async getFailedCompanies() {
    return this.getFailedOrganizations();
  },
};
