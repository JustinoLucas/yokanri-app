import { getDescricaoLancamento } from '../../../types/obra';

/**
 * InfoSection - General information (author, studio, release pattern)
 * Displays key metadata about the work in a grid layout
 */
function InfoSection({ obra }) {
  return (
    <section className="detail-section">
      <h3>Informações Gerais</h3>
      <div className="info-grid">
        {obra.autor && (
          <div className="info-item">
            <strong>Autor:</strong>
            <span>{obra.autor}</span>
          </div>
        )}
        {obra.studio && (
          <div className="info-item">
            <strong>Estúdio/Artista:</strong>
            <span>{obra.studio}</span>
          </div>
        )}
        {obra.anoLancamento && (
          <div className="info-item">
            <strong>Ano de Lançamento:</strong>
            <span>{obra.anoLancamento}</span>
          </div>
        )}
        <div className="info-item">
          <strong>Padrão de Lançamento:</strong>
          <span>{getDescricaoLancamento(obra)}</span>
        </div>
      </div>
    </section>
  );
}

export default InfoSection;
