import FlagIcon from './FlagIcon';
import { useLanguage } from '../../../i18n/LanguageContext';

const TIPOS_VALIDOS = ['Coreano', 'Chinês', 'Japonês'];

const TIPO_KEY = {
  'Coreano': 'tipo_coreano',
  'Chinês':  'tipo_chines',
  'Japonês': 'tipo_japones',
};

function TipoBadge({ tipo, className = 'badge-tipo' }) {
  const { t } = useLanguage();
  if (!TIPOS_VALIDOS.includes(tipo)) return null;

  const size = className.includes('badge-lg') ? 16 : 13;

  return (
    <span className={className}>
      <span className="badge-tipo-flag">
        <FlagIcon tipo={tipo} size={size} />
      </span>
      {t(TIPO_KEY[tipo]) || tipo}
    </span>
  );
}

export default TipoBadge;
