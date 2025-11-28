import api from './api';

export const authService = {
  async login(nombre_usuario, password) {
    const response = await api.post('/auth/login', { nombre_usuario, password });
    const { data } = response.data;

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));

    return { token: data.token, user: data };
  }
  ,

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === "undefined") return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error("JSON inválido en localStorage:", error);
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  hasRole(role) {
    const user = this.getCurrentUser();
    return user?.rol === role;
  },

  hasAnyRole(roles) {
    const user = this.getCurrentUser();
    return roles.includes(user?.rol);
  }
};
