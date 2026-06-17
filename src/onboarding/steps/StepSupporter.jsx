import { useState } from 'react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { getT } from '../i18n/strings';

const PLATFORMS = [
  {
    id: 'patreon',
    name: 'Patreon',
    handle: 'patreon.com/yokanri',
    url: 'https://patreon.com/yokanri',
    color: '#FF424D',
    bg: 'rgba(255, 66, 77, 0.08)',
    border: 'rgba(255, 66, 77, 0.22)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="14.5" cy="9" r="6.5" />
        <rect x="3" y="2" width="4" height="20" rx="1" />
      </svg>
    ),
  },
  {
    id: 'kofi',
    name: 'Ko-fi',
    handle: 'ko-fi.com/yokanri',
    url: 'https://ko-fi.com/yokanri',
    color: '#29ABE0',
    bg: 'rgba(41, 171, 224, 0.08)',
    border: 'rgba(41, 171, 224, 0.22)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="2" x2="6" y2="5" />
        <line x1="10" y1="2" x2="10" y2="5" />
        <line x1="14" y1="2" x2="14" y2="5" />
      </svg>
    ),
  },
];

function isValidCode(code) {
  return code.replace(/\s/g, '').length >= 6;
}

function StepSupporter({ language, onConfirm, onSkip, onBack }) {
  const t = getT(language);
  const [stage, setStage] = useState('platforms');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePlatformClick = (url) => {
    openUrl(url).catch(() => {});
  };

  const handleActivate = async () => {
    const trimmed = code.trim();
    if (!trimmed) { setError(t('supporter_error_empty')); return; }
    if (!isValidCode(trimmed)) { setError(t('supporter_error_invalid')); return; }

    setError('');
    setLoading(true);
    try {
      setSuccess(true);
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
    if (e.key === 'Enter' && !loading) handleActivate();
  };

  /* ── Stage: plataformas ──────────────────────────────── */
  if (stage === 'platforms') {
    return (
      <div className="ob-step ob-step--supporter">

        <div className="ob-step-header">
          <div className="ob-sup-icon-wrap">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h2 className="ob-title">{t('supporter_platforms_title')}</h2>
          <p className="ob-subtitle">{t('supporter_platforms_subtitle')}</p>
        </div>

        <div className="ob-platform-list">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              className="ob-platform-card"
              onClick={() => handlePlatformClick(p.url)}
              type="button"
              style={{
                '--platform-color': p.color,
                '--platform-bg': p.bg,
                '--platform-border': p.border,
              }}
            >
              <span className="ob-platform-icon">{p.icon}</span>
              <span className="ob-platform-info">
                <span className="ob-platform-name">{p.name}</span>
                <span className="ob-platform-handle">{p.handle}</span>
              </span>
              <svg className="ob-platform-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </button>
          ))}
        </div>

        <p className="ob-platform-hint">{t('supporter_key_hint')}</p>

        <button
          className="ob-btn ob-btn--supporter ob-btn--full"
          onClick={() => setStage('key')}
          type="button"
        >
          ♥ {t('supporter_continue_key')}
        </button>

        <button className="ob-btn ob-btn--ghost" onClick={onBack} type="button">
          ← {t('back')}
        </button>
      </div>
    );
  }

  /* ── Stage: chave ────────────────────────────────────── */
  return (
    <div className="ob-step ob-step--supporter">

      <div className="ob-step-header">
        <div className="ob-sup-icon-wrap">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 className="ob-title">{t('supporter_title')}</h2>
        <p className="ob-subtitle">{t('supporter_subtitle')}</p>
      </div>

      <div className="ob-supporter-form">
        <input
          type="text"
          className={`ob-code-input${error ? ' ob-code-input--error' : ''}${success ? ' ob-code-input--success' : ''}`}
          placeholder={t('supporter_placeholder')}
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(''); setSuccess(false); }}
          onKeyDown={handleKeyDown}
          disabled={loading || success}
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />

        {error   && <p className="ob-field-error">{error}</p>}
        {success && <p className="ob-field-success">✓ {t('supporter_success')}</p>}

        <button
          className="ob-btn ob-btn--supporter ob-btn--full"
          onClick={handleActivate}
          disabled={loading || success}
          type="button"
        >
          {loading ? t('loading') : t('supporter_activate')}
        </button>
      </div>

      <div className="ob-supporter-footer">
        <button className="ob-btn ob-btn--ghost" onClick={onSkip} disabled={loading} type="button">
          {t('supporter_skip')}
        </button>
        <button className="ob-btn ob-btn--ghost" onClick={() => setStage('platforms')} disabled={loading} type="button">
          ← {t('back')}
        </button>
      </div>
    </div>
  );
}

export default StepSupporter;
