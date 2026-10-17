// lib/api/admin.js — super admin user management
import API from '../api';

export const adminApi = {
  async getUsers({ page = 1, limit = 20, status = '', search = '' } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    const { data } = await API.get(`/admin/users?${params}`);
    return data;
  },

  async getStats() {
    const { data } = await API.get('/admin/users/stats');
    return data;
  },

  async updateStatus(id, status, reason = '') {
    try {
      const { data } = await API.patch(`/admin/users/${id}/status`, { status, reason });
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update user');
    }
  },

  async deleteUser(id) {
    try {
      const { data } = await API.delete(`/admin/users/${id}`);
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete user');
    }
  },
};
