import { useState } from 'react';
import ObraCard from '../ObraCard';
import FilterBar from './FilterBar';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import { useFiltering } from './hooks/useFiltering';
import { usePagination } from './hooks/usePagination';
import { VIEW_MODES } from './constants';
import './ObraList.css';

function ObraList({ obras, config, onViewDetail, onEdit, onDelete, onQuickUpdate }) {
  const [viewMode, setViewMode] = useState(VIEW_MODES.TABLE);

  const {
    searchTerm,
    filterTipo,
    filterStatusObra,
    filterStatusLeitura,
    filterGenero,
    showFavoritosOnly,
    sortBy,
    sortOrder,
    setSearchTerm,
    setFilterTipo,
    setFilterStatusObra,
    setFilterStatusLeitura,
    setFilterGenero,
    setShowFavoritosOnly,
    handleSortChange,
    toggleSortOrder,
    clearFilters,
    filteredAndSortedObras,
    hasActiveFilters
  } = useFiltering(obras);

  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    currentPageItems,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage
  } = usePagination(filteredAndSortedObras, [
    searchTerm,
    filterTipo,
    filterStatusObra,
    filterStatusLeitura,
    filterGenero,
    showFavoritosOnly
  ]);

  return (
    <div className="obra-list-container">
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterTipo={filterTipo}
        onFilterTipoChange={setFilterTipo}
        filterStatusObra={filterStatusObra}
        onFilterStatusObraChange={setFilterStatusObra}
        filterStatusLeitura={filterStatusLeitura}
        onFilterStatusLeituraChange={setFilterStatusLeitura}
        filterGenero={filterGenero}
        onFilterGeneroChange={setFilterGenero}
        showFavoritosOnly={showFavoritosOnly}
        onShowFavoritosChange={setShowFavoritosOnly}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onToggleSortOrder={toggleSortOrder}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        config={config}
      />

      <div className="results-info">
        Mostrando {startIndex + 1}-{Math.min(endIndex, filteredAndSortedObras.length)} de {filteredAndSortedObras.length} obras
        {filteredAndSortedObras.length !== obras.length && ` (${obras.length} no total)`}
      </div>

      {filteredAndSortedObras.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {viewMode === VIEW_MODES.COMPACT ? (
            <table className="compact-table">
              <thead>
                <tr>
                  <th className="compact-th compact-th-cover"></th>
                  <th className="compact-th compact-th-title">Nome</th>
                  <th className="compact-th compact-th-status">Meu Status</th>
                  <th className="compact-th compact-th-obra-status">Status Obra</th>
                  <th className="compact-th compact-th-tipo">Tipo</th>
                  <th className="compact-th compact-th-progress">Capítulo</th>
                  <th className="compact-th compact-th-rating">Nota</th>
                  <th className="compact-th compact-th-actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentPageItems.map(obra => (
                  <ObraCard
                    key={obra.id}
                    obra={obra}
                    viewMode={viewMode}
                    onViewDetail={() => onViewDetail(obra)}
                    onEdit={() => onEdit(obra)}
                    onDelete={() => onDelete(obra.id)}
                    onQuickUpdate={onQuickUpdate}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <div className={`obra-list ${viewMode}`}>
              {currentPageItems.map(obra => (
                <ObraCard
                  key={obra.id}
                  obra={obra}
                  viewMode={viewMode}
                  onViewDetail={() => onViewDetail(obra)}
                  onEdit={() => onEdit(obra)}
                  onDelete={() => onDelete(obra.id)}
                  onQuickUpdate={onQuickUpdate}
                />
              ))}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onFirstPage={goToFirstPage}
            onPreviousPage={goToPreviousPage}
            onNextPage={goToNextPage}
            onLastPage={goToLastPage}
          />
        </>
      )}
    </div>
  );
}

export default ObraList;
