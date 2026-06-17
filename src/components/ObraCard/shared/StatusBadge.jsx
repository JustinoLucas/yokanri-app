import { useConfig } from '../../../context/ConfigContext';
import { useLanguage } from '../../../i18n/LanguageContext';
import { getItemLabel } from '../../../i18n/itemLabel';

function StatusBadge({ status, className = 'badge-outlined' }) {
  const config = useConfig();
  const { t } = useLanguage();
  const item = config?.statusLeitura?.find(s => s.id === status);
  const color = item?.color || '#666';
  const label = getItemLabel(item, t) || status;

  return (
    <span className={className} style={{ '--badge-color': color, color }}>
      {label}
    </span>
  );
}

export default StatusBadge;
