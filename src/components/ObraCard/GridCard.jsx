import { useState } from 'react';
import { Star, ExternalLink, Plus, StickyNote, X, EyeOff } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import FavoriteStar from './shared/FavoriteStar';
import StatusBadge from './shared/StatusBadge';
import ObraStatusBadge from './shared/ObraStatusBadge';
import TipoBadge from './shared/TipoBadge';
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
  onLinkClick,
  isNsfw,
  nsfwMode,
}) {
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [blurRevealed, setBlurRevealed] = useState(false);
  const [chapterPulse, setChapterPulse] = useState(false);

  const { t } = useLanguage();
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
    setChapterPulse(true);
    setTimeout(() => setChapterPulse(false), 400);
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
    <div className={`obra-card ${notesExpanded ? 'card-notes-expanded' : ''}`}>
      <div className="card-main" onClick={onViewDetail}>
        <div className={`card-cover${isBlurred ? ' nsfw-blur' : ''}`}>
          {coverUrl ? (
            <img src={coverUrl} alt={obra.nome} />
          ) : (
            <div className="no-cover"></div>
          )}

          {/* Overlay de revelação — só aparece quando o blur está ativo */}
          {isBlurred && (
            <button
              className="nsfw-reveal-btn"
              onClick={handleReveal}
              title="Clique para revelar a capa"
            >
              <EyeOff size={22} />
              <span>+18</span>
            </button>
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
            <TipoBadge tipo={obra.tipo} />
            <StatusBadge status={obra.statusUsuario} />
            <ObraStatusBadge status={obra.status} />
          </div>

          <div className="card-progress-wrapper">
            <div className="card-progress">
              <span className={`progress-text${chapterPulse ? ' card-chapter-pulse' : ''}`}>
                {t('card_chapter')} {obra.capituloAtualUsuario}
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
                title={notesExpanded ? t('card_hide_notes') : t('card_show_notes')}
              >
                <StickyNote size={16} />
              </button>
            )}
            {hasObraLink && (
              <button className="btn-card-action" onClick={handleLink} title={t('card_open_link')}>
                <ExternalLink size={16} />
              </button>
            )}
            <button className="btn-card-action" onClick={handleIncrement} title={t('card_next_chapter')}>
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
