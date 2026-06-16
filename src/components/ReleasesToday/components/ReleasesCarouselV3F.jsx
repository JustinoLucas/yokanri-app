import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import ObraCard from '../../ObraCard';
import EmptyState from './EmptyState';
import './ReleasesCarouselV3F.css';

/**
 * ReleasesCarouselV3F — Carrossel editorial V3F
 *
 * Layout:
 *   [Sparkles "AGENDA EDITORIAL" | divider | "Sabado, 23" · 5 obras | spacer | DayPills + arrows + "Ver agenda"]
 *   [Carrossel horizontal de ObraCards com setas overlay]
 *
 * Props:
 *   dias                  — array de { offset, nomeCompleto, diaSemana, lancamentos[] }
 *   lancamentosIndeterminados — array
 *   onViewDetail, onEdit, onDelete, onQuickUpdate — callbacks
 */
function ReleasesCarouselV3F({
  dias,
  weekOffset,
  onWeekChange,
  lancamentosIndeterminados,
  onViewDetail,
  onEdit,
  onDelete,
  onQuickUpdate,
  onShowCalendar,
}) {
  const { t, language } = useLanguage();
  const [activeIdx, setActiveIdx] = useState(0); // índice no array `dias`
  const carouselRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  // Volta para o primeiro dia da semana ao trocar de semana
  useEffect(() => {
    setActiveIdx(0);
  }, [weekOffset]);

  // Dia ativo
  const activeDay = dias[activeIdx] ?? dias[0];
  const cards = activeDay?.lancamentos ?? [];

  // Verifica overflow do carrossel
  const checkOverflow = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [checkOverflow, cards]);

  const scrollLeft = () => carouselRef.current?.scrollBy({ left: -220, behavior: 'smooth' });
  const scrollRight = () => carouselRef.current?.scrollBy({ left: 220, behavior: 'smooth' });

  // Label do dia ativo para o header (locale-aware)
  const getDayLabel = () => {
    if (!activeDay?.date) return '—';
    const label = activeDay.date.toLocaleDateString(language, { weekday: 'long', day: 'numeric', month: 'long' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const totalCards = cards.length;

  return (
    <div className="carousel-v3f">
      {/* ── Header row ─────────────────────────────────────────── */}
      <div className="carousel-v3f-header">
        {/* Left: label + date */}
        <Sparkles size={12} className="carousel-v3f-sparkle" />
        <span className="carousel-v3f-eyebrow">{t('releases_section')}</span>
        <div className="carousel-v3f-sep" />
        <span className="carousel-v3f-date">{getDayLabel()}</span>
        {totalCards > 0 && (
          <span className="carousel-v3f-count">· {totalCards} {totalCards !== 1 ? t('releases_obras') : t('releases_obra')}</span>
        )}

        <div className="carousel-v3f-spacer" />

        {/* Right: day pills + week arrows + "Ver agenda" */}
        <div className="carousel-v3f-pills">
          {dias.map((dia, idx) => (
            <DayPill
              key={dia.offset}
              dia={dia}
              active={idx === activeIdx}
              onClick={() => setActiveIdx(idx)}
            />
          ))}
        </div>

        <div className="carousel-v3f-sep" />
        <button
          className="carousel-v3f-week-btn"
          onClick={() => onWeekChange(weekOffset - 1)}
          disabled={weekOffset <= 0}
          title={t('releases_week_prev')}
        >
          <ChevronLeft size={11} />
        </button>
        <button
          className="carousel-v3f-week-btn"
          onClick={() => onWeekChange(weekOffset + 1)}
          title={t('releases_week_next')}
        >
          <ChevronRight size={11} />
        </button>
        <div className="carousel-v3f-sep" />
        <button className="carousel-v3f-agenda-btn" onClick={onShowCalendar}>
          <Calendar size={10} />
          {t('releases_view_agenda')}
        </button>
      </div>

      {/* ── Carrossel track ────────────────────────────────────── */}
      <div className="carousel-v3f-track-wrap">
        {/* Seta esquerda */}
        {canLeft && (
          <>
            <div className="carousel-v3f-fade carousel-v3f-fade--left" />
            <button className="carousel-v3f-arrow carousel-v3f-arrow--left" onClick={scrollLeft}>
              <ChevronLeft size={15} />
            </button>
          </>
        )}

        {/* Cards */}
        <div
          className="carousel-v3f-track"
          ref={carouselRef}
          onScroll={checkOverflow}
        >
          {cards.length > 0 ? (
            cards.map(obra => (
              <div className="carousel-v3f-card-wrap" key={obra.id}>
                <ObraCard
                  obra={obra}
                  viewMode="carousel"
                  onViewDetail={() => onViewDetail(obra)}
                  onEdit={() => onEdit(obra)}
                  onDelete={() => onDelete(obra.id)}
                  onQuickUpdate={onQuickUpdate}
                />
              </div>
            ))
          ) : (
            <div className="carousel-v3f-empty">
              <EmptyState />
            </div>
          )}
        </div>

        {/* Seta direita */}
        {canRight && (
          <>
            <div className="carousel-v3f-fade carousel-v3f-fade--right" />
            <button className="carousel-v3f-arrow carousel-v3f-arrow--right" onClick={scrollRight}>
              <ChevronRight size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── DayPill ─────────────────────────────────────────────── */

function DayPill({ dia, active, onClick }) {
  return (
    <button
      className={`carousel-v3f-daypill ${active ? 'carousel-v3f-daypill--active' : ''}`}
      onClick={onClick}
    >
      <span className="carousel-v3f-daypill-abbr">
        {(dia.nomeAbrev ?? '---').toUpperCase()}
      </span>
      <span className="carousel-v3f-daypill-day">{dia.diaDoMes}</span>
    </button>
  );
}

export default ReleasesCarouselV3F;
