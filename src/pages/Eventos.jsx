import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiMapPin, FiFilter } from 'react-icons/fi';
import { eventoService } from '../services/eventoService';
import { rvParkService } from '../services/rvParkService';
import { formatDateTime } from '../utils/dateUtils';
import { usePagination } from '../hooks/usePagination';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import Pagination from '../components/Pagination';

const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [rvParks, setRvParks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEvento, setEditingEvento] = useState(null);
  const [filters, setFilters] = useState({
    id_rv_park: '',
    tipo_evento: ''
  });
  const [formData, setFormData] = useState({
    id_rv_park: '',
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    ubicacion: '',
    tipo_evento: 'otro'
  });

  const tiposEvento = [
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'festivo', label: 'Festivo' },
    { value: 'reunion', label: 'Reunión' },
    { value: 'otro', label: 'Otro' }
  ];

  const getEventoTypeColor = (tipo) => {
    const colors = {
      mantenimiento: 'bg-orange-100 text-orange-800',
      festivo: 'bg-green-100 text-green-800',
      reunion: 'bg-blue-100 text-blue-800',
      otro: 'bg-gray-100 text-gray-800'
    };
    return colors[tipo] || colors.otro;
  };

  useEffect(() => {
    loadEventos();
    loadRvParks();
  }, []);

  useEffect(() => {
    loadEventos();
  }, [filters]);

  const loadEventos = async () => {
    setLoading(true);
    try {
      const data = await eventoService.getAll(filters);
      setEventos(data);
    } catch (error) {
      toast.error('Error al cargar eventos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadRvParks = async () => {
    try {
      const data = await rvParkService.getAll();
      setRvParks(data);
    } catch (error) {
      console.error('Error al cargar RV Parks:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar fechas
      if (new Date(formData.fecha_fin) <= new Date(formData.fecha_inicio)) {
        toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
        setLoading(false);
        return;
      }

      if (editingEvento) {
        await eventoService.update(editingEvento.id_evento, formData);
        toast.success('Evento actualizado correctamente');
      } else {
        await eventoService.create(formData);
        toast.success('Evento creado correctamente');
      }
      setShowModal(false);
      resetForm();
      loadEventos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar evento');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (evento) => {
    setEditingEvento(evento);
    // Formatear fechas para el input datetime-local
    const formatForInput = (dateString) => {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    };

    setFormData({
      id_rv_park: evento.id_rv_park || '',
      titulo: evento.titulo || '',
      descripcion: evento.descripcion || '',
      fecha_inicio: formatForInput(evento.fecha_inicio),
      fecha_fin: formatForInput(evento.fecha_fin),
      ubicacion: evento.ubicacion || '',
      tipo_evento: evento.tipo_evento || 'otro'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este evento?')) return;

    try {
      await eventoService.delete(id);
      toast.success('Evento eliminado correctamente');
      loadEventos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar evento');
    }
  };

  const resetForm = () => {
    setEditingEvento(null);
    setFormData({
      id_rv_park: '',
      titulo: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      ubicacion: '',
      tipo_evento: 'otro'
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      id_rv_park: '',
      tipo_evento: ''
    });
  };

  // Paginación
  const pagination = usePagination(eventos);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Gestión de Eventos</h1>
          <p className="text-neutral-500 mt-1">Administra los eventos de los RV Parks</p>
        </div>
        <Button icon={FiPlus} onClick={() => setShowModal(true)}>
          Nuevo Evento
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FiFilter className="text-neutral-500" />
            <h3 className="font-medium text-neutral-900">Filtros</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="RV Park"
              name="filter_rv_park"
              value={filters.id_rv_park}
              onChange={(e) => handleFilterChange('id_rv_park', e.target.value)}
              options={[
                { value: '', label: 'Todos los RV Parks' },
                ...rvParks.map(park => ({ value: String(park.id_rv_park), label: park.nombre }))
              ]}
            />
            <Select
              label="Tipo de Evento"
              name="filter_tipo_evento"
              value={filters.tipo_evento}
              onChange={(e) => handleFilterChange('tipo_evento', e.target.value)}
              options={[{ value: '', label: 'Todos los tipos' }, ...tiposEvento]}
            />
            <div className="flex items-end">
              <Button variant="secondary" onClick={clearFilters} className="w-full">
                Limpiar Filtros
              </Button>
            </div>
          </div>
          <div className="text-sm text-neutral-500">
            {pagination.totalItems} evento(s) encontrado(s)
          </div>
        </div>
      </Card>

      {/* Lista de Eventos */}
      <Card>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : eventos.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <FiCalendar className="mx-auto mb-4" size={48} />
            <p>No hay eventos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Evento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">RV Park</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Fecha Inicio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Fecha Fin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Ubicación</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pagination.paginatedData.map((evento) => (
                  <tr key={evento.id_evento} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-neutral-900">{evento.titulo}</p>
                        {evento.descripcion && (
                          <p className="text-xs text-neutral-500 mt-1 truncate max-w-[200px]">
                            {evento.descripcion}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-neutral-600">
                        <FiMapPin size={14} />
                        {evento.rvPark?.nombre || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventoTypeColor(evento.tipo_evento)}`}>
                        {tiposEvento.find(t => t.value === evento.tipo_evento)?.label || evento.tipo_evento}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-600 text-sm">
                      {formatDateTime(evento.fecha_inicio)}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 text-sm">
                      {formatDateTime(evento.fecha_fin)}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 text-sm">
                      {evento.ubicacion || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(evento)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(evento.id_evento)}
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
          </div>
        )}
      </Card>

      {/* Paginación */}
      {!loading && eventos.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.setCurrentPage}
        />
      )}

      {/* Modal para crear/editar evento */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingEvento ? 'Editar Evento' : 'Nuevo Evento'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="RV Park"
            name="id_rv_park"
            value={formData.id_rv_park}
            onChange={(e) => setFormData({ ...formData, id_rv_park: Number(e.target.value) })}
            required
            options={[
              { value: '', label: 'Seleccione un RV Park' },
              ...rvParks.map(park => ({ value: park.id_rv_park, label: park.nombre }))
            ]}
          />

          <Input
            label="Título"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            required
            minLength={3}
            maxLength={100}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">
              Descripción
            </label>
            <textarea
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              maxLength={1000}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha y Hora de Inicio"
              type="datetime-local"
              value={formData.fecha_inicio}
              onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
              required
            />

            <Input
              label="Fecha y Hora de Fin"
              type="datetime-local"
              value={formData.fecha_fin}
              onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
              required
            />
          </div>

          <Input
            label="Ubicación"
            value={formData.ubicacion}
            onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
            maxLength={255}
          />

          <Select
            label="Tipo de Evento"
            name="tipo_evento"
            value={formData.tipo_evento}
            onChange={(e) => setFormData({ ...formData, tipo_evento: e.target.value })}
            required
            options={tiposEvento}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : editingEvento ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Eventos;
