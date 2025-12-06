import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiDollarSign, 
  FiCalendar, FiCreditCard, FiUser, FiFilter, FiDownload 
} from 'react-icons/fi';
import { pagoService } from '../services/pagoService';
import { rentaService } from '../services/rentaService';
import { METODOS_PAGO } from '../utils/constants';
import { formatDate } from '../utils/dateUtils';
import { formatCurrency } from '../utils/formatUtils';
import { usePagination } from '../hooks/usePagination';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import Pagination from '../components/Pagination';

const Pagos = () => {
  const [pagos, setPagos] = useState([]);
  const [rentas, setRentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPago, setEditingPago] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRenta, setFilterRenta] = useState('');
  const [filterPeriodo, setFilterPeriodo] = useState('');
  const [selectedRentaInfo, setSelectedRentaInfo] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    id_renta: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    monto: '',
    metodo_pago: 'Efectivo',
    referencia: '',
  });

  useEffect(() => {
    loadPagos();
    loadRentas();
  }, []);

  const loadPagos = async () => {
    setLoading(true);
    try {
      const pagos = await pagoService.getAll();
      setPagos(pagos);
    } catch (error) {
      toast.error('Error al cargar pagos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadRentas = async () => {
    try {
      const rentas = await rentaService.getAll();
      // Mostrar solo rentas que no estén canceladas y tengan estatus_pago diferente de 'Pagado'
      const rentasPendientes = rentas.filter(r => 
        r.estatus_pago !== 'Cancelado' && r.estatus_pago !== 'Pagado'
      );
      setRentas(rentasPendientes);
    } catch (error) {
      console.error('Error al cargar rentas:', error);
      toast.error('Error al cargar rentas');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.id_renta) {
      newErrors.id_renta = 'Seleccione una renta';
    }
    
    if (!formData.fecha_pago) {
      newErrors.fecha_pago = 'Ingrese la fecha de pago';
    }
    
    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      newErrors.monto = 'Ingrese un monto válido mayor a 0';
    }
    
    // Validar que el monto no exceda la deuda pendiente
    if (selectedRentaInfo && formData.monto) {
      const monto = parseFloat(formData.monto);
      const deuda = selectedRentaInfo.monto_total - (selectedRentaInfo.total_pagado || 0);
      
      if (monto > deuda) {
        newErrors.monto = `El monto no puede exceder la deuda pendiente: ${formatCurrency(deuda)}`;
      }
    }
    
    if (!formData.metodo_pago) {
      newErrors.metodo_pago = 'Seleccione un método de pago';
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
      const pagoData = {
        id_renta: parseInt(formData.id_renta),
        fecha_pago: formData.fecha_pago,
        monto: parseFloat(formData.monto),
        metodo_pago: formData.metodo_pago,
        referencia: formData.referencia || null,
      };

      if (editingPago) {
        await pagoService.update(editingPago.id_pago, pagoData);
        toast.success('Pago actualizado correctamente');
      } else {
        await pagoService.create(pagoData);
        toast.success('Pago registrado correctamente');
      }
      setShowModal(false);
      resetForm();
      loadPagos();
      loadRentas(); // Recargar rentas para actualizar la lista
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar pago');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pago) => {
    setEditingPago(pago);
    setFormData({
      id_renta: pago.id_renta || '',
      fecha_pago: pago.fecha_pago || '',
      monto: pago.monto || '',
      metodo_pago: pago.metodo_pago || 'Efectivo',
      referencia: pago.referencia || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este pago?')) return;

    try {
      await pagoService.delete(id);
      toast.success('Pago eliminado correctamente');
      loadPagos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar pago');
    }
  };

  const handleRentaChange = (idRenta) => {
    const renta = rentas.find(r => r.id_renta === parseInt(idRenta));
    setSelectedRentaInfo(renta || null);
    setFormData({ ...formData, id_renta: idRenta, monto: renta?.monto_total || '' });
    setErrors({});
  };

  const resetForm = () => {
    setEditingPago(null);
    setSelectedRentaInfo(null);
    setErrors({});
    setFormData({
      id_renta: '',
      fecha_pago: new Date().toISOString().split('T')[0],
      monto: '',
      metodo_pago: 'Efectivo',
      referencia: '',
    });
  };

  // Obtener lista de periodos únicos para filtro
  const periodos = [...new Set(pagos.map(p => p.periodo).filter(Boolean))].sort().reverse();

  const filteredPagos = pagos.filter((pago) => {
    const clienteNombre = pago.renta?.usuario?.Persona?.nombre || '';
    const spotCodigo = pago.renta?.spot?.codigo || '';
    const matchSearch = 
      clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spotCodigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.referencia?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchRenta = !filterRenta || pago.id_renta === Number(filterRenta);
    const matchPeriodo = !filterPeriodo || pago.periodo === filterPeriodo;

    return matchSearch && matchRenta && matchPeriodo;
  });

  // Paginación
  const pagination = usePagination(filteredPagos);

  // Calcular totales
  const totalMonto = filteredPagos.reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0);
  const totalPagosMes = filteredPagos.filter(p => {
    const pagoDate = new Date(p.fecha_pago);
    const now = new Date();
    return pagoDate.getMonth() === now.getMonth() && pagoDate.getFullYear() === now.getFullYear();
  }).length;

  const getMetodoPagoIcon = (metodo) => {
    switch (metodo) {
      case 'Efectivo': return '💵';
      case 'Transferencia': return '🏦';
      case 'Tarjeta': return '💳';
      default: return '💰';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Gestión de Pagos</h1>
          <p className="text-neutral-500 mt-1">Administra los pagos de rentas</p>
        </div>
        <Button icon={FiPlus} onClick={() => setShowModal(true)}>
          Registrar Pago
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-neutral-900">{pagos.length}</p>
          <p className="text-sm text-neutral-500">Total Pagos</p>
        </Card>
        <Card className="text-center bg-success-50">
          <p className="text-2xl font-bold text-success-700">
            {formatCurrency(totalMonto)}
          </p>
          <p className="text-sm text-success-600">Monto Total</p>
        </Card>
        <Card className="text-center bg-primary-50">
          <p className="text-2xl font-bold text-primary-700">{totalPagosMes}</p>
          <p className="text-sm text-primary-600">Pagos Este Mes</p>
        </Card>
        <Card className="text-center bg-warning-50">
          <p className="text-2xl font-bold text-warning-700">{rentas.length}</p>
          <p className="text-sm text-warning-600">Rentas Activas</p>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por cliente, spot o referencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={FiSearch}
            />
          </div>
          <Select
            value={filterPeriodo}
            onChange={(e) => setFilterPeriodo(e.target.value)}
            options={periodos.map(p => ({ value: p, label: p }))}
            placeholder="Todos los períodos"
            className="w-full md:w-48"
          />
          {(filterRenta || filterPeriodo || searchTerm) && (
            <Button
              variant="secondary"
              onClick={() => {
                setSearchTerm('');
                setFilterRenta('');
                setFilterPeriodo('');
              }}
            >
              Limpiar
            </Button>
          )}
        </div>
      </Card>

      {/* Tabla de Pagos */}
      <Card>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredPagos.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <FiDollarSign className="mx-auto mb-4" size={48} />
            <p>No hay pagos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Cliente / Spot</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Período</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Monto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Método</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Referencia</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pagination.paginatedData.map((pago) => (
                  <tr key={pago.id_pago} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-neutral-400" size={14} />
                        <span className="text-sm">{formatDate(pago.fecha_pago)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <FiUser className="text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">
                            {pago.renta?.usuario?.Persona?.nombre || 'Sin asignar'}
                          </p>
                          <p className="text-xs text-neutral-500">
                            Spot: {pago.renta?.spot?.codigo_spot || '-'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                        {pago.periodo || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="text-success-500" size={16} />
                        <span className="font-semibold text-success-700">
                          {formatCurrency(pago.monto)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                        <span>{getMetodoPagoIcon(pago.metodo_pago)}</span>
                        {pago.metodo_pago}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 max-w-[200px] truncate">
                      {pago.referencia || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(pago)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(pago.id_pago)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer con total */}
            <div className="border-t bg-neutral-50 px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-neutral-600">
                Total filtrado: {formatCurrency(totalMonto)}
              </span>
            </div>
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

      {/* Modal de Crear/Editar Pago */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingPago ? 'Editar Pago' : 'Registrar Pago'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selección de Renta */}
          <Select
            label="Renta"
            name="id_renta"
            value={formData.id_renta}
            onChange={(e) => handleRentaChange(e.target.value)}
            options={rentas.map(r => ({ 
              value: r.id_renta, 
              label: `${r.usuario?.Persona?.nombre || 'Cliente'} - Spot ${r.spot?.codigo_spot || '-'} - ${formatCurrency(r.monto_total)}` 
            }))}
            placeholder="Seleccionar renta pendiente"
            required
            disabled={!!editingPago}
            error={errors.id_renta}
          />

          {/* Información de la Renta Seleccionada */}
          {selectedRentaInfo && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-medium text-primary-900">Información de la Renta</p>
              <div className="grid grid-cols-2 gap-2 text-primary-700">
                <div>
                  <p className="text-xs text-primary-600">Cliente:</p>
                  <p className="font-medium">{selectedRentaInfo.usuario?.Persona?.nombre}</p>
                </div>
                <div>
                  <p className="text-xs text-primary-600">Spot:</p>
                  <p className="font-medium">{selectedRentaInfo.spot?.codigo_spot}</p>
                </div>
                <div>
                  <p className="text-xs text-primary-600">Monto Total:</p>
                  <p className="font-semibold">{formatCurrency(selectedRentaInfo.monto_total)}</p>
                </div>
                <div>
                  <p className="text-xs text-primary-600">Tipo:</p>
                  <p className="font-medium capitalize">{selectedRentaInfo.tipo_renta}</p>
                </div>
                <div>
                  <p className="text-xs text-primary-600">Total Pagado:</p>
                  <p className="font-medium text-success-700">{formatCurrency(selectedRentaInfo.total_pagado || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-primary-600">Deuda Pendiente:</p>
                  <p className="font-semibold text-warning-700">
                    {formatCurrency(selectedRentaInfo.monto_total - (selectedRentaInfo.total_pagado || 0))}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Fecha y Monto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Fecha de Pago"
              name="fecha_pago"
              type="date"
              value={formData.fecha_pago}
              onChange={(e) => setFormData({ ...formData, fecha_pago: e.target.value })}
              required
              error={errors.fecha_pago}
            />
            <Input
              label="Monto"
              name="monto"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.monto}
              onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
              placeholder="Ingrese el monto"
              icon={FiDollarSign}
              required
              error={errors.monto}
            />
          </div>

          {/* Método de Pago */}
          <Select
            label="Método de Pago"
            name="metodo_pago"
            value={formData.metodo_pago}
            onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
            options={METODOS_PAGO.map(m => ({ value: m, label: m }))}
            required
            error={errors.metodo_pago}
          />

          {/* Referencia */}
          <Input
            label="Referencia / Notas"
            name="referencia"
            value={formData.referencia}
            onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
            placeholder="Número de transacción, notas, etc."
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setShowModal(false); resetForm(); }}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loading} icon={FiDollarSign}>
              {editingPago ? 'Actualizar' : 'Registrar Pago'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Pagos;
