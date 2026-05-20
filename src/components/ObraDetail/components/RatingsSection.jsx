import { Star } from 'lucide-react';

/**
 * RatingsSection - Overall rating and user rating
 * Displays general rating and user's personal rating with star icons
 */
function RatingsSection({ obra }) {
  if (obra.nota <= 0 && obra.notaUsuario <= 0) return null;

  return (
    <section className="detail-section">
      <h3>Avaliações</h3>
      <div className="ratings">
        {obra.nota > 0 && (
          <div className="rating-item">
            <span className="rating-label">Nota Geral:</span>
            <span className="rating-value">
              <Star size={18} fill="#fbbf24" color="#fbbf24" />
              {obra.nota}/5
            </span>
          </div>
        )}
        {obra.notaUsuario > 0 && (
          <div className="rating-item">
            <span className="rating-label">Minha Nota:</span>
            <span className="rating-value">
              <Star size={18} fill="#fbbf24" color="#fbbf24" />
              {obra.notaUsuario}/5
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

export default RatingsSection;
