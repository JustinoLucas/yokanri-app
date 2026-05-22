import { useConfig } from '../../../context/ConfigContext';

// status é um ID estável ('lendo', 'completo', …) — exibe o label configurado
function StatusBadge({ status, className = 'badge' }) {
  const config = useConfig();
  const item = config?.statusLeitura?.find(s => s.id === status);
  const color = item?.color || '#666';
  const label = item?.label || status;

  return (
    <span className={className} style={{ backgroundColor: color }}>
      {label}
    </span>
  );
}

export default StatusBadge;
