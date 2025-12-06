import api from './api';

export const rentaService = {
  async getAll() {
    const response = await api.get('/rentas');
    return response.data.data || [];
  },

  async getById(id) {
    const response = await api.get(`/rentas/${id}`);
    return response.data.data;
  },

  async create(rentaData) {
    const response = await api.post('/rentas', rentaData);
    return response.data;
  },

  async update(id, rentaData) {
    const response = await api.put(`/rentas/${id}`, rentaData);
    return response.data.data;
  },

  async delete(id) {
    const response = await api.delete(`/rentas/${id}`);
    return response.data;
  },

  async calcularMonto(id_spot, fecha_inicio, fecha_fin) {
    const response = await api.post('/rentas/calcular', {
      id_spot,
      fecha_inicio,
      fecha_fin
    });
    return response.data;
  },

  async finalizar(id) {
    const response = await api.put(`/rentas/finalizar/${id}`);
    return response.data.data;
  },

  async cancelar(id, data) {
    const response = await api.post(`/rentas/${id}/cancelar`, data);
    return response.data;
  }
};
