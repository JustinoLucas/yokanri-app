import { ChevronDown } from 'lucide-react';
import { TIPO_LANCAMENTO, DIAS_SEMANA } from '../../../types/obra';
import DaySelector from '../components/DaySelector';
import { formatDateForInput, dateInputToISO } from '../utils/dataProcessing';
import { useLanguage } from '../../../i18n/LanguageContext';

const TIPO_LANCAMENTO_KEY = {
  'nao-definido': 'lancamento_tipo_nao_definido',
  'semanal':      'lancamento_tipo_semanal',
  'quinzenal':    'lancamento_tipo_quinzenal',
  'mensal':       'lancamento_tipo_mensal',
  'irregular':    'lancamento_tipo_irregular',
};

function ReleaseScheduleSection({ formData, onChange, onNumberChange, onNumberBlur, onDayToggle, statusObraList, tipoLancamentoList }) {
  const { t } = useLanguage();
  const currentStatusItem = statusObraList?.find(s => s.id === formData.status);
  if (currentStatusItem?.hideSchedule) return null;

  const labelSemanal   = tipoLancamentoList?.find(t => t.id === 'semanal')?.label    ?? TIPO_LANCAMENTO.SEMANAL;
  const labelQuinzenal = tipoLancamentoList?.find(t => t.id === 'quinzenal')?.label  ?? TIPO_LANCAMENTO.QUINZENAL;
  const labelMensal    = tipoLancamentoList?.find(t => t.id === 'mensal')?.label     ?? TIPO_LANCAMENTO.MENSAL;
  const labelIrregular = tipoLancamentoList?.find(t => t.id === 'irregular')?.label  ?? TIPO_LANCAMENTO.IRREGULAR;

  const tipoItems = tipoLancamentoList ?? Object.values(TIPO_LANCAMENTO).map(label => ({ id: label.toLowerCase(), label }));

  const availableDays = Object.values(DIAS_SEMANA).filter(
    dia => dia !== 'Não definido' && dia !== 'Variável'
  );

  return (
    <section className="form-section">
      <h3>{t('form_section_release')}</h3>

      <div className="form-group">
        <label>{t('form_release_type')}</label>
        <div className="custom-select-wrapper">
          <select
            className="custom-select"
            value={formData.tipoLancamento}
            onChange={(e) => onChange('tipoLancamento', e.target.value)}
          >
            {tipoItems.map(item => (
              <option key={item.id} value={item.label}>
                {t(TIPO_LANCAMENTO_KEY[item.id]) || item.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="custom-select-icon" />
        </div>
      </div>

      {formData.tipoLancamento === labelSemanal && (
        <div className="form-group full-width">
          <label>{t('form_days_week')}</label>
          <DaySelector
            selectedDays={formData.diasLancamento || []}
            onToggle={onDayToggle}
            availableDays={availableDays}
          />
        </div>
      )}

      {formData.tipoLancamento === labelQuinzenal && (
        <>
          <div className="form-row">
            <div className="form-group">
              <label>{t('form_biweekly_interval')}</label>
              <input
                type="number"
                min="2"
                max="4"
                value={formData.intervaloSemanas}
                onChange={(e) => onNumberChange('intervaloSemanas', e.target.value)}
                onBlur={(e) => onNumberBlur('intervaloSemanas', e.target.value, 2, 4, 2)}
              />
            </div>
            <div className="form-group">
              <label>{t('form_biweekly_ref')}</label>
              <input
                type="date"
                value={formatDateForInput(formData.dataReferenciaQuinzenal)}
                onChange={(e) => onChange('dataReferenciaQuinzenal', dateInputToISO(e.target.value))}
              />
              <small style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {t('form_biweekly_hint')}
              </small>
            </div>
          </div>
          <div className="form-group full-width">
            <label>{t('form_days_week')}</label>
            <DaySelector
              selectedDays={formData.diasLancamento || []}
              onToggle={onDayToggle}
              availableDays={availableDays}
            />
          </div>
        </>
      )}

      {formData.tipoLancamento === labelMensal && (
        <div className="form-group">
          <label>{t('form_monthly_day')}</label>
          <input
            type="number"
            min="1"
            max="31"
            value={formData.diaDoMes}
            onChange={(e) => onNumberChange('diaDoMes', e.target.value)}
            onBlur={(e) => onNumberBlur('diaDoMes', e.target.value, 1, 31, 1)}
          />
        </div>
      )}

      {formData.tipoLancamento === labelIrregular && (
        <div className="form-group">
          <label>{t('form_irregular_details')}</label>
          <input
            type="text"
            value={formData.detalhesLancamento}
            onChange={(e) => onChange('detalhesLancamento', e.target.value)}
            placeholder={t('form_irregular_ph')}
          />
        </div>
      )}
    </section>
  );
}

export default ReleaseScheduleSection;
