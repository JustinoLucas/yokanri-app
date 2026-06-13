import { useState } from 'react';
import { useReleasesData } from './hooks/useReleasesData';
import ReleasesCarouselV3F from './components/ReleasesCarouselV3F';

function ReleasesToday({ obras, onViewDetail, onEdit, onDelete, onQuickUpdate, onShowCalendar }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const { dias, lancamentosIndeterminados } = useReleasesData(obras, 'lendo', weekOffset);

  return (
    <ReleasesCarouselV3F
      dias={dias}
      weekOffset={weekOffset}
      onWeekChange={setWeekOffset}
      lancamentosIndeterminados={lancamentosIndeterminados}
      onViewDetail={onViewDetail}
      onEdit={onEdit}
      onDelete={onDelete}
      onQuickUpdate={onQuickUpdate}
      onShowCalendar={onShowCalendar}
    />
  );
}

export default ReleasesToday;
