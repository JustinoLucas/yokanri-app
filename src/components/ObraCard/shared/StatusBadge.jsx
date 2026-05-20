import { useConfig } from '../../../context/ConfigContext';

function StatusBadge({ status, className = 'badge' }) {
  const config = useConfig();
  const item = config?.statusLeitura?.find(s => s.label === status);
  const color = item?.color || '#666';

  return (
    <span className={className} style={{ backgroundColor: color }}>
      {status}
    </span>
  );
}

export default StatusBadge;
