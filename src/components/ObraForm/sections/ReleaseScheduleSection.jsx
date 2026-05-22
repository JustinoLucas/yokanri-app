import { ChevronDown } from 'lucide-react';
import { TIPO_LANCAMENTO, DIAS_SEMANA } from '../../../types/obra';
import DaySelector from '../components/DaySelector';
import { formatDateForInput, dateInputToISO } from '../utils/dataProcessing';

function ReleaseScheduleSection({ formData, onChange, onNumberChange, onNumberBlur, onDayToggle, statusObraList, tipoLancamentoList }) {
  const currentStatusItem = statusObraList?.find(s => s.id === formData.status);
  if (currentStatusItem?.hideSchedule) return null;

  const labelSemanal = tipoLancamentoList?.find(t => t.id === 'semanal')?.label ?? TIPO_LANCAMENTO.SEMANAL;
  const labelQuinzenal = tipoLancamentoList?.find(t => t.id === 'quinzenal')?.label ?? TIPO_LANCAMENTO.QUINZENAL;
  const labelMensal = tipoLancamentoList?.find(t => t.id === 'mensal')?.label ?? TIPO_LANCAMENTO.MENSAL;
  const labelIrregular = tipoLancamentoList?.find(t => t.id === 'irregular')?.label ?? TIPO_LANCAMENTO.IRREGULAR;

  const tipoOptions = tipoLancamentoList?.map(t => t.label) ?? Object.values(TIPO_LANCAMENTO);

  const availableDays = Object.values(DIAS_SEMANA).filter(
    dia => dia !== 'Não definido' && dia !== 'Variável'
  );

  return (
    <section className="form-section">
      <h3>Padrão de Lançamento</h3>

      <div className="form-group">
        <label>Tipo de Lançamento</label>
        <div className="custom-select-wrapper">
          <select
            className="custom-select"
            value={formData.tipoLancamento}
            onChange={(e) => onChange('tipoLancamento', e.target.value)}
          >
            {tipoOptions.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
          <ChevronDown size={16} className="custom-select-icon" />
        </div>
      </div>

      {/* Weekly release */}
      {formData.tipoLancamento === labelSemanal && (
        <div className="form-group full-width">
          <label>Dias da Semana</label>
          <DaySelector
            selectedDays={formData.diasLancamento || []}
            onToggle={onDayToggle}
            availableDays={availableDays}
          />
        </div>
      )}

      {/* Biweekly release */}
      {formData.tipoLancamento === labelQuinzenal && (
        <>
          <div className="form-row">
            <div className="form-group">
              <label>A cada quantas semanas?</label>
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
              <label>Data de referência (último lançamento)</label>
              <input
                type="date"
                value={formatDateForInput(formData.dataReferenciaQuinzenal)}
                onChange={(e) => onChange('dataReferenciaQuinzenal', dateInputToISO(e.target.value))}
              />
              <small style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Informe uma data que teve lançamento para calcular o ciclo
              </small>
            </div>
          </div>
          <div className="form-group full-width">
            <label>Dias da Semana</label>
            <DaySelector
              selectedDays={formData.diasLancamento || []}
              onToggle={onDayToggle}
              availableDays={availableDays}
            />
          </div>
        </>
      )}

      {/* Monthly release */}
      {formData.tipoLancamento === labelMensal && (
        <div className="form-group">
          <label>Dia do mês (1-31)</label>
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

      {/* Irregular release */}
      {formData.tipoLancamento === labelIrregular && (
        <div className="form-group">
          <label>Detalhes do lançamento (opcional)</label>
          <input
            type="text"
            value={formData.detalhesLancamento}
            onChange={(e) => onChange('detalhesLancamento', e.target.value)}
            placeholder="Ex: Lança quando o autor lembrar que existe"
          />
        </div>
      )}
    </section>
  );
}

export default ReleaseScheduleSection;
