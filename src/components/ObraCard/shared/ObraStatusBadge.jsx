import { useConfig } from '../../../context/ConfigContext';

// status é um ID estável ('em-andamento', 'completo', …) — exibe o label configurado
function ObraStatusBadge({ status, className = 'badge' }) {
  const config = useConfig();
  const item = config?.statusObra?.find(s => s.id === status);
  const color = item?.color || 'var(--text-tertiary)';
  const label = item?.label || status;
  // Abbreviate 'Em andamento' → 'Andamento' for compact display
  const shortLabel = status === 'em-andamento' ? 'Andamento' : label;

  return (
    <span className={className} style={{ backgroundColor: color }} title={`Status da obra: ${label}`}>
      {shortLabel}
    </span>
  );
}

export default ObraStatusBadge;
