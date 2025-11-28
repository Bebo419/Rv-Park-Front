import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiFilter, FiRefreshCw } from 'react-icons/fi';
import { spotService } from '../services/spotService';
import { RV_PARKS, SPOT_ESTADOS } from '../utils/constants';
import SpotCard from '../components/SpotCard';
import Card from '../components/Card';
import Select from '../components/Select';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { formatDate } from '../utils/dateUtils';
import { formatCurrency } from '../utils/formatUtils';

const Dashboard = () => {
  const [spots, setSpots] = useState([]);
  const [selectedPark, setSelectedPark] = useState(RV_PARKS[0].id);
  const [filterEstado, setFilterEstado] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    disponibles: 0,
    pagados: 0,
    enProceso: 0,
    caliche: 0,
  });

  useEffect(() => {
    loadSpots();
  }, [selectedPark, filterEstado]);

  const loadSpots = async () => {
    setLoading(true);
    try {
      const data = await spotService.getAll(selectedPark, filterEstado || null);
      setSpots(data);
      calculateStats(data);
      
      // Guardar en localStorage para soporte offline
      localStorage.setItem(`spots_park_${selectedPark}`, JSON.stringify(data));
    } catch (error) {
      toast.error('Error al cargar espacios');
      // Intentar cargar desde cache offline
      const cached = localStorage.getItem(`spots_park_${selectedPark}`);
      if (cached) {
        const cachedData = JSON.parse(cached);
        setSpots(cachedData);
        calculateStats(cachedData);
        toast.info('Mostrando datos offline');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      disponibles: data.filter(s => s.estado === 'Disponible').length,
      pagados: data.filter(s => s.estado === 'Pagado').length,
      enProceso: data.filter(s => s.estado === 'Proceso').length,
      caliche: data.filter(s => s.estado === 'Caliche').length,
    });
  };

  const handleSpotClick = (spot) => {
    setSelectedSpot(spot);
    setShowModal(true);
  };

  const parkName = RV_PARKS.find(p => p.id === selectedPark)?.nombre || '';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard - Mapa de Espacios</h1>
        <p className="text-neutral-500 mt-1">Vista en tiempo real del estado de espacios</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
          <p className="text-sm text-neutral-500">Total</p>
        </Card>
        <Card className="text-center bg-neutral-100">
          <p className="text-2xl font-bold text-neutral-700">{stats.disponibles}</p>
          <p className="text-sm text-neutral-600">Disponibles</p>
        </Card>
        <Card className="text-center bg-success-50">
          <p className="text-2xl font-bold text-success-700">{stats.pagados}</p>
          <p className="text-sm text-success-600">Pagados</p>
        </Card>
        <Card className="text-center bg-warning-50">
          <p className="text-2xl font-bold text-warning-700">{stats.enProceso}</p>
          <p className="text-sm text-warning-600">En Proceso</p>
        </Card>
        <Card className="text-center bg-primary-50">
          <p className="text-2xl font-bold text-primary-700">{stats.caliche}</p>
          <p className="text-sm text-primary-600">Caliche</p>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <Select
            label="RV Park"
            value={selectedPark}
            onChange={(e) => setSelectedPark(Number(e.target.value))}
            options={RV_PARKS.map(p => ({ value: p.id, label: p.nombre }))}
            className="flex-1"
          />
          <Select
            label="Filtrar por Estado"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            options={Object.values(SPOT_ESTADOS).map(e => ({ value: e, label: e }))}
            placeholder="Todos"
            className="flex-1"
          />
          <Button icon={FiRefreshCw} onClick={loadSpots} disabled={loading}>
            Actualizar
          </Button>
        </div>
      </Card>

      {/* Mapa de Espacios */}
      <Card title={parkName} subtitle="Mapa visual de estacionamiento">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : spots.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <p>No hay espacios disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {spots.map((spot) => (
              <SpotCard key={spot.id_spot} spot={spot} onClick={handleSpotClick} />
            ))}
          </div>
        )}
      </Card>

      {/* Modal de Detalles */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Detalles - ${selectedSpot?.codigo_spot}`}
      >
        {selectedSpot && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-500">Código</p>
                <p className="font-semibold">{selectedSpot.codigo_spot}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Estado</p>
                <p className="font-semibold">{selectedSpot.estado}</p>
              </div>
              {selectedSpot.clienteNombre && (
                <>
                  <div>
                    <p className="text-sm text-neutral-500">Cliente</p>
                    <p className="font-semibold">{selectedSpot.clienteNombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Teléfono</p>
                    <p className="font-semibold">{selectedSpot.clienteTelefono || 'N/A'}</p>
                  </div>
                </>
              )}
              {selectedSpot.fechaInicio && (
                <>
                  <div>
                    <p className="text-sm text-neutral-500">Fecha Inicio</p>
                    <p className="font-semibold">{formatDate(selectedSpot.fechaInicio)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Fecha Fin</p>
                    <p className="font-semibold">{formatDate(selectedSpot.fechaFin)}</p>
                  </div>
                </>
              )}
            </div>
            
            {selectedSpot.estado !== 'Disponible' && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={() => setShowModal(false)}>
                    Cerrar
                  </Button>
                  <Button onClick={() => {/* Navegar a detalles de renta */}}>
                    Ver Renta Completa
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
