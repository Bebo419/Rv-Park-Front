import api from './api';

export const pagoService = {
  /**
   * Obtiene todos los pagos, opcionalmente filtrados por renta o periodo
   * @param {number} rentaId - ID de renta para filtrar (opcional)
   * @param {string} periodo - Periodo para filtrar (opcional)
   */
  async getAll(rentaId = null, periodo = null) {
    const params = {};
    if (rentaId) params.id_renta = rentaId;
    if (periodo) params.periodo = periodo;
    
    const response = await api.get('/pagos', { params });
    // Backend retorna { success, count, data }
    return response.data.data || [];
  },

  async getById(id) {
    const response = await api.get(`/pagos/${id}`);
    return response.data.data;
  },

  async create(pagoData) {
    // El backend espera: id_renta, fecha_pago, monto (opcional), metodo_pago, referencia (opcional)
    const response = await api.post('/pagos', pagoData);
    return response.data.data;
  },

  async update(id, pagoData) {
    const response = await api.put(`/pagos/${id}`, pagoData);
    return response.data.data;
  },

  async delete(id) {
    const response = await api.delete(`/pagos/${id}`);
    return response.data;
  }
};
