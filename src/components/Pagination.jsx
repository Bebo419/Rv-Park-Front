import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { PAGINATION } from '../utils/constants';

/**
 * Componente de paginación reutilizable
 * @param {Object} props
 * @param {number} props.currentPage - Página actual
 * @param {number} props.totalPages - Total de páginas
 * @param {number} props.pageSize - Tamaño de página actual
 * @param {number} props.totalItems - Total de items
 * @param {number} props.startIndex - Índice inicial de items mostrados
 * @param {number} props.endIndex - Índice final de items mostrados
 * @param {Function} props.onPageChange - Callback al cambiar de página
 * @param {Function} props.onPageSizeChange - Callback al cambiar tamaño de página
 * @param {boolean} props.hasNextPage - Si hay siguiente página
 * @param {boolean} props.hasPrevPage - Si hay página anterior
 */
const Pagination = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onPageSizeChange,
  hasNextPage,
  hasPrevPage,
}) => {
  if (totalItems === 0) return null;

  // Generar array de páginas a mostrar (máximo 5 páginas visibles)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas cercanas a la actual
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisible - 1);
      
      if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-neutral-50 border-t">
      {/* Información de registros */}
      <div className="text-sm text-neutral-600">
        Mostrando <span className="font-medium">{startIndex}</span> a{' '}
        <span className="font-medium">{endIndex}</span> de{' '}
        <span className="font-medium">{totalItems}</span> registros
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center gap-2">
        {/* Selector de tamaño de página */}
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="text-sm border border-neutral-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {PAGINATION.PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size} / página
            </option>
          ))}
        </select>

        {/* Botones de navegación */}
        <div className="flex items-center gap-1">
          {/* Primera página */}
          <button
            onClick={() => onPageChange(1)}
            disabled={!hasPrevPage}
            className="p-2 rounded-lg hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Primera página"
          >
            <FiChevronsLeft size={18} />
          </button>

          {/* Página anterior */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevPage}
            className="p-2 rounded-lg hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Anterior"
          >
            <FiChevronLeft size={18} />
          </button>

          {/* Números de página */}
          <div className="hidden sm:flex items-center gap-1">
            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[36px] px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-primary-500 text-white'
                    : 'hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Indicador móvil de página actual */}
          <div className="sm:hidden px-3 py-1 text-sm font-medium text-neutral-700">
            {currentPage} / {totalPages}
          </div>

          {/* Página siguiente */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
            className="p-2 rounded-lg hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Siguiente"
          >
            <FiChevronRight size={18} />
          </button>

          {/* Última página */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={!hasNextPage}
            className="p-2 rounded-lg hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Última página"
          >
            <FiChevronsRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
