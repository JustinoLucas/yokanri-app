import { Search, Plus, Settings, BarChart3, X } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import useCover from '../ObraCard/hooks/useCover';
import { useLanguage } from '../../i18n/LanguageContext';

const TIPO_COLORS = {
  'Coreano': '#1e40af',
  'Chinês':  '#991b1b',
  'Japonês': '#5b21b6',
};

/**
 * AppTopbar V3F — 48px de altura, full-width
 *
 * Props:
 *   onNewObra        — criar nova obra
 *   onShowStats      — navegar para estatísticas
 *   onShowConfig     — navegar para configurações
 *   workspaceMenu    — ReactNode do WorkspaceMenu
 *   obras            — array de obras para busca
 *   onNavigate       — (obra) => void — navega para o detalhe da obra
 */
function Topbar({ onNewObra, onShowStats, onShowConfig, workspaceMenu, obras = [], onNavigate }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  // Ctrl+K para focar
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === 'Escape') {
        setQuery('');
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const onMouseDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  // Resultados de busca
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return obras.filter(o =>
      o.nome.toLowerCase().includes(q) ||
      (o.nomeAlternativo || '').toLowerCase().includes(q) ||
      (o.autor || '').toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query, obras]);

  const handleSelect = (obra) => {
    onNavigate?.(obra);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    setOpen(true);
  };

  return (
    <header className="topbar" data-tauri-drag-region="">
      {/* Logo */}
      <svg className="topbar-logo" width="18" height="18" viewBox="0 0 56 56">
        <path
          d="M 10 10 L 10 30 L 28 30 L 28 46 M 46 10 L 28 30"
          stroke="var(--text-primary)"
          strokeWidth="5.5"
          strokeLinecap="square"
          fill="none"
        />
      </svg>

      <div className="topbar-divider" />
      {workspaceMenu}
      <div className="topbar-spacer" />

      {/* Busca com dropdown */}
      <div className="topbar-search-wrap" ref={wrapRef} data-tauri-drag-region="false">
        <div className={`topbar-search ${query ? 'topbar-search--active' : ''}`}>
          <Search size={13} className="topbar-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="topbar-search-input"
            placeholder={t('topbar_search_placeholder')}
            value={query}
            onChange={handleChange}
            onFocus={() => query && setOpen(true)}
          />
          {query ? (
            <button
              className="topbar-search-clear"
              onMouseDown={(e) => { e.preventDefault(); setQuery(''); setOpen(false); inputRef.current?.focus(); }}
            >
              <X size={11} />
            </button>
          ) : (
            <kbd className="topbar-search-kbd">Ctrl+K</kbd>
          )}
        </div>

        {/* Dropdown de resultados */}
        {open && results.length > 0 && (
          <div className="topbar-search-dropdown">
            {results.map(obra => (
              <button
                key={obra.id}
                className="topbar-search-result"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(obra); }}
              >
                <SearchResultCover obra={obra} />
                <div className="topbar-search-result-info">
                  <span className="topbar-search-result-name">{obra.nome}</span>
                  {obra.nomeAlternativo && (
                    <span className="topbar-search-result-alt">{obra.nomeAlternativo}</span>
                  )}
                </div>
                <span className="topbar-search-result-tipo">{obra.tipo}</span>
              </button>
            ))}
          </div>
        )}

        {/* Sem resultados */}
        {open && query.trim() && results.length === 0 && (
          <div className="topbar-search-dropdown">
            <div className="topbar-search-empty">{t('topbar_search_empty')}</div>
          </div>
        )}
      </div>

      {/* Add button */}
      <button className="topbar-add-btn" onClick={onNewObra}>
        <Plus size={13} />
        <span>{t('topbar_new_obra')}</span>
      </button>

      {/* Icon buttons */}
      <div className="topbar-icons">
        <button className="topbar-icon-btn" onClick={onShowStats} title={t('topbar_stats')}>
          <BarChart3 size={15} />
        </button>
        <button className="topbar-icon-btn" onClick={onShowConfig} title={t('topbar_settings')}>
          <Settings size={15} />
        </button>
      </div>
    </header>
  );
}

/**
 * Mini capa do resultado de busca — exibe a capa real da obra
 * ou, na ausência dela, um placeholder colorido por tipo.
 */
function SearchResultCover({ obra }) {
  const coverUrl = useCover(obra);
  const [imgError, setImgError] = useState(false);

  if (coverUrl && !imgError) {
    return (
      <img
        src={coverUrl}
        alt={obra.nome}
        className="topbar-search-result-cover"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className="topbar-search-result-cover topbar-search-result-cover--empty"
      style={{ background: TIPO_COLORS[obra.tipo] ?? '#1e293b' }}
    >
      {obra.nome.charAt(0).toUpperCase()}
    </div>
  );
}

export default Topbar;
