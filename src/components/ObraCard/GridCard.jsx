import { useState } from 'react';
import { Star, ExternalLink, Plus, StickyNote, X } from 'lucide-react';
import FavoriteStar from './shared/FavoriteStar';
import StatusBadge from './shared/StatusBadge';
import ObraStatusBadge from './shared/ObraStatusBadge';
import CoverImage from './shared/CoverImage';
import { hasLink, calculateProgress } from './utils';

/**
 * Grid/Card view for obra
 */
function GridCard({
  obra,
  coverUrl,
  onViewDetail,
  onToggleFavorito,
  onIncrementCapitulo,
  onLinkClick
}) {
  const [notesExpanded, setNotesExpanded] = useState(false);

  const hasObraLink = hasLink(obra);
  const hasNotes = obra.notas && obra.notas.trim().length > 0;
  const progressPercentage = calculateProgress(obra.capituloAtualUsuario, obra.capituloAtual);

  const handleFavorite = (e) => {
    e.stopPropagation();
    onToggleFavorito();
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    onIncrementCapitulo();
  };

  const handleLink = (e) => {
    e.stopPropagation();
    onLinkClick();
  };

  const handleToggleNotes = (e) => {
    e.stopPropagation();
    setNotesExpanded(!notesExpanded);
  };

  return (
    <div className={`obra-card ${notesExpanded ? 'card-notes-expanded' : ''}`}>
      <div className="card-main" onClick={onViewDetail}>
        <div className="card-cover">
          {coverUrl ? (
            <img src={coverUrl} alt={obra.nome} />
          ) : (
            <div className="no-cover"></div>
          )}
          <button
            className="favorite-btn"
            onClick={handleFavorite}
            title="Favoritar"
          >
            {obra.favorito ? (
              <FavoriteStar obraId={obra.id} size={18} />
            ) : (
              <Star size={18} color="white" />
            )}
          </button>
        </div>

        <div className="card-content">
          <h3 className="card-title">{obra.nome}</h3>
          {obra.nomeAlternativo && (
            <p className="card-alt-title">{obra.nomeAlternativo}</p>
          )}

          <div className="card-status">
            <StatusBadge status={obra.statusUsuario} />
            <ObraStatusBadge status={obra.status} />
          </div>

          <div className="card-progress-wrapper">
            <div className="card-progress">
              <span className="progress-text">
                Capítulo: {obra.capituloAtualUsuario}
                {obra.capituloAtual > 0 && ` / ${obra.capituloAtual}`}
              </span>
              {obra.notaUsuario > 0 && (
                <div className="card-rating">
                  <Star size={14} fill="#fbbf24" color="#fbbf24" />
                  {obra.notaUsuario > 5 ? (obra.notaUsuario / 2).toFixed(1) : obra.notaUsuario.toFixed(1)}/5
                </div>
              )}
            </div>
            {obra.capituloAtual > 0 && (
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            )}
          </div>

          <div className="card-actions">
            {hasNotes && (
              <button
                className={`btn-card-action ${notesExpanded ? 'notes-active' : ''}`}
                onClick={handleToggleNotes}
                title={notesExpanded ? "Ocultar notas" : "Ver notas"}
              >
                <StickyNote size={16} />
              </button>
            )}
            {hasObraLink && (
              <button className="btn-card-action" onClick={handleLink} title="Abrir link">
                <ExternalLink size={16} />
              </button>
            )}
            <button className="btn-card-action" onClick={handleIncrement} title="Ler próximo capítulo">
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {hasNotes && notesExpanded && (
        <div className="card-notes-section">
          <div className="notes-header">
            <StickyNote size={16} />
            <span>Notas</span>
            <button
              className="btn-close-notes"
              onClick={handleToggleNotes}
              title="Fechar notas"
            >
              <X size={16} />
            </button>
          </div>
          <div className="notes-content">{obra.notas}</div>
        </div>
      )}
    </div>
  );
}

export default GridCard;
