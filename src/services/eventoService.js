import api from './api';

export const eventoService = {
  // Obtener todos los eventos
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.id_rv_park) params.append('id_rv_park', filters.id_rv_park);
    if (filters.tipo_evento) params.append('tipo_evento', filters.tipo_evento);
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);

    const response = await api.get(`/eventos?${params.toString()}`);
    return response.data.data;
  },

  // Obtener evento por ID
  getById: async (id) => {
    const response = await api.get(`/eventos/${id}`);
    return response.data.data;
  },

  // Crear evento
  create: async (eventoData) => {
    const response = await api.post('/eventos', eventoData);
    return response.data.data;
  },

  // Actualizar evento
  update: async (id, eventoData) => {
    const response = await api.put(`/eventos/${id}`, eventoData);
    return response.data.data;
  },

  // Eliminar evento
  delete: async (id) => {
    const response = await api.delete(`/eventos/${id}`);
    return response.data;
  }
};
