import { useConfig } from '../../../context/ConfigContext';

function ObraStatusBadge({ status, className = 'badge-flat' }) {
  const config = useConfig();
  const item = config?.statusObra?.find(s => s.id === status);
  const color = item?.color || '#888';
  const label = item?.label || status;
  const shortLabel = status === 'em-andamento' ? 'Andamento' : label;

  return (
    <span className={className} style={{ '--badge-color': color }} title={`Status da obra: ${label}`}>
      {shortLabel}
    </span>
  );
}

export default ObraStatusBadge;
