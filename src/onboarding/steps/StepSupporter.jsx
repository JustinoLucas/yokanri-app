/**
 * StepSupporter — Passo 3: Inserção e validação do código Supporter
 *
 * Validação local (formato mínimo): string não vazia com pelo menos 6 chars.
 * O app é offline-first, então não há validação de servidor.
 *
 * Props:
 *   language  {string}   Idioma selecionado
 *   onConfirm {function} (code: string) => void  (código aceito)
 *   onSkip    {function} () => void  (pular → vai para Core)
 *   onBack    {function} () => void
 */

import { useState } from 'react';
import { getT } from '../i18n/strings';

/** Valida o código supporter: mínimo 6 caracteres não-espaço */
function isValidCode(code) {
  return code.replace(/\s/g, '').length >= 6;
}

function StepSupporter({ language, onConfirm, onSkip, onBack }) {
  const t = getT(language);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    const trimmed = code.trim();

    if (!trimmed) {
      setError(t('supporter_error_empty'));
      return;
    }

    if (!isValidCode(trimmed)) {
      setError(t('supporter_error_invalid'));
      return;
    }

    setError('');
    setLoading(true);

    try {
      setSuccess(true);
      // Pequeno delay visual para o feedback de sucesso
      await new Promise(resolve => setTimeout(resolve, 700));
      await onConfirm(trimmed);
    } catch {
      setSuccess(false);
      setError(t('supporter_error_invalid'));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleActivate();
    }
  };

  return (
    <div className="ob-step ob-step--supporter">
      <div className="ob-step-header">
        <div className="ob-supporter-badge">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <h2 className="ob-title">{t('supporter_title')}</h2>
        <p className="ob-subtitle">{t('supporter_subtitle')}</p>
      </div>

      <div className="ob-supporter-form">
        <input
          type="text"
          className={`ob-code-input ${error ? 'ob-code-input--error' : ''} ${success ? 'ob-code-input--success' : ''}`}
          placeholder={t('supporter_placeholder')}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError('');
            setSuccess(false);
          }}
          onKeyDown={handleKeyDown}
          disabled={loading || success}
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />

        {error && (
          <p className="ob-field-error">{error}</p>
        )}

        {success && (
          <p className="ob-field-success">✓ {t('supporter_success')}</p>
        )}

        <button
          className="ob-btn ob-btn--primary ob-btn--full"
          onClick={handleActivate}
          disabled={loading || success}
          type="button"
        >
          {loading ? t('loading') : t('supporter_activate')}
        </button>
      </div>

      <div className="ob-supporter-footer">
        <button
          className="ob-btn ob-btn--ghost"
          onClick={onSkip}
          disabled={loading}
          type="button"
        >
          {t('supporter_skip')}
        </button>
        <button
          className="ob-btn ob-btn--ghost"
          onClick={onBack}
          disabled={loading}
          type="button"
        >
          ← {t('back')}
        </button>
      </div>
    </div>
  );
}

export default StepSupporter;
