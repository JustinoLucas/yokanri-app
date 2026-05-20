import { ChevronDown } from 'lucide-react';
import './CustomSelect.css';

function CustomSelect({ value, onChange, options, placeholder }) {
  return (
    <div className="custom-select-wrapper">
      <select
        className="custom-select"
        value={value}
        onChange={onChange}
      >
        {placeholder && <option value="TODOS">{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="custom-select-icon" />
    </div>
  );
}

export default CustomSelect;
