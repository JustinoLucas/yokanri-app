import { LANGUAGES, getT } from '../i18n/strings';
import stringsJson from '../../i18n/strings.json';

function StepWelcome({ language, onLanguageChange, onNext }) {
  const t = getT(language);

  // welcome_title / welcome_subtitle são editáveis via TranslationEditor (strings.json).
  // Para idiomas sem entrada no strings.json, cai no getT() de strings.js.
  const jsonLang = stringsJson[language] || stringsJson['pt-BR'];
  const welcomeTitle    = jsonLang?.welcome_title    || t('welcome_title');
  const welcomeSubtitle = jsonLang?.welcome_subtitle || t('welcome_subtitle');
  const chooseLanguage  = jsonLang?.welcome_choose_language || t('welcome_choose_language');
  const continueLabel   = jsonLang?.welcome_continue || t('welcome_continue');

  return (
    <div className="ob-step ob-step--welcome">

      {/* ── Hero ───────────────────────────────────────── */}
      <div className="ob-welcome-header">
        <div className="ob-app-icon">
          <div className="ob-app-icon-glow" />
          <svg width="56" height="56" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <rect width="48" height="48" rx="14" fill="var(--accent-primary)" opacity="0.18" />
            <path
              d="M14 16h5l5 12 5-12h5L24 35 14 16z"
              fill="var(--accent-primary)"
            />
          </svg>
        </div>
        <h1 className="ob-title">{welcomeTitle}</h1>
        <p className="ob-subtitle">{welcomeSubtitle}</p>
      </div>

      {/* ── Language picker ────────────────────────────── */}
      <div className="ob-language-section">
        <p className="ob-label">{chooseLanguage}</p>
        <div className="ob-language-grid">
          {LANGUAGES.map((lang) => {
            const isActive = language === lang.code;
            return (
              <button
                key={lang.code}
                className={`ob-lang-btn ${isActive ? 'ob-lang-btn--active' : ''}`}
                onClick={() => onLanguageChange(lang.code)}
                type="button"
              >
                {isActive && <span className="ob-lang-check">✓</span>}
                <span className="ob-lang-flag">{lang.flag}</span>
                <span className="ob-lang-name">{lang.native}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button className="ob-btn ob-btn--primary ob-btn--full" onClick={onNext} type="button">
        {continueLabel}
      </button>
    </div>
  );
}

export default StepWelcome;
