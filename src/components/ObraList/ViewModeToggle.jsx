import { List, LayoutGrid, AlignJustify } from 'lucide-react';
import { VIEW_MODES } from './constants';

function ViewModeToggle({ viewMode, onViewModeChange }) {
  return (
    <div className="view-mode-toggle">
      <button
        className={`btn-icon ${viewMode === VIEW_MODES.TABLE ? 'active' : ''}`}
        onClick={() => onViewModeChange(VIEW_MODES.TABLE)}
        title="Lista"
      >
        <List size={18} />
      </button>
      <button
        className={`btn-icon ${viewMode === VIEW_MODES.GRID ? 'active' : ''}`}
        onClick={() => onViewModeChange(VIEW_MODES.GRID)}
        title="Grade"
      >
        <LayoutGrid size={18} />
      </button>
      <button
        className={`btn-icon ${viewMode === VIEW_MODES.COMPACT ? 'active' : ''}`}
        onClick={() => onViewModeChange(VIEW_MODES.COMPACT)}
        title="Tabela Compacta"
      >
        <AlignJustify size={18} />
      </button>
    </div>
  );
}

export default ViewModeToggle;
