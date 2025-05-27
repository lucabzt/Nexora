import axios from 'axios';

const API_URL = '/api';

class AuthService {
  async login(username, password) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await axios.post(`${API_URL}/token`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (response.data.access_token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  }

  async register(username, email, password) {
    return axios.post(`${API_URL}/register`, {
      username,
      email,
      password,
    });
  }

  logout() {
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  getAuthHeader() {
    const user = this.getCurrentUser();
    if (user && user.access_token) {
      return { Authorization: `Bearer ${user.access_token}` };
    } else {
      return {};
    }
  }
}

export default new AuthService();