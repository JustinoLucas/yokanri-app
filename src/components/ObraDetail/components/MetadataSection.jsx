import { formatDate } from '../utils/formatters';

/**
 * MetadataSection - Registration metadata (added date, updated date)
 * Displays when the work was added and last updated in the system
 */
function MetadataSection({ obra }) {
  return (
    <section className="detail-section">
      <h3>Informações do Registro</h3>
      <div className="info-grid">
        <div className="info-item">
          <strong>Adicionado em:</strong>
          <span>{formatDate(obra.dataAdicionado)}</span>
        </div>
        <div className="info-item">
          <strong>Última atualização:</strong>
          <span>{formatDate(obra.dataAtualizado)}</span>
        </div>
      </div>
    </section>
  );
}

export default MetadataSection;
