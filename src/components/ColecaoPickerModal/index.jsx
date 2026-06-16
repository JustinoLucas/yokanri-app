import { useMemo, useState } from 'react';
import { X, Search } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import './ColecaoPickerModal.css';

/**
 * ColecaoPickerModal — modal de seleção de obras para adicionar a uma coleção
 *
 * Props:
 *   obras       — lista completa de obras da biblioteca
 *   selectedIds — IDs já presentes na coleção (exibidos como desabilitados)
 *   onClose     — fecha o modal sem alterações
 *   onConfirm   — (novosIds: string[]) => void
 */
function ColecaoPickerModal({ obras, selectedIds, onClose, onConfirm }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState(new Set());

  const options = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...obras]
      .filter(o => !term || o.nome.toLowerCase().includes(term))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
  }, [obras, search]);

  const togglePick = (id) => {
    setPicked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    if (picked.size === 0) {
      onClose();
      return;
    }
    onConfirm([...picked]);
  };

  return (
    <div className="colvpm-overlay" onClick={onClose}>
      <div className="colvpm-modal" onClick={e => e.stopPropagation()}>
        <div className="colvpm-header">
          <h2>{t('colpicker_title')}</h2>
          <button className="colvpm-close" onClick={onClose} title={t('close')}>
            <X size={16} />
          </button>
        </div>

        <div className="colvpm-search">
          <Search size={14} className="colvpm-search-icon" />
          <input
            placeholder={t('colpicker_search_ph')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="colvpm-list">
          {options.length > 0 ? (
            options.map(obra => {
              const alreadyIn = selectedIds.includes(obra.id);
              const isPicked = picked.has(obra.id);
              return (
                <label
                  key={obra.id}
                  className={`colvpm-item${alreadyIn ? ' colvpm-item--disabled' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={alreadyIn || isPicked}
                    disabled={alreadyIn}
                    onChange={() => togglePick(obra.id)}
                  />
                  <span className="colvpm-item-name">{obra.nome}</span>
                  {alreadyIn && <span className="colvpm-item-tag">{t('colpicker_already_added')}</span>}
                </label>
              );
            })
          ) : (
            <p className="colvpm-empty">{t('colpicker_empty')}</p>
          )}
        </div>

        <div className="colvpm-footer">
          <button className="colvpm-btn colvpm-btn--ghost" onClick={onClose}>
            {t('cancel')}
          </button>
          <button
            className="colvpm-btn colvpm-btn--primary"
            onClick={handleConfirm}
            disabled={picked.size === 0}
          >
            {t('collection_add_obras')}{picked.size > 0 ? ` (${picked.size})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ColecaoPickerModal;
