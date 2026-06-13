import { useConfig } from '../../../context/ConfigContext';

function StatusBadge({ status, className = 'badge-outlined' }) {
  const config = useConfig();
  const item = config?.statusLeitura?.find(s => s.id === status);
  const color = item?.color || '#666';
  const label = item?.label || status;

  return (
    <span className={className} style={{ '--badge-color': color, color }}>
      {label}
    </span>
  );
}

export default StatusBadge;
