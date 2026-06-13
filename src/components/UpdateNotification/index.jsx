import { useState, useEffect } from 'react';
import { DownloadCloud, X, RefreshCw } from 'lucide-react';
import { checkForUpdate, downloadAndInstall, restartApp } from '../../services/updaterService';
import './UpdateNotification.css';

/**
 * Toast que verifica atualizações no startup e oferece baixar/instalar
 * a nova versão via Tauri Updater (GitHub Releases).
 */
function UpdateNotification() {
  const [update, setUpdate] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | available | downloading | finished | error
  const [progress, setProgress] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkForUpdate().then(result => {
      if (result) {
        setUpdate(result);
        setStatus('available');
      }
    });
  }, []);

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

  const handleRestart = () => {
    restartApp();
  };

  if (dismissed || status === 'idle') return null;

  return (
    <div className="update-toast">
      <div className="update-toast-header">
        <DownloadCloud size={16} className="update-toast-icon" />
        <span className="update-toast-title">Atualização disponível</span>
        {status === 'available' && (
          <button className="update-toast-close" onClick={() => setDismissed(true)} title="Fechar">
            <X size={14} />
          </button>
        )}
      </div>

      {status === 'available' && (
        <>
          <div className="update-toast-body">
            Uma nova versão (<span className="update-toast-version">v{update.version}</span>) está disponível.
            Deseja baixar e instalar agora?
          </div>
          <div className="update-toast-actions">
            <button className="update-toast-btn update-toast-btn--secondary" onClick={() => setDismissed(true)}>
              Mais tarde
            </button>
            <button className="update-toast-btn update-toast-btn--primary" onClick={handleUpdate}>
              Atualizar agora
            </button>
          </div>
        </>
      )}

      {status === 'downloading' && (
        <>
          <div className="update-toast-body">Baixando atualização… {progress}%</div>
          <div className="update-toast-progress">
            <div className="update-toast-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </>
      )}

      {status === 'finished' && (
        <>
          <div className="update-toast-body">
            Atualização instalada. Reinicie o app para aplicar a nova versão.
          </div>
          <div className="update-toast-actions">
            <button className="update-toast-btn update-toast-btn--primary update-toast-btn--icon" onClick={handleRestart}>
              <RefreshCw size={13} />
              Reiniciar agora
            </button>
          </div>
        </>
      )}

      {status === 'error' && (
        <div className="update-toast-body">
          Não foi possível instalar a atualização. Tente novamente mais tarde.
        </div>
      )}
    </div>
  );
}

export default UpdateNotification;
