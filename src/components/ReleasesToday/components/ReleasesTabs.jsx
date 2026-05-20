import { useRef, useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

function ReleasesTabs({ activeTab, onTabChange, dias, lancamentosIndeterminados }) {
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 4);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkArrows();
    window.addEventListener('resize', checkArrows);
    return () => window.removeEventListener('resize', checkArrows);
  }, []);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  return (
    <div className="tabs-wrapper">
      {showLeft && (
        <button className="tabs-arrow tabs-arrow-left" onClick={() => scroll(-1)}>
          <ChevronLeft size={16} />
        </button>
      )}

      <div className="releases-tabs" ref={scrollRef} onScroll={checkArrows}>
        {dias.map((dia) => {
          const label =
            dia.offset === 0 ? `Hoje (${dia.nomeCompleto})` :
            dia.offset === 1 ? `Amanhã (${dia.nomeCompleto})` :
            dia.nomeCompleto;

          return (
            <button
              key={dia.offset}
              className={`tab-button ${activeTab === dia.offset ? 'active' : ''}`}
              onClick={() => onTabChange(dia.offset)}
            >
              <Calendar size={16} />
              {label}
              <span className="tab-count">{dia.lancamentos.length}</span>
            </button>
          );
        })}

        <button
          className={`tab-button ${activeTab === 'indeterminado' ? 'active' : ''}`}
          onClick={() => onTabChange('indeterminado')}
        >
          <Calendar size={16} />
          Não Determinado
          <span className="tab-count">{lancamentosIndeterminados.length}</span>
        </button>
      </div>

      {showRight && (
        <button className="tabs-arrow tabs-arrow-right" onClick={() => scroll(1)}>
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}

export default ReleasesTabs;
