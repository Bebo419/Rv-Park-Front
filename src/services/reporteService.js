import api from './api';

export const reporteService = {
  async getOcupacion(rvParkId, fechaInicio, fechaFin) {
    const response = await api.get('/reportes/ocupacion', {
      params: { rvParkId, fechaInicio, fechaFin }
    });
    return response.data;
  },

  async getIngresos(rvParkId, fechaInicio, fechaFin) {
    const response = await api.get('/reportes/ingresos', {
      params: { rvParkId, fechaInicio, fechaFin }
    });
    return response.data;
  },

  async getRentasActivas(rvParkId) {
    const response = await api.get('/reportes/rentas-activas', {
      params: { rvParkId }
    });
    return response.data;
  },

  async getPagosPendientes(rvParkId) {
    const response = await api.get('/reportes/pagos-pendientes', {
      params: { rvParkId }
    });
    return response.data;
  }
};
