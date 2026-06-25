import { useState, useEffect } from 'react';
import { Pencil, Trash2, Check, X, Plus, Lock, ShieldAlert, Sun, Moon, ArrowLeft, RefreshCw, DownloadCloud, CheckCircle2, AlertCircle, RotateCcw, Heart, Key, ExternalLink, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { getItemLabel } from '../../i18n/itemLabel';
import { getVersion } from '@tauri-apps/api/app';
import { checkForUpdate, downloadAndInstall, restartApp } from '../../services/updaterService';
import { openUrl } from '@tauri-apps/plugin-opener';
import './Configuracoes.css';

// ─── Helpers ────────────────────────────────────────────────────────────────

function sortGeneros(list) {
  return [...list].sort((a, b) =>
    a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' })
  );
}

// ─── Configuração das abas ───────────────────────────────────────────────────

const TABS = [
  { id: 'geral',          labelKey: 'config_tab_general',     isGeneral: true },
  { id: 'aparencia',      labelKey: 'config_tab_aparencia',   isAparencia: true },
  { id: 'statusObra',     labelKey: 'config_tab_obra_status', hasColor: true,  hasHideSchedule: true  },
  { id: 'statusLeitura',  labelKey: 'config_tab_user_status', hasColor: true,  hasHideSchedule: false },
  { id: 'generos',        labelKey: 'config_tab_genres',      hasColor: false, hasHideSchedule: false },
  { id: 'supporter',      labelKey: 'config_tab_supporter',   isSupporter: true },
];

const SUP_PLATFORMS = [
  {
    id: 'patreon',
    name: 'Patreon',
    handle: 'patreon.com/yokanri',
    url: 'https://patreon.com/yokanri',
    color: '#FF424D',
    bg: 'rgba(255,66,77,0.08)',
    border: 'rgba(255,66,77,0.22)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.82 2.41C11.57 2.41 8.93 5.05 8.93 8.3c0 3.24 2.64 5.88 5.89 5.88 3.24 0 5.88-2.64 5.88-5.88 0-3.25-2.64-5.89-5.88-5.89zM3.1 21.6h3.16V2.41H3.1z"/>
      </svg>
    ),
  },
  {
    id: 'kofi',
    name: 'Ko-fi',
    handle: 'ko-fi.com/yokanri',
    url: 'https://ko-fi.com/yokanri',
    color: '#29ABE0',
    bg: 'rgba(41,171,224,0.08)',
    border: 'rgba(41,171,224,0.22)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.034-.099-.1-.099-.1S6.95 10.086 6.869 9.24c-.136-1.383.594-2.583 1.607-3.086 1.444-.723 3.935.854 4.135 3.305zm5.101.774l-1.308 1.332 1.332 1.308-1.332 1.332-1.308-1.308-1.332 1.308-1.332-1.332 1.308-1.308-1.308-1.332 1.332-1.332 1.308 1.308 1.332-1.308 1.332 1.332z"/>
      </svg>
    ),
  },
];

const CATEGORY_TO_OBRA_FIELD = {
  statusObra:     'status',
  statusLeitura:  'statusUsuario',
  tipoLancamento: 'tipoLancamento',
  generos:        'generos',
};

const NSFW_MODE_KEYS = [
  { value: 'show',   labelKey: 'config_nsfw_show_label',   descKey: 'config_nsfw_show_desc' },
  { value: 'blur',   labelKey: 'config_nsfw_blur_label',   descKey: 'config_nsfw_blur_desc' },
  { value: 'hidden', labelKey: 'config_nsfw_hidden_label', descKey: 'config_nsfw_hidden_desc' },
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
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(() => getItemLabel(item, t));
  const [editError, setEditError] = useState('');

  const displayLabel = getItemLabel(item, t);

  const handleConfirmEdit = async () => {
    // Sem mudança se o texto for igual ao label exibido (traduzido ou customizado)
    if (!editValue.trim() || editValue.trim() === displayLabel) {
      setEditing(false);
      return;
    }
    const result = await onRename(item.id, editValue.trim());
    if (result === 'duplicate') {
      setEditError(t('config_item_duplicate').replace('{name}', editValue.trim()));
      return;
    }
    setEditing(false);
    setEditError('');
  };

  const handleCancelEdit = () => {
    setEditValue(displayLabel);
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
            title={t('config_item_choose_color')}
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
        <span className="config-item-label">{getItemLabel(item, t)}</span>
      )}

      {hasHideSchedule && (
        <label className="config-item-toggle" title={t('config_item_hide_sch_title')}>
          <input
            type="checkbox"
            checked={!!item.hideSchedule}
            onChange={() => onToggleHideSchedule(item.id)}
            disabled={item.protected}
          />
          <span>{t('config_item_hide_schedule')}</span>
        </label>
      )}

      {hasNsfw && (
        <button
          className={`config-nsfw-btn${item.nsfw ? ' config-nsfw-btn--active' : ''}`}
          onClick={() => onToggleNsfw(item.id)}
          title={item.nsfw ? t('config_nsfw_marked') : t('config_nsfw_mark')}
        >
          <ShieldAlert size={13} />
          <span>+18</span>
        </button>
      )}

      {(item.protected || readonly) ? (
        <div className="config-item-protected">
          <Lock size={11} />
          {t('config_item_fixed')}
        </div>
      ) : item.isFixed ? (
        <div className="config-item-actions">
          {editing ? (
            <>
              <button className="config-btn confirm" onClick={handleConfirmEdit} title={t('confirm')}><Check size={13} /></button>
              <button className="config-btn" onClick={handleCancelEdit} title={t('cancel')}><X size={13} /></button>
            </>
          ) : (
            <button className="config-btn" onClick={() => { setEditValue(displayLabel); setEditing(true); }} title={t('rename')}>
              <Pencil size={13} />
            </button>
          )}
        </div>
      ) : (
        <div className="config-item-actions">
          {editing ? (
            <>
              <button className="config-btn confirm" onClick={handleConfirmEdit} title={t('confirm')}><Check size={13} /></button>
              <button className="config-btn" onClick={handleCancelEdit} title={t('cancel')}><X size={13} /></button>
            </>
          ) : (
            <>
              <button className="config-btn" onClick={() => { setEditValue(displayLabel); setEditing(true); }} title={t('rename')}>
                <Pencil size={13} />
              </button>
              <button className="config-btn danger" onClick={() => onDelete(item.id, item.label)} title={t('delete')}>
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

function renderMarkdown(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (/^### (.+)/.test(line))  return <p key={i} className="config-notes-h3">{line.replace(/^### /, '')}</p>;
    if (/^## (.+)/.test(line))   return <p key={i} className="config-notes-h2">{line.replace(/^## /, '')}</p>;
    if (/^- (.+)/.test(line))    return <p key={i} className="config-notes-li">· {line.replace(/^- /, '').replace(/\*\*(.+?)\*\*/g, '$1')}</p>;
    if (/^---$/.test(line))      return <hr key={i} className="config-notes-hr" />;
    if (line.trim() === '')      return <div key={i} className="config-notes-gap" />;
    return <p key={i} className="config-notes-p">{line.replace(/\*\*(.+?)\*\*/g, '$1')}</p>;
  });
}

function UpdateSection() {
  const { t } = useLanguage();
  const [appVersion, setAppVersion] = useState('');
  const [status, setStatus] = useState('idle'); // idle | checking | up-to-date | available | downloading | finished | error
  const [update, setUpdate] = useState(null);
  const [progress, setProgress] = useState(0);
  const [releaseNotes, setReleaseNotes] = useState('');

  useEffect(() => {
    getVersion().then(setAppVersion).catch(() => {});
  }, []);

  const handleCheck = async () => {
    setStatus('checking');
    try {
      const result = await checkForUpdate();
      if (result) {
        setUpdate(result);
        setReleaseNotes(result.body || '');
        setStatus('available');
      } else {
        setStatus('up-to-date');
      }
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
      setStatus('error');
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

  const showNotes = releaseNotes && ['available', 'downloading', 'finished'].includes(status);

  return (
    <div className="config-section">
      <span className="config-section-label">{t('config_section_updates')}</span>

      <div className="config-row">
        <div className="config-row-info">
          <span className="config-row-title">{t('config_current_version')}</span>
          <span className="config-row-desc">Yokanri v{appVersion || '—'}</span>
        </div>

        {(status === 'idle' || status === 'up-to-date' || status === 'error') && (
          <button className="config-theme-btn" onClick={handleCheck}>
            <RefreshCw size={13} />
            {t('config_check_updates')}
          </button>
        )}

        {status === 'checking' && (
          <button className="config-theme-btn" disabled>
            <RefreshCw size={13} className="config-spin" />
            {t('config_checking')}
          </button>
        )}

        {status === 'available' && (
          <button className="config-theme-btn config-theme-btn--accent" onClick={handleUpdate}>
            <DownloadCloud size={13} />
            {t('config_update_available').replace('{version}', update.version)}
          </button>
        )}

        {status === 'finished' && (
          <button className="config-theme-btn config-theme-btn--accent" onClick={restartApp}>
            <RefreshCw size={13} />
            {t('config_restart_now')}
          </button>
        )}
      </div>

      {status === 'up-to-date' && (
        <p className="config-update-status">
          <CheckCircle2 size={13} />
          {t('config_up_to_date')}
        </p>
      )}

      {status === 'downloading' && (
        <div className="config-update-progress">
          <div className="config-update-progress-bar">
            <div className="config-update-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="config-update-progress-text">
            {t('config_downloading').replace('{progress}', progress)}
          </span>
        </div>
      )}

      {status === 'finished' && (
        <p className="config-update-status">
          <CheckCircle2 size={13} />
          {t('config_update_installed')}
        </p>
      )}

      {status === 'error' && (
        <p className="config-update-status config-update-status--error">
          <AlertCircle size={13} />
          {t('config_update_error')}
        </p>
      )}

      {showNotes && (
        <div className="config-update-notes">
          <span className="config-update-notes-title">
            {status === 'finished'
              ? t('config_update_notes_installed').replace('{version}', update?.version)
              : t('config_update_notes_available').replace('{version}', update?.version)
            }
          </span>
          <div className="config-update-notes-body">
            {renderMarkdown(releaseNotes)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Aba Aparência ───────────────────────────────────────────────────────────

function TabAparencia() {
  const { theme, toggleTheme, accent, setAccent, visibleThemes } = useTheme();
  const { t } = useLanguage();

  return (
    <div className="config-geral">

      {/* Modo claro/escuro */}
      <div className="config-section">
        <span className="config-section-label">{t('config_theme_label')}</span>
        <div className="config-row">
          <div className="config-row-info">
            <span className="config-row-title">
              {theme === 'dark' ? t('config_theme_dark_active') : t('config_theme_light_active')}
            </span>
          </div>
          <button className="config-theme-btn" onClick={toggleTheme}>
            {theme === 'dark'
              ? <><Sun size={13} /> {t('config_theme_to_light')}</>
              : <><Moon size={13} /> {t('config_theme_to_dark')}</>
            }
          </button>
        </div>
      </div>

      {/* Cor de destaque */}
      <div className="config-section">
        <span className="config-section-label">{t('config_accent_label')}</span>
        <div className="config-accent-grid">
          {visibleThemes.map(th => (
            <button
              key={th.id}
              className={`config-accent-swatch${accent === th.id ? ' config-accent-swatch--active' : ''}`}
              style={{ background: th.gradient }}
              title={th.label || th.id}
              onClick={() => setAccent(th.id)}
              aria-label={th.label || th.id}
            >
              {accent === th.id && (
                <span className="config-accent-check">
                  <Check size={14} strokeWidth={3} />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─── Aba Geral ───────────────────────────────────────────────────────────────

function TabGeral({ nsfwMode, onSetNsfwMode, onGoToSupporter }) {
  const { language, setLanguage, languages, t } = useLanguage();

  return (
    <div className="config-geral">

      {/* Atualizações */}
      <UpdateSection />

      {/* Banner Supporter */}
      <div className="config-section">
        <button className="config-sup-banner" onClick={onGoToSupporter}>
          <div className="config-sup-banner-icon">
            <Heart size={18} />
          </div>
          <div className="config-sup-banner-info">
            <span className="config-sup-banner-title">{t('sup_banner_title')}</span>
            <span className="config-sup-banner-desc">{t('sup_banner_desc')}</span>
          </div>
          <ChevronRight size={16} className="config-sup-banner-arrow" />
        </button>
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
                  {lang.flag} {t('lang_name_' + lang.code) || lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Conteúdo adulto */}
      <div className="config-section">
        <span className="config-section-label">{t('config_section_nsfw')}</span>

        <div className="config-nsfw-modes">
          {NSFW_MODE_KEYS.map(mode => (
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
                <span className="config-nsfw-mode-label">{t(mode.labelKey)}</span>
                <span className="config-nsfw-mode-desc">{t(mode.descKey)}</span>
              </div>
            </label>
          ))}
        </div>

        <p className="config-nsfw-hint">{t('config_nsfw_hint')}</p>
      </div>

    </div>
  );
}

// ─── Aba Supporter ───────────────────────────────────────────────────────────

function TabSupporter() {
  const { t } = useLanguage();

  const handlePlatformClick = (url) => {
    openUrl(url).catch(() => {});
  };

  const benefits = [
    t('sup_benefit_1'),
    t('sup_benefit_2'),
    t('sup_benefit_3'),
    t('sup_benefit_4'),
    t('sup_benefit_5'),
  ];

  return (
    <div className="config-sup-page">

      {/* Hero */}
      <div className="config-sup-hero">
        <div className="config-sup-hero-icon">♥</div>
        <div className="config-sup-hero-text">
          <span className="config-sup-hero-title">{t('sup_title')}</span>
          <span className="config-sup-hero-subtitle">{t('sup_subtitle')}</span>
        </div>
      </div>

      {/* Benefícios */}
      <div>
        <span className="config-sup-section-label">{t('sup_benefits_title')}</span>
        <div className="config-sup-benefits">
          {benefits.map((b, i) => (
            <div key={i} className="config-sup-benefit">
              <div className="config-sup-benefit-check">✓</div>
              {b}
            </div>
          ))}
        </div>
      </div>

      {/* Plataformas */}
      <div>
        <span className="config-sup-section-label">{t('sup_platforms_title')}</span>
        <div className="config-sup-platforms">
          {SUP_PLATFORMS.map(p => (
            <button
              key={p.id}
              className="config-sup-platform-card"
              style={{
                '--platform-color':  p.color,
                '--platform-bg':     p.bg,
                '--platform-border': p.border,
              }}
              onClick={() => handlePlatformClick(p.url)}
            >
              <div className="config-sup-platform-icon">{p.icon}</div>
              <div className="config-sup-platform-info">
                <span className="config-sup-platform-name">{p.name}</span>
                <span className="config-sup-platform-handle">{p.handle}</span>
              </div>
              <ExternalLink size={14} className="config-sup-platform-arrow" />
            </button>
          ))}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
          {t('sup_platforms_subtitle')}
        </p>
      </div>

      {/* Key — Em breve */}
      <div className="config-sup-key-box">
        <Key size={16} className="config-sup-key-icon" />
        <div className="config-sup-key-info">
          <span className="config-sup-key-title">
            {t('sup_key_title')}
            <span className="config-sup-key-soon-badge">{t('sup_key_soon')}</span>
          </span>
          <span className="config-sup-key-desc">{t('sup_key_desc')}</span>
        </div>
      </div>

    </div>
  );
}

// ─── Modal de reset ──────────────────────────────────────────────────────────

function ResetModal({ tabLabel, onConfirm, onCancel }) {
  const { t } = useLanguage();
  return (
    <div className="config-modal-overlay" onClick={onCancel}>
      <div className="config-modal" onClick={e => e.stopPropagation()}>
        <div className="config-modal-header">
          <RotateCcw size={18} className="config-modal-icon--warn" />
          <h3>{t('config_reset_title') || 'Restaurar padrões'}</h3>
        </div>
        <div className="config-modal-body">
          <p>
            {(t('config_reset_desc') || 'Os itens padrão de "{tab}" que foram renomeados voltarão aos nomes originais. Itens criados por você serão mantidos.')
              .replace('{tab}', tabLabel)}
          </p>
          <p className="config-modal-warning">
            {t('config_reset_warning') || 'Esta ação não pode ser desfeita.'}
          </p>
        </div>
        <div className="config-modal-footer">
          <button className="config-modal-btn" onClick={onCancel}>
            {t('cancel') || 'Cancelar'}
          </button>
          <button className="config-modal-btn config-modal-btn--danger" onClick={onConfirm}>
            <RotateCcw size={13} />
            {t('config_reset_confirm') || 'Restaurar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

function Configuracoes({ config, obras, onAdd, onRename, onDelete, onUpdateColor, onToggleHideSchedule, onToggleGenreNsfw, onSetNsfwMode, onReset, onClose }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('geral');
  const [newItemValue, setNewItemValue] = useState('');
  const [newItemColor, setNewItemColor] = useState('#888888');
  const [addError, setAddError] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const handleReset = async () => {
    await onReset(activeTab);
    setResetModalOpen(false);
  };

  if (!config) return <div className="config-loading">{t('config_loading')}</div>;

  const activeTabDef = TABS.find(tab => tab.id === activeTab);
  const isGeneral   = !!activeTabDef?.isGeneral;
  const isAparencia = !!activeTabDef?.isAparencia;
  const isSupporter = !!activeTabDef?.isSupporter;
  const isReadonly  = !!activeTabDef?.readonly;

  const rawItems = config[activeTab] ?? [];
  const items = (activeTab === 'generos' ? sortGeneros(rawItems) : rawItems)
    .filter(item => !item.hidden);

  const nsfwMode = config?.nsfwMode ?? 'show';

  const handleAdd = async () => {
    if (!newItemValue.trim()) return;
    const result = await onAdd(activeTab, newItemValue.trim(), newItemColor);
    if (result === 'duplicate') {
      setAddError(t('config_item_duplicate_list').replace('{name}', newItemValue.trim()));
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
    let msg = t('config_delete_confirm').replace('{name}', label);
    if (activeTab === 'generos' && affected > 0) {
      msg += t('config_delete_genre_affected').replace('{count}', affected);
    } else if (activeTab !== 'generos' && affected > 0) {
      msg += t('config_delete_status_affected').replace('{count}', affected);
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
            {t('config_back')}
          </button>
        )}
        <div className="config-bar-divider" />
        <span className="config-bar-title">{t('config_title')}</span>
      </div>

      {/* ── Body: nav + content ───────────────────────────── */}
      <div className="config-body">

        {/* Vertical nav */}
        <nav className="config-nav">
          <span className="config-nav-section-label">{t('config_nav_label')}</span>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`config-nav-item${activeTab === tab.id ? ' config-nav-item--active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="config-content">

          {isGeneral ? (
            <TabGeral
              nsfwMode={nsfwMode}
              onSetNsfwMode={onSetNsfwMode}
              onGoToSupporter={() => handleTabChange('supporter')}
            />
          ) : isAparencia ? (
            <TabAparencia />
          ) : isSupporter ? (
            <TabSupporter />
          ) : (
            <>
              <div className="config-content-header">
                <span className="config-content-title">{t(activeTabDef?.labelKey)}</span>
                <button className="config-reset-btn" onClick={() => setResetModalOpen(true)} title={t('config_reset_title') || 'Restaurar padrões'}>
                  <RotateCcw size={13} />
                  {t('config_reset_btn') || 'Restaurar padrões'}
                </button>
              </div>

              {!isReadonly && (
                <div className="config-add-section">
                  <div className="config-add-row">
                    {activeTabDef?.hasColor && (
                      <input
                        type="color"
                        className="config-add-color"
                        value={newItemColor}
                        onChange={e => setNewItemColor(e.target.value)}
                        title={t('config_item_choose_color')}
                      />
                    )}
                    <input
                      className="config-add-input"
                      placeholder={t('config_item_add_ph')}
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
                      {t('config_item_add_btn')}
                    </button>
                  </div>
                  {addError && <span className="config-add-error">{addError}</span>}
                </div>
              )}

              <div className="config-list">
                {items.length === 0 ? (
                  <div className="config-empty">{t('config_item_none')}</div>
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
                <p className="config-readonly-note">{t('config_readonly_note')}</p>
              )}
            </>
          )}

        </div>
      </div>

      {resetModalOpen && (
        <ResetModal
          tabLabel={t(activeTabDef?.labelKey)}
          onConfirm={handleReset}
          onCancel={() => setResetModalOpen(false)}
        />
      )}
    </div>
  );
}

export default Configuracoes;
