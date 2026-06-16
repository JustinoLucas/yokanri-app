import { useState, useEffect } from 'react';
import { Pencil, Trash2, Check, X, Plus, Lock, ShieldAlert, Sun, Moon, ArrowLeft, RefreshCw, DownloadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { getVersion } from '@tauri-apps/api/app';
import { checkForUpdate, downloadAndInstall, restartApp } from '../../services/updaterService';
import './Configuracoes.css';

// ─── Helpers ────────────────────────────────────────────────────────────────

function sortGeneros(list) {
  return [...list].sort((a, b) =>
    a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' })
  );
}

// ─── Configuração das abas ───────────────────────────────────────────────────

const TABS = [
  { id: 'geral',          label: 'Geral',               isGeneral: true },
  { id: 'statusObra',     label: 'Status da Obra',       hasColor: true,  hasHideSchedule: true  },
  { id: 'statusLeitura',  label: 'Meu Status',           hasColor: true,  hasHideSchedule: false },
  { id: 'generos',        label: 'Gêneros',              hasColor: false, hasHideSchedule: false },
];

const CATEGORY_TO_OBRA_FIELD = {
  statusObra:     'status',
  statusLeitura:  'statusUsuario',
  tipoLancamento: 'tipoLancamento',
  generos:        'generos',
};

const NSFW_MODES = [
  { value: 'show',   label: 'Mostrar normalmente',  desc: 'Conteúdo adulto exibido sem restrição.' },
  { value: 'blur',   label: 'Exibir com blur',       desc: 'Capas borradas — reveladas só por clique explícito.' },
  { value: 'hidden', label: 'Ocultar completamente', desc: 'Obras NSFW não aparecem na biblioteca.' },
];

// ─── Contagem de obras afetadas ──────────────────────────────────────────────

function countAffected(obras, category, itemId, itemLabel) {
  const field = CATEGORY_TO_OBRA_FIELD[category];
  if (!obras || !field) return 0;
  return obras.filter(obra => {
    if (category === 'generos') return Array.isArray(obra.generos) && obra.generos.includes(itemLabel);
    return obra[field] === itemId;
  }).length;
}

// ─── Config item row ─────────────────────────────────────────────────────────

function ConfigItem({ item, hasColor, hasHideSchedule, hasNsfw, readonly, onRename, onDelete, onUpdateColor, onToggleHideSchedule, onToggleNsfw }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.label);
  const [editError, setEditError] = useState('');

  const handleConfirmEdit = async () => {
    if (!editValue.trim() || editValue.trim() === item.label) {
      setEditing(false);
      return;
    }
    const result = await onRename(item.id, editValue.trim());
    if (result === 'duplicate') {
      setEditError(`"${editValue.trim()}" já existe.`);
      return;
    }
    setEditing(false);
    setEditError('');
  };

  const handleCancelEdit = () => {
    setEditValue(item.label);
    setEditing(false);
    setEditError('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleConfirmEdit();
    if (e.key === 'Escape') handleCancelEdit();
  };

  return (
    <div className={`config-item${editing ? ' editing' : ''}`}>
      {hasColor && (
        <div className="config-item-color">
          <input
            type="color"
            value={item.color || '#888888'}
            onChange={e => onUpdateColor(item.id, e.target.value)}
            title="Escolher cor"
            disabled={item.protected || item.hidden}
          />
        </div>
      )}

      {editing ? (
        <div className="config-item-edit-wrapper">
          <input
            className="config-item-input"
            value={editValue}
            onChange={e => { setEditValue(e.target.value); setEditError(''); }}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          {editError && <span className="config-item-error">{editError}</span>}
        </div>
      ) : (
        <span className="config-item-label">{item.label}</span>
      )}

      {hasHideSchedule && (
        <label className="config-item-toggle" title="Ocultar seção de padrão de lançamento">
          <input
            type="checkbox"
            checked={!!item.hideSchedule}
            onChange={() => onToggleHideSchedule(item.id)}
            disabled={item.protected}
          />
          <span>oculta lançamento</span>
        </label>
      )}

      {hasNsfw && (
        <button
          className={`config-nsfw-btn${item.nsfw ? ' config-nsfw-btn--active' : ''}`}
          onClick={() => onToggleNsfw(item.id)}
          title={item.nsfw ? 'Marcado como NSFW — clique para desmarcar' : 'Marcar como NSFW (+18)'}
        >
          <ShieldAlert size={13} />
          <span>+18</span>
        </button>
      )}

      {(item.protected || readonly) ? (
        <div className="config-item-protected">
          <Lock size={11} />
          fixo
        </div>
      ) : item.isFixed ? (
        <div className="config-item-actions">
          {editing ? (
            <>
              <button className="config-btn confirm" onClick={handleConfirmEdit} title="Confirmar"><Check size={13} /></button>
              <button className="config-btn" onClick={handleCancelEdit} title="Cancelar"><X size={13} /></button>
            </>
          ) : (
            <button className="config-btn" onClick={() => { setEditValue(item.label); setEditing(true); }} title="Renomear">
              <Pencil size={13} />
            </button>
          )}
        </div>
      ) : (
        <div className="config-item-actions">
          {editing ? (
            <>
              <button className="config-btn confirm" onClick={handleConfirmEdit} title="Confirmar"><Check size={13} /></button>
              <button className="config-btn" onClick={handleCancelEdit} title="Cancelar"><X size={13} /></button>
            </>
          ) : (
            <>
              <button className="config-btn" onClick={() => { setEditValue(item.label); setEditing(true); }} title="Renomear">
                <Pencil size={13} />
              </button>
              <button className="config-btn danger" onClick={() => onDelete(item.id, item.label)} title="Excluir">
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Seção de Atualizações ───────────────────────────────────────────────────

function UpdateSection() {
  const [appVersion, setAppVersion] = useState('');
  const [status, setStatus] = useState('idle'); // idle | checking | up-to-date | available | downloading | finished | error
  const [update, setUpdate] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    getVersion().then(setAppVersion).catch(() => {});
  }, []);

  const handleCheck = async () => {
    setStatus('checking');
    const result = await checkForUpdate();
    if (result) {
      setUpdate(result);
      setStatus('available');
    } else {
      setStatus('up-to-date');
    }
  };

  const handleUpdate = async () => {
    if (!update) return;
    setStatus('downloading');
    setProgress(0);

    try {
      await downloadAndInstall(update, ({ status: progressStatus, contentLength, downloaded }) => {
        if (progressStatus === 'progress' && contentLength > 0) {
          setProgress(Math.min(100, Math.round((downloaded / contentLength) * 100)));
        }
        if (progressStatus === 'finished') {
          setProgress(100);
        }
      });
      setStatus('finished');
    } catch (error) {
      console.error('Erro ao baixar/instalar atualização:', error);
      setStatus('error');
    }
  };

  return (
    <div className="config-section">
      <span className="config-section-label">Atualizações</span>

      <div className="config-row">
        <div className="config-row-info">
          <span className="config-row-title">Versão atual</span>
          <span className="config-row-desc">Yokanri v{appVersion || '—'}</span>
        </div>

        {(status === 'idle' || status === 'up-to-date' || status === 'error') && (
          <button className="config-theme-btn" onClick={handleCheck}>
            <RefreshCw size={13} />
            Verificar atualizações
          </button>
        )}

        {status === 'checking' && (
          <button className="config-theme-btn" disabled>
            <RefreshCw size={13} className="config-spin" />
            Verificando…
          </button>
        )}

        {status === 'available' && (
          <button className="config-theme-btn config-theme-btn--accent" onClick={handleUpdate}>
            <DownloadCloud size={13} />
            Atualizar para v{update.version}
          </button>
        )}

        {status === 'finished' && (
          <button className="config-theme-btn config-theme-btn--accent" onClick={restartApp}>
            <RefreshCw size={13} />
            Reiniciar agora
          </button>
        )}
      </div>

      {status === 'up-to-date' && (
        <p className="config-update-status">
          <CheckCircle2 size={13} />
          Você já está na versão mais recente.
        </p>
      )}

      {status === 'downloading' && (
        <div className="config-update-progress">
          <div className="config-update-progress-bar">
            <div className="config-update-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="config-update-progress-text">Baixando atualização… {progress}%</span>
        </div>
      )}

      {status === 'finished' && (
        <p className="config-update-status">
          <CheckCircle2 size={13} />
          Atualização instalada — reinicie para aplicar.
        </p>
      )}

      {status === 'error' && (
        <p className="config-update-status config-update-status--error">
          <AlertCircle size={13} />
          Não foi possível verificar/instalar a atualização.
        </p>
      )}
    </div>
  );
}

// ─── Aba Geral ───────────────────────────────────────────────────────────────

function TabGeral({ nsfwMode, onSetNsfwMode }) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, languages, t } = useLanguage();

  return (
    <div className="config-geral">

      {/* Atualizações */}
      <UpdateSection />

      {/* Aparência */}
      <div className="config-section">
        <span className="config-section-label">Aparência</span>
        <div className="config-row">
          <div className="config-row-info">
            <span className="config-row-title">Tema</span>
            <span className="config-row-desc">
              {theme === 'dark' ? 'Tema escuro ativo' : 'Tema claro ativo'}
            </span>
          </div>
          <button className="config-theme-btn" onClick={toggleTheme}>
            {theme === 'dark'
              ? <><Sun size={13} /> Claro</>
              : <><Moon size={13} /> Escuro</>
            }
          </button>
        </div>
      </div>

      {/* Idioma */}
      <div className="config-section">
        <span className="config-section-label">{t('config_section_language')}</span>
        <div className="config-row">
          <div className="config-row-info">
            <span className="config-row-title">{t('config_language_label')}</span>
            <span className="config-row-desc">{t('config_language_desc')}</span>
          </div>
          <div className="config-language-select-wrapper">
            <select
              className="config-language-select"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Conteúdo adulto */}
      <div className="config-section">
        <span className="config-section-label">Conteúdo adulto (+18)</span>

        <div className="config-nsfw-modes">
          {NSFW_MODES.map(mode => (
            <label
              key={mode.value}
              className={`config-nsfw-mode-option${nsfwMode === mode.value ? ' selected' : ''}`}
            >
              <input
                type="radio"
                name="nsfwMode"
                value={mode.value}
                checked={nsfwMode === mode.value}
                onChange={() => onSetNsfwMode(mode.value)}
              />
              <div className="config-nsfw-mode-info">
                <span className="config-nsfw-mode-label">{mode.label}</span>
                <span className="config-nsfw-mode-desc">{mode.desc}</span>
              </div>
            </label>
          ))}
        </div>

        <p className="config-nsfw-hint">
          Marque gêneros como +18 na seção "Gêneros".
          No modo blur, a capa é revelada ao clicar nela.
        </p>
      </div>

    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

function Configuracoes({ config, obras, onAdd, onRename, onDelete, onUpdateColor, onToggleHideSchedule, onToggleGenreNsfw, onSetNsfwMode, onClose }) {
  const [activeTab, setActiveTab] = useState('geral');
  const [newItemValue, setNewItemValue] = useState('');
  const [newItemColor, setNewItemColor] = useState('#888888');
  const [addError, setAddError] = useState('');

  if (!config) return <div className="config-loading">Carregando configurações…</div>;

  const activeTabDef = TABS.find(t => t.id === activeTab);
  const isGeneral  = !!activeTabDef?.isGeneral;
  const isReadonly = !!activeTabDef?.readonly;

  const rawItems = config[activeTab] ?? [];
  const items = (activeTab === 'generos' ? sortGeneros(rawItems) : rawItems)
    .filter(item => !item.hidden);

  const nsfwMode = config?.nsfwMode ?? 'show';

  const handleAdd = async () => {
    if (!newItemValue.trim()) return;
    const result = await onAdd(activeTab, newItemValue.trim(), newItemColor);
    if (result === 'duplicate') {
      setAddError(`"${newItemValue.trim()}" já existe nesta lista.`);
      return;
    }
    setNewItemValue('');
    setNewItemColor('#888888');
    setAddError('');
  };

  const handleNewKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  const handleDelete = (id, label) => {
    const affected = countAffected(obras, activeTab, id, label);
    let msg = `Excluir "${label}"?`;
    if (activeTab === 'generos' && affected > 0) {
      msg += `\n\nEste gênero será removido de ${affected} obra(s).`;
    } else if (activeTab !== 'generos' && affected > 0) {
      msg += `\n\n${affected} obra(s) com este valor serão redefinidas como "Não definido".`;
    }
    if (confirm(msg)) onDelete(activeTab, id);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setNewItemValue('');
    setNewItemColor('#888888');
    setAddError('');
  };

  return (
    <div className="configuracoes-v3f">

      {/* ── Back bar ──────────────────────────────────────── */}
      <div className="config-bar">
        {onClose && (
          <button className="config-bar-back" onClick={onClose}>
            <ArrowLeft size={13} />
            Biblioteca
          </button>
        )}
        <div className="config-bar-divider" />
        <span className="config-bar-title">Configurações</span>
      </div>

      {/* ── Body: nav + content ───────────────────────────── */}
      <div className="config-body">

        {/* Vertical nav */}
        <nav className="config-nav">
          <span className="config-nav-section-label">Opções</span>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`config-nav-item${activeTab === tab.id ? ' config-nav-item--active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="config-content">

          {isGeneral ? (
            <TabGeral nsfwMode={nsfwMode} onSetNsfwMode={onSetNsfwMode} />
          ) : (
            <>
              <div className="config-list">
                {items.length === 0 ? (
                  <div className="config-empty">Nenhum item cadastrado.</div>
                ) : (
                  items.map(item => (
                    <ConfigItem
                      key={item.id}
                      item={item}
                      hasColor={activeTabDef?.hasColor}
                      hasHideSchedule={activeTabDef?.hasHideSchedule}
                      hasNsfw={activeTab === 'generos'}
                      readonly={isReadonly}
                      onRename={(id, newLabel) => onRename(activeTab, id, newLabel)}
                      onDelete={handleDelete}
                      onUpdateColor={(id, color) => onUpdateColor(activeTab, id, color)}
                      onToggleHideSchedule={onToggleHideSchedule}
                      onToggleNsfw={onToggleGenreNsfw}
                    />
                  ))
                )}
              </div>

              {isReadonly && (
                <p className="config-readonly-note">
                  Os tipos de lançamento são gerenciados pelo sistema e não podem ser alterados.
                </p>
              )}

              {!isReadonly && (
                <div className="config-add-section">
                  <div className="config-add-row">
                    {activeTabDef?.hasColor && (
                      <input
                        type="color"
                        className="config-add-color"
                        value={newItemColor}
                        onChange={e => setNewItemColor(e.target.value)}
                        title="Cor do novo item"
                      />
                    )}
                    <input
                      className="config-add-input"
                      placeholder="Novo item…"
                      value={newItemValue}
                      onChange={e => { setNewItemValue(e.target.value); setAddError(''); }}
                      onKeyDown={handleNewKeyDown}
                    />
                    <button
                      className="config-add-btn"
                      onClick={handleAdd}
                      disabled={!newItemValue.trim()}
                    >
                      <Plus size={14} />
                      Adicionar
                    </button>
                  </div>
                  {addError && <span className="config-add-error">{addError}</span>}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default Configuracoes;
