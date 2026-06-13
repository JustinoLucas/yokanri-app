import { useState } from 'react';
import { Plus, ExternalLink, EyeOff, Star } from 'lucide-react';
import StatusBadge from './shared/StatusBadge';
import ObraStatusBadge from './shared/ObraStatusBadge';
import { hasLink, calculateProgress } from './utils';

/**
 * CarouselCard — Card do carrossel editorial
 *
 * Estrutura:
 *   ┌────────────────┐  ← 196px wide
 *   │  cover 268px   │  sem dot, sem badge no topo
 *   │ [título embaixo│  overlay gradient + nome
 *   ├────────────────┤
 *   │ [Lendo][Andando│  status badges
 *   │ cap 116 / 116  │  progresso
 *   │    ★ 4.6/5    │  nota (se houver)
 *   │   [link]  [+] │  ações
 *   └────────────────┘
 */
function CarouselCard({
  obra,
  coverUrl,
  onViewDetail,
  onIncrementCapitulo,
  onLinkClick,
  isNsfw,
  nsfwMode,
}) {
  const [blurRevealed, setBlurRevealed] = useState(false);
  const [chapterPulse, setChapterPulse] = useState(false);
  const isBlurred = isNsfw && nsfwMode === 'blur' && !blurRevealed;
  const obraHasLink = hasLink(obra);
  const progress = calculateProgress(obra.capituloAtualUsuario, obra.capituloAtual);
  const rating = obra.notaUsuario > 0
    ? (obra.notaUsuario > 5 ? (obra.notaUsuario / 2).toFixed(1) : obra.notaUsuario.toFixed(1))
    : null;

  const handleReveal   = (e) => { e.stopPropagation(); setBlurRevealed(true); };
  const handleInc      = (e) => {
    e.stopPropagation();
    onIncrementCapitulo();
    setChapterPulse(true);
    setTimeout(() => setChapterPulse(false), 400);
  };
  const handleLink     = (e) => { e.stopPropagation(); onLinkClick?.(); };

  return (
    <div className="ccard" onClick={onViewDetail}>

      {/* ── Cover ──────────────────────────────────────────── */}
      <div className={`ccard-cover${isBlurred ? ' nsfw-blur' : ''}`}>
        {coverUrl
          ? <img src={coverUrl} alt={obra.nome} />
          : <div className="ccard-no-cover" />
        }
        {isBlurred && (
          <button className="nsfw-reveal-btn" onClick={handleReveal}>
            <EyeOff size={20} />
            <span>+18</span>
          </button>
        )}
        <div className="ccard-overlay" />
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="ccard-body">

        {/* Título e título alternativo */}
        <div className="ccard-title-wrap">
          <div className="ccard-title">{obra.nome}</div>
          {obra.nomeAlternativo && (
            <div className="ccard-alt-title">{obra.nomeAlternativo}</div>
          )}
        </div>

        {/* Status badges */}
        <div className="ccard-badges">
          <StatusBadge status={obra.statusUsuario} className="badge-outlined" />
          <ObraStatusBadge status={obra.status} className="badge-flat" />
        </div>

        {/* Progresso de capítulos */}
        <div className="ccard-chapter-row">
          <span className={`ccard-chapter-text${chapterPulse ? ' ccard-chapter-pulse' : ''}`}>
            Capítulo: {obra.capituloAtualUsuario}
            {obra.capituloAtual > 0 ? ` / ${obra.capituloAtual}` : ''}
          </span>
          {rating && (
            <span className="ccard-rating">
              <Star size={10} fill="#fbbf24" color="#fbbf24" />
              {rating}/5
            </span>
          )}
        </div>

        {/* Barra de progresso (só se tiver capítulo total) */}
        {obra.capituloAtual > 0 && (
          <div className="ccard-progress-bar">
            <div className="ccard-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Ações */}
        <div className="ccard-actions">
          {obraHasLink && (
            <button className="ccard-action-btn ccard-action-btn--link" onClick={handleLink} title="Abrir link de leitura">
              <ExternalLink size={12} />
            </button>
          )}
          <button className="ccard-action-btn ccard-action-btn--inc" onClick={handleInc} title="Próximo capítulo">
            <Plus size={12} />
          </button>
        </div>

      </div>
    </div>
  );
}

export default CarouselCard;
