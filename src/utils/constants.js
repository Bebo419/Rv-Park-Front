export const ROLES = {
  ADMINISTRADOR: 'Administrador',
  SUPERVISOR: 'Supervisor',
  OPERADOR: 'Operador',
};

export const SPOT_ESTADOS = {
  DISPONIBLE: 'Disponible',
  PAGADO: 'Pagado',
  PROCESO: 'Proceso',
  CALICHE: 'Caliche',
};

export const SPOT_ESTADO_COLORS = {
  Disponible: {
    bg: 'bg-neutral-200',
    text: 'text-neutral-700',
    border: 'border-neutral-300',
    hex: '#E5E7EB',
  },
  Pagado: {
    bg: 'bg-success-500',
    text: 'text-white',
    border: 'border-success-600',
    hex: '#10B981',
  },
  Proceso: {
    bg: 'bg-warning-500',
    text: 'text-white',
    border: 'border-warning-600',
    hex: '#F59E0B',
  },
  Caliche: {
    bg: 'bg-primary-500',
    text: 'text-white',
    border: 'border-primary-600',
    hex: '#3B82F6',
  },
};

export const RV_PARKS = [
  { id: 1, nombre: 'Park 1 - Norte', codigo: 'A1' },
  { id: 2, nombre: 'Park 2 - Sur', codigo: 'P2' },
  { id: 3, nombre: 'Park 3 - Este', codigo: 'P3' },
  { id: 4, nombre: 'Park 4 - Oeste', codigo: 'P4' },
  { id: 5, nombre: 'Park 5 - Centro', codigo: 'P5' },
];

export const METODOS_PAGO = [
  'Efectivo',
  'Tarjeta',
  'Transferencia',
];

export const TIPOS_VEHICULO = [
  { value: 'Carga', label: 'Carga' },
  { value: 'Maquinaria', label: 'Maquinaria' },
  { value: 'Caravana', label: 'Caravana' },
  { value: 'Otro', label: 'Otro' },
];

export const ESTATUS_PAGO = {
  PAGADO: 'Pagado',
  PENDIENTE: 'Pendiente',
};

export const ESTATUS_PAGO_COLORS = {
  Pagado: {
    bg: 'bg-success-100',
    text: 'text-success-700',
  },
  Pendiente: {
    bg: 'bg-warning-100',
    text: 'text-warning-700',
  },
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};
