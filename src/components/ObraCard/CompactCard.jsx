import { useState } from 'react';
import { Star, Edit2, ExternalLink, EyeOff } from 'lucide-react';
import StatusBadge from './shared/StatusBadge';
import ObraStatusBadge from './shared/ObraStatusBadge';
import FlagIcon from './shared/FlagIcon';
import { hasLink, getPrincipalLink } from './utils';

/**
 * Compact table row view for obra
 */
function CompactCard({
  obra,
  coverUrl,
  onViewDetail,
  onEdit,
  onToggleFavorito,
  onLinkClick,
  isNsfw,
  nsfwMode,
}) {
  const [blurRevealed, setBlurRevealed] = useState(false);

  const hasObraLink = hasLink(obra);
  const isBlurred = isNsfw && nsfwMode === 'blur' && !blurRevealed;

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit();
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    onToggleFavorito();
  };

  const handleLink = (e) => {
    e.stopPropagation();
    const link = getPrincipalLink(obra);
    if (link) {
      onLinkClick();
    }
  };

  const handleReveal = (e) => {
    e.stopPropagation();
    setBlurRevealed(true);
  };

  return (
    <tr className="compact-row" onClick={onViewDetail}>
      <td className="compact-cell compact-cell-cover">
        <div className="compact-cover-wrapper">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={obra.nome}
              className={`compact-cover-img${isBlurred ? ' nsfw-blur-img' : ''}`}
            />
          ) : (
            <div className="compact-cover-img" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
          )}
          {isBlurred && (
            <button
              className="nsfw-reveal-btn nsfw-reveal-btn--compact"
              onClick={handleReveal}
              title="Clique para revelar a capa"
            >
              <EyeOff size={12} />
            </button>
          )}
        </div>
      </td>
      <td className="compact-cell compact-cell-title">
        {obra.favorito && (
          <Star size={14} fill="var(--accent-primary)" color="var(--accent-primary)" className="favorite-star-compact" />
        )}
        <span className="compact-title">{obra.nome}</span>
      </td>
      <td className="compact-cell compact-cell-status">
        <StatusBadge status={obra.statusUsuario} className="compact-badge" />
      </td>
      <td className="compact-cell compact-cell-obra-status">
        <ObraStatusBadge status={obra.status} className="compact-badge" />
      </td>
      <td className="compact-cell compact-cell-tipo">
        <FlagIcon tipo={obra.tipo} size={24} />
      </td>
      <td className="compact-cell compact-cell-progress">
        {obra.capituloAtualUsuario}{obra.capituloAtual > 0 && ` / ${obra.capituloAtual}`}
      </td>
      <td className="compact-cell compact-cell-rating">
        {obra.notaUsuario > 0 && (
          <span className="compact-rating-content">
            <Star size={12} fill="#fbbf24" color="#fbbf24" />
            {obra.notaUsuario > 5 ? (obra.notaUsuario / 2).toFixed(1) : obra.notaUsuario.toFixed(1)}
          </span>
        )}
      </td>
      <td className="compact-cell compact-cell-actions" onClick={(e) => e.stopPropagation()}>
        {hasObraLink && (
          <button className="compact-btn" onClick={handleLink} title="Abrir link">
            <ExternalLink size={14} />
          </button>
        )}
        <button className="compact-btn" onClick={handleEdit} title="Editar">
          <Edit2 size={14} />
        </button>
        <button className="compact-btn" onClick={handleFavorite} title="Favoritar">
          <Star size={14} fill={obra.favorito ? 'currentColor' : 'none'} />
        </button>
      </td>
    </tr>
  );
}

export default CompactCard;
