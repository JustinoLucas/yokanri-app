import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  Upload,
  FolderInput,
  BookOpen,
  Image as ImageIcon,
  Calendar,
  HardDrive,
  FolderOpen,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  GitMerge,
  RefreshCw,
  FolderPlus,
  Loader,
  FileWarning,
  ShieldCheck,
  MoveRight,
  Files,
} from 'lucide-react';
import './LibraryActionModal.css';

// ─── CONSTANTS ─────────────────────────────────────────────

const PROCESSING_STEPS = {
  export: [
    'Lendo arquivos do workspace...',
    'Comprimindo biblioteca...',
    'Salvando arquivo...',
  ],
  import_merge: [
    'Analisando dados do backup...',
    'Identificando obras novas...',
    'Adicionando obras...',
    'Restaurando capas...',
  ],
  import_replace: [
    'Removendo dados atuais...',
    'Restaurando banco de dados...',
    'Restaurando capas...',
  ],
  import_create: [
    'Criando workspace...',
    'Importando banco de dados...',
    'Restaurando capas...',
  ],
  move: [
    'Copiando arquivos para o destino...',
    'Verificando integridade dos dados...',
    'Atualizando registro...',
    'Finalizando...',
  ],
};

const HEADER_CONFIG = {
  export: {
    icon: Download,
    iconClass: 'lam-header-icon--export',
    title: 'Exportar Biblioteca',
    subtitle: 'Salva um backup completo no formato .yokanri',
  },
  import: {
    icon: Upload,
    iconClass: 'lam-header-icon--import',
    title: 'Importar Biblioteca',
    subtitle: 'Restaura dados a partir de um arquivo .yokanri',
  },
  move: {
    icon: FolderInput,
    iconClass: 'lam-header-icon--move',
    title: 'Mover Workspace',
    subtitle: 'Move todos os dados para outro local no disco',
  },
};

// ─── HELPERS ───────────────────────────────────────────────

function fmtBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function fmtPath(path, maxLen = 55) {
  if (!path) return '';
  if (path.length <= maxLen) return path;
  const half = Math.floor(maxLen / 2) - 2;
  return path.slice(0, half) + '…' + path.slice(path.length - half);
}

function fmtDate(isoStr) {
  if (!isoStr) return 'desconhecida';
  return new Date(isoStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
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

function ExportPreviewPanel({ preview }) {
  return (
    <div className="lam-preview-card">
      <div className="lam-preview-name">
        <BookOpen size={15} className="lam-preview-name-icon" />
        {preview.workspaceName}
      </div>

      <div className="lam-stat-row">
        <StatChip icon={BookOpen}  value={preview.obraCount ?? 0}      label="obras" />
        <StatChip icon={ImageIcon} value={preview.coverCount ?? 0}     label="capas" />
        <StatChip icon={HardDrive} value={fmtBytes(preview.estimatedSizeBytes)} />
      </div>

      <PathRow label="Destino" path={preview.savePath} />

      {preview.fileExists && (
        <div className="lam-warning-banner">
          <FileWarning size={14} />
          <span>Arquivo existente — será substituído ao confirmar</span>
        </div>
      )}
    </div>
  );
}

function ImportPreviewPanel({ preview }) {
  const isCompatible = !preview.version || preview.version <= 1;
  return (
    <div className="lam-preview-card">
      <div className="lam-preview-name">
        <BookOpen size={15} className="lam-preview-name-icon" />
        {preview.workspaceName}
        {isCompatible
          ? <Badge type="success"><ShieldCheck size={11} /> Compatível</Badge>
          : <Badge type="warning"><AlertTriangle size={11} /> Verificar versão</Badge>
        }
      </div>

      <div className="lam-stat-row">
        <StatChip icon={BookOpen}  value={preview.obraCount ?? 0}    label="obras" />
        <StatChip icon={ImageIcon} value={preview.coverCount ?? 0}   label="capas" />
        <StatChip icon={Calendar}  value={fmtDate(preview.exportDate)} />
        {preview.fileSizeBytes > 0 && (
          <StatChip icon={HardDrive} value={fmtBytes(preview.fileSizeBytes)} />
        )}
      </div>
    </div>
  );
}

function MovePreviewPanel({ preview }) {
  return (
    <div className="lam-preview-card">
      <div className="lam-preview-name">
        <FolderOpen size={15} className="lam-preview-name-icon" />
        {preview.workspaceName}
        {preview.destExists && (
          <Badge type="danger"><AlertTriangle size={11} /> Destino ocupado</Badge>
        )}
      </div>

      <div className="lam-stat-row">
        <StatChip icon={Files}     value={preview.fileCount ?? 0}            label="arquivos" />
        <StatChip icon={HardDrive} value={fmtBytes(preview.totalSizeBytes)} />
      </div>

      <div className="lam-move-paths">
        <PathRow label="De"   path={preview.sourcePath} variant="source" />
        <div className="lam-move-arrow"><MoveRight size={14} /></div>
        <PathRow label="Para" path={preview.destPath}   variant="dest" />
      </div>

      <div className="lam-info-note">
        <ShieldCheck size={13} />
        <span>Os arquivos originais são removidos apenas após verificação de integridade.</span>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────

/**
 * LibraryActionModal — Modal unificado para Export, Import e Move
 *
 * Props:
 *   isOpen        {bool}
 *   type          'export' | 'import' | 'move'
 *   preview       {object} — dados do preview (tipo-específico)
 *   onExecute     {async fn} — para export/move: executa a ação
 *   onImportMerge   {async fn(action)} — para import
 *   onImportReplace {async fn}         — para import
 *   onImportCreate  {async fn(name)}   — para import
 *   onSuccess     {fn(result)}         — chamado após sucesso
 *   onClose       {fn}
 */
function LibraryActionModal({
  isOpen,
  type,
  preview,
  onExecute,
  onImportMerge,
  onImportReplace,
  onImportCreate,
  onSuccess,
  onClose,
}) {
  // ─── STATE ────────────────────────────────────────
  const [step, setStep]             = useState('preview'); // preview | confirm-replace | processing | success | error
  const [importMode, setImportMode] = useState(null);      // merge | replace | create
  const [stepIdx, setStepIdx]       = useState(0);
  const [result, setResult]         = useState(null);
  const [newWsName, setNewWsName]   = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const createInputRef = useRef(null);

  // Reset on open/type change
  useEffect(() => {
    if (isOpen) {
      setStep('preview');
      setImportMode(null);
      setStepIdx(0);
      setResult(null);
      setNewWsName(preview?.workspaceName || '');
      setShowCreate(false);
    }
  }, [isOpen, type]); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus create input when shown
  useEffect(() => {
    if (showCreate && createInputRef.current) {
      createInputRef.current.focus();
    }
  }, [showCreate]);

  // Animate processing steps
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
  }, [step, type, importMode]);

  if (!isOpen || !preview) return null;

  const header = HEADER_CONFIG[type] ?? HEADER_CONFIG.export;
  const HeaderIcon = header.icon;

  // ─── HANDLERS ─────────────────────────────────────

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

  // Chama execute diretamente — o executeMerge já faz deduplicação internamente,
  // dispensando uma etapa de analyze separada.
  const handleMerge = () => runWithProcessing('merge', () => onImportMerge('execute'));

  const handleReplace = () => runWithProcessing('replace', () => onImportReplace());

  const handleCreate = () => {
    const name = newWsName.trim() || preview.workspaceName || 'Importado';
    runWithProcessing('create', () => onImportCreate(name));
  };

  const handleClose = () => {
    setStep('preview');
    setImportMode(null);
    setStepIdx(0);
    setResult(null);
    setNewWsName('');
    setShowCreate(false);
    onClose();
  };

  const steps = PROCESSING_STEPS[getStepKey(type, importMode)] ?? [];

  // ─── RENDER ───────────────────────────────────────

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
            <button className="lam-close" onClick={handleClose} aria-label="Fechar">
              <X size={18} />
            </button>
          )}
        </div>

        {/* ── PREVIEW CARD (sempre visível no step preview) ─── */}
        {step === 'preview' && (
          <div className="lam-preview-section">
            {type === 'export' && <ExportPreviewPanel preview={preview} />}
            {type === 'import' && <ImportPreviewPanel preview={preview} />}
            {type === 'move'   && <MovePreviewPanel   preview={preview} />}
          </div>
        )}

        {/* ── BODY ──────────────────────────────────── */}
        <div className="lam-body">

          {/* ── STEP: PREVIEW / ACTION SELECTION ─────── */}
          {step === 'preview' && (
            <>
              {/* Export & Move: simple confirm */}
              {(type === 'export' || type === 'move') && (
                <div className="lam-actions-row">
                  <button className="lam-btn lam-btn--ghost" onClick={handleClose}>
                    Cancelar
                  </button>
                  {type === 'export' && (
                    <button className="lam-btn lam-btn--primary" onClick={handleExecute}>
                      Exportar biblioteca
                      <ArrowRight size={15} />
                    </button>
                  )}
                  {type === 'move' && (
                    <button
                      className="lam-btn lam-btn--primary"
                      onClick={handleExecute}
                      disabled={preview.destExists}
                    >
                      Mover workspace
                      <ArrowRight size={15} />
                    </button>
                  )}
                </div>
              )}

              {/* Move: blocked state */}
              {type === 'move' && preview.destExists && (
                <div className="lam-warning-banner lam-warning-banner--danger">
                  <AlertTriangle size={14} />
                  <span>Não é possível mover: a pasta de destino já existe. Escolha outro local.</span>
                </div>
              )}

              {/* Import: mode selection */}
              {type === 'import' && (
                <div className="lam-import-modes">
                  <p className="lam-modes-label">Como deseja importar?</p>

                  <button className="lam-mode-btn" onClick={handleMerge}>
                    <div className="lam-mode-icon lam-mode-icon--merge">
                      <GitMerge size={20} />
                    </div>
                    <div className="lam-mode-info">
                      <span className="lam-mode-name">Adicionar à biblioteca atual</span>
                      <span className="lam-mode-desc">
                        Mescla os dados. Obras duplicadas são ignoradas, apenas conteúdo novo é adicionado.
                      </span>
                    </div>
                  </button>

                  <button className="lam-mode-btn" onClick={() => setStep('confirm-replace')}>
                    <div className="lam-mode-icon lam-mode-icon--replace">
                      <RefreshCw size={20} />
                    </div>
                    <div className="lam-mode-info">
                      <span className="lam-mode-name">Substituir biblioteca atual</span>
                      <span className="lam-mode-desc">
                        Remove todos os dados atuais e restaura com o conteúdo do arquivo.
                      </span>
                    </div>
                  </button>

                  {!showCreate ? (
                    <button className="lam-mode-btn" onClick={() => setShowCreate(true)}>
                      <div className="lam-mode-icon lam-mode-icon--create">
                        <FolderPlus size={20} />
                      </div>
                      <div className="lam-mode-info">
                        <span className="lam-mode-name">Criar novo workspace</span>
                        <span className="lam-mode-desc">
                          Cria um workspace isolado com os dados do arquivo. Não altera nada no atual.
                        </span>
                      </div>
                    </button>
                  ) : (
                    <div className="lam-create-section">
                      <div className="lam-mode-icon lam-mode-icon--create lam-mode-icon--sm">
                        <FolderPlus size={18} />
                      </div>
                      <div className="lam-create-form">
                        <label className="lam-create-label">Nome do novo workspace:</label>
                        <input
                          ref={createInputRef}
                          type="text"
                          className="lam-create-input"
                          value={newWsName}
                          onChange={(e) => setNewWsName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && newWsName.trim() && handleCreate()}
                          placeholder="Nome do workspace..."
                          maxLength={40}
                        />
                        <div className="lam-create-actions">
                          <button
                            className="lam-btn lam-btn--primary lam-btn--sm"
                            onClick={handleCreate}
                            disabled={!newWsName.trim()}
                          >
                            Criar e importar
                          </button>
                          <button
                            className="lam-btn lam-btn--ghost lam-btn--sm"
                            onClick={() => setShowCreate(false)}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── STEP: CONFIRM REPLACE ─────────────────── */}
          {step === 'confirm-replace' && (
            <div className="lam-confirm">
              <div className="lam-confirm-body">
                <div className="lam-confirm-icon">
                  <AlertTriangle size={36} />
                </div>
                <h3 className="lam-confirm-title">Substituir biblioteca?</h3>
                <p className="lam-confirm-text">
                  Esta ação vai <strong>remover permanentemente</strong> todas as obras,
                  capas e configurações da biblioteca atual e substituir pelo conteúdo
                  de <strong>"{preview?.workspaceName}"</strong>.
                </p>
                <p className="lam-confirm-hint">
                  Esta ação não pode ser desfeita. Considere exportar um backup antes de continuar.
                </p>
              </div>
              <div className="lam-actions-row lam-actions-row--centered">
                <button className="lam-btn lam-btn--ghost" onClick={() => setStep('preview')}>
                  Voltar
                </button>
                <button className="lam-btn lam-btn--danger" onClick={handleReplace}>
                  Sim, substituir tudo
                </button>
              </div>
            </div>
          )}

          {/* ── STEP: PROCESSING ─────────────────────── */}
          {step === 'processing' && (
            <div className="lam-processing">
              <div className="lam-spinner-wrap">
                <Loader size={32} className="lam-spinner" />
              </div>
              <div className="lam-steps-list">
                {steps.map((label, i) => (
                  <div
                    key={i}
                    className={`lam-step ${
                      i < stepIdx ? 'lam-step--done' :
                      i === stepIdx ? 'lam-step--active' :
                      'lam-step--pending'
                    }`}
                  >
                    <div className="lam-step-dot" />
                    <span className="lam-step-label">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP: SUCCESS ─────────────────────────── */}
          {step === 'success' && result && (
            <div className="lam-result lam-result--success">
              <div className="lam-result-icon">
                <CheckCircle size={44} />
              </div>
              <div className="lam-result-content">
                {type === 'export' && (
                  <>
                    <h3>Biblioteca exportada!</h3>
                    <p>
                      <strong>{result.obraCount ?? preview.obraCount}</strong> obras e{' '}
                      <strong>{result.coverCount ?? preview.coverCount}</strong> capas salvas com sucesso.
                    </p>
                    {result.path && (
                      <div className="lam-result-path" title={result.path}>
                        {fmtPath(result.path, 60)}
                      </div>
                    )}
                  </>
                )}
                {type === 'move' && (
                  <>
                    <h3>Workspace movido!</h3>
                    <p>Todos os arquivos foram transferidos e verificados com sucesso.</p>
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
                      {importMode === 'merge'   && 'Obras adicionadas!'}
                      {importMode === 'replace' && 'Biblioteca restaurada!'}
                      {importMode === 'create'  && 'Workspace criado!'}
                    </h3>
                    <p className="lam-result-msg">{result.message}</p>
                  </>
                )}
              </div>
              <button className="lam-btn lam-btn--primary" onClick={handleClose}>
                Fechar
              </button>
            </div>
          )}

          {/* ── STEP: ERROR ───────────────────────────── */}
          {step === 'error' && result && (
            <div className="lam-result lam-result--error">
              <div className="lam-result-icon">
                <XCircle size={44} />
              </div>
              <div className="lam-result-content">
                <h3>Ocorreu um erro</h3>
                <p className="lam-result-msg">{result.message}</p>
              </div>
              <div className="lam-actions-row lam-actions-row--centered">
                <button className="lam-btn lam-btn--ghost" onClick={handleClose}>
                  Fechar
                </button>
                <button className="lam-btn lam-btn--primary" onClick={() => setStep('preview')}>
                  Tentar novamente
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
