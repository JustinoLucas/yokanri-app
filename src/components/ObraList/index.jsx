import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import ObraCard from '../ObraCard';
import LibraryToolbar from './LibraryToolbar';
import LibraryFilterPanel from './LibraryFilterPanel';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import { useFiltering } from './hooks/useFiltering';
import { usePagination } from './hooks/usePagination';
import { useInfiniteScroll } from './hooks/useInfiniteScroll';
import { VIEW_MODES, LISTING_MODES, BATCH_SIZE, FILTER_ALL } from './constants';
import './ObraList.css';

const LISTING_MODE_KEY = 'yokanri_listing_mode';

const SORT_KEY_MAP = {
  dataAdicionado:      'library_sort_updated',
  nome:                'library_sort_name',
  nota:                'library_sort_rating',
  capituloAtualUsuario:'library_sort_chapters',
};

function ObraList({
  obras,
  config,
  onViewDetail,
  onEdit,
  onDelete,
  onQuickUpdate,
  onSetNsfwMode,
  children,
}) {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState(VIEW_MODES.TABLE);
  const [listingMode] = useState(
    () => localStorage.getItem(LISTING_MODE_KEY) ?? LISTING_MODES.PAGINATION
  );
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const {
    filterTipo, filterStatusObra, filterStatusLeitura, filterGenero,
    filterAutor, filterArtista,
    filterAnoMin, filterAnoMax,
    filterCapMin, filterCapMax,
    filterMode,
    showFavoritosOnly,
    sortBy, sortOrder,

    setFilterTipo, setFilterStatusObra, setFilterStatusLeitura, setFilterGenero,
    setFilterAutor, setFilterArtista,
    setFilterAnoMin, setFilterAnoMax,
    setFilterCapMin, setFilterCapMax,
    setFilterMode,
    setShowFavoritosOnly,

    handleSortChange, toggleSortOrder, clearFilters,
    filteredAndSortedObras,
  } = useFiltering(obras, config);

  // Número de filtros ativos (exibido no badge do botão "Filtros")
  const activeFiltersCount = [
    filterTipo !== FILTER_ALL,
    filterStatusObra !== FILTER_ALL,
    filterStatusLeitura !== FILTER_ALL,
    filterGenero !== FILTER_ALL,
    filterAutor !== '',
    filterArtista !== '',
    filterAnoMin !== '',
    filterAnoMax !== '',
    filterCapMin !== '',
    filterCapMax !== '',
    showFavoritosOnly,
  ].filter(Boolean).length;

  const pagination = usePagination(filteredAndSortedObras, [
    filterTipo, filterStatusObra, filterStatusLeitura,
    filterGenero, filterAutor, filterArtista,
    filterAnoMin, filterAnoMax, filterCapMin, filterCapMax,
    showFavoritosOnly,
  ]);

  const infinite = useInfiniteScroll(filteredAndSortedObras, BATCH_SIZE);

  const isInfinite = listingMode === LISTING_MODES.INFINITE;
  const displayItems = isInfinite ? infinite.visibleItems : pagination.currentPageItems;

  // Label da toolbar
  const toolbarTitle = (() => {
    const count = filteredAndSortedObras.length;
    const obraLabel = count !== 1 ? t('library_obras') : t('library_obra');
    if (filterStatusLeitura !== FILTER_ALL && config?.statusLeitura) {
      const s = config.statusLeitura.find(x => x.id === filterStatusLeitura);
      if (s) return `${s.label} · ${count} ${obraLabel}`;
    }
    return `${count} ${obraLabel}`;
  })();

  // Label do sort atual
  const sortLabel = t(SORT_KEY_MAP[sortBy] || 'library_sort_name');
  const sortArrow = sortOrder === 'asc' ? '↑' : '↓';

  // Cicla para o próximo sortBy
  const SORT_CYCLE = ['dataAdicionado', 'nome', 'nota', 'capituloAtualUsuario'];
  const handleCycleSortBy = () => {
    const idx = SORT_CYCLE.indexOf(sortBy);
    const next = SORT_CYCLE[(idx + 1) % SORT_CYCLE.length];
    handleSortChange(next);
  };

  return (
    <div className="obra-list-v3f">
      {/* ── Toolbar 52px ──────────────────────────────────────── */}
      <LibraryToolbar
        eyebrow={t('library_toolbar_eyebrow')}
        title={toolbarTitle}
        filterPanelOpen={filterPanelOpen}
      />

      {/* ── Filter panel — acima do carrossel, abaixo do toolbar ── */}
      {filterPanelOpen && (
        <LibraryFilterPanel
          config={config}
          filterTipo={filterTipo}
          filterStatusObra={filterStatusObra}
          filterStatusLeitura={filterStatusLeitura}
          filterGenero={filterGenero}
          filterAutor={filterAutor}
          filterArtista={filterArtista}
          filterAnoMin={filterAnoMin}
          filterAnoMax={filterAnoMax}
          filterCapMin={filterCapMin}
          filterCapMax={filterCapMax}
          filterMode={filterMode}
          showFavoritosOnly={showFavoritosOnly}
          sortBy={sortBy}
          sortOrder={sortOrder}
          nsfwMode={config?.nsfwMode}
          onFilterTipoChange={setFilterTipo}
          onFilterStatusObraChange={setFilterStatusObra}
          onFilterStatusLeituraChange={setFilterStatusLeitura}
          onFilterGeneroChange={setFilterGenero}
          onFilterAutorChange={setFilterAutor}
          onFilterArtistaChange={setFilterArtista}
          onFilterAnoMinChange={setFilterAnoMin}
          onFilterAnoMaxChange={setFilterAnoMax}
          onFilterCapMinChange={setFilterCapMin}
          onFilterCapMaxChange={setFilterCapMax}
          onFilterModeChange={setFilterMode}
          onShowFavoritosChange={setShowFavoritosOnly}
          onSortChange={handleSortChange}
          onToggleSortOrder={toggleSortOrder}
          onSetNsfwMode={onSetNsfwMode}
          onClearFilters={clearFilters}
          onClose={() => setFilterPanelOpen(false)}
          totalResults={filteredAndSortedObras.length}
        />
      )}

      {/* ── Conteúdo injetado (carrossel) — sempre visível ─── */}
      {children}

      {/* ── Lista de obras ───────────────────────────────────── */}
      <div className="obra-list-body">

          {/* ── View toggle + filtros + sort ──────────────── */}
          <div className="lib-pills-row">
            <div className="lib-pills-actions">
              <div className="lib-toolbar-view-toggle">
                <ViewBtn
                  active={viewMode === VIEW_MODES.TABLE}
                  onClick={() => setViewMode(VIEW_MODES.TABLE)}
                  title={t('library_view_rows')}
                >
                  <RowsIcon />
                </ViewBtn>
                <ViewBtn
                  active={viewMode === VIEW_MODES.GRID}
                  onClick={() => setViewMode(VIEW_MODES.GRID)}
                  title={t('library_view_grid')}
                >
                  <GridIcon />
                </ViewBtn>
                <ViewBtn
                  active={viewMode === VIEW_MODES.COMPACT}
                  onClick={() => setViewMode(VIEW_MODES.COMPACT)}
                  title={t('library_view_compact')}
                >
                  <ListIcon />
                </ViewBtn>
              </div>

              <button
                className={`lib-toolbar-filters-btn ${filterPanelOpen ? 'lib-toolbar-filters-btn--active' : ''}`}
                onClick={() => setFilterPanelOpen(v => !v)}
              >
                <SlidersHorizontal size={13} />
                {t('library_filters')}
                {activeFiltersCount > 0 && (
                  <span className="lib-toolbar-filters-badge">{activeFiltersCount}</span>
                )}
              </button>
            </div>

            {/* Ordenação */}
            <div className="lib-pills-sort">
              <span className="lib-pills-sort-label">{t('library_sort_label')}</span>
              <button className="lib-pills-sort-btn" onClick={handleCycleSortBy}>
                {sortLabel}
              </button>
              <button className="lib-pills-sort-order" onClick={toggleSortOrder} title={t('library_sort_toggle')}>
                {sortArrow}
              </button>
            </div>
          </div>

          {filteredAndSortedObras.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {viewMode === VIEW_MODES.COMPACT ? (
                <table className="compact-table">
                  <thead>
                    <tr>
                      <th className="compact-th compact-th-cover" />
                      <th className="compact-th compact-th-title">{t('library_col_name')}</th>
                      <th className="compact-th compact-th-status">{t('library_col_my_status')}</th>
                      <th className="compact-th compact-th-obra-status">{t('library_col_obra_status')}</th>
                      <th className="compact-th compact-th-tipo">{t('library_col_type')}</th>
                      <th className="compact-th compact-th-progress">{t('library_col_chapter')}</th>
                      <th className="compact-th compact-th-rating">{t('library_col_rating')}</th>
                      <th className="compact-th compact-th-actions">{t('library_col_actions')}</th>
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
                    <p className="infinite-scroll-end">{t('library_all_loaded')}</p>
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
    </div>
  );
}

/* ─── View mode toggle sub-components ────────────────── */

function ViewBtn({ active, onClick, title, children }) {
  return (
    <button
      className={`lib-toolbar-view-btn ${active ? 'lib-toolbar-view-btn--active' : ''}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}

/* Minimal inline SVG icons to avoid heavy lucide bundle impact */
function RowsIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="11" height="3" rx="1"/>
      <rect x="1" y="6" width="11" height="3" rx="1"/>
      <rect x="1" y="11" width="6" height="1.5" rx="0.75"/>
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1"   y="1"   width="4.5" height="4.5" rx="1"/>
      <rect x="7.5" y="1"   width="4.5" height="4.5" rx="1"/>
      <rect x="1"   y="7.5" width="4.5" height="4.5" rx="1"/>
      <rect x="7.5" y="7.5" width="4.5" height="4.5" rx="1"/>
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="1" y1="2.5"  x2="12" y2="2.5"/>
      <line x1="1" y1="6.5"  x2="12" y2="6.5"/>
      <line x1="1" y1="10.5" x2="12" y2="10.5"/>
    </svg>
  );
}

export default ObraList;
