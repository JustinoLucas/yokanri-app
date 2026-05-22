import { useState } from 'react';
import {
  X,
  Upload,
  Loader,
  GitMerge,
  RefreshCw,
  FolderPlus,
  BookOpen,
  Image,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';
import './ImportModal.css';

/**
 * ImportModal — Modal multi-etapa para importação de biblioteca
 *
 * Etapas:
 *   1. Preview — mostra info do arquivo selecionado
 *   2. Modo — escolher: merge / replace / create new
 *   3. Confirmação (só para replace) — confirmação forte
 *   4. Execução — loading + resultado
 *
 * Toda lógica pesada está nos services. Este componente é apenas UI.
 */
function ImportModal({ isOpen, preview, onMerge, onReplace, onCreate, onClose }) {
  const [step, setStep] = useState('mode'); // 'mode' | 'confirm-replace' | 'loading' | 'result'
  const [mergeStats, setMergeStats] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [result, setResult] = useState(null);
  const [newWsName, setNewWsName] = useState(preview?.workspaceName || '');
  const [showCreateInput, setShowCreateInput] = useState(false);

  if (!isOpen || !preview) return null;

  const exportDate = preview.exportDate
    ? new Date(preview.exportDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'desconhecida';

  // ─── HANDLERS ──────────────────────────────────────

  const handleMerge = async () => {
    setStep('loading');
    setLoadingMessage('Analisando dados para merge...');

    try {
      // Primeiro analisa
      const analysis = await onMerge('analyze');

      if (!analysis.success) {
        setResult({ success: false, message: analysis.message });
        setStep('result');
        return;
      }

      setMergeStats(analysis.stats);

      // Se não há obras novas, mostra resultado direto
      if (analysis.stats.newObras === 0) {
        setResult({
          success: true,
          message: 'Nenhuma obra nova encontrada. Todas as obras do arquivo já existem na biblioteca atual.',
        });
        setStep('result');
        return;
      }

      // Executa o merge
      setLoadingMessage(`Adicionando ${analysis.stats.newObras} obra${analysis.stats.newObras !== 1 ? 's' : ''}...`);
      const mergeResult = await onMerge('execute');
      setResult(mergeResult);
      setStep('result');
    } catch (error) {
      setResult({ success: false, message: `Erro: ${error?.message || error}` });
      setStep('result');
    }
  };

  const handleReplace = async () => {
    setStep('loading');
    setLoadingMessage('Substituindo biblioteca...');

    try {
      const replaceResult = await onReplace();
      setResult(replaceResult);
      setStep('result');
    } catch (error) {
      setResult({ success: false, message: `Erro: ${error?.message || error}` });
      setStep('result');
    }
  };

  const handleCreate = async () => {
    const name = newWsName.trim() || preview.workspaceName || 'Importado';
    setStep('loading');
    setLoadingMessage('Criando novo workspace...');

    try {
      const createResult = await onCreate(name);
      setResult(createResult);
      setStep('result');
    } catch (error) {
      setResult({ success: false, message: `Erro: ${error?.message || error}` });
      setStep('result');
    }
  };

  const handleClose = () => {
    // Reset state
    setStep('mode');
    setMergeStats(null);
    setLoadingMessage('');
    setResult(null);
    setNewWsName(preview?.workspaceName || '');
    setShowCreateInput(false);
    onClose();
  };

  // ─── RENDER ────────────────────────────────────────

  return (
    <div className="modal-overlay imp-overlay" onClick={handleClose}>
      <div className="modal-content imp-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header imp-header">
          <div className="imp-header-title">
            <Upload size={20} />
            <h2>Importar Biblioteca</h2>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Preview info — sempre visível */}
        <div className="imp-preview">
          <div className="imp-preview-name">{preview.workspaceName}</div>
          <div className="imp-preview-stats">
            <span className="imp-stat">
              <BookOpen size={14} />
              {preview.obraCount || 0} obras
            </span>
            <span className="imp-stat">
              <Image size={14} />
              {preview.coverCount || 0} capas
            </span>
            <span className="imp-stat">
              <Calendar size={14} />
              {exportDate}
            </span>
          </div>
        </div>

        {/* Body — muda conforme a etapa */}
        <div className="imp-body">

          {/* ─── ETAPA: ESCOLHER MODO ─────────────────── */}
          {step === 'mode' && (
            <div className="imp-modes">
              <p className="imp-modes-title">Como deseja importar?</p>

              <button className="imp-mode-btn" onClick={handleMerge}>
                <div className="imp-mode-icon imp-mode-icon--merge">
                  <GitMerge size={22} />
                </div>
                <div className="imp-mode-info">
                  <span className="imp-mode-name">Adicionar à biblioteca atual</span>
                  <span className="imp-mode-desc">
                    Mescla os dados. Obras duplicadas são ignoradas, apenas conteúdo novo é adicionado.
                  </span>
                </div>
              </button>

              <button className="imp-mode-btn" onClick={() => setStep('confirm-replace')}>
                <div className="imp-mode-icon imp-mode-icon--replace">
                  <RefreshCw size={22} />
                </div>
                <div className="imp-mode-info">
                  <span className="imp-mode-name">Substituir biblioteca atual</span>
                  <span className="imp-mode-desc">
                    Remove todos os dados atuais e restaura com o conteúdo do arquivo.
                  </span>
                </div>
              </button>

              <button
                className="imp-mode-btn"
                onClick={() => setShowCreateInput(true)}
                style={{ display: showCreateInput ? 'none' : undefined }}
              >
                <div className="imp-mode-icon imp-mode-icon--create">
                  <FolderPlus size={22} />
                </div>
                <div className="imp-mode-info">
                  <span className="imp-mode-name">Criar novo workspace</span>
                  <span className="imp-mode-desc">
                    Cria um workspace isolado com os dados do arquivo. Não altera nada no atual.
                  </span>
                </div>
              </button>

              {showCreateInput && (
                <div className="imp-create-section">
                  <div className="imp-mode-icon imp-mode-icon--create" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                    <FolderPlus size={22} />
                  </div>
                  <div className="imp-create-form">
                    <label className="imp-create-label">Nome do novo workspace:</label>
                    <input
                      type="text"
                      className="imp-create-input"
                      value={newWsName}
                      onChange={(e) => setNewWsName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                      placeholder="Nome do workspace..."
                      maxLength={40}
                      autoFocus
                    />
                    <div className="imp-create-actions">
                      <button
                        className="imp-btn imp-btn--primary"
                        onClick={handleCreate}
                        disabled={!newWsName.trim()}
                      >
                        Criar e importar
                      </button>
                      <button
                        className="imp-btn imp-btn--ghost"
                        onClick={() => setShowCreateInput(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── ETAPA: CONFIRMAR REPLACE ─────────────── */}
          {step === 'confirm-replace' && (
            <div className="imp-confirm">
              <div className="imp-confirm-warning">
                <AlertTriangle size={32} className="imp-warning-icon" />
                <h3>Substituir biblioteca?</h3>
                <p>
                  Esta ação vai <strong>remover permanentemente</strong> todas as obras,
                  capas e configurações do workspace atual e substituir pelo conteúdo do arquivo.
                </p>
                <p className="imp-confirm-hint">
                  Esta ação não pode ser desfeita. Considere exportar um backup antes de continuar.
                </p>
              </div>
              <div className="imp-confirm-actions">
                <button className="imp-btn imp-btn--danger" onClick={handleReplace}>
                  Sim, substituir tudo
                </button>
                <button className="imp-btn imp-btn--ghost" onClick={() => setStep('mode')}>
                  Voltar
                </button>
              </div>
            </div>
          )}

          {/* ─── ETAPA: LOADING ───────────────────────── */}
          {step === 'loading' && (
            <div className="imp-loading">
              <Loader size={36} className="imp-spinner" />
              <p>{loadingMessage}</p>
            </div>
          )}

          {/* ─── ETAPA: RESULTADO ─────────────────────── */}
          {step === 'result' && result && (
            <div className="imp-result">
              <div className={`imp-result-icon ${result.success ? 'imp-result-icon--success' : 'imp-result-icon--error'}`}>
                {result.success ? <CheckCircle size={36} /> : <AlertTriangle size={36} />}
              </div>
              <p className="imp-result-message">{result.message}</p>
              <button className="imp-btn imp-btn--primary" onClick={handleClose}>
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImportModal;
