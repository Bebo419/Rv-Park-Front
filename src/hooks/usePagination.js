import { useState, useMemo, useEffect } from 'react';
import { PAGINATION } from '../utils/constants';

/**
 * Hook para manejar paginación del lado del cliente
 * @param {Array} items - Array de items a paginar
 * @param {number} initialPageSize - Tamaño inicial de página (default: 20)
 * @returns {Object} Estado y funciones de paginación
 */
export const usePagination = (items = [], initialPageSize = PAGINATION.DEFAULT_PAGE_SIZE) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Calcular datos paginados
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, pageSize]);

  // Calcular información de paginación
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  // Funciones de navegación
  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const changePageSize = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Resetear a la primera página al cambiar el tamaño
  };

  // Resetear a la primera página cuando cambian los items
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [items.length, totalPages, currentPage]);

  return {
    // Datos paginados
    paginatedData,
    
    // Estado
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    
    // Flags
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    
    // Funciones
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    setCurrentPage,
  };
};

export default usePagination;
