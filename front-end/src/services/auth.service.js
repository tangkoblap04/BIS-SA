const BASE_URL = 'http://localhost:8080/api'; // Backend API URL

export const authService = {
  async login(email, password) {
    try {
      console.log('Attempting login to:', `${BASE_URL}/login`);
      console.log('Login data:', { email, password });
      
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const error = await response.json();
        console.log('Login error response:', error);
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Login success response:', data);
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  async refreshToken() {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch(`${BASE_URL}/refresh-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Token refresh failed');

      const data = await response.json();
      localStorage.setItem('token', data.token);
      return data.token;
    } catch (error) {
      this.logout();
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },

  isHR() {
    const user = this.getCurrentUser();
    return user?.role === 'HR';
  },

  isEmployee() {
    const user = this.getCurrentUser();
    return user?.role === 'employee';
  }
};