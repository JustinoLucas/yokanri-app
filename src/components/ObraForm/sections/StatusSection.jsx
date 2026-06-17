import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { getItemLabel } from '../../../i18n/itemLabel';

function StatusSection({ formData, onChange, onNumberChange, onNumberBlur, statusObraList, statusLeituraList }) {
  const { t } = useLanguage();
  const statusObraOptions   = statusObraList?.filter(s => !s.hidden)  ?? [];
  const statusLeituraOptions = statusLeituraList?.filter(s => !s.hidden) ?? [];

  return (
    <section className="form-section">
      <h3>{t('form_section_status')}</h3>

      <div className="form-row">
        <div className="form-group">
          <label>{t('form_obra_status_label')}</label>
          <div className="custom-select-wrapper">
            <select
              className="custom-select"
              value={formData.status}
              onChange={(e) => onChange('status', e.target.value)}
            >
              {statusObraOptions.map(s => (
                <option key={s.id} value={s.id}>{getItemLabel(s, t)}</option>
              ))}
            </select>
            <ChevronDown size={16} className="custom-select-icon" />
          </div>
        </div>

        <div className="form-group">
          <label>{t('form_user_status_label')}</label>
          <div className="custom-select-wrapper">
            <select
              className="custom-select"
              value={formData.statusUsuario}
              onChange={(e) => onChange('statusUsuario', e.target.value)}
            >
              {statusLeituraOptions.map(s => (
                <option key={s.id} value={s.id}>{getItemLabel(s, t)}</option>
              ))}
            </select>
            <ChevronDown size={16} className="custom-select-icon" />
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>{t('form_chapter_label')}</label>
          <input
            type="number"
            min="0"
            value={formData.capituloAtual}
            onChange={(e) => onNumberChange('capituloAtual', e.target.value)}
            onBlur={(e) => onNumberBlur('capituloAtual', e.target.value, 0, null, 0)}
          />
        </div>

        <div className="form-group">
          <label>{t('form_user_chapter_label')}</label>
          <input
            type="number"
            min="0"
            max={formData.capituloAtual || undefined}
            value={formData.capituloAtualUsuario}
            onChange={(e) => onNumberChange('capituloAtualUsuario', e.target.value)}
            onBlur={(e) => onNumberBlur('capituloAtualUsuario', e.target.value, 0, formData.capituloAtual || null, 0)}
          />
          {formData.capituloAtual > 0 && (
            <small style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {t('form_chapter_max').replace('{max}', formData.capituloAtual)}
            </small>
          )}
        </div>
      </div>

      {(formData.statusUsuario === 'lendo' ||
        formData.statusUsuario === 'pausado' ||
        formData.statusUsuario === 'completo') && (
        <div className="form-row">
          <div className="form-group">
            <label>
              {t('form_date_start')}
              <small style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                {t('form_date_optional')}
              </small>
            </label>
            <input
              type="date"
              value={formData.dataInicioLeitura ? formData.dataInicioLeitura.split('T')[0] : ''}
              onChange={(e) => {
                const dateValue = e.target.value ? new Date(e.target.value + 'T00:00:00').toISOString() : null;
                onChange('dataInicioLeitura', dateValue);
              }}
            />
          </div>

          {formData.statusUsuario === 'completo' && (
            <div className="form-group">
              <label>
                {t('form_date_end')}
                <small style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                  {t('form_date_optional')}
                </small>
              </label>
              <input
                type="date"
                value={formData.dataFimLeitura ? formData.dataFimLeitura.split('T')[0] : ''}
                onChange={(e) => {
                  const dateValue = e.target.value ? new Date(e.target.value + 'T23:59:59').toISOString() : null;
                  onChange('dataFimLeitura', dateValue);
                }}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default StatusSection;
