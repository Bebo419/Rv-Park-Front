import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiCalendar,
  FiMapPin, FiUser, FiDollarSign, FiClock, FiCheckCircle, FiXCircle
} from 'react-icons/fi';
import { rentaService } from '../services/rentaService';
import { spotService } from '../services/spotService';
import { clienteService } from '../services/clienteService';
import { RV_PARKS, METODOS_PAGO, ESTATUS_PAGO_COLORS } from '../utils/constants';
import { formatDate } from '../utils/dateUtils';
import { formatCurrency } from '../utils/formatUtils';
import { usePagination } from '../hooks/usePagination';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import Pagination from '../components/Pagination';

const Rentas = () => {
  const [rentas, setRentas] = useState([]);
  const [spots, setSpots] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [editingRenta, setEditingRenta] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPark, setSelectedPark] = useState('');
  const [calculoPago, setCalculoPago] = useState(null);
  const [formData, setFormData] = useState({
    id_usuario: '',
    id_spot: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: '',
    metodo_pago: 'Efectivo',
    observaciones: '',
  });

  useEffect(() => {
    loadRentas();
    loadClientes();
  }, []);

  useEffect(() => {
    if (selectedPark) {
      loadSpots(selectedPark);
    }
  }, [selectedPark]);

  const loadRentas = async () => {
    setLoading(true);
    try {
      const rentas = await rentaService.getAll();
      setRentas(rentas);
    } catch (error) {
      toast.error('Error al cargar rentas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSpots = async (parkId) => {
    try {
      const spots = await spotService.getAll(parkId, 'Disponible');
      setSpots(spots);
    } catch (error) {
      console.error('Error al cargar spots:', error);
    }
  };

  const loadClientes = async () => {
    try {
      const clientes = await clienteService.getAll();
      setClientes(clientes);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const handleCalcMonto = async () => {
    if (!formData.fecha_inicio) {
      toast.error('Ingrese la fecha de inicio');
      return;
    }
    try {
      const response = await rentaService.calcularMonto(
        formData.id_spot,
        formData.fecha_inicio,
        formData.fecha_fin || null
      );
      setCalculoPago(response.calculoPago);
      setShowCalcModal(true);
    } catch {
      toast.error('Error al calcular monto');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingRenta) {
        await rentaService.update(editingRenta.id_renta, formData);
        toast.success('Renta actualizada correctamente');
      } else {
        const response = await rentaService.create(formData);
        if (response.calculoPago) {
          toast.success(
            `Renta creada. Primer pago: ${formatCurrency(response.calculoPago.monto)} (${response.calculoPago.diasRestantes} días)`
          );
        } else {
          toast.success('Renta creada correctamente');
        }
      }
      setShowModal(false);
      resetForm();
      loadRentas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar renta');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (renta) => {
    setEditingRenta(renta);
    setFormData({
      id_usuario: renta.id_usuario || '',
      id_spot: renta.id_spot || '',
      fecha_inicio: renta.fecha_inicio || '',
      fecha_fin: renta.fecha_fin || '',
      metodo_pago: renta.metodo_pago || 'Efectivo',
      observaciones: renta.observaciones || '',
    });
    if (renta.spot?.id_rv_park) {
      setSelectedPark(renta.spot.id_rv_park);
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta renta? El spot volverá a estar disponible.')) return;

    try {
      await rentaService.delete(id);
      toast.success('Renta eliminada correctamente');
      loadRentas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar renta');
    }
  };

  const handleFinalizar = async (id) => {
    if (!window.confirm('¿Está seguro de finalizar esta renta?')) return;

    try {
      await rentaService.finalizar(id);
      toast.success('Renta finalizada correctamente');
      loadRentas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al finalizar renta');
    }
  };

  const resetForm = () => {
    setEditingRenta(null);
    setSelectedPark('');
    setCalculoPago(null);
    setFormData({
      id_usuario: '',
      id_spot: '',
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: '',
      metodo_pago: 'Efectivo',
      observaciones: '',
    });
  };

  const filteredRentas = rentas.filter((renta) => {
    const clienteNombre = renta.usuario?.Persona?.nombre || '';
    const spotCodigo = renta.spot?.codigo || '';
    return (
      clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spotCodigo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Paginación
  const pagination = usePagination(filteredRentas);

  const getStatusColor = (status) => {
    return ESTATUS_PAGO_COLORS[status] || { bg: 'bg-neutral-100', text: 'text-neutral-700' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Gestión de Rentas</h1>
          <p className="text-neutral-500 mt-1">Administra las rentas de espacios</p>
        </div>
        <Button icon={FiPlus} onClick={() => setShowModal(true)}>
          Nueva Renta
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-neutral-900">{rentas.length}</p>
          <p className="text-sm text-neutral-500">Total Rentas</p>
        </Card>
        <Card className="text-center bg-success-50">
          <p className="text-2xl font-bold text-success-700">
            {rentas.filter(r => r.estatus_pago === 'Pagado').length}
          </p>
          <p className="text-sm text-success-600">Pagadas</p>
        </Card>
        <Card className="text-center bg-warning-50">
          <p className="text-2xl font-bold text-warning-700">
            {rentas.filter(r => r.estatus_pago === 'Pendiente').length}
          </p>
          <p className="text-sm text-warning-600">Pendientes</p>
        </Card>
        <Card className="text-center bg-primary-50">
          <p className="text-2xl font-bold text-primary-700">
            {rentas.filter(r => !r.fecha_fin).length}
          </p>
          <p className="text-sm text-primary-600">Activas</p>
        </Card>
      </div>

      {/* Búsqueda */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por cliente o código de spot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={FiSearch}
            />
          </div>
        </div>
      </Card>

      {/* Tabla de Rentas */}
      <Card>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredRentas.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <FiCalendar className="mx-auto mb-4" size={48} />
            <p>No hay rentas registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Spot</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Periodo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Monto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pagination.paginatedData.map((renta) => {
                  const statusColor = getStatusColor(renta.estatus_pago);
                  return (
                    <tr key={renta.id_renta} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <FiUser className="text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900">
                              {renta.usuario?.Persona?.nombre || 'Sin asignar'}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {renta.usuario?.Persona?.telefono || ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FiMapPin className="text-neutral-400" size={16} />
                          <div>
                            <p className="font-medium">{renta.spot?.codigo_spot || '-'}</p>
                            <p className="text-xs text-neutral-500">
                              {RV_PARKS.find(p => p.id === renta.spot?.id_rv_park)?.nombre || ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm">
                          <FiCalendar className="text-neutral-400" size={14} />
                          <div>
                            <p>{formatDate(renta.fecha_inicio)}</p>
                            {renta.fecha_fin ? (
                              <p className="text-neutral-500">al {formatDate(renta.fecha_fin)}</p>
                            ) : (
                              <p className="text-primary-600 text-xs">En curso</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FiDollarSign className="text-success-500" size={16} />
                          <span className="font-semibold text-neutral-900">
                            {formatCurrency(renta.monto_total)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                          {renta.estatus_pago === 'Pagado' ? <FiCheckCircle size={12} /> : <FiClock size={12} />}
                          {renta.estatus_pago}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {!renta.fecha_fin && (
                            <button
                              onClick={() => handleFinalizar(renta.id_renta)}
                              className="p-2 text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                              title="Finalizar renta"
                            >
                              <FiCheckCircle size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(renta)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(renta.id_renta)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              pageSize={pagination.pageSize}
              totalItems={pagination.totalItems}
              startIndex={pagination.startIndex}
              endIndex={pagination.endIndex}
              onPageChange={pagination.goToPage}
              onPageSizeChange={pagination.changePageSize}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
            />
          </div>
        )}
      </Card>

      {/* Modal de Crear/Editar Renta */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingRenta ? 'Editar Renta' : 'Nueva Renta'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selección de Park y Spot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="RV Park"
              name="park"
              value={selectedPark}
              onChange={(e) => {
                setSelectedPark(e.target.value);
                setFormData({ ...formData, id_spot: '' });
              }}
              options={RV_PARKS.map(p => ({ value: p.id, label: p.nombre }))}
              required
            />
            <Select
              label="Espacio Disponible"
              name="id_spot"
              value={formData.id_spot}
              onChange={(e) => setFormData({ ...formData, id_spot: Number(e.target.value) })}
              options={spots.map(s => ({ value: s.id_spot, label: s.codigo_spot }))}
              placeholder={selectedPark ? 'Seleccionar espacio' : 'Primero seleccione un Park'}
              disabled={!selectedPark}
              required
            />
          </div>

          {/* Selección de Cliente */}
          <Select
            label="Cliente"
            name="id_usuario"
            value={formData.id_usuario}
            onChange={(e) => setFormData({ ...formData, id_usuario: Number(e.target.value) })}
            options={clientes.map(c => ({
              value: c.usuario?.id_usuario || c.id_usuario,
              label: c.nombre || c.Persona?.nombre
            }))}
            required
          />

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Fecha de Inicio"
              name="fecha_inicio"
              type="date"
              value={formData.fecha_inicio}
              onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
              required
            />
            <Input
              label="Fecha de Fin (opcional)"
              name="fecha_fin"
              type="date"
              value={formData.fecha_fin}
              onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
            />
          </div>

          {/* Método de Pago */}
          <Select
            label="Método de Pago"
            name="metodo_pago"
            value={formData.metodo_pago}
            onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
            options={METODOS_PAGO.map(m => ({ value: m, label: m }))}
          />

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Notas adicionales sobre la renta..."
            />
          </div>

          {/* Botón calcular monto */}
          {!editingRenta && formData.fecha_inicio && (
            <div className="bg-neutral-50 p-4 rounded-lg">
              <Button
                type="button"
                variant="outline"
                onClick={handleCalcMonto}
                icon={FiDollarSign}
              >
                Calcular Monto del Primer Pago
              </Button>
              {calculoPago && (
                <div className="mt-3 text-sm">
                  <p className="text-neutral-600">
                    <strong>Monto a pagar:</strong> {formatCurrency(calculoPago.monto)}
                  </p>
                  <p className="text-neutral-500">
                    {calculoPago.diasRestantes} días restantes del mes (período: {calculoPago.periodo})
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setShowModal(false); resetForm(); }}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              {editingRenta ? 'Actualizar' : 'Crear Renta'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Cálculo */}
      <Modal
        isOpen={showCalcModal}
        onClose={() => setShowCalcModal(false)}
        title="Cálculo de Pago"
        size="sm"
      >
        {calculoPago && (
          <div className="space-y-4">
            <div className="bg-success-50 p-4 rounded-lg text-center">
              <p className="text-sm text-success-600">Monto del Primer Pago</p>
              <p className="text-3xl font-bold text-success-700">
                {formatCurrency(calculoPago.monto)}
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Días restantes del mes:</strong> {calculoPago.diasRestantes}</p>
              <p><strong>Último día del mes:</strong> {calculoPago.ultimoDiaMes}</p>
              <p><strong>Período:</strong> {calculoPago.periodo}</p>
            </div>
            <Button fullWidth onClick={() => setShowCalcModal(false)}>
              Entendido
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Rentas;
