import { useConfig } from '../../../context/ConfigContext';
import { useLanguage } from '../../../i18n/LanguageContext';
import { getItemLabel } from '../../../i18n/itemLabel';

function ObraStatusBadge({ status, className = 'badge-flat' }) {
  const config = useConfig();
  const { t } = useLanguage();
  const item = config?.statusObra?.find(s => s.id === status);
  const color = item?.color || '#888';
  const label = getItemLabel(item, t) || status;

  return (
    <span className={className} style={{ '--badge-color': color }} title={`Status da obra: ${label}`}>
      {label}
    </span>
  );
}

export default ObraStatusBadge;
