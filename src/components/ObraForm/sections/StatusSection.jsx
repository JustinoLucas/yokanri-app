import { ChevronDown } from 'lucide-react';
import { STATUS_OBRA, STATUS_LEITURA } from '../../../types/obra';

function StatusSection({ formData, onChange, onNumberChange, onNumberBlur, statusObraList, statusLeituraList }) {
  const statusObraOptions = statusObraList?.map(s => s.label) ?? Object.values(STATUS_OBRA);
  const statusLeituraOptions = statusLeituraList?.map(s => s.label) ?? Object.values(STATUS_LEITURA);

  const labelLendo = statusLeituraList?.find(s => s.id === 'lendo')?.label ?? 'Lendo';
  const labelPausado = statusLeituraList?.find(s => s.id === 'pausado')?.label ?? 'Pausado';
  const labelCompleto = statusLeituraList?.find(s => s.id === 'completo')?.label ?? 'Completo';

  return (
    <section className="form-section">
      <h3>Status e Progresso</h3>

      <div className="form-row">
        <div className="form-group">
          <label>Status da Obra</label>
          <div className="custom-select-wrapper">
            <select
              className="custom-select"
              value={formData.status}
              onChange={(e) => onChange('status', e.target.value)}
            >
              {statusObraOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <ChevronDown size={16} className="custom-select-icon" />
          </div>
        </div>

        <div className="form-group">
          <label>Meu Status</label>
          <div className="custom-select-wrapper">
            <select
              className="custom-select"
              value={formData.statusUsuario}
              onChange={(e) => onChange('statusUsuario', e.target.value)}
            >
              {statusLeituraOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <ChevronDown size={16} className="custom-select-icon" />
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Capítulo Atual (Lançado)</label>
          <input
            type="number"
            min="0"
            value={formData.capituloAtual}
            onChange={(e) => onNumberChange('capituloAtual', e.target.value)}
            onBlur={(e) => onNumberBlur('capituloAtual', e.target.value, 0, null, 0)}
          />
        </div>

        <div className="form-group">
          <label>Meu Capítulo Atual</label>
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
              Máximo: {formData.capituloAtual}
            </small>
          )}
        </div>
      </div>

      {/* Datas de Leitura - Aparecem baseado no status */}
      {(formData.statusUsuario === labelLendo ||
        formData.statusUsuario === labelPausado ||
        formData.statusUsuario === labelCompleto) && (
        <div className="form-row">
          <div className="form-group">
            <label>
              Data de Início de Leitura
              <small style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                (opcional - edite se necessário)
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

          {formData.statusUsuario === labelCompleto && (
            <div className="form-group">
              <label>
                Data de Conclusão
                <small style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                  (opcional - edite se necessário)
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
