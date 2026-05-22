import { useState } from 'react';
import { Star, ExternalLink, Plus, Calendar, StickyNote, X, EyeOff } from 'lucide-react';
import FavoriteStar from './shared/FavoriteStar';
import StatusBadge from './shared/StatusBadge';
import ObraStatusBadge from './shared/ObraStatusBadge';
import CoverImage from './shared/CoverImage';
import FlagIcon from './shared/FlagIcon';
import { hasLink, calculateProgress } from './utils';

/**
 * Row/Table view for obra
 */
function RowCard({
  obra,
  coverUrl,
  onViewDetail,
  onToggleFavorito,
  onIncrementCapitulo,
  onLinkClick,
  isNsfw,
  nsfwMode,
}) {
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [blurRevealed, setBlurRevealed] = useState(false);

  const hasObraLink = hasLink(obra);
  const hasNotes = obra.notas && obra.notas.trim().length > 0;
  const progressPercentage = calculateProgress(obra.capituloAtualUsuario, obra.capituloAtual);

  const isBlurred = isNsfw && nsfwMode === 'blur' && !blurRevealed;

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

  const handleReveal = (e) => {
    e.stopPropagation();
    setBlurRevealed(true);
  };

  return (
    <div className={`obra-row-wrapper ${notesExpanded ? 'notes-expanded' : ''}`}>
      <div className="obra-row" onClick={onViewDetail}>
        <CoverImage
          coverUrl={coverUrl}
          altText={obra.nome}
          className={`row-cover${isBlurred ? ' nsfw-blur' : ''}`}
          imgClassName=""
        >
          {isBlurred && (
            <button
              className="nsfw-reveal-btn"
              onClick={handleReveal}
              title="Clique para revelar a capa"
            >
              <EyeOff size={18} />
            </button>
          )}
        </CoverImage>

        <div className="row-info">
          <div className="row-title">
            {obra.favorito && <FavoriteStar obraId={obra.id} size={18} />}
            <strong>{obra.nome}</strong>
            {obra.nomeAlternativo && <span className="alt-name"> ({obra.nomeAlternativo})</span>}
          </div>
          <div className="row-meta">
            <StatusBadge status={obra.statusUsuario} />
            <ObraStatusBadge status={obra.status} />
            <FlagIcon tipo={obra.tipo} size={24} />
            {obra.notaUsuario > 0 && (
              <span className="nota">
                <Star size={14} fill="#fbbf24" color="#fbbf24" />
                {obra.notaUsuario > 5 ? (obra.notaUsuario / 2).toFixed(1) : obra.notaUsuario.toFixed(1)}/5
              </span>
            )}
          </div>
          <div className="row-details">
            {obra.autor && <span className="detail-item">Autor: {obra.autor}</span>}
            {obra.studio && <span className="detail-item">• Studio: {obra.studio}</span>}
          </div>
          <div className="row-progress-info">
            <div className="chapter-info">
              <span className="chapter-count">
                Cap: {obra.capituloAtualUsuario}{obra.capituloAtual > 0 && ` / ${obra.capituloAtual}`}
              </span>
              {Array.isArray(obra.diasLancamento) && obra.diasLancamento.length > 0 && (
                <span className="dias-badge">
                  <Calendar size={14} />
                  {obra.diasLancamento.join(', ')}
                </span>
              )}
            </div>
            {obra.capituloAtual > 0 && (
              <div className="row-progress">
                <div className="progress-bar-row">
                  <div className="progress-fill-row" style={{ width: `${progressPercentage}%` }} />
                </div>
                <span className="progress-percentage" style={{textAlign: 'left', color: 'var(--text-secondary)'}}>
                  {progressPercentage}%
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="row-actions">
          {hasNotes && (
            <button
              className={`btn-row-action ${notesExpanded ? 'notes-active' : ''}`}
              onClick={handleToggleNotes}
              title={notesExpanded ? "Ocultar notas" : "Ver notas"}
            >
              <StickyNote size={16} />
            </button>
          )}
          {hasObraLink && (
            <button className="btn-row-action" onClick={handleLink} title="Abrir link">
              <ExternalLink size={16} />
            </button>
          )}
          <button className="btn-row-action" onClick={handleIncrement} title="Ler próximo capítulo">
            <Plus size={16} />
          </button>
          <button className="btn-row-action" onClick={handleFavorite} title="Favoritar">
            <Star size={16} fill={obra.favorito ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
      {hasNotes && notesExpanded && (
        <div className="row-notes-expanded">
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

export default RowCard;
