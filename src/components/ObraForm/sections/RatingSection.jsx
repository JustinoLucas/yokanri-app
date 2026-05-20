import { Square, CheckSquare } from 'lucide-react';

/**
 * Rating section
 * Includes: general rating, user rating, and favorite checkbox
 */
function RatingSection({ formData, onChange, onNumberChange, onNumberBlur }) {
  return (
    <section className="form-section">
      <h3>Avaliação</h3>

      <div className="form-row">
        <div className="form-group">
          <label>Nota Geral (0-5)</label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.nota}
            onChange={(e) => onNumberChange('nota', e.target.value)}
            onBlur={(e) => onNumberBlur('nota', e.target.value, 0, 5, 0)}
          />
        </div>

        <div className="form-group">
          <label>Minha Nota (0-5)</label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.notaUsuario}
            onChange={(e) => onNumberChange('notaUsuario', e.target.value)}
            onBlur={(e) => onNumberBlur('notaUsuario', e.target.value, 0, 5, 0)}
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.favorito}
              onChange={(e) => onChange('favorito', e.target.checked)}
              style={{ display: 'none' }}
            />
            {formData.favorito ? (
              <CheckSquare size={18} className="checkbox-icon-checked" />
            ) : (
              <Square size={18} className="checkbox-icon-unchecked" />
            )}
            Marcar como Favorito
          </label>
        </div>
      </div>
    </section>
  );
}

export default RatingSection;
