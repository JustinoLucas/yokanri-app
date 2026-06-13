import FlagIcon from './FlagIcon';

const TIPOS_VALIDOS = ['Coreano', 'Chinês', 'Japonês'];

function TipoBadge({ tipo, className = 'badge-tipo' }) {
  if (!TIPOS_VALIDOS.includes(tipo)) return null;

  const size = className.includes('badge-lg') ? 16 : 13;

  return (
    <span className={className}>
      <span className="badge-tipo-flag">
        <FlagIcon tipo={tipo} size={size} />
      </span>
      {tipo}
    </span>
  );
}

export default TipoBadge;
