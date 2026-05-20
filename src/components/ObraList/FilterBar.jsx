import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Square, CheckSquare, X, ArrowUpDown } from 'lucide-react';
import { STATUS_LEITURA, STATUS_OBRA, TIPO_OBRA, GENEROS } from '../../types/obra';
import CustomSelect from '../CustomSelect';
import ViewModeToggle from './ViewModeToggle';
import { SORT_OPTIONS } from './constants';

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
  config,
}) {
  const statusObraOptions = config?.statusObra?.map(s => s.label) ?? Object.values(STATUS_OBRA);
  const statusLeituraOptions = config?.statusLeitura?.map(s => s.label) ?? Object.values(STATUS_LEITURA);
  const generosOptions = config?.generos?.map(g => g.label) ?? GENEROS;
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
            options={statusObraOptions.map(s => ({ value: s, label: s }))}
          />

          <CustomSelect
            value={filterStatusLeitura}
            onChange={(e) => onFilterStatusLeituraChange(e.target.value)}
            placeholder="Meu Status"
            options={statusLeituraOptions.map(s => ({ value: s, label: s }))}
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
