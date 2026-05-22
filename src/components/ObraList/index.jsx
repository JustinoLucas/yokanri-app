import { useState } from 'react';
import ObraCard from '../ObraCard';
import FilterBar from './FilterBar';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import { useFiltering } from './hooks/useFiltering';
import { usePagination } from './hooks/usePagination';
import { useInfiniteScroll } from './hooks/useInfiniteScroll';
import { VIEW_MODES, LISTING_MODES, BATCH_SIZE } from './constants';
import './ObraList.css';

const LISTING_MODE_KEY = 'yokanri_listing_mode';

function ObraList({ obras, config, onViewDetail, onEdit, onDelete, onQuickUpdate }) {
  const [viewMode, setViewMode] = useState(VIEW_MODES.TABLE);
  const [listingMode, setListingMode] = useState(
    () => localStorage.getItem(LISTING_MODE_KEY) ?? LISTING_MODES.PAGINATION
  );

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
  } = useFiltering(obras, config);

  const pagination = usePagination(filteredAndSortedObras, [
    searchTerm,
    filterTipo,
    filterStatusObra,
    filterStatusLeitura,
    filterGenero,
    showFavoritosOnly
  ]);

  const infinite = useInfiniteScroll(filteredAndSortedObras, BATCH_SIZE);

  const isInfinite = listingMode === LISTING_MODES.INFINITE;
  const displayItems = isInfinite ? infinite.visibleItems : pagination.currentPageItems;

  const handleListingModeChange = (newMode) => {
    setListingMode(newMode);
    localStorage.setItem(LISTING_MODE_KEY, newMode);
  };

  const resultsInfo = isInfinite
    ? `Mostrando ${displayItems.length} de ${filteredAndSortedObras.length} obras`
    : `Mostrando ${pagination.startIndex + 1}–${Math.min(pagination.endIndex, filteredAndSortedObras.length)} de ${filteredAndSortedObras.length} obras`;

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
        listingMode={listingMode}
        onListingModeChange={handleListingModeChange}
        config={config}
      />

      <div className="results-info">
        {resultsInfo}
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
                {displayItems.map(obra => (
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
              {displayItems.map(obra => (
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

          {isInfinite ? (
            <>
              {infinite.hasMore && (
                <div ref={infinite.sentinelRef} className="infinite-scroll-sentinel" aria-hidden="true" />
              )}
              {!infinite.hasMore && filteredAndSortedObras.length > BATCH_SIZE && (
                <p className="infinite-scroll-end">Todas as obras carregadas</p>
              )}
            </>
          ) : (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onFirstPage={pagination.goToFirstPage}
              onPreviousPage={pagination.goToPreviousPage}
              onNextPage={pagination.goToNextPage}
              onLastPage={pagination.goToLastPage}
            />
          )}
        </>
      )}
    </div>
  );
}

export default ObraList;
