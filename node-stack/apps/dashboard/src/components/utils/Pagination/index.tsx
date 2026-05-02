import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  /**
   * Número total de elementos
   */
  totalItems: number;
  /**
   * Número de elementos por página
   */
  itemsPerPage: number;
  /**
   * Página actual (comienza en 1)
   */
  currentPage: number;
  /**
   * Función a ejecutar cuando se cambia de página
   * @param page Número de página seleccionada
   */
  onPageChange: (page: number) => void;
  /**
   * Número máximo de botones de página a mostrar
   * @default 5
   */
  maxPageButtons?: number;
  /**
   * Texto para el botón anterior
   * @default "Anterior"
   */
  prevButtonLabel?: string;
  /**
   * Texto para el botón siguiente
   * @default "Siguiente"
   */
  nextButtonLabel?: string;
  /**
   * Clase CSS personalizada para el contenedor
   */
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  maxPageButtons = 5,
  prevButtonLabel = "Anterior",
  nextButtonLabel = "Siguiente",
  className = "",
}) => {
  // Calcular el número total de páginas
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Si no hay elementos o solo hay una página, no mostrar paginación
  if (totalItems <= itemsPerPage) {
    return null;
  }

  // Helper para generar los números a mostrar con puntos suspensivos si es necesario
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= maxPageButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(currentPage - Math.floor(maxPageButtons / 2), 1);
      let endPage = startPage + maxPageButtons - 1;

      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(endPage - maxPageButtons + 1, 1);
      }

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Manejar clic en página anterior
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  // Manejar clic en página siguiente
  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Calcular los índices de los elementos mostrados
  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      className={`flex flex-col sm:flex-row justify-between items-center gap-4 w-full py-4 ${className}`}
    >
      <div className="text-sm text-gray-500 dark:text-gray-400 font-label">
        Mostrando <span className="text-gray-900 dark:text-white font-heading">{startItem}</span> a <span className="text-gray-900 dark:text-white font-heading">{endItem}</span> de <span className="text-gray-900 dark:text-white font-heading">{totalItems}</span>
      </div>

      <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto max-w-full">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`flex flex-shrink-0 items-center justify-center min-w-[36px] h-9 px-3 rounded-xl font-heading text-sm transition-all
            ${currentPage === 1
              ? "text-gray-300 dark:text-gray-600 bg-transparent cursor-not-allowed"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 active:scale-95 cursor-pointer"
            }`}
          aria-label="Página anterior"
        >
          <ChevronLeft size={18} strokeWidth={2.5} className="sm:mr-1" />
          <span className="hidden sm:inline">{prevButtonLabel}</span>
        </button>

        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="flex items-center justify-center w-8 h-9 text-gray-400 dark:text-gray-600 font-label">                  •••
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`flex flex-shrink-0 items-center justify-center min-w-[36px] h-9 px-2 text-sm font-heading rounded-xl transition-all
                  ${currentPage === page
                    ? "bg-primary-500 text-white shadow-md shadow-blue-900/20"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 active:scale-95 cursor-pointer"
                  }`}
                aria-label={`Página ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`flex flex-shrink-0 items-center justify-center min-w-[36px] h-9 px-3 rounded-xl font-heading text-sm transition-all
            ${currentPage === totalPages
              ? "text-gray-300 dark:text-gray-600 bg-transparent cursor-not-allowed"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 active:scale-95 cursor-pointer"
            }`}
          aria-label="Página siguiente"
        >
          <span className="hidden sm:inline">{nextButtonLabel}</span>
          <ChevronRight size={18} strokeWidth={2.5} className="sm:ml-1" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
