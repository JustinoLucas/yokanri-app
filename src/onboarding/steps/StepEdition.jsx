/**
 * StepEdition — Passo 2: Escolha entre Core e Supporter
 *
 * Props:
 *   language    {string}   Idioma selecionado
 *   onCore      {function} () => void  (escolheu Core)
 *   onSupporter {function} () => void  (escolheu Supporter)
 *   onBack      {function} () => void
 */

import { getT } from '../i18n/strings';

function StepEdition({ language, onCore, onSupporter, onBack }) {
  const t = getT(language);

  return (
    <div className="ob-step ob-step--edition">
      <div className="ob-step-header">
        <h2 className="ob-title">{t('edition_title')}</h2>
        <p className="ob-subtitle">{t('edition_subtitle')}</p>
      </div>

      <div className="ob-edition-cards">
        {/* ── Card Core ────────────────────────────────── */}
        <div className="ob-edition-card ob-edition-card--core">
          <div className="ob-edition-card-top">
            <div className="ob-edition-icon ob-edition-icon--core">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="ob-edition-card-info">
              <div className="ob-edition-card-name-row">
                <span className="ob-edition-card-name">{t('edition_core_name')}</span>
                <span className="ob-edition-tag ob-edition-tag--core">{t('edition_core_tag')}</span>
              </div>
              <p className="ob-edition-card-desc">{t('edition_core_desc')}</p>
            </div>
          </div>
          <button
            className="ob-btn ob-btn--secondary ob-btn--full"
            onClick={onCore}
            type="button"
          >
            {t('edition_core_btn')}
          </button>
        </div>

        {/* ── Card Supporter ───────────────────────────── */}
        <div className="ob-edition-card ob-edition-card--supporter">
          <div className="ob-edition-card-top">
            <div className="ob-edition-icon ob-edition-icon--supporter">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="ob-edition-card-info">
              <div className="ob-edition-card-name-row">
                <span className="ob-edition-card-name">{t('edition_supporter_name')}</span>
                <span className="ob-edition-tag ob-edition-tag--supporter">{t('edition_supporter_tag')}</span>
              </div>
              <p className="ob-edition-card-desc">{t('edition_supporter_desc')}</p>
            </div>
          </div>
          <button
            className="ob-btn ob-btn--primary ob-btn--full"
            onClick={onSupporter}
            type="button"
          >
            {t('edition_supporter_btn')}
          </button>
        </div>
      </div>

      <button className="ob-btn ob-btn--ghost" onClick={onBack} type="button">
        ← {t('back')}
      </button>
    </div>
  );
}

export default StepEdition;
