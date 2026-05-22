import { Sparkles } from 'lucide-react';
import { useConfig } from '../../../context/ConfigContext';

function ReleasesHeader({ filterStatusLeitura, onFilterChange }) {
  const config = useConfig();
  // Exclui itens ocultos (ex: 'nao-definido') — value = ID, texto = label
  const statusList = config?.statusLeitura?.filter(s => !s.hidden) ?? [];

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
          {statusList.map(s => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ReleasesHeader;
