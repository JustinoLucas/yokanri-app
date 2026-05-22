/**
 * StepWorkspace — Passo 4: Criação ou importação da biblioteca (workspace)
 *
 * Fluxo "Criar":
 *   1. Usuário clica "Nova biblioteca" → expande formulário de nome
 *   2. Preenche o nome e clica "Criar biblioteca"
 *   3. initDirsOnly() → createWorkspace(name) → switchWorkspace(id)
 *   4. markCompleted() → onComplete(workspace)
 *
 * Fluxo "Importar":
 *   1. Usuário clica "Importar backup" → importWorkspaceFile() abre diálogo
 *   2. Se arquivo válido → mostra preview (nome + contagem de obras)
 *   3. Usuário confirma → confirmImportWorkspace() → switchWorkspace()
 *   4. markCompleted() → onComplete(workspace)
 *
 * Props:
 *   language     {string}       Idioma selecionado
 *   isSupporter  {boolean}
 *   supporterCode {string|null}
 *   onComplete   {function}     (workspace: Object) => void
 *   onBack       {function}     () => void
 */

import { useState, useEffect } from 'react';
import storage from '../../services/storage/storageService';
import * as onboardingService from '../services/onboardingService';
import { getT } from '../i18n/strings';

// ─── Subcomponente: opção de criação ────────────────────

function CreateOption({ t, onExpand, expanded, onCreate, loading }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('workspace_name_empty'));
      return;
    }
    setError('');
    await onCreate(trimmed);
  };

  return (
    <div className={`ob-ws-option ${expanded ? 'ob-ws-option--expanded' : ''}`}>
      <button
        className="ob-ws-option-header"
        onClick={expanded ? undefined : onExpand}
        type="button"
        disabled={expanded}
      >
        <div className="ob-ws-option-icon ob-ws-option-icon--create">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <div className="ob-ws-option-text">
          <span className="ob-ws-option-label">{t('workspace_create_label')}</span>
          <span className="ob-ws-option-desc">{t('workspace_create_desc')}</span>
        </div>
      </button>

      {expanded && (
        <div className="ob-ws-create-form">
          <label className="ob-ws-name-label">{t('workspace_create_name_label')}</label>
          <input
            type="text"
            className={`ob-ws-name-input ${error ? 'ob-code-input--error' : ''}`}
            placeholder={t('workspace_create_name_placeholder')}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleCreate()}
            autoFocus
            disabled={loading}
            maxLength={60}
          />
          {error && <p className="ob-field-error">{error}</p>}
          <button
            className="ob-btn ob-btn--primary ob-btn--full"
            onClick={handleCreate}
            disabled={loading}
            type="button"
          >
            {loading ? t('workspace_creating') : t('workspace_create_btn')}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Subcomponente: preview de importação ───────────────

function ImportPreview({ t, preview, onConfirm, onCancel, loading }) {
  const obraCount = preview?.obraCount ?? 0;
  const wsName = preview?.workspaceName ?? '—';

  return (
    <div className="ob-import-preview">
      <div className="ob-import-preview-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div className="ob-import-preview-info">
        <p className="ob-import-preview-title">{t('workspace_import_preview_title')}</p>
        <p className="ob-import-preview-name">{wsName}</p>
        <p className="ob-import-preview-count">
          {obraCount} {t('workspace_import_preview_obras')}
        </p>
      </div>
      <div className="ob-import-preview-actions">
        <button
          className="ob-btn ob-btn--primary ob-btn--full"
          onClick={onConfirm}
          disabled={loading}
          type="button"
        >
          {loading ? t('workspace_importing') : t('workspace_import_confirm')}
        </button>
        <button
          className="ob-btn ob-btn--ghost"
          onClick={onCancel}
          disabled={loading}
          type="button"
        >
          {t('back')}
        </button>
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────

function StepWorkspace({ language, isSupporter, supporterCode, onComplete, onBack }) {
  const t = getT(language);

  const [mode, setMode] = useState('choose'); // 'choose' | 'create' | 'import-preview'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importData, setImportData] = useState(null); // { preview, _zipData }

  // Prepara os diretórios raiz na primeira vez que o step monta
  useEffect(() => {
    storage.initDirsOnly().catch(console.error);
  }, []);

  /** Finaliza o onboarding após workspace estar ativo */
  async function finish(workspace) {
    await onboardingService.markCompleted({
      language,
      isSupporter,
      supporterCode,
    });
    onComplete(workspace);
  }

  // ── Fluxo Criar ────────────────────────────────────────

  const handleCreate = async (name) => {
    setLoading(true);
    setError('');
    try {
      const workspace = await storage.createWorkspace(name);
      await storage.switchWorkspace(workspace.id);
      await finish(workspace);
    } catch (err) {
      console.error('Erro ao criar workspace:', err);
      setError(t('workspace_error_create'));
      setLoading(false);
    }
  };

  // ── Fluxo Importar ─────────────────────────────────────

  const handleImportSelect = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await storage.importWorkspaceFile();
      if (!result.success) {
        // Usuário cancelou o diálogo ou arquivo inválido
        if (result.message && result.message !== 'cancelled') {
          setError(result.message);
        }
        setLoading(false);
        return;
      }
      // Arquivo válido — guarda dados e mostra preview
      setImportData({ preview: result.preview, _zipData: result._zipData });
      setMode('import-preview');
    } catch (err) {
      console.error('Erro ao importar:', err);
      setError(t('workspace_error_import'));
    } finally {
      setLoading(false);
    }
  };

  const handleImportConfirm = async () => {
    if (!importData) return;
    setLoading(true);
    setError('');
    try {
      // _zipData = conteúdo descompactado; preview = objeto manifest (retornado junto no select)
      const { _zipData, preview } = importData;
      const result = await storage.confirmImportWorkspace(_zipData, preview);
      if (!result.success || !result.workspace) {
        throw new Error(result.message || 'Falha na importação');
      }
      await storage.switchWorkspace(result.workspace.id);
      await finish(result.workspace);
    } catch (err) {
      console.error('Erro ao confirmar importação:', err);
      setError(t('workspace_error_import'));
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────

  return (
    <div className="ob-step ob-step--workspace">
      <div className="ob-step-header">
        <h2 className="ob-title">{t('workspace_title')}</h2>
        <p className="ob-subtitle">{t('workspace_subtitle')}</p>
      </div>

      {error && (
        <div className="ob-error-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {mode === 'import-preview' ? (
        <ImportPreview
          t={t}
          preview={importData?.preview}
          onConfirm={handleImportConfirm}
          onCancel={() => { setMode('choose'); setImportData(null); setError(''); }}
          loading={loading}
        />
      ) : (
        <div className="ob-ws-options">
          {/* Opção: Criar */}
          <CreateOption
            t={t}
            expanded={mode === 'create'}
            onExpand={() => { setMode('create'); setError(''); }}
            onCreate={handleCreate}
            loading={loading}
          />

          {/* Divisor */}
          {mode !== 'create' && (
            <div className="ob-ws-divider">
              <span>ou</span>
            </div>
          )}

          {/* Opção: Importar */}
          {mode !== 'create' && (
            <button
              className="ob-ws-option ob-ws-option--import"
              onClick={handleImportSelect}
              disabled={loading}
              type="button"
            >
              <div className="ob-ws-option-icon ob-ws-option-icon--import">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
              <div className="ob-ws-option-text">
                <span className="ob-ws-option-label">{t('workspace_import_label')}</span>
                <span className="ob-ws-option-desc">{t('workspace_import_desc')}</span>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Botão de voltar */}
      {mode !== 'import-preview' && (
        <button
          className="ob-btn ob-btn--ghost"
          onClick={() => {
            if (mode === 'create') {
              setMode('choose');
              setError('');
            } else {
              onBack();
            }
          }}
          disabled={loading}
          type="button"
        >
          ← {t('back')}
        </button>
      )}
    </div>
  );
}

export default StepWorkspace;
