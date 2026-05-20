import { Square, CheckSquare } from 'lucide-react';

/**
 * Reusable component for selecting weekdays
 * Displays as a grid of checkboxes with custom styling
 */
function DaySelector({ selectedDays = [], onToggle, availableDays }) {
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
            <span>{dia}</span>
          </label>
        );
      })}
    </div>
  );
}

export default DaySelector;
