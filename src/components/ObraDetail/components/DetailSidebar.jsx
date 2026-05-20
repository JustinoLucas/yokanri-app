import { Star } from 'lucide-react';
import CoversGallery from './CoversGallery';
import ObraStatusBadge from '../../ObraCard/shared/ObraStatusBadge';
import FlagIcon from '../../ObraCard/shared/FlagIcon';
import StatusBadge from '../../ObraCard/shared/StatusBadge';

/**
 * DetailSidebar - Left column with cover, gallery, and quick info badges
 * Displays the main cover image, favorite star, multiple covers gallery, and key badges
 */
function DetailSidebar({ obra, coverUrl, allCovers, selectedCoverIndex, onSelectCover }) {
  return (
    <div className="detail-sidebar">
      <div className="detail-cover">
        {coverUrl ? (
          <img src={coverUrl} alt={obra.nome} />
        ) : (
          <div className="no-cover-large"></div>
        )}
        {obra.favorito && (
          <div className="favorite-star-detail">
            {(() => {
              const favGradientId = `favMetal-detail-${obra.id}`;
              return (
                <Star
                  size={24}
                  className="favorite-star favorite-star--metal"
                  fill={`url(#${favGradientId})`}
                  color={`url(#${favGradientId})`}
                >
                  <defs>
                    <linearGradient id={favGradientId} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="var(--accent-secondary)" />
                      <stop offset="35%" stopColor="var(--accent-primary)" />
                      <stop stopColor="var(--text-primary)" stopOpacity="0.95">
                        <animate attributeName="offset" values="10%;90%;10%" dur="2.8s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="65%" stopColor="var(--accent-primary)" />
                      <stop offset="100%" stopColor="var(--accent-secondary)" />
                    </linearGradient>
                  </defs>
                </Star>
              );
            })()}
          </div>
        )}
      </div>

      <CoversGallery
        covers={allCovers}
        selectedIndex={selectedCoverIndex}
        onSelectCover={onSelectCover}
      />

      <div className="detail-quick-info">
        <div className="info-item">
          <strong>Tipo:</strong>
          <FlagIcon tipo={obra.tipo} size={24} />
        </div>

        <div className="info-item">
          <strong>Status da Obra:</strong>
          <ObraStatusBadge status={obra.status} className="status-badge" />
        </div>

        <div className="info-item">
          <strong>Meu Status:</strong>
          <StatusBadge status={obra.statusUsuario} className="status-badge" />
        </div>
      </div>
    </div>
  );
}

export default DetailSidebar;
