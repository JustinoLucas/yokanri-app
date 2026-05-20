import { ChevronLeft, ChevronRight } from 'lucide-react';
import ObraCard from '../../ObraCard';
import EmptyState from './EmptyState';

function ReleasesGrid({
  currentLancamentos,
  scrollContainerRef,
  showLeftArrow,
  showRightArrow,
  onScrollLeft,
  onScrollRight,
  onCheckScroll,
  onViewDetail,
  onEdit,
  onDelete,
  onQuickUpdate
}) {
  return (
    <div className="releases-scroll-container">
      {showLeftArrow && (
        <button className="scroll-arrow scroll-arrow-left" onClick={onScrollLeft}>
          <ChevronLeft size={24} />
        </button>
      )}

      <div
        className="releases-grid-scroll"
        ref={scrollContainerRef}
        onScroll={onCheckScroll}
      >
        {currentLancamentos.length > 0 ? (
          currentLancamentos.map(obra => (
            <ObraCard
              key={obra.id}
              obra={obra}
              viewMode="grid"
              onViewDetail={() => onViewDetail(obra)}
              onEdit={() => onEdit(obra)}
              onDelete={() => onDelete(obra.id)}
              onQuickUpdate={onQuickUpdate}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </div>

      {showRightArrow && (
        <button className="scroll-arrow scroll-arrow-right" onClick={onScrollRight}>
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
}

export default ReleasesGrid;
