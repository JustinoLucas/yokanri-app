import { useState } from 'react';
import { Star, ExternalLink, Plus, StickyNote, X, EyeOff, Calendar } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatDiaParaLocale } from '../ReleasesToday/utils/releaseCalculations';
import FavoriteStar from './shared/FavoriteStar';
import StatusBadge from './shared/StatusBadge';
import ObraStatusBadge from './shared/ObraStatusBadge';
import CoverImage from './shared/CoverImage';
import TipoBadge from './shared/TipoBadge';
import { hasLink, calculateProgress } from './utils';

/**
 * Row/Table view for obra
 *
 * Grid: cover(102px) | info(1fr) | right(rating + actions)
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
  const { t, language } = useLanguage();
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [blurRevealed, setBlurRevealed] = useState(false);
  const [chapterPulse, setChapterPulse] = useState(false);

  const hasObraLink = hasLink(obra);
  const hasNotes = obra.notas && obra.notas.trim().length > 0;
  const progressPercentage = calculateProgress(obra.capituloAtualUsuario, obra.capituloAtual);

  const isBlurred = isNsfw && nsfwMode === 'blur' && !blurRevealed;

  // Normalised rating (always 0–5 scale)
  const rawRating = obra.notaUsuario > 0 ? obra.notaUsuario : (obra.nota > 0 ? obra.nota : 0);
  const displayRating = rawRating > 5 ? rawRating / 2 : rawRating;
  const hasRating = displayRating > 0;

  const handleFavorite = (e) => { e.stopPropagation(); onToggleFavorito(); };
  const handleIncrement = (e) => {
    e.stopPropagation();
    onIncrementCapitulo();
    setChapterPulse(true);
    setTimeout(() => setChapterPulse(false), 400);
  };
  const handleLink = (e) => { e.stopPropagation(); onLinkClick(); };
  const handleToggleNotes = (e) => { e.stopPropagation(); setNotesExpanded(!notesExpanded); };
  const handleReveal = (e) => { e.stopPropagation(); setBlurRevealed(true); };

  return (
    <div className={`obra-row-wrapper ${notesExpanded ? 'notes-expanded' : ''}`}>
      <div className="obra-row" onClick={onViewDetail}>

        {/* ── Cover ─────────────────────────────────────── */}
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

        {/* ── Info (centre column) ──────────────────────── */}
        <div className="row-info">

          {/* Top section: badges → title → alt → details */}
          <div>
            {/* Badges: flag + status leitura + status obra — ABOVE title */}
            <div className="row-meta">
              <TipoBadge tipo={obra.tipo} />
              <StatusBadge status={obra.statusUsuario} />
              <ObraStatusBadge status={obra.status} />
            </div>

            {/* Title */}
            <div className="row-title">
              {obra.favorito && <FavoriteStar obraId={obra.id} size={16} />}
              <strong>{obra.nome}</strong>
            </div>

            {/* Alt title — separate line in Geist Mono */}
            {obra.nomeAlternativo && (
              <div className="row-alt">{obra.nomeAlternativo}</div>
            )}

            {/* Author · Studio */}
            {(obra.autor || obra.studio) && (
              <div className="row-details">
                {obra.autor && <span className="detail-item">{t('card_author')} {obra.autor}</span>}
                {obra.studio && <span className="detail-item">{t('card_studio_artist')} {obra.studio}</span>}
              </div>
            )}
          </div>

          {/* Bottom section: chapter count + progress bar */}
          <div className="row-progress-info">
            <div className="chapter-info">
              <span className={`chapter-count${chapterPulse ? ' row-chapter-pulse' : ''}`}>
                {t('card_chapter')} {obra.capituloAtualUsuario}{obra.capituloAtual > 0 && ` / ${obra.capituloAtual}`}
              </span>
              {Array.isArray(obra.diasLancamento) && obra.diasLancamento.length > 0 && (
                <span className="dias-badge">
                  <Calendar size={12} />
                  {obra.diasLancamento.map(d => formatDiaParaLocale(d, language)).join(', ')}
                </span>
              )}
            </div>
            {obra.capituloAtual > 0 && (
              <div className="row-progress">
                <div className="progress-bar-row">
                  <div className="progress-fill-row" style={{ width: `${progressPercentage}%` }} />
                </div>
                <span className="progress-percentage">{progressPercentage}%</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Right column: rating + spacer + actions ────── */}
        <div className="row-right">

          {/* Star rating */}
          {hasRating && (
            <div className="row-rating">
              <div className="row-rating-stars">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    size={13}
                    fill={i <= Math.round(displayRating) ? 'var(--gold)' : 'none'}
                    color="var(--gold)"
                    style={i > Math.round(displayRating) ? { opacity: 0.25 } : {}}
                  />
                ))}
              </div>
              <span className="row-rating-val">
                {displayRating.toFixed(1)}<span className="row-rating-max">/5</span>
              </span>
            </div>
          )}

          {/* Flex spacer pushes actions to bottom */}
          <div className="row-right-spacer" />

          {/* Action buttons */}
          <div className="row-actions">
            {hasNotes && (
              <button
                className={`btn-row-action ${notesExpanded ? 'notes-active' : ''}`}
                onClick={handleToggleNotes}
                title={notesExpanded ? t('card_hide_notes') : t('card_show_notes')}
              >
                <StickyNote size={14} />
              </button>
            )}
            {hasObraLink && (
              <button className="btn-row-action" onClick={handleLink} title={t('card_open_link')}>
                <ExternalLink size={14} />
              </button>
            )}
            <button className="btn-row-action" onClick={handleIncrement} title={t('card_next_chapter')}>
              <Plus size={14} />
            </button>
            <button className="btn-row-action" onClick={handleFavorite} title={t('card_favorite')}>
              <Star size={14} fill={obra.favorito ? 'currentColor' : 'none'} />
            </button>
          </div>

        </div>
      </div>

      {/* ── Expanded notes ──────────────────────────────── */}
      {hasNotes && notesExpanded && (
        <div className="row-notes-expanded">
          <div className="notes-header">
            <StickyNote size={16} />
            <span>{t('card_notes')}</span>
            <button className="btn-close-notes" onClick={handleToggleNotes} title={t('close')}>
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
