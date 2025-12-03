import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiMapPin, 
  FiPhone, FiMail, FiCalendar, FiGrid 
} from 'react-icons/fi';
import { rvParkService } from '../services/rvParkService';
import { formatDate } from '../utils/dateUtils';
import { usePagination } from '../hooks/usePagination';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Pagination from '../components/Pagination';

const RvParks = () => {
  const [rvParks, setRvParks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingRvPark, setEditingRvPark] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewCodes, setPreviewCodes] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    generar_spots: false,
    cantidad_spots: 150
  });

  useEffect(() => {
    loadRvParks();
  }, []);

  // Generar preview de códigos
  useEffect(() => {
    if (formData.generar_spots && formData.cantidad_spots > 0) {
      generatePreview();
    } else {
      setPreviewCodes([]);
    }
  }, [formData.generar_spots, formData.cantidad_spots]);

  const loadRvParks = async () => {
    setLoading(true);
    try {
      const parks = await rvParkService.getAll();
      setRvParks(parks);
    } catch (error) {
      toast.error('Error al cargar RV Parks');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = () => {
    const cantidad = parseInt(formData.cantidad_spots);
    if (!cantidad || cantidad <= 0 || cantidad > 500) return;

    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const codes = [];
    let letraIndex = 0;
    let numero = 1;

    for (let i = 0; i < Math.min(cantidad, 10); i++) { // Mostrar solo los primeros 10
      const letra = letras[letraIndex];
      const codigo = `${letra}${numero.toString().padStart(2, '0')}`;
      codes.push(codigo);

      numero++;
      if (numero > 99) {
        numero = 1;
        letraIndex++;
      }
    }

    setPreviewCodes(codes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        nombre: formData.nombre.trim(),
        direccion: formData.direccion.trim(),
        telefono: formData.telefono.trim(),
        email: formData.email.trim(),
      };

      // Solo agregar datos de generación si está activo
      if (formData.generar_spots) {
        dataToSend.generar_spots = true;
        dataToSend.cantidad_spots = parseInt(formData.cantidad_spots);
      }

      if (editingRvPark) {
        await rvParkService.update(editingRvPark.id_rv_park, dataToSend);
        toast.success('RV Park actualizado correctamente');
      } else {
        const response = await rvParkService.create(dataToSend);
        if (response.spots_generados) {
          toast.success(
            `RV Park creado con ${response.spots_generados} spots generados automáticamente`
          );
        } else {
          toast.success('RV Park creado correctamente');
        }
      }
      setShowModal(false);
      resetForm();
      loadRvParks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar RV Park');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rvPark) => {
    setEditingRvPark(rvPark);
    setFormData({
      nombre: rvPark.nombre || '',
      direccion: rvPark.direccion || '',
      telefono: rvPark.telefono || '',
      email: rvPark.email || '',
      generar_spots: false,
      cantidad_spots: 150
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este RV Park? Se eliminarán todos sus spots.')) return;

    try {
      await rvParkService.delete(id);
      toast.success('RV Park eliminado correctamente');
      loadRvParks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar RV Park');
    }
  };

  const resetForm = () => {
    setEditingRvPark(null);
    setPreviewCodes([]);
    setFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      generar_spots: false,
      cantidad_spots: 150
    });
  };

  const filteredRvParks = rvParks.filter((park) =>
    park.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    park.direccion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pagination = usePagination(filteredRvParks);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Gestión de RV Parks</h1>
          <p className="text-neutral-500 mt-1">Administra los parques RV del sistema</p>
        </div>
        <Button icon={FiPlus} onClick={() => setShowModal(true)}>
          Nuevo RV Park
        </Button>
      </div>

      {/* Búsqueda */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={FiSearch}
            />
          </div>
          <div className="text-sm text-neutral-500">
            {pagination.totalItems} parque(s) encontrado(s)
          </div>
        </div>
      </Card>

      {/* Grid de RV Parks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredRvParks.length === 0 ? (
          <div className="col-span-full text-center py-12 text-neutral-500">
            <FiMapPin className="mx-auto mb-4" size={48} />
            <p>No hay RV Parks registrados</p>
          </div>
        ) : (
          pagination.paginatedData.map((park) => (
            <Card key={park.id_rv_park} className="hover:shadow-lg transition-shadow">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-neutral-900">{park.nombre}</h3>
                    <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                      <FiCalendar size={12} />
                      Desde: {formatDate(park.fecha_registro)}
                    </p>
                  </div>
                </div>

                {/* Información */}
                <div className="space-y-2 flex-1">
                  {park.direccion && (
                    <div className="flex items-start gap-2 text-sm text-neutral-600">
                      <FiMapPin size={16} className="mt-0.5" />
                      <span className="flex-1">{park.direccion}</span>
                    </div>
                  )}
                  {park.telefono && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <FiPhone size={14} />
                      <span>{park.telefono}</span>
                    </div>
                  )}
                  {park.email && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <FiMail size={14} />
                      <span className="truncate">{park.email}</span>
                    </div>
                  )}
                  {park.spots && (
                    <div className="flex items-center gap-2 text-sm text-primary-600 font-medium mt-3 pt-3 border-t">
                      <FiGrid size={14} />
                      <span>{park.spots.length} spots</span>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={FiEdit2}
                    onClick={() => handleEdit(park)}
                    className="flex-1"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={FiTrash2}
                    onClick={() => handleDelete(park.id_rv_park)}
                    className="flex-1 text-danger-600 hover:bg-danger-50"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Paginación */}
      {filteredRvParks.length > 0 && (
        <Pagination {...pagination} />
      )}

      {/* Modal Formulario */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingRvPark ? 'Editar RV Park' : 'Nuevo RV Park'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre *"
            name="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Nombre del RV Park"
            required
          />

          <Input
            label="Dirección"
            name="direccion"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            placeholder="Dirección completa"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="1234567890"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contacto@rvpark.com"
            />
          </div>

          {!editingRvPark && (
            <>
              <div className="border-t pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.generar_spots}
                    onChange={(e) => setFormData({ ...formData, generar_spots: e.target.checked })}
                    className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="font-medium text-neutral-900">
                    Generar spots automáticamente
                  </span>
                </label>
              </div>

              {formData.generar_spots && (
                <div className="bg-primary-50 p-4 rounded-lg space-y-3">
                  <Input
                    label="Cantidad de Spots"
                    name="cantidad_spots"
                    type="number"
                    min="1"
                    max="500"
                    value={formData.cantidad_spots}
                    onChange={(e) => setFormData({ ...formData, cantidad_spots: e.target.value })}
                    placeholder="150"
                  />

                  {previewCodes.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-neutral-700 mb-2">
                        Preview (primeros 10 códigos):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {previewCodes.map((code, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-white border border-primary-200 rounded text-xs font-mono text-primary-700"
                          >
                            {code}
                          </span>
                        ))}
                        {formData.cantidad_spots > 10 && (
                          <span className="px-2 py-1 text-xs text-neutral-500">
                            ... y {formData.cantidad_spots - 10} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Guardando...' : editingRvPark ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RvParks;
