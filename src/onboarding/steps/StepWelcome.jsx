/**
 * StepWelcome — Passo 1: Boas-vindas e seleção de idioma
 *
 * Props:
 *   language        {string}   Idioma atualmente selecionado ('pt-BR', 'en', ...)
 *   onLanguageChange {function} (lang: string) => void
 *   onNext          {function} () => void  (avança para Step 2)
 */

import { LANGUAGES, getT } from '../i18n/strings';

function StepWelcome({ language, onLanguageChange, onNext }) {
  const t = getT(language);

  return (
    <div className="ob-step ob-step--welcome">
      <div className="ob-welcome-header">
        <div className="ob-app-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <rect width="48" height="48" rx="12" fill="var(--accent-primary)" opacity="0.15" />
            <path
              d="M14 16h5l5 12 5-12h5L24 35 14 16z"
              fill="var(--accent-primary)"
            />
          </svg>
        </div>
        <h1 className="ob-title">{t('welcome_title')}</h1>
        <p className="ob-subtitle">{t('welcome_subtitle')}</p>
      </div>

      <div className="ob-language-section">
        <p className="ob-label">{t('welcome_choose_language')}</p>
        <div className="ob-language-grid">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`ob-lang-btn ${language === lang.code ? 'ob-lang-btn--active' : ''}`}
              onClick={() => onLanguageChange(lang.code)}
              type="button"
            >
              <span className="ob-lang-flag">{lang.flag}</span>
              <span className="ob-lang-name">{lang.native}</span>
            </button>
          ))}
        </div>
      </div>

      <button className="ob-btn ob-btn--primary ob-btn--full" onClick={onNext} type="button">
        {t('welcome_continue')}
      </button>
    </div>
  );
}

export default StepWelcome;
