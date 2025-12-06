import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiCalendar,
  FiMapPin, FiUser, FiDollarSign, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle
} from 'react-icons/fi';
import { rentaService } from '../services/rentaService';
import { spotService } from '../services/spotService';
import { clienteService } from '../services/clienteService';
import { rvParkService } from '../services/rvParkService';
import { pagoService } from '../services/pagoService';
import { METODOS_PAGO, ESTATUS_PAGO_COLORS } from '../utils/constants';
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
  const [rvParks, setRvParks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [selectedRenta, setSelectedRenta] = useState(null);
  const [editingRenta, setEditingRenta] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPark, setSelectedPark] = useState('');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    id_usuario: '',
    id_spot: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    tipo_renta: 'mes',
    tarifa_unitaria: '',
    duracion: 1,
    observaciones: '',
  });
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [pagoData, setPagoData] = useState({
    monto: '',
    metodo_pago: 'Efectivo',
    referencia: '',
    fecha_pago: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadRentas();
    loadClientes();
    loadRvParks();
  }, []);

  useEffect(() => {
    if (selectedPark) {
      loadSpots(selectedPark);
    } else {
      setSpots([]);
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
      toast.error('Error al cargar clientes');
    }
  };

  const loadRvParks = async () => {
    try {
      const parks = await rvParkService.getAll();
      setRvParks(parks);
    } catch (error) {
      console.error('Error al cargar RV Parks:', error);
      toast.error('Error al cargar RV Parks');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.id_usuario) newErrors.id_usuario = 'Seleccione un cliente';
    if (!formData.id_spot) newErrors.id_spot = 'Seleccione un spot';
    if (!formData.fecha_inicio) newErrors.fecha_inicio = 'Ingrese la fecha de inicio';
    if (!formData.tipo_renta) newErrors.tipo_renta = 'Seleccione el tipo de renta';
    
    if (formData.tipo_renta === 'personalizado') {
      if (!formData.fecha_fin) {
        newErrors.fecha_fin = 'Para tipo personalizado, ingrese fecha de fin';
      } else if (new Date(formData.fecha_fin) <= new Date(formData.fecha_inicio)) {
        newErrors.fecha_fin = 'La fecha de fin debe ser posterior a la de inicio';
      }
    }
    
    if (!formData.tarifa_unitaria || parseFloat(formData.tarifa_unitaria) <= 0) {
      newErrors.tarifa_unitaria = 'Ingrese una tarifa válida mayor a 0';
    }
    
    if (formData.tipo_renta !== 'personalizado') {
      if (!formData.duracion || parseInt(formData.duracion) <= 0) {
        newErrors.duracion = 'Ingrese una duración válida mayor a 0';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }
    
    setLoading(true);

    try {
      const dataToSend = {
        id_usuario: parseInt(formData.id_usuario),
        id_spot: parseInt(formData.id_spot),
        fecha_inicio: formData.fecha_inicio,
        tipo_renta: formData.tipo_renta,
        tarifa_unitaria: parseFloat(formData.tarifa_unitaria),
        observaciones: formData.observaciones || null,
      };

      // Solo enviar duracion si no es personalizado
      if (formData.tipo_renta !== 'personalizado') {
        dataToSend.duracion = parseInt(formData.duracion);
      } else {
        dataToSend.fecha_fin = formData.fecha_fin;
      }

      if (editingRenta) {
        await rentaService.update(editingRenta.id_renta, dataToSend);
        toast.success('Renta actualizada correctamente');
        setShowModal(false);
        resetForm();
        loadRentas();
      } else {
        const response = await rentaService.create(dataToSend);
        toast.success('Renta creada correctamente. ¿Desea registrar el pago ahora?');
        
        // Mostrar modal de pago con la renta recién creada
        setSelectedRenta(response.data);
        setPagoData({
          monto: response.data.monto_total || '',
          metodo_pago: 'Efectivo',
          referencia: '',
          fecha_pago: new Date().toISOString().split('T')[0],
        });
        setShowModal(false);
        setShowPagoModal(true);
        resetForm();
        loadRentas();
      }
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
      tipo_renta: renta.tipo_renta || 'mes',
      tarifa_unitaria: renta.tarifa_unitaria || '',
      duracion: renta.duracion || 1,
      observaciones: renta.observaciones || '',
    });
    if (renta.spot?.id_rv_park) {
      setSelectedPark(renta.spot.id_rv_park);
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCancelar = (renta) => {
    if (renta.estatus_pago === 'Cancelado') {
      toast.warning('Esta renta ya está cancelada');
      return;
    }
    setSelectedRenta(renta);
    setMotivoCancelacion('');
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!motivoCancelacion || motivoCancelacion.trim().length < 10) {
      toast.error('El motivo de cancelación debe tener al menos 10 caracteres');
      return;
    }

    setLoading(true);
    try {
      await rentaService.cancelar(selectedRenta.id_renta, { motivo_cancelacion: motivoCancelacion });
      toast.success('Renta cancelada exitosamente');
      setShowCancelModal(false);
      setMotivoCancelacion('');
      setSelectedRenta(null);
      loadRentas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cancelar renta');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarPago = async () => {
    if (!pagoData.monto || parseFloat(pagoData.monto) <= 0) {
      toast.error('Ingrese un monto válido mayor a 0');
      return;
    }

    setLoading(true);
    try {
      const pagoPayload = {
        id_renta: selectedRenta.id_renta,
        fecha_pago: pagoData.fecha_pago,
        monto: parseFloat(pagoData.monto),
        metodo_pago: pagoData.metodo_pago,
        referencia: pagoData.referencia || null,
      };

      await pagoService.create(pagoPayload);
      toast.success('Pago registrado exitosamente');
      setShowPagoModal(false);
      setPagoData({
        monto: '',
        metodo_pago: 'Efectivo',
        referencia: '',
        fecha_pago: new Date().toISOString().split('T')[0],
      });
      setSelectedRenta(null);
      loadRentas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrar pago');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingRenta(null);
    setSelectedPark('');
    setErrors({});
    setFormData({
      id_usuario: '',
      id_spot: '',
      fecha_inicio: new Date().toISOString().split('T')[0],
      tipo_renta: 'mes',
      tarifa_unitaria: '',
      duracion: 1,
      observaciones: '',
    });
  };

  const filteredRentas = rentas.filter((renta) => {
    const clienteNombre = renta.usuario?.Persona?.nombre || '';
    const spotCodigo = renta.spot?.codigo_spot || '';
    const tipoRenta = renta.tipo_renta || '';
    return (
      clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spotCodigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tipoRenta.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Card className="text-center bg-red-50">
          <p className="text-2xl font-bold text-red-700">
            {rentas.filter(r => r.estatus_pago === 'Cancelado').length}
          </p>
          <p className="text-sm text-red-600">Canceladas</p>
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
                              {rvParks.find(p => p.id_rv_park === renta.spot?.id_rv_park)?.nombre || ''}
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
                          {renta.estatus_pago !== 'Cancelado' && (
                            <>
                              <button
                                onClick={() => handleEdit(renta)}
                                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <FiEdit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleCancelar(renta)}
                                className="p-2 text-warning-600 hover:bg-warning-50 rounded-lg transition-colors"
                                title="Cancelar renta"
                              >
                                <FiXCircle size={18} />
                              </button>
                            </>
                          )}
                          {renta.estatus_pago === 'Cancelado' && (
                            <span className="text-xs text-neutral-400 px-2 py-1">Cancelada</span>
                          )}
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
              options={rvParks.map(p => ({ value: p.id_rv_park, label: p.nombre }))}
              required
              error={errors.park}
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
              error={errors.id_spot}
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
            error={errors.id_usuario}
          />

          {/* Fecha de Inicio */}
          <Input
            label="Fecha de Inicio"
            name="fecha_inicio"
            type="date"
            value={formData.fecha_inicio}
            onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
            required
            error={errors.fecha_inicio}
          />

          {/* Tipo de Renta */}
          <Select
            label="Tipo de Renta"
            name="tipo_renta"
            value={formData.tipo_renta}
            onChange={(e) => setFormData({ ...formData, tipo_renta: e.target.value, fecha_fin: '' })}
            options={[
              { value: 'dia', label: 'Por Día' },
              { value: 'semana', label: 'Por Semana' },
              { value: 'mes', label: 'Por Mes' },
              { value: 'personalizado', label: 'Personalizado' },
            ]}
            required
            error={errors.tipo_renta}
          />

          {/* Campos dinámicos según tipo de renta */}
          {formData.tipo_renta === 'personalizado' ? (
            <Input
              label="Fecha de Fin"
              name="fecha_fin"
              type="date"
              value={formData.fecha_fin}
              onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
              required
              error={errors.fecha_fin}
            />
          ) : (
            <Input
              label={`Duración (${formData.tipo_renta === 'dia' ? 'días' : formData.tipo_renta === 'semana' ? 'semanas' : 'meses'})`}
              name="duracion"
              type="number"
              min="1"
              value={formData.duracion}
              onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
              required
              error={errors.duracion}
            />
          )}

          {/* Tarifa Unitaria */}
          <Input
            label={`Tarifa por ${formData.tipo_renta === 'dia' ? 'Día' : formData.tipo_renta === 'semana' ? 'Semana' : formData.tipo_renta === 'mes' ? 'Mes' : 'Día'}`}
            name="tarifa_unitaria"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.tarifa_unitaria}
            onChange={(e) => setFormData({ ...formData, tarifa_unitaria: e.target.value })}
            placeholder="Ej: 1200.00"
            required
            error={errors.tarifa_unitaria}
            icon={FiDollarSign}
          />

          {/* Preview de cálculo */}
          {formData.tarifa_unitaria && (formData.duracion || formData.fecha_fin) && (() => {
            try {
              let montoEstimado = 0;
              if (formData.tipo_renta === 'personalizado' && formData.fecha_fin && formData.fecha_inicio) {
                const dias = Math.ceil((new Date(formData.fecha_fin) - new Date(formData.fecha_inicio)) / (1000 * 60 * 60 * 24));
                montoEstimado = dias * parseFloat(formData.tarifa_unitaria || 0);
              } else {
                montoEstimado = parseFloat(formData.tarifa_unitaria || 0) * parseInt(formData.duracion || 0);
              }
              
              return (
                <div className="bg-primary-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-primary-900 mb-2">Vista Previa</p>
                  <div className="text-sm space-y-1">
                    <p className="text-primary-700">
                      <strong>Monto Total Estimado:</strong> {formatCurrency(montoEstimado)}
                    </p>
                    {formData.tipo_renta !== 'personalizado' && (
                      <p className="text-primary-600">
                        {formData.duracion} {formData.tipo_renta === 'dia' ? 'días' : formData.tipo_renta === 'semana' ? 'semanas' : 'meses'} x {formatCurrency(formData.tarifa_unitaria || 0)}
                      </p>
                    )}
                  </div>
                </div>
              );
            } catch {
              return null;
            }
          })()}

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

      {/* Modal de Cancelación */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setMotivoCancelacion('');
          setSelectedRenta(null);
        }}
        title="Cancelar Renta"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 flex gap-3">
            <FiAlertCircle className="text-warning-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-warning-800">
              <p className="font-medium mb-1">¿Está seguro de cancelar esta renta?</p>
              <p>El spot será liberado automáticamente. Esta acción no se puede deshacer.</p>
            </div>
          </div>

          {selectedRenta && (
            <div className="bg-neutral-50 p-4 rounded-lg text-sm space-y-2">
              <p><strong>Cliente:</strong> {selectedRenta.usuario?.Persona?.nombre}</p>
              <p><strong>Spot:</strong> {selectedRenta.spot?.codigo_spot}</p>
              <p><strong>Monto Total:</strong> {formatCurrency(selectedRenta.monto_total)}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Motivo de Cancelación *
            </label>
            <textarea
              value={motivoCancelacion}
              onChange={(e) => setMotivoCancelacion(e.target.value)}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warning-500"
              rows={4}
              placeholder="Ingrese el motivo de la cancelación (mínimo 10 caracteres)..."
              required
              minLength={10}
            />
            <p className="text-xs text-neutral-500 mt-1">
              {motivoCancelacion.length}/10 caracteres mínimo
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCancelModal(false);
                setMotivoCancelacion('');
                setSelectedRenta(null);
              }}
            >
              Volver
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmCancel}
              loading={loading}
              disabled={!motivoCancelacion || motivoCancelacion.trim().length < 10}
            >
              Confirmar Cancelación
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Registro de Pago */}
      <Modal
        isOpen={showPagoModal}
        onClose={() => {
          setShowPagoModal(false);
          setPagoData({
            monto: '',
            metodo_pago: 'Efectivo',
            referencia: '',
            fecha_pago: new Date().toISOString().split('T')[0],
          });
          setSelectedRenta(null);
        }}
        title="Registrar Pago"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-success-50 border border-success-200 rounded-lg p-4">
            <p className="text-sm text-success-800">
              Renta creada exitosamente. Ahora puede registrar el pago inicial.
            </p>
          </div>

          {selectedRenta && (
            <div className="bg-neutral-50 p-4 rounded-lg text-sm space-y-2">
              <p><strong>Cliente:</strong> {selectedRenta.usuario?.Persona?.nombre || 'N/A'}</p>
              <p><strong>Spot:</strong> {selectedRenta.spot?.codigo_spot || 'N/A'}</p>
              <p><strong>Monto Total:</strong> {formatCurrency(selectedRenta.monto_total || 0)}</p>
              <p><strong>Estado:</strong> <span className="text-warning-600">{selectedRenta.estatus_pago || 'Pendiente'}</span></p>
            </div>
          )}

          <Input
            label="Fecha de Pago"
            name="fecha_pago"
            type="date"
            value={pagoData.fecha_pago}
            onChange={(e) => setPagoData({ ...pagoData, fecha_pago: e.target.value })}
            required
          />

          <Input
            label="Monto"
            name="monto"
            type="number"
            step="0.01"
            min="0.01"
            value={pagoData.monto}
            onChange={(e) => setPagoData({ ...pagoData, monto: e.target.value })}
            placeholder="Ingrese el monto a pagar"
            required
            icon={FiDollarSign}
          />

          <Select
            label="Método de Pago"
            name="metodo_pago"
            value={pagoData.metodo_pago}
            onChange={(e) => setPagoData({ ...pagoData, metodo_pago: e.target.value })}
            options={METODOS_PAGO.map(m => ({ value: m, label: m }))}
            required
          />

          <Input
            label="Referencia (opcional)"
            name="referencia"
            value={pagoData.referencia}
            onChange={(e) => setPagoData({ ...pagoData, referencia: e.target.value })}
            placeholder="Número de transacción, notas, etc."
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowPagoModal(false);
                setPagoData({
                  monto: '',
                  metodo_pago: 'Efectivo',
                  referencia: '',
                  fecha_pago: new Date().toISOString().split('T')[0],
                });
                setSelectedRenta(null);
              }}
            >
              Omitir por Ahora
            </Button>
            <Button
              type="button"
              onClick={handleRegistrarPago}
              loading={loading}
              icon={FiDollarSign}
            >
              Registrar Pago
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Rentas;
