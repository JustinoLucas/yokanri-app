import useCover from './hooks/useCover';
import CompactCard from './CompactCard';
import RowCard from './RowCard';
import GridCard from './GridCard';
import { getPrincipalLink } from './utils';
import './ObraCard.css';

/**
 * Main ObraCard component that routes to the appropriate view mode
 * @param {Object} obra - The obra object
 * @param {string} viewMode - View mode: 'compact', 'table', or 'grid'
 * @param {Function} onViewDetail - Handler for viewing details
 * @param {Function} onEdit - Handler for editing
 * @param {Function} onDelete - Handler for deleting
 * @param {Function} onQuickUpdate - Handler for quick updates
 */
function ObraCard({ obra, viewMode, onViewDetail, onEdit, onDelete, onQuickUpdate }) {
  const coverUrl = useCover(obra);

  const handleToggleFavorito = () => {
    onQuickUpdate(obra.id, { favorito: !obra.favorito });
  };

  const handleIncrementCapitulo = () => {
    // If user is up to date with releases, increment both chapters
    const updates = { capituloAtualUsuario: obra.capituloAtualUsuario + 1 };

    if (obra.capituloAtualUsuario === obra.capituloAtual) {
      updates.capituloAtual = obra.capituloAtual + 1;
    }

    onQuickUpdate(obra.id, updates);
  };

  const handleLinkClick = () => {
    const link = getPrincipalLink(obra);

    if (!link) {
      return;
    }

    // Auto-increment if enabled
    if (obra.autoIncrementOnLink) {
      const updates = { capituloAtualUsuario: obra.capituloAtualUsuario + 1 };

      // If user is up to date with releases, increment both chapters
      if (obra.capituloAtualUsuario === obra.capituloAtual) {
        updates.capituloAtual = obra.capituloAtual + 1;
      }

      onQuickUpdate(obra.id, updates);
    }

    window.open(link, '_blank');
  };

  // Route to the appropriate view component
  if (viewMode === 'compact') {
    return (
      <CompactCard
        obra={obra}
        coverUrl={coverUrl}
        onViewDetail={onViewDetail}
        onEdit={onEdit}
        onToggleFavorito={handleToggleFavorito}
        onLinkClick={handleLinkClick}
      />
    );
  }

  if (viewMode === 'table') {
    return (
      <RowCard
        obra={obra}
        coverUrl={coverUrl}
        onViewDetail={onViewDetail}
        onToggleFavorito={handleToggleFavorito}
        onIncrementCapitulo={handleIncrementCapitulo}
        onLinkClick={handleLinkClick}
      />
    );
  }

  // Default to grid view
  return (
    <GridCard
      obra={obra}
      coverUrl={coverUrl}
      onViewDetail={onViewDetail}
      onToggleFavorito={handleToggleFavorito}
      onIncrementCapitulo={handleIncrementCapitulo}
      onLinkClick={handleLinkClick}
    />
  );
}

export default ObraCard;
