import { useState } from 'react';
import { useReleasesData } from './hooks/useReleasesData';
import { useScrollNavigation } from './hooks/useScrollNavigation';
import ReleasesHeader from './components/ReleasesHeader';
import ReleasesTabs from './components/ReleasesTabs';
import ReleasesGrid from './components/ReleasesGrid';
import './ReleasesToday.css';

function ReleasesToday({ obras, onViewDetail, onEdit, onDelete, onQuickUpdate }) {
  const [activeTab, setActiveTab] = useState(0);
  // Filtra por ID estável — o label exibido vem do ReleasesHeader
  const [filterStatusLeitura, setFilterStatusLeitura] = useState('lendo');

  const { dias, lancamentosIndeterminados } = useReleasesData(obras, filterStatusLeitura);

  const currentLancamentos =
    activeTab === 'indeterminado'
      ? lancamentosIndeterminados
      : (dias[activeTab]?.lancamentos ?? []);

  const {
    scrollContainerRef,
    showLeftArrow,
    showRightArrow,
    checkScroll,
    scrollLeft,
    scrollRight
  } = useScrollNavigation(currentLancamentos, activeTab);

  return (
    <div className="releases-today">
      <ReleasesHeader
        filterStatusLeitura={filterStatusLeitura}
        onFilterChange={setFilterStatusLeitura}
      />

      <ReleasesTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dias={dias}
        lancamentosIndeterminados={lancamentosIndeterminados}
      />

      <ReleasesGrid
        currentLancamentos={currentLancamentos}
        scrollContainerRef={scrollContainerRef}
        showLeftArrow={showLeftArrow}
        showRightArrow={showRightArrow}
        onScrollLeft={scrollLeft}
        onScrollRight={scrollRight}
        onCheckScroll={checkScroll}
        onViewDetail={onViewDetail}
        onEdit={onEdit}
        onDelete={onDelete}
        onQuickUpdate={onQuickUpdate}
      />
    </div>
  );
}

export default ReleasesToday;
