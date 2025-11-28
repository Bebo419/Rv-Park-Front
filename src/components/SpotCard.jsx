import { SPOT_ESTADO_COLORS } from '../utils/constants';

const SpotCard = ({ spot, onClick }) => {
  const colors = SPOT_ESTADO_COLORS[spot.estado] || SPOT_ESTADO_COLORS.Disponible;

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Pagado':
        return '✅';
      case 'Proceso':
        return '🟠';
      case 'Caliche':
        return '🔵';
      default:
        return '⬜';
    }
  };

  return (
    <div
      onClick={() => onClick(spot)}
      className={`${colors.bg} ${colors.border} border-2 rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform duration-200 shadow-sm hover:shadow-md group relative`}
    >
      <div className="flex flex-col items-center justify-center space-y-2">
        <span className="text-2xl">{getEstadoIcon(spot.estado)}</span>
        <span className={`${colors.text} font-bold text-lg`}>{spot.codigo_spot}</span>
        {spot.clienteNombre && (
          <span className={`${colors.text} text-xs text-center truncate w-full px-1`}>
            {spot.clienteNombre}
          </span>
        )}
        <span className={`${colors.text} text-xs font-medium px-2 py-1 rounded bg-white bg-opacity-30`}>
          {spot.estado}
        </span>
      </div>

      {/* Tooltip hover - información rápida */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
        <div className="bg-neutral-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
          <div className="font-semibold">{spot.codigo_spot}</div>
          {spot.clienteNombre && <div>Cliente: {spot.clienteNombre}</div>}
          <div>Estado: {spot.estado}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-neutral-900"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotCard;
