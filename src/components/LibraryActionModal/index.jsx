import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Download, Upload, FolderInput, BookOpen,
  Image as ImageIcon, Calendar, HardDrive, FolderOpen,
  ArrowRight, AlertTriangle, CheckCircle, XCircle,
  GitMerge, RefreshCw, FolderPlus, Loader,
  FileWarning, ShieldCheck, MoveRight, Files,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import './LibraryActionModal.css';

// ─── HELPERS ───────────────────────────────────────────────

function fmtBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function fmtPath(path, maxLen = 55) {
  if (!path) return '';
  if (path.length <= maxLen) return path;
  const half = Math.floor(maxLen / 2) - 2;
  return path.slice(0, half) + '…' + path.slice(path.length - half);
}

function fmtDate(isoStr, unknown) {
  if (!isoStr) return unknown;
  return new Date(isoStr).toLocaleDateString(undefined, {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function getStepKey(type, importMode) {
  if (type === 'export') return 'export';
  if (type === 'move') return 'move';
  if (type === 'import') return `import_${importMode || 'merge'}`;
  return 'export';
}

// ─── SUB-COMPONENTS ────────────────────────────────────────

function StatChip({ icon: Icon, value, label }) {
  return (
    <div className="lam-stat-chip">
      <Icon size={13} className="lam-stat-chip-icon" />
      <span className="lam-stat-chip-value">{value}</span>
      {label && <span className="lam-stat-chip-label">{label}</span>}
    </div>
  );
}

function PathRow({ label, path, variant = 'default' }) {
  return (
    <div className={`lam-path-row lam-path-row--${variant}`}>
      <span className="lam-path-label">{label}</span>
      <span className="lam-path-value" title={path}>{fmtPath(path)}</span>
    </div>
  );
}

function Badge({ type, children }) {
  return <span className={`lam-badge lam-badge--${type}`}>{children}</span>;
}

// ─── PREVIEW PANELS ────────────────────────────────────────

function ExportPreviewPanel({ preview, t }) {
  return (
    <div className="lam-preview-card">
      <div className="lam-preview-name">
        <BookOpen size={15} className="lam-preview-name-icon" />
        {preview.workspaceName}
      </div>
      <div className="lam-stat-row">
        <StatChip icon={BookOpen}  value={preview.obraCount ?? 0}               label={t('lam_stat_obras')} />
        <StatChip icon={ImageIcon} value={preview.coverCount ?? 0}              label={t('lam_stat_capas')} />
        <StatChip icon={HardDrive} value={fmtBytes(preview.estimatedSizeBytes)} />
      </div>
      <PathRow label={t('lam_label_dest')} path={preview.savePath} />
      {preview.fileExists && (
        <div className="lam-warning-banner">
          <FileWarning size={14} />
          <span>{t('lam_warn_file_exists')}</span>
        </div>
      )}
    </div>
  );
}

function ImportPreviewPanel({ preview, t }) {
  const isCompatible = !preview.version || preview.version <= 1;
  return (
    <div className="lam-preview-card">
      <div className="lam-preview-name">
        <BookOpen size={15} className="lam-preview-name-icon" />
        {preview.workspaceName}
        {isCompatible
          ? <Badge type="success"><ShieldCheck size={11} /> {t('lam_badge_compatible')}</Badge>
          : <Badge type="warning"><AlertTriangle size={11} /> {t('lam_badge_check_version')}</Badge>
        }
      </div>
      <div className="lam-stat-row">
        <StatChip icon={BookOpen}  value={preview.obraCount ?? 0}  label={t('lam_stat_obras')} />
        <StatChip icon={ImageIcon} value={preview.coverCount ?? 0} label={t('lam_stat_capas')} />
        <StatChip icon={Calendar}  value={fmtDate(preview.exportDate, t('lam_date_unknown'))} />
        {preview.fileSizeBytes > 0 && (
          <StatChip icon={HardDrive} value={fmtBytes(preview.fileSizeBytes)} />
        )}
      </div>
    </div>
  );
}

function MovePreviewPanel({ preview, t }) {
  return (
    <div className="lam-preview-card">
      <div className="lam-preview-name">
        <FolderOpen size={15} className="lam-preview-name-icon" />
        {preview.workspaceName}
        {preview.destExists && (
          <Badge type="danger"><AlertTriangle size={11} /> {t('lam_badge_dest_taken')}</Badge>
        )}
      </div>
      <div className="lam-stat-row">
        <StatChip icon={Files}     value={preview.fileCount ?? 0}           label={t('lam_stat_files')} />
        <StatChip icon={HardDrive} value={fmtBytes(preview.totalSizeBytes)} />
      </div>
      <div className="lam-move-paths">
        <PathRow label={t('lam_label_from')} path={preview.sourcePath} variant="source" />
        <div className="lam-move-arrow"><MoveRight size={14} /></div>
        <PathRow label={t('lam_label_to')} path={preview.destPath} variant="dest" />
      </div>
      <div className="lam-info-note">
        <ShieldCheck size={13} />
        <span>{t('lam_note_integrity')}</span>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────

function LibraryActionModal({
  isOpen, type, preview,
  onExecute, onImportMerge, onImportReplace, onImportCreate,
  onSuccess, onClose,
}) {
  const { t } = useLanguage();

  const PROCESSING_STEPS = {
    export:         [t('lam_step_export_1'),  t('lam_step_export_2'),  t('lam_step_export_3')],
    import_merge:   [t('lam_step_merge_1'),   t('lam_step_merge_2'),   t('lam_step_merge_3'),   t('lam_step_merge_4')],
    import_replace: [t('lam_step_replace_1'), t('lam_step_replace_2'), t('lam_step_replace_3')],
    import_create:  [t('lam_step_create_1'),  t('lam_step_create_2'),  t('lam_step_create_3')],
    move:           [t('lam_step_move_1'),     t('lam_step_move_2'),    t('lam_step_move_3'),    t('lam_step_move_4')],
  };

  const HEADER_CONFIG = {
    export: { icon: Download,    iconClass: 'lam-header-icon--export', title: t('lam_export_title'), subtitle: t('lam_export_subtitle') },
    import: { icon: Upload,      iconClass: 'lam-header-icon--import', title: t('lam_import_title'), subtitle: t('lam_import_subtitle') },
    move:   { icon: FolderInput, iconClass: 'lam-header-icon--move',   title: t('lam_move_title'),   subtitle: t('lam_move_subtitle')   },
  };

  const [step, setStep]             = useState('preview');
  const [importMode, setImportMode] = useState(null);
  const [stepIdx, setStepIdx]       = useState(0);
  const [result, setResult]         = useState(null);
  const [newWsName, setNewWsName]   = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const createInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setStep('preview'); setImportMode(null); setStepIdx(0);
      setResult(null); setNewWsName(preview?.workspaceName || ''); setShowCreate(false);
    }
  }, [isOpen, type]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (showCreate && createInputRef.current) createInputRef.current.focus();
  }, [showCreate]);

  useEffect(() => {
    if (step !== 'processing') return;
    const steps = PROCESSING_STEPS[getStepKey(type, importMode)] ?? [];
    setStepIdx(0);
    let idx = 0;
    const timer = setInterval(() => {
      idx = Math.min(idx + 1, steps.length - 1);
      setStepIdx(idx);
    }, 1100);
    return () => clearInterval(timer);
  }, [step, type, importMode]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen || !preview) return null;

  const header = HEADER_CONFIG[type] ?? HEADER_CONFIG.export;
  const HeaderIcon = header.icon;

  const runWithProcessing = async (modeName, action) => {
    setImportMode(modeName);
    setStep('processing');
    try {
      const res = await action();
      setResult(res);
      setStep(res.success ? 'success' : 'error');
      if (res.success && onSuccess) onSuccess(res);
    } catch (err) {
      setResult({ success: false, message: err?.message || String(err) });
      setStep('error');
    }
  };

  const handleExecute = () => runWithProcessing(null, () => onExecute());
  const handleMerge   = () => runWithProcessing('merge',   () => onImportMerge('execute'));
  const handleReplace = () => runWithProcessing('replace', () => onImportReplace());
  const handleCreate  = () => {
    const name = newWsName.trim() || preview.workspaceName || 'Importado';
    runWithProcessing('create', () => onImportCreate(name));
  };

  const handleClose = () => {
    setStep('preview'); setImportMode(null); setStepIdx(0);
    setResult(null); setNewWsName(''); setShowCreate(false);
    onClose();
  };

  const steps = PROCESSING_STEPS[getStepKey(type, importMode)] ?? [];

  return createPortal(
    <div className="lam-overlay" onClick={step === 'processing' ? undefined : handleClose}>
      <div className="lam-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── HEADER ────────────────────────────────── */}
        <div className="lam-header">
          <div className={`lam-header-icon ${header.iconClass}`}>
            <HeaderIcon size={20} />
          </div>
          <div className="lam-header-text">
            <h2 className="lam-header-title">{header.title}</h2>
            <p className="lam-header-sub">{header.subtitle}</p>
          </div>
          {step !== 'processing' && (
            <button className="lam-close" onClick={handleClose} aria-label={t('close')}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* ── PREVIEW CARD ─────────────────────────── */}
        {step === 'preview' && (
          <div className="lam-preview-section">
            {type === 'export' && <ExportPreviewPanel preview={preview} t={t} />}
            {type === 'import' && <ImportPreviewPanel preview={preview} t={t} />}
            {type === 'move'   && <MovePreviewPanel   preview={preview} t={t} />}
          </div>
        )}

        {/* ── BODY ──────────────────────────────────── */}
        <div className="lam-body">

          {/* ── STEP: PREVIEW ─────────────────────── */}
          {step === 'preview' && (
            <>
              {(type === 'export' || type === 'move') && (
                <div className="lam-actions-row">
                  <button className="lam-btn lam-btn--ghost" onClick={handleClose}>
                    {t('cancel')}
                  </button>
                  {type === 'export' && (
                    <button className="lam-btn lam-btn--primary" onClick={handleExecute}>
                      {t('lam_btn_export')} <ArrowRight size={15} />
                    </button>
                  )}
                  {type === 'move' && (
                    <button className="lam-btn lam-btn--primary" onClick={handleExecute} disabled={preview.destExists}>
                      {t('lam_btn_move')} <ArrowRight size={15} />
                    </button>
                  )}
                </div>
              )}

              {type === 'move' && preview.destExists && (
                <div className="lam-warning-banner lam-warning-banner--danger">
                  <AlertTriangle size={14} />
                  <span>{t('lam_warn_dest_exists')}</span>
                </div>
              )}

              {type === 'import' && (
                <div className="lam-import-modes">
                  <p className="lam-modes-label">{t('lam_import_question')}</p>

                  <button className="lam-mode-btn" onClick={handleMerge}>
                    <div className="lam-mode-icon lam-mode-icon--merge"><GitMerge size={20} /></div>
                    <div className="lam-mode-info">
                      <span className="lam-mode-name">{t('lam_mode_merge_name')}</span>
                      <span className="lam-mode-desc">{t('lam_mode_merge_desc')}</span>
                    </div>
                  </button>

                  <button className="lam-mode-btn" onClick={() => setStep('confirm-replace')}>
                    <div className="lam-mode-icon lam-mode-icon--replace"><RefreshCw size={20} /></div>
                    <div className="lam-mode-info">
                      <span className="lam-mode-name">{t('lam_mode_replace_name')}</span>
                      <span className="lam-mode-desc">{t('lam_mode_replace_desc')}</span>
                    </div>
                  </button>

                  {!showCreate ? (
                    <button className="lam-mode-btn" onClick={() => setShowCreate(true)}>
                      <div className="lam-mode-icon lam-mode-icon--create"><FolderPlus size={20} /></div>
                      <div className="lam-mode-info">
                        <span className="lam-mode-name">{t('lam_mode_create_name')}</span>
                        <span className="lam-mode-desc">{t('lam_mode_create_desc')}</span>
                      </div>
                    </button>
                  ) : (
                    <div className="lam-create-section">
                      <div className="lam-mode-icon lam-mode-icon--create lam-mode-icon--sm">
                        <FolderPlus size={18} />
                      </div>
                      <div className="lam-create-form">
                        <label className="lam-create-label">{t('lam_create_label')}</label>
                        <input
                          ref={createInputRef}
                          type="text"
                          className="lam-create-input"
                          value={newWsName}
                          onChange={(e) => setNewWsName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && newWsName.trim() && handleCreate()}
                          placeholder={t('lam_create_placeholder')}
                          maxLength={40}
                        />
                        <div className="lam-create-actions">
                          <button className="lam-btn lam-btn--primary lam-btn--sm" onClick={handleCreate} disabled={!newWsName.trim()}>
                            {t('lam_btn_create_import')}
                          </button>
                          <button className="lam-btn lam-btn--ghost lam-btn--sm" onClick={() => setShowCreate(false)}>
                            {t('cancel')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── STEP: CONFIRM REPLACE ─────────────── */}
          {step === 'confirm-replace' && (
            <div className="lam-confirm">
              <div className="lam-confirm-body">
                <div className="lam-confirm-icon"><AlertTriangle size={36} /></div>
                <h3 className="lam-confirm-title">{t('lam_confirm_replace_title')}</h3>
                <p className="lam-confirm-text"
                  dangerouslySetInnerHTML={{ __html:
                    t('lam_confirm_replace_body').replace('{name}', `<strong>${preview?.workspaceName}</strong>`)
                  }}
                />
                <p className="lam-confirm-hint">{t('lam_confirm_replace_hint')}</p>
              </div>
              <div className="lam-actions-row lam-actions-row--centered">
                <button className="lam-btn lam-btn--ghost" onClick={() => setStep('preview')}>
                  {t('back')}
                </button>
                <button className="lam-btn lam-btn--danger" onClick={handleReplace}>
                  {t('lam_btn_replace_confirm')}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP: PROCESSING ─────────────────── */}
          {step === 'processing' && (
            <div className="lam-processing">
              <div className="lam-spinner-wrap">
                <Loader size={32} className="lam-spinner" />
              </div>
              <div className="lam-steps-list">
                {steps.map((label, i) => (
                  <div key={i} className={`lam-step ${
                    i < stepIdx ? 'lam-step--done' :
                    i === stepIdx ? 'lam-step--active' : 'lam-step--pending'
                  }`}>
                    <div className="lam-step-dot" />
                    <span className="lam-step-label">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP: SUCCESS ────────────────────── */}
          {step === 'success' && result && (
            <div className="lam-result lam-result--success">
              <div className="lam-result-icon"><CheckCircle size={44} /></div>
              <div className="lam-result-content">
                {type === 'export' && (
                  <>
                    <h3>{t('lam_success_export_title')}</h3>
                    <p dangerouslySetInnerHTML={{ __html:
                      t('lam_success_export_desc')
                        .replace('{obras}', `<strong>${result.obraCount ?? preview.obraCount}</strong>`)
                        .replace('{capas}', `<strong>${result.coverCount ?? preview.coverCount}</strong>`)
                    }} />
                    {result.path && (
                      <div className="lam-result-path" title={result.path}>
                        {fmtPath(result.path, 60)}
                      </div>
                    )}
                  </>
                )}
                {type === 'move' && (
                  <>
                    <h3>{t('lam_success_move_title')}</h3>
                    <p>{t('lam_success_move_desc')}</p>
                    {preview.destPath && (
                      <div className="lam-result-path" title={preview.destPath}>
                        {fmtPath(preview.destPath, 60)}
                      </div>
                    )}
                  </>
                )}
                {type === 'import' && (
                  <>
                    <h3>
                      {importMode === 'merge'   && t('lam_success_merge_title')}
                      {importMode === 'replace' && t('lam_success_replace_title')}
                      {importMode === 'create'  && t('lam_success_create_title')}
                    </h3>
                    <p className="lam-result-msg">{result.message}</p>
                  </>
                )}
              </div>
              <button className="lam-btn lam-btn--primary" onClick={handleClose}>
                {t('close')}
              </button>
            </div>
          )}

          {/* ── STEP: ERROR ──────────────────────── */}
          {step === 'error' && result && (
            <div className="lam-result lam-result--error">
              <div className="lam-result-icon"><XCircle size={44} /></div>
              <div className="lam-result-content">
                <h3>{t('lam_error_title')}</h3>
                <p className="lam-result-msg">{result.message}</p>
              </div>
              <div className="lam-actions-row lam-actions-row--centered">
                <button className="lam-btn lam-btn--ghost" onClick={handleClose}>
                  {t('close')}
                </button>
                <button className="lam-btn lam-btn--primary" onClick={() => setStep('preview')}>
                  {t('lam_btn_retry')}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}

export default LibraryActionModal;
