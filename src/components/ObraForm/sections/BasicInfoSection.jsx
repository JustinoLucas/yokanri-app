import { ChevronDown, Search } from 'lucide-react';
import { TIPO_OBRA } from '../../../types/obra';
import { useLanguage } from '../../../i18n/LanguageContext';

const TIPO_KEY = {
  [TIPO_OBRA.COREANO]: 'form_type_manhwa',
  [TIPO_OBRA.CHINES]:  'form_type_manhua',
  [TIPO_OBRA.JAPONES]: 'form_type_manga',
};

function BasicInfoSection({ formData, onChange, onSearchClick }) {
  const { t } = useLanguage();

  return (
    <section className="form-section">
      <div className="form-section-header">
        <h3>{t('form_section_basic')}</h3>
        <button
          type="button"
          className="search-btn"
          onClick={onSearchClick}
        >
          <Search size={13} />
          {t('form_search_online')}
        </button>
      </div>

      <div className="form-group">
        <label>{t('form_nome_label')}</label>
        <input
          type="text"
          value={formData.nome}
          onChange={(e) => onChange('nome', e.target.value)}
          placeholder={t('form_nome_placeholder')}
          required
        />
      </div>

      <div className="form-group">
        <label>{t('form_nome_alt_label')}</label>
        <input
          type="text"
          value={formData.nomeAlternativo}
          onChange={(e) => onChange('nomeAlternativo', e.target.value)}
          placeholder={t('form_nome_alt_ph')}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>{t('form_author_label')}</label>
          <input
            type="text"
            value={formData.autor}
            onChange={(e) => onChange('autor', e.target.value)}
            placeholder={t('form_author_ph')}
          />
        </div>

        <div className="form-group">
          <label>{t('form_studio_label')}</label>
          <input
            type="text"
            value={formData.studio}
            onChange={(e) => onChange('studio', e.target.value)}
            placeholder={t('form_studio_ph')}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>{t('form_type_label')}</label>
          <div className="custom-select-wrapper">
            <select
              className="custom-select"
              value={formData.tipo}
              onChange={(e) => onChange('tipo', e.target.value)}
            >
              {Object.values(TIPO_OBRA).map(tipo => (
                <option key={tipo} value={tipo}>
                  {t(TIPO_KEY[tipo]) || tipo}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="custom-select-icon" />
          </div>
        </div>

        <div className="form-group">
          <label>{t('form_year_label')}</label>
          <input
            type="number"
            value={formData.anoLancamento || ''}
            onChange={(e) => onChange('anoLancamento', e.target.value ? parseInt(e.target.value) : null)}
            placeholder={t('form_year_ph')}
            min="1900"
            max={new Date().getFullYear() + 1}
          />
        </div>
      </div>
    </section>
  );
}

export default BasicInfoSection;
