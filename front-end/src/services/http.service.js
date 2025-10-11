import { authService } from './auth.service';

const BASE_URL = 'http://localhost:8080/api';

export const httpClient = {
  async fetch(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...authService.getAuthHeader(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      // ถ้า token หมดอายุ
      if (response.status === 401) {
        try {
          // พยายาม refresh token
          await authService.refreshToken();
          
          // ลองส่งคำขอใหม่อีกครั้งด้วย token ใหม่
          const newHeaders = {
            ...headers,
            ...authService.getAuthHeader(),
          };
          const retryResponse = await fetch(url, { ...options, headers: newHeaders });
          return this.handleResponse(retryResponse);
        } catch (error) {
          // ถ้า refresh token ไม่สำเร็จ ให้ logout
          authService.logout();
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      }

      return this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  async handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Network response was not ok');
    }
    return data;
  },

  get(endpoint) {
    return this.fetch(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body) {
    return this.fetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return this.fetch(endpoint, { method: 'DELETE' });
  },
};