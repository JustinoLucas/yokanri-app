import { Square, CheckSquare } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';

const DIA_KEY = {
  'Domingo':      'dia_domingo',
  'Segunda-feira':'dia_segunda',
  'Terça-feira':  'dia_terca',
  'Quarta-feira': 'dia_quarta',
  'Quinta-feira': 'dia_quinta',
  'Sexta-feira':  'dia_sexta',
  'Sábado':       'dia_sabado',
};

function DaySelector({ selectedDays = [], onToggle, availableDays }) {
  const { t } = useLanguage();

  return (
    <div className="dias-grid">
      {availableDays.map(dia => {
        const isSelected = selectedDays.includes(dia);

        return (
          <label key={dia} className="dia-checkbox">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggle(dia)}
              style={{ display: 'none' }}
            />
            {isSelected ? (
              <CheckSquare size={18} className="checkbox-icon-checked" />
            ) : (
              <Square size={18} className="checkbox-icon-unchecked" />
            )}
            <span>{t(DIA_KEY[dia]) || dia}</span>
          </label>
        );
      })}
    </div>
  );
}

export default DaySelector;
