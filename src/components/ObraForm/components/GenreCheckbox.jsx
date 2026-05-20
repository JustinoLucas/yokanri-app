import { Square, CheckSquare } from 'lucide-react';

/**
 * Reusable component for genre selection
 * Single checkbox with custom styling
 */
function GenreCheckbox({ genre, isSelected, onToggle }) {
  return (
    <label className="genero-checkbox">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(genre)}
        style={{ display: 'none' }}
      />
      {isSelected ? (
        <CheckSquare size={18} className="checkbox-icon-checked" />
      ) : (
        <Square size={18} className="checkbox-icon-unchecked" />
      )}
      {genre}
    </label>
  );
}

export default GenreCheckbox;
