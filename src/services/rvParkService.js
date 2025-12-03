import api from './api';

export const rvParkService = {
  /**
   * Obtiene todos los RV Parks
   */
  async getAll() {
    const response = await api.get('/rv-parks');
    return response.data.data || [];
  },

  /**
   * Obtiene un RV Park por ID
   */
  async getById(id) {
    const response = await api.get(`/rv-parks/${id}`);
    return response.data.data;
  },

  /**
   * Crea un nuevo RV Park con opción de generar spots automáticamente
   * @param {Object} rvParkData - Datos del RV Park
   * @param {string} rvParkData.nombre - Nombre del RV Park (único)
   * @param {string} rvParkData.direccion - Dirección física
   * @param {string} rvParkData.telefono - Teléfono de contacto
   * @param {string} rvParkData.email - Email de contacto
   * @param {boolean} rvParkData.generar_spots - Si genera spots automáticamente
   * @param {number} rvParkData.cantidad_spots - Número de spots a generar (1-500)
   */
  async create(rvParkData) {
    const response = await api.post('/rv-parks', rvParkData);
    return response.data;
  },

  /**
   * Actualiza un RV Park existente
   */
  async update(id, rvParkData) {
    const response = await api.put(`/rv-parks/${id}`, rvParkData);
    return response.data.data;
  },

  /**
   * Elimina un RV Park
   */
  async delete(id) {
    const response = await api.delete(`/rv-parks/${id}`);
    return response.data;
  }
};
