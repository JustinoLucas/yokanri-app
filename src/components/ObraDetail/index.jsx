import { useEffect } from 'react';
import { useCoverLoader } from './hooks/useCoverLoader';
import DetailSidebar from './components/DetailSidebar';
import DetailHeader from './components/DetailHeader';
import InfoSection from './components/InfoSection';
import GenresSection from './components/GenresSection';
import ProgressSection from './components/ProgressSection';
import RatingsSection from './components/RatingsSection';
import LinksSection from './components/LinksSection';
import NotesSection from './components/NotesSection';
import MetadataSection from './components/MetadataSection';
import './ObraDetail.css';

/**
 * ObraDetail - Main orchestrator component
 * Manages the overall layout and composition of all detail sections
 */
function ObraDetail({ obra, onEdit, onDelete, onClose }) {
  const { coverUrl, allCovers, selectedCoverIndex, selectCover } = useCoverLoader(obra);

  useEffect(() => {
    // Força scroll para o topo quando o componente é montado
    window.scrollTo(0, 0);
  }, [obra]);

  return (
    <div className="obra-detail">
      <div className="detail-content">
        <DetailSidebar
          obra={obra}
          coverUrl={coverUrl}
          allCovers={allCovers}
          selectedCoverIndex={selectedCoverIndex}
          onSelectCover={selectCover}
        />

        <div className="detail-main">
          <DetailHeader
            obra={obra}
            onEdit={onEdit}
            onDelete={onDelete}
          />

          <InfoSection obra={obra} />
          <GenresSection generos={obra.generos} />
          <ProgressSection obra={obra} />
          <RatingsSection obra={obra} />
          <LinksSection obra={obra} />
          <NotesSection notas={obra.notas} />
          <MetadataSection obra={obra} />
        </div>
      </div>
    </div>
  );
}

export default ObraDetail;
