import { getT } from '../i18n/strings';

const CORE_FEATURES = {
  'pt-BR': ['Pesquisa Online', 'Perfil Personalizado', 'Coleções Personalizadas', 'Temas Prontos', 'Gerenciamento da Biblioteca', 'Calendário', 'e mais no futuro…'],
  en:      ['Online Search', 'Personal Profile', 'Custom Collections', 'Ready Themes', 'Library Management', 'Calendar', 'and more in the future…'],
  es:      ['Búsqueda Online', 'Perfil Personalizado', 'Colecciones Personalizadas', 'Temas Listos', 'Gestión de Biblioteca', 'Calendario', 'y más en el futuro…'],
  jp:      ['オンライン検索', 'パーソナルプロフィール', 'カスタムコレクション', '既成テーマ', 'ライブラリ管理', 'カレンダー', '今後さらに追加…'],
  kr:      ['온라인 검색', '개인 프로필', '커스텀 컬렉션', '기본 테마', '라이브러리 관리', '캘린더', '더 많은 기능 예정…'],
  ch:      ['在线搜索', '个人资料', '自定义合集', '预设主题', '图书馆管理', '日历', '更多功能即将推出…'],
};

const SUP_FEATURES = {
  'pt-BR': ['Tudo do Core', 'Apoie o Desenvolvimento Contínuo', 'Temas Personalizados', 'Acesso Antecipado a Atualizações', 'Envio de Sugestões', 'e muito mais no futuro…'],
  en:      ['Everything in Core', 'Help Continuous Development', 'Custom Themes', 'Early Access to Updates', 'Submit Suggestions', 'and much more in the future…'],
  es:      ['Todo de Core', 'Ayuda al Desarrollo Continuo', 'Temas Personalizados', 'Acceso Anticipado a Actualizaciones', 'Envío de Sugerencias', 'y mucho más en el futuro…'],
  jp:      ['Coreの全機能', '継続的な開発支援', 'カスタムテーマ', '早期アップデートアクセス', '提案の送信', '今後さらに多くの機能…'],
  kr:      ['Core 전체 포함', '지속적인 개발 지원', '커스텀 테마', '업데이트 조기 접근', '제안 보내기', '더 많은 기능 예정…'],
  ch:      ['包含所有Core功能', '支持持续开发', '自定义主题', '抢先体验更新', '提交建议', '以及更多未来功能…'],
};

function StepEdition({ language, onCore, onSupporter, onBack }) {
  const t = getT(language);
  const lang = CORE_FEATURES[language] ? language : 'pt-BR';
  const coreFeatures = CORE_FEATURES[lang];
  const supFeatures  = SUP_FEATURES[lang];

  return (
    <div className="ob-step ob-step--edition">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="ob-step-header">
        <h2 className="ob-title">{t('edition_title')}</h2>
        <p className="ob-subtitle">{t('edition_subtitle')}</p>
      </div>

      {/* ── Two-column comparison ───────────────────────── */}
      <div className="ob-edition-columns">

        {/* Core */}
        <div className="ob-ed-col ob-ed-col--core">
          <div className="ob-ed-col-header">
            <div className="ob-ed-icon ob-ed-icon--core">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="ob-ed-name-row">
              <span className="ob-ed-name">{t('edition_core_name')}</span>
              <span className="ob-ed-tag ob-ed-tag--free">{t('edition_core_tag')}</span>
            </div>
          </div>

          <ul className="ob-ed-features">
            {coreFeatures.map((feature, i) => (
              <li key={i} className="ob-ed-feature">
                <span className="ob-ed-check ob-ed-check--core">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <button className="ob-btn ob-btn--secondary ob-btn--full ob-ed-btn" onClick={onCore} type="button">
            {t('edition_core_btn')}
          </button>
        </div>

        {/* Supporter */}
        <div className="ob-ed-col ob-ed-col--supporter">
          <div className="ob-ed-col-header">
            <div className="ob-ed-icon ob-ed-icon--supporter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="ob-ed-name-row">
              <span className="ob-ed-name">{t('edition_supporter_name')}</span>
              <span className="ob-ed-supporter-badge">♥ {t('edition_supporter_tag')}</span>
            </div>
          </div>

          <ul className="ob-ed-features">
            {supFeatures.map((feature, i) => (
              <li key={i} className="ob-ed-feature">
                <span className="ob-ed-check ob-ed-check--sup">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <button className="ob-btn ob-btn--supporter ob-btn--full ob-ed-btn" onClick={onSupporter} type="button">
            ♥ {t('edition_supporter_btn')}
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
