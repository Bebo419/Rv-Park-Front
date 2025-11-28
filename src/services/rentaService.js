import api from './api';

export const rentaService = {
  async getAll() {
    const response = await api.get('/rentas');
    // Backend retorna { success, count, data }
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

  async calcularMonto(spotId, fechaInicio, fechaFin) {
    const response = await api.post('/rentas/calcular', {
      id_spot: spotId,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    });
    return response.data;
  },

  async finalizar(id) {
    // Finalizar renta = agregar fecha_fin
    const response = await api.put(`/rentas/${id}`, {
      fecha_fin: new Date().toISOString().split('T')[0]
    });
    return response.data.data;
  }
};
