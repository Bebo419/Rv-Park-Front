import api from './api';

export const spotService = {
  async getAll(rvParkId, estado = null) {
    const params = {};
    if (rvParkId) params.id_rv_park = rvParkId;
    if (estado) params.estado = estado;

    const response = await api.get(`/spots`, { params });
    return response.data.data;
  },

  async getById(id) {
    const response = await api.get(`/spots/${id}`);
    return response.data.data;
  },

  async create(spotData) {
    const response = await api.post('/spots', spotData);
    return response.data.data;
  },

  async update(id, spotData) {
    const response = await api.put(`/spots/${id}`, spotData);
    return response.data.data;
  },

  async delete(id) {
    const response = await api.delete(`/spots/${id}`);
    return response.data;
  },

  // Endpoints especiales del backend
  async getZonas() {
    const response = await api.get('/spots/zonas');
    return response.data.data;
  },

  async generarSpots() {
    const response = await api.get('/spots/generar-spots');
    return response.data;
  },

  async apartarSpot(id) {
    const response = await api.post(`/spots/apartar-spot/${id}`);
    return response.data.data;
  },

  async cancelarSpot(id) {
    const response = await api.post(`/spots/cancelar-spot/${id}`);
    return response.data.data;
  }
};
