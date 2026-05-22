import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Square, CheckSquare, X, ArrowUpDown, FileText, ChevronsDown } from 'lucide-react';
import { TIPO_OBRA, GENEROS } from '../../types/obra';
import CustomSelect from '../CustomSelect';
import ViewModeToggle from './ViewModeToggle';
import { SORT_OPTIONS, LISTING_MODES } from './constants';

function FilterBar({
  searchTerm,
  onSearchChange,
  filterTipo,
  onFilterTipoChange,
  filterStatusObra,
  onFilterStatusObraChange,
  filterStatusLeitura,
  onFilterStatusLeituraChange,
  filterGenero,
  onFilterGeneroChange,
  showFavoritosOnly,
  onShowFavoritosChange,
  sortBy,
  sortOrder,
  onSortChange,
  onToggleSortOrder,
  hasActiveFilters,
  onClearFilters,
  viewMode,
  onViewModeChange,
  listingMode,
  onListingModeChange,
  config,
}) {
  // Exclui itens ocultos (nao-definido) — value = ID, label = rótulo configurado
  const statusObraOptions = (config?.statusObra?.filter(s => !s.hidden) ?? []).map(s => ({ value: s.id, label: s.label }));
  const statusLeituraOptions = (config?.statusLeitura?.filter(s => !s.hidden) ?? []).map(s => ({ value: s.id, label: s.label }));
  const generosOptions = (config?.generos ?? GENEROS.map(label => ({ label })))
    .slice()
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }))
    .map(g => g.label);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  return (
    <div className="filters-bar-compact">
      <div className="search-and-view">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>

        <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />

        <div className="listing-mode-toggle" title="Modo de listagem">
          <button
            className={`listing-mode-btn${listingMode === LISTING_MODES.PAGINATION ? ' active' : ''}`}
            onClick={() => onListingModeChange(LISTING_MODES.PAGINATION)}
            title="Paginação"
          >
            <FileText size={16} />
          </button>
          <button
            className={`listing-mode-btn${listingMode === LISTING_MODES.INFINITE ? ' active' : ''}`}
            onClick={() => onListingModeChange(LISTING_MODES.INFINITE)}
            title="Scroll infinito"
          >
            <ChevronsDown size={16} />
          </button>
        </div>
      </div>

      <div className="filters-actions">
        <button
          className="filters-toggle"
          onClick={() => setFiltersExpanded(!filtersExpanded)}
        >
          Filtros
          {filtersExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {hasActiveFilters && (
          <button
            className="btn-clear-filters"
            onClick={onClearFilters}
            title="Limpar filtros"
          >
            <X size={16} />
            Limpar
          </button>
        )}
      </div>

      {filtersExpanded && (
        <div className="filters-expanded">
          <CustomSelect
            value={filterTipo}
            onChange={(e) => onFilterTipoChange(e.target.value)}
            placeholder="Tipo"
            options={Object.values(TIPO_OBRA).map(tipo => ({
              value: tipo,
              label: tipo
            }))}
          />

          <CustomSelect
            value={filterStatusObra}
            onChange={(e) => onFilterStatusObraChange(e.target.value)}
            placeholder="Status da Obra"
            options={statusObraOptions}
          />

          <CustomSelect
            value={filterStatusLeitura}
            onChange={(e) => onFilterStatusLeituraChange(e.target.value)}
            placeholder="Meu Status"
            options={statusLeituraOptions}
          />

          <CustomSelect
            value={filterGenero}
            onChange={(e) => onFilterGeneroChange(e.target.value)}
            placeholder="Gênero"
            options={generosOptions.map(g => ({ value: g, label: g }))}
          />

          <div className="sort-group">
            <CustomSelect
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              options={SORT_OPTIONS}
            />
            <button
              className="sort-order-btn"
              onClick={onToggleSortOrder}
              title={sortOrder === 'asc' ? 'Ordem crescente (A-Z, 0-9)' : 'Ordem decrescente (Z-A, 9-0)'}
            >
              <ArrowUpDown size={18} />
              <span className="sort-order-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            </button>
          </div>

          <label className="checkbox-compact">
            <input
              type="checkbox"
              checked={showFavoritosOnly}
              onChange={(e) => onShowFavoritosChange(e.target.checked)}
              className="visually-hidden"
            />
            {showFavoritosOnly ? (
              <CheckSquare size={20} className="checkbox-icon-checked" />
            ) : (
              <Square size={20} className="checkbox-icon-unchecked" />
            )}
            Favoritos
          </label>
        </div>
      )}
    </div>
  );
}

export default FilterBar;
