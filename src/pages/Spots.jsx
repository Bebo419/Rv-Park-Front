import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { spotService } from '../services/spotService';
import { RV_PARKS, SPOT_ESTADOS } from '../utils/constants';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';

const Spots = () => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSpot, setEditingSpot] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '',
    rvParkId: '',
    estado: 'Disponible',
  });

  useEffect(() => {
    loadSpots();
  }, []);

  const loadSpots = async () => {
    setLoading(true);
    try {
      const spotsData = await spotService.getAll();

      const adaptados = spotsData.map(s => ({
        id: s.id_spot,
        codigo: s.codigo_spot,
        rvParkId: s.id_rv_park,
        estado: s.estado,
        zona: s.zona
      }));

      setSpots(adaptados);
    } catch (error) {
      toast.error('Error al cargar espacios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingSpot) {
        await spotService.update(editingSpot.id, {
          codigo_spot: formData.codigo,
          id_rv_park: formData.rvParkId,
          estado: formData.estado
        });

        toast.success('Espacio actualizado');
      } else {
        await spotService.create({
          codigo_spot: formData.codigo,
          id_rv_park: formData.rvParkId,
          estado: formData.estado
        });

        toast.success('Espacio creado');
      }
      setShowModal(false);
      resetForm();
      loadSpots();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (spot) => {
    setEditingSpot(spot);
    setFormData({
      codigo: spot.codigo,
      rvParkId: spot.rvParkId,
      estado: spot.estado,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este espacio?')) return;

    try {
      await spotService.delete(id);
      toast.success('Espacio eliminado');
      loadSpots();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const resetForm = () => {
    setEditingSpot(null);
    setFormData({ codigo: '', rvParkId: '', estado: 'Disponible' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Gestión de Espacios</h1>
          <p className="text-neutral-500 mt-1">Administra los espacios de estacionamiento</p>
        </div>
        <Button icon={FiPlus} onClick={() => setShowModal(true)}>
          Nuevo Espacio
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Código</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">RV Park</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {spots.map((spot) => (
                <tr key={spot.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">{spot.codigo}</td>
                  <td className="px-4 py-3">{RV_PARKS.find(p => p.id === spot.rvParkId)?.nombre}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${spot.estado === 'Disponible' ? 'bg-neutral-200 text-neutral-700' :
                      spot.estado === 'Pagado' ? 'bg-success-100 text-success-700' :
                        spot.estado === 'Proceso' ? 'bg-warning-100 text-warning-700' :
                          'bg-primary-100 text-primary-700'
                      }`}>
                      {spot.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => handleEdit(spot)} className="text-primary-600 hover:text-primary-800">
                      <FiEdit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(spot.id)} className="text-red-600 hover:text-red-800">
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingSpot ? 'Editar Espacio' : 'Nuevo Espacio'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Código"
            name="codigo"
            value={formData.codigo}
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
            required
          />
          <Select
            label="RV Park"
            name="rvParkId"
            value={formData.rvParkId}
            onChange={(e) => setFormData({ ...formData, rvParkId: Number(e.target.value) })}
            options={RV_PARKS.map(p => ({ value: p.id, label: p.nombre }))}
            required
          />
          <Select
            label="Estado"
            name="estado"
            value={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
            options={Object.values(SPOT_ESTADOS).map(e => ({ value: e, label: e }))}
            required
          />
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              {editingSpot ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Spots;
