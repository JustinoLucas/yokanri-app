import { useState, useEffect } from 'react';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { TIPO_OBRA } from '../../types/obra';
import { FILTER_ALL } from './constants';
import { useLanguage } from '../../i18n/LanguageContext';
import { getItemLabel } from '../../i18n/itemLabel';
import './LibraryFilterPanel.css';

const TIPO_KEY_MAP = {
  'Coreano': 'tipo_coreano',
  'Chinês':  'tipo_chines',
  'Japonês': 'tipo_japones',
};

function LibraryFilterPanel({
  config,
  filterTipo, filterStatusObra, filterStatusLeitura, filterGenero,
  filterAutor, filterArtista,
  filterAnoMin, filterAnoMax,
  filterCapMin, filterCapMax,
  filterMode,
  showFavoritosOnly,
  nsfwMode,
  onFilterTipoChange, onFilterStatusObraChange, onFilterStatusLeituraChange,
  onFilterGeneroChange, onFilterAutorChange, onFilterArtistaChange,
  onFilterAnoMinChange, onFilterAnoMaxChange,
  onFilterCapMinChange, onFilterCapMaxChange,
  onFilterModeChange,
  onShowFavoritosChange,
  onSetNsfwMode,
  onClearFilters,
  onClose,
  totalResults,
}) {
  const [draft, setDraft] = useState({
    filterTipo:           filterTipo           ?? FILTER_ALL,
    filterStatusObra:     filterStatusObra      ?? FILTER_ALL,
    filterStatusLeitura:  filterStatusLeitura   ?? FILTER_ALL,
    filterGenero:         filterGenero          ?? FILTER_ALL,
    filterAutor:          filterAutor           ?? '',
    filterArtista:        filterArtista         ?? '',
    filterAnoMin:         filterAnoMin          ?? '',
    filterAnoMax:         filterAnoMax          ?? '',
    filterCapMin:         filterCapMin          ?? '',
    filterCapMax:         filterCapMax          ?? '',
    filterMode:           filterMode            ?? 'or',
    showFavoritosOnly:    showFavoritosOnly      ?? false,
    nsfwMode:             nsfwMode              ?? 'hidden',
  });

  const { t } = useLanguage();
  const [genresExpanded, setGenresExpanded] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const set = (key, value) => setDraft(prev => ({ ...prev, [key]: value }));
  const toggle = (key, val, all) =>
    setDraft(prev => ({ ...prev, [key]: prev[key] === val ? all : val }));

  const statusLeituraOpts = config?.statusLeitura?.filter(s => !s.hidden) ?? [];
  const statusObraOpts    = config?.statusObra?.filter(s => !s.hidden) ?? [];
  const generos = (config?.generos ?? []).slice().sort((a, b) =>
    a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' })
  );
  const tipoOpts = Object.values(TIPO_OBRA);

  const activeCount = [
    draft.filterStatusLeitura !== FILTER_ALL,
    draft.filterStatusObra    !== FILTER_ALL,
    draft.filterTipo          !== FILTER_ALL,
    draft.filterGenero        !== FILTER_ALL,
    draft.filterAutor         !== '',
    draft.filterArtista       !== '',
    draft.filterAnoMin        !== '',
    draft.filterAnoMax        !== '',
    draft.filterCapMin        !== '',
    draft.filterCapMax        !== '',
    draft.showFavoritosOnly,
  ].filter(Boolean).length;

  const handleApply = () => {
    onFilterStatusLeituraChange(draft.filterStatusLeitura);
    onFilterStatusObraChange(draft.filterStatusObra);
    onFilterTipoChange(draft.filterTipo);
    onFilterGeneroChange(draft.filterGenero);
    onFilterAutorChange(draft.filterAutor);
    onFilterArtistaChange(draft.filterArtista);
    onFilterAnoMinChange(draft.filterAnoMin);
    onFilterAnoMaxChange(draft.filterAnoMax);
    onFilterCapMinChange(draft.filterCapMin);
    onFilterCapMaxChange(draft.filterCapMax);
    onFilterModeChange(draft.filterMode);
    onShowFavoritosChange(draft.showFavoritosOnly);
    onSetNsfwMode?.(draft.nsfwMode);
    onClose();
  };

  const handleClear = () => {
    setDraft(prev => ({
      ...prev,
      filterTipo: FILTER_ALL, filterStatusObra: FILTER_ALL,
      filterStatusLeitura: FILTER_ALL, filterGenero: FILTER_ALL,
      filterAutor: '', filterArtista: '',
      filterAnoMin: '', filterAnoMax: '',
      filterCapMin: '', filterCapMax: '',
      filterMode: 'or',
      showFavoritosOnly: false,
    }));
  };

  const activeChips = [
    draft.filterStatusLeitura !== FILTER_ALL && {
      label: getItemLabel(statusLeituraOpts.find(s => s.id === draft.filterStatusLeitura), t) || draft.filterStatusLeitura,
      clear: () => set('filterStatusLeitura', FILTER_ALL),
    },
    draft.filterStatusObra !== FILTER_ALL && {
      label: getItemLabel(statusObraOpts.find(s => s.id === draft.filterStatusObra), t) || draft.filterStatusObra,
      clear: () => set('filterStatusObra', FILTER_ALL),
    },
    draft.filterTipo !== FILTER_ALL && {
      label: t(TIPO_KEY_MAP[draft.filterTipo]) || draft.filterTipo,
      clear: () => set('filterTipo', FILTER_ALL),
    },
    draft.filterGenero !== FILTER_ALL && {
      label: getItemLabel(generos.find(g => g.label === draft.filterGenero), t) || draft.filterGenero,
      clear: () => set('filterGenero', FILTER_ALL),
    },
    draft.filterAutor && {
      label: `${t('filter_chip_author')}: ${draft.filterAutor}`,
      clear: () => set('filterAutor', ''),
    },
    draft.filterArtista && {
      label: `${t('filter_chip_artist')}: ${draft.filterArtista}`,
      clear: () => set('filterArtista', ''),
    },
    (draft.filterAnoMin || draft.filterAnoMax) && {
      label: `${t('filter_chip_year')}: ${draft.filterAnoMin || '?'} – ${draft.filterAnoMax || '?'}`,
      clear: () => setDraft(p => ({ ...p, filterAnoMin: '', filterAnoMax: '' })),
    },
    (draft.filterCapMin || draft.filterCapMax) && {
      label: `${t('filter_chip_chapters')}: ${draft.filterCapMin || '0'} – ${draft.filterCapMax || '∞'}`,
      clear: () => setDraft(p => ({ ...p, filterCapMin: '', filterCapMax: '' })),
    },
    draft.showFavoritosOnly && {
      label: t('filter_chip_favorites'),
      clear: () => set('showFavoritosOnly', false),
    },
  ].filter(Boolean);

  return (
    <div className="filter-panel-backdrop" onClick={onClose}>
    <div className="filter-panel" onClick={e => e.stopPropagation()}>

      {/* ── Cabeçalho ────────────────────────────────────────────────────── */}
      <div className="filter-panel-header">
        <SlidersHorizontal size={14} className="filter-panel-header-icon" />
        <span className="filter-panel-header-title">{t('filter_title')}</span>
        {activeCount > 0 && (
          <span className="filter-panel-active-badge">{activeCount} {t('filter_active')}</span>
        )}
        <div className="filter-panel-header-spacer" />
        <button className="filter-panel-clear-btn" onClick={handleClear}>
          {t('filter_clear_all')}
        </button>
        <div className="filter-panel-divider-v" />
        <button className="filter-panel-close-btn" onClick={onClose}>
          <X size={13} />
        </button>
      </div>

      {/* ── Corpo scrollável ─────────────────────────────────────────────── */}
      <div className="filter-panel-body">

        {/* Linha 1: STATUS | TIPO | AUTOR | ARTISTA */}
        <div className="filter-panel-row filter-panel-row--4col">
          <FilterGroup label={t('filter_group_status')}>
            <div className="filter-chips-wrap">
              {statusLeituraOpts.map(s => (
                <FChip
                  key={s.id}
                  label={getItemLabel(s, t)}
                  selected={draft.filterStatusLeitura === s.id}
                  onClick={() => toggle('filterStatusLeitura', s.id, FILTER_ALL)}
                />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label={t('filter_group_tipo')}>
            <div className="filter-chips-wrap">
              {tipoOpts.map(tipo => (
                <FChip
                  key={tipo}
                  label={t(TIPO_KEY_MAP[tipo]) || tipo}
                  selected={draft.filterTipo === tipo}
                  onClick={() => toggle('filterTipo', tipo, FILTER_ALL)}
                />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label={t('filter_group_author')}>
            <input
              type="text"
              className="filter-text-input"
              placeholder={t('filter_author_placeholder')}
              value={draft.filterAutor}
              onChange={e => set('filterAutor', e.target.value)}
            />
          </FilterGroup>

          <FilterGroup label={t('filter_group_artist')}>
            <input
              type="text"
              className="filter-text-input"
              placeholder={t('filter_artist_placeholder')}
              value={draft.filterArtista}
              onChange={e => set('filterArtista', e.target.value)}
            />
          </FilterGroup>
        </div>

        {/* Linha 2: ANO | CAPÍTULOS | MODO FILTRO | CONTEÚDO ADULTO */}
        <div className="filter-panel-row filter-panel-row--4col filter-panel-row--border">
          <FilterGroup label={t('filter_group_year')}>
            <div className="filter-range-wrap">
              <input
                type="number"
                className="filter-text-input filter-text-input--range"
                placeholder={t('filter_year_from')}
                value={draft.filterAnoMin}
                onChange={e => set('filterAnoMin', e.target.value)}
                min="1900" max="2100"
              />
              <input
                type="number"
                className="filter-text-input filter-text-input--range"
                placeholder={t('filter_year_to')}
                value={draft.filterAnoMax}
                onChange={e => set('filterAnoMax', e.target.value)}
                min="1900" max="2100"
              />
            </div>
          </FilterGroup>

          <FilterGroup label={t('filter_group_chapters')}>
            <div className="filter-range-wrap">
              <input
                type="number"
                className="filter-text-input filter-text-input--range"
                placeholder={t('filter_chapters_min')}
                value={draft.filterCapMin}
                onChange={e => set('filterCapMin', e.target.value)}
                min="0"
              />
              <input
                type="number"
                className="filter-text-input filter-text-input--range"
                placeholder={t('filter_chapters_max')}
                value={draft.filterCapMax}
                onChange={e => set('filterCapMax', e.target.value)}
                min="0"
              />
            </div>
          </FilterGroup>

          <FilterGroup label={t('filter_group_mode')}>
            <div className="filter-chips-wrap">
              <FChip
                label={t('filter_mode_or')}
                selected={draft.filterMode === 'or'}
                onClick={() => set('filterMode', 'or')}
              />
              <FChip
                label={t('filter_mode_and')}
                selected={draft.filterMode === 'and'}
                onClick={() => set('filterMode', 'and')}
              />
            </div>
          </FilterGroup>

          <FilterGroup label={t('filter_group_nsfw')}>
            <div className="filter-chips-wrap">
              <FChip
                label={t('filter_nsfw_hidden')}
                selected={draft.nsfwMode === 'hidden'}
                onClick={() => set('nsfwMode', 'hidden')}
              />
              <FChip
                label={t('filter_nsfw_show')}
                selected={draft.nsfwMode === 'show'}
                onClick={() => set('nsfwMode', 'show')}
              />
              <FChip
                label={t('filter_nsfw_blur')}
                selected={draft.nsfwMode === 'blur'}
                onClick={() => set('nsfwMode', 'blur')}
              />
            </div>
          </FilterGroup>
        </div>

        {/* Linha 3: Status da Obra + Especial */}
        <div className="filter-panel-row filter-panel-row--3col filter-panel-row--border">
          <FilterGroup label={t('filter_group_status_obra')}>
            <div className="filter-chips-wrap">
              {statusObraOpts.map(s => (
                <FChip
                  key={s.id}
                  label={getItemLabel(s, t)}
                  selected={draft.filterStatusObra === s.id}
                  onClick={() => toggle('filterStatusObra', s.id, FILTER_ALL)}
                />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label={t('filter_group_special')}>
            <div className="filter-chips-wrap">
              <FChip
                label={t('filter_favorites')}
                selected={draft.showFavoritosOnly}
                onClick={() => set('showFavoritosOnly', !draft.showFavoritosOnly)}
              />
            </div>
          </FilterGroup>
        </div>

        {/* Gêneros — colapsável */}
        {generos.length > 0 && (
          <CollapsibleSection
            label={t('filter_group_genres')}
            expanded={genresExpanded}
            onToggle={() => setGenresExpanded(v => !v)}
          >
            <div className="filter-chips-wrap filter-chips-wrap--dense">
              {generos.map(g => (
                <FChip
                  key={g.id || g.label}
                  label={getItemLabel(g, t)}
                  selected={draft.filterGenero === g.label}
                  onClick={() => toggle('filterGenero', g.label, FILTER_ALL)}
                />
              ))}
            </div>
          </CollapsibleSection>
        )}


      </div>

      {/* ── Rodapé fixo ──────────────────────────────────────────────────── */}
      <div className="filter-panel-footer">
        <div className="filter-panel-footer-chips">
          {activeChips.length === 0 ? (
            <span className="filter-panel-footer-empty">{t('filter_no_active')}</span>
          ) : (
            activeChips.map((chip, i) => (
              <span key={i} className="filter-active-chip">
                {chip.label}
                <button className="filter-active-chip-remove" onClick={chip.clear}>
                  <X size={9} />
                </button>
              </span>
            ))
          )}
        </div>

        <div className="filter-panel-footer-actions">
          <button className="filter-panel-cancel-btn" onClick={onClose}>
            {t('cancel')}
          </button>
          <button className="filter-panel-apply-btn" onClick={handleApply}>
            {t('filter_apply')}
            {activeCount > 0 && <span className="filter-panel-apply-badge">{activeCount}</span>}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────────────────────── */

function FilterGroup({ label, children }) {
  return (
    <div className="filter-group">
      <div className="filter-group-label">{label.toUpperCase()}</div>
      {children}
    </div>
  );
}

function FChip({ label, selected, onClick }) {
  return (
    <button
      className={`fchip ${selected ? 'fchip--selected' : ''}`}
      onClick={onClick}
    >
      {selected && <span className="fchip-dot" />}
      {label}
    </button>
  );
}

function CollapsibleSection({ label, expanded, onToggle, children }) {
  return (
    <div className="filter-collapsible">
      <button className="filter-collapsible-header" onClick={onToggle}>
        <span className="filter-collapsible-label">{label.toUpperCase()}</span>
        <ChevronDown
          size={13}
          className={`filter-collapsible-chevron ${expanded ? 'filter-collapsible-chevron--open' : ''}`}
        />
      </button>
      {expanded && (
        <div className="filter-collapsible-body">{children}</div>
      )}
    </div>
  );
}

export default LibraryFilterPanel;
