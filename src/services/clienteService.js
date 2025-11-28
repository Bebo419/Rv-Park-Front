import api from './api';

export const clienteService = {
  async getAll(search = '') {
    const params = search ? { search } : {};
    const response = await api.get('/clientes', { params });
    // Backend retorna { success, count, data }
    return response.data.data || [];
  },

  async getById(id) {
    const response = await api.get(`/clientes/${id}`);
    return response.data.data;
  },

  async create(clienteData) {
    // El backend espera: nombre, telefono, email, direccion, nombre_usuario, password_hash, rol
    const response = await api.post('/clientes', clienteData);
    return response.data.data;
  },

  async update(id, clienteData) {
    const response = await api.put(`/clientes/${id}`, clienteData);
    return response.data.data;
  },

  async delete(id) {
    const response = await api.delete(`/clientes/${id}`);
    return response.data;
  }
};
