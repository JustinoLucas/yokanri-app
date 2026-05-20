import { useConfig } from '../../../context/ConfigContext';

function ObraStatusBadge({ status, className = 'badge' }) {
  const config = useConfig();
  const item = config?.statusObra?.find(s => s.label === status);
  const color = item?.color || 'var(--text-tertiary)';
  const shortLabel = item?.id === 'em-andamento' ? 'Andamento' : status;

  return (
    <span className={className} style={{ backgroundColor: color }} title={`Status da obra: ${status}`}>
      {shortLabel}
    </span>
  );
}

export default ObraStatusBadge;
