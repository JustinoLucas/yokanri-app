import { Sparkles } from 'lucide-react';
import { useConfig } from '../../../context/ConfigContext';

function ReleasesHeader({ filterStatusLeitura, onFilterChange }) {
  const config = useConfig();
  const statusList = config?.statusLeitura?.map(s => s.label) ?? [];

  return (
    <div className="releases-header">
      <div className="header-info">
        <h2>
          <Sparkles size={20} />
          Lançamentos
        </h2>
      </div>
      <div className="header-filter">
        <select
          id="status-filter"
          className="status-filter-select"
          value={filterStatusLeitura}
          onChange={(e) => onFilterChange(e.target.value)}
        >
          {statusList.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ReleasesHeader;
