import { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight,
  Sparkles, Shuffle, Calendar as CalIcon,
} from 'lucide-react';
import { lancaNoDia, isLancamentoIndeterminado } from '../ReleasesToday/utils/releaseCalculations';
import { useConfig } from '../../context/ConfigContext';
import { filterNsfwObras } from '../../utils/nsfwUtils';
import FlagIcon from '../ObraCard/shared/FlagIcon';
import useCover from '../ObraCard/hooks/useCover';
import './Calendar.css';

/* ─── Constantes ─────────────────────────────────────────── */

const DIAS_MON = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const DIAS_PT  = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES    = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

/* ─── Helpers ────────────────────────────────────────────── */

function startOfDay(d) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

/** Retorna a segunda-feira da semana que contém `date`. */
function getMonday(date) {
  const d = startOfDay(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

/* ─── Calendar (componente raiz) ─────────────────────────── */

function Calendar({ obras, onClose, onViewDetail }) {
  const config = useConfig();
  const hoje   = useMemo(() => startOfDay(new Date()), []);

  const [weekOffset,   setWeekOffset]   = useState(0);
  const [view,         setView]         = useState('week');
  const [selectedDay,  setSelectedDay]  = useState(null);

  /* Pivot = hoje + weekOffset semanas */
  const pivotDate = useMemo(() => {
    const d = new Date(hoje);
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [hoje, weekOffset]);

  /* Obras ativas (lendo) */
  const ativas = useMemo(() => {
    const filtradas = filterNsfwObras(obras, config);
    return filtradas.filter(o =>
      o.statusUsuario === 'lendo' &&
      o.status !== 'completo' &&
      o.status !== 'cancelado'
    );
  }, [obras, config]);

  /* Irregulares */
  const indeterminados = useMemo(
    () => ativas.filter(isLancamentoIndeterminado),
    [ativas]
  );

  /* ── Dados da semana ───────────────────────────────────── */
  const weekDays = useMemo(() => {
    const weekStart = getMonday(pivotDate);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      date.setHours(0, 0, 0, 0);
      const off = Math.round((date - hoje) / 864e5);
      return {
        date,
        abbrev: DIAS_MON[i],
        off,
        lancamentos: ativas.filter(o => lancaNoDia(o, off)),
        isToday: off === 0,
        isPast:  off < 0,
      };
    });
  }, [pivotDate, ativas, hoje]);

  /* ── Dados do mês ──────────────────────────────────────── */
  const monthData = useMemo(() => {
    const year  = pivotDate.getFullYear();
    const month = pivotDate.getMonth();
    const total = new Date(year, month + 1, 0).getDate();
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Seg=0

    const cells = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let day = 1; day <= total; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      const off = Math.round((date - hoje) / 864e5);
      cells.push({
        day, date, off,
        isToday: off === 0,
        lancamentos: ativas.filter(o => lancaNoDia(o, off)),
      });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return { cells, year, month };
  }, [pivotDate, ativas, hoje]);

  /* ── Label mês/ano ─────────────────────────────────────── */
  const monthLabel = useMemo(() => {
    if (view === 'month') {
      return `${MESES[monthData.month]} ${monthData.year}`;
    }
    // Usa quinta-feira (índice 3) para rótulo estável em semanas que cruzam meses
    const thu = new Date(weekDays[3].date);
    return `${MESES[thu.getMonth()]} ${thu.getFullYear()}`;
  }, [view, weekDays, monthData]);

  /* ── Navegação ─────────────────────────────────────────── */
  function navPrev() {
    if (view === 'week') {
      setWeekOffset(o => o - 1);
    } else {
      const nd = new Date(pivotDate);
      nd.setMonth(nd.getMonth() - 1);
      setWeekOffset(Math.round((nd - hoje) / (7 * 864e5)));
    }
  }

  function navNext() {
    if (view === 'week') {
      setWeekOffset(o => o + 1);
    } else {
      const nd = new Date(pivotDate);
      nd.setMonth(nd.getMonth() + 1);
      setWeekOffset(Math.round((nd - hoje) / (7 * 864e5)));
    }
  }

  /* "Hoje" visível no view atual? */
  const todayVisible = view === 'week'
    ? weekDays.some(d => d.isToday)
    : (monthData.year === hoje.getFullYear() && monthData.month === hoje.getMonth());

  return (
    <div className="cal-v3f">

      {/* ── Toolbar 52px ────────────────────────────────── */}
      <div className="cal-bar">

        {/* Esquerda: eyebrow + título */}
        <div className="cal-bar-left">
          <div className="cal-bar-eyebrow">Calendário</div>
          <div className="cal-bar-title">Agenda editorial</div>
        </div>

        {/* Direita: nav + Hoje + toggle */}
        <div className="cal-bar-right">
          <div className="cal-bar-nav">
            <button className="cal-nav-btn" onClick={navPrev} aria-label="Anterior">
              <ChevronLeft size={11} />
            </button>
            <span className="cal-month-label">{monthLabel}</span>
            <button className="cal-nav-btn" onClick={navNext} aria-label="Próximo">
              <ChevronRight size={11} />
            </button>
          </div>

          <div className="cal-bar-sep" />

          <button
            className={`cal-hoje-btn${todayVisible ? ' cal-hoje-btn--dim' : ''}`}
            onClick={() => setWeekOffset(0)}
          >
            <Sparkles size={11} />
            Hoje
          </button>

          <div className="cal-view-toggle">
            <button
              className={`cal-view-btn${view === 'week' ? ' cal-view-btn--active' : ''}`}
              onClick={() => setView('week')}
            >Semana</button>
            <button
              className={`cal-view-btn${view === 'month' ? ' cal-view-btn--active' : ''}`}
              onClick={() => setView('month')}
            >Mês</button>
          </div>
        </div>
      </div>

      {/* ── Conteúdo ─────────────────────────────────────── */}
      {view === 'week' ? (
        <CalWeekView
          days={weekDays}
          indeterminados={indeterminados}
          onViewDetail={onViewDetail}
        />
      ) : (
        <CalMonthView
          monthData={monthData}
          hoje={hoje}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          onViewDetail={onViewDetail}
        />
      )}

    </div>
  );
}

/* ─── Vista Semanal ──────────────────────────────────────── */

function CalWeekView({ days, indeterminados, onViewDetail }) {
  return (
    <div className="cal-scroll">
      <div className="cal-scroll-inner">

        {/* Cabeçalhos dos dias — sticky */}
        <div className="cal-week-headers">
          {days.map((day, i) => (
            <div
              key={i}
              className={[
                'cal-day-hdr',
                day.isToday ? 'cal-day-hdr--today' : '',
                day.isPast  ? 'cal-day-hdr--past'  : '',
              ].filter(Boolean).join(' ')}
            >
              <div className="cal-day-hdr-abbrev">{day.abbrev}</div>
              <div className={`cal-day-hdr-num${day.lancamentos.length === 0 && !day.isToday ? ' cal-day-hdr-num--empty' : ''}`}>
                {day.date.getDate()}
              </div>
              <div className="cal-day-hdr-count">
                {day.lancamentos.length > 0
                  ? `${day.lancamentos.length} obra${day.lancamentos.length > 1 ? 's' : ''}`
                  : '—'
                }
              </div>
            </div>
          ))}
        </div>

        {/* Colunas de lançamentos */}
        <div className="cal-week-grid">
          {days.map((day, i) => (
            <div
              key={i}
              className={`cal-day-col${day.isPast ? ' cal-day-col--past' : ''}`}
            >
              {day.lancamentos.length > 0
                ? day.lancamentos.map(obra => (
                    <WeekMiniCard
                      key={obra.id}
                      obra={obra}
                      isPast={day.isPast}
                      onViewDetail={onViewDetail}
                    />
                  ))
                : <div className="cal-day-empty" />
              }
            </div>
          ))}
        </div>

        {/* Lançamentos irregulares */}
        {indeterminados.length > 0 && (
          <div className="cal-irregular-section">
            <div className="cal-irregular-header">
              <Shuffle size={11} />
              <span>Lançamento irregular</span>
              <span className="cal-irregular-count">{indeterminados.length}</span>
            </div>
            <div className="cal-irregular-list">
              {indeterminados.map(obra => (
                <button
                  key={obra.id}
                  className="cal-irr-item"
                  onClick={() => onViewDetail?.(obra)}
                >
                  <FlagIcon tipo={obra.tipo} size={13} />
                  <span className="cal-irr-title">{obra.nome}</span>
                  {obra.detalhesLancamento && (
                    <span className="cal-irr-hint">{obra.detalhesLancamento}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ─── WeekMiniCard ───────────────────────────────────────── */

function WeekMiniCard({ obra, isPast, onViewDetail }) {
  const [imgError, setImgError] = useState(false);

  const coverUrl = useCover(obra);
  const capNum   = obra.capituloAtualUsuario > 0 ? obra.capituloAtualUsuario : null;

  return (
    <button className="cal-mini-card" onClick={() => onViewDetail?.(obra)}>
      {/* CRÍTICO: position:relative contém o .cal-mini-no-cover absoluto */}
      <div className="cal-mini-cover">
        {coverUrl && !imgError
          ? <img
              src={coverUrl}
              alt={obra.nome}
              className="cal-mini-img"
              onError={() => setImgError(true)}
            />
          : <div className="cal-mini-no-cover" />
        }
      </div>
      <div className="cal-mini-info">
        <span className="cal-mini-title">{obra.nome}</span>
        <div className="cal-mini-cap">
          {capNum !== null ? `cap ${capNum}` : '—'}
        </div>
        {!isPast && (
          <div className="cal-mini-novo">
            <span className="cal-mini-novo-dot" />
            <span className="cal-mini-novo-text">novo</span>
          </div>
        )}
      </div>
    </button>
  );
}

/* ─── Vista Mensal ───────────────────────────────────────── */

function CalMonthView({ monthData, hoje, selectedDay, setSelectedDay, onViewDetail }) {
  const { cells, year, month } = monthData;

  // Dia selecionado padrão = hoje (se no mês atual) ou 1
  const effectiveSelected = selectedDay ?? (
    month === hoje.getMonth() && year === hoje.getFullYear()
      ? hoje.getDate()
      : 1
  );

  const selectedCell = cells.find(c => c && c.day === effectiveSelected) ?? null;

  return (
    <div className="cal-month-view">

      {/* Grade */}
      <div className="cal-month-grid-area">
        <div className="cal-month-dow-row">
          {DIAS_MON.map(d => (
            <div key={d} className="cal-month-dow">{d}</div>
          ))}
        </div>
        <div className="cal-month-cells">
          {cells.map((cell, i) => (
            <MonthCell
              key={i}
              cell={cell}
              selected={cell?.day === effectiveSelected}
              onSelect={setSelectedDay}
            />
          ))}
        </div>
      </div>

      {/* Painel do dia */}
      <CalDayPanel
        cell={selectedCell}
        year={year}
        month={month}
        onViewDetail={onViewDetail}
      />

    </div>
  );
}

/* ─── MonthCell ──────────────────────────────────────────── */

function MonthCell({ cell, selected, onSelect }) {
  if (!cell) return <div className="cal-month-cell cal-month-cell--pad" />;

  const { day, isToday, lancamentos } = cell;

  return (
    <div
      className={[
        'cal-month-cell',
        isToday  ? 'cal-month-cell--today'    : '',
        selected ? 'cal-month-cell--selected' : '',
      ].filter(Boolean).join(' ')}
      onClick={() => onSelect(day)}
    >
      <div className="cal-month-cell-num">{day}</div>
      <div className="cal-month-cell-covers">
        {lancamentos.slice(0, 3).map((obra, i) => (
          <MonthThumb key={obra.id || i} obra={obra} />
        ))}
        {lancamentos.length > 3 && (
          <div className="cal-month-thumb cal-month-thumb--more">
            +{lancamentos.length - 3}
          </div>
        )}
      </div>
      {lancamentos.length > 0 && (
        <div className="cal-month-cell-count">
          {lancamentos.length} {lancamentos.length === 1 ? 'obra' : 'obras'}
        </div>
      )}
    </div>
  );
}

/* ─── MonthThumb ─────────────────────────────────────────── */

function MonthThumb({ obra }) {
  const [imgError, setImgError] = useState(false);
  const coverUrl = useCover(obra);

  return (
    <div className="cal-month-thumb">
      {coverUrl && !imgError
        ? <img
            src={coverUrl}
            alt={obra.nome}
            className="cal-month-thumb-img"
            onError={() => setImgError(true)}
          />
        : <div className="cal-month-thumb-empty" />
      }
    </div>
  );
}

/* ─── CalDayPanel (sidebar do mês) ──────────────────────── */

function CalDayPanel({ cell, year, month, onViewDetail }) {
  const dow = cell ? DIAS_PT[cell.date.getDay()] : null;

  return (
    <div className="cal-day-panel">
      <div className="cal-day-panel-hdr">
        <div className="cal-day-panel-eyebrow">Dia selecionado</div>
        {cell ? (
          <>
            <div className={`cal-day-panel-date${cell.isToday ? ' cal-day-panel-date--today' : ''}`}>
              {dow} {cell.day}
            </div>
            <div className="cal-day-panel-sub">
              {cell.lancamentos.length > 0
                ? `${cell.lancamentos.length} lançamento${cell.lancamentos.length > 1 ? 's' : ''} · ${MESES[month]} ${year}`
                : 'Sem lançamentos'
              }
            </div>
          </>
        ) : (
          <div className="cal-day-panel-date">—</div>
        )}
      </div>

      <div className="cal-day-panel-list">
        {!cell || cell.lancamentos.length === 0 ? (
          <div className="cal-day-panel-nil">
            <CalIcon size={26} />
            <span>Nenhuma obra</span>
          </div>
        ) : cell.lancamentos.map(obra => (
          <DayPanelCard key={obra.id} obra={obra} onViewDetail={onViewDetail} />
        ))}
      </div>
    </div>
  );
}

/* ─── DayPanelCard ───────────────────────────────────────── */

function DayPanelCard({ obra, onViewDetail }) {
  const [imgError, setImgError] = useState(false);

  const coverUrl = useCover(obra);
  const capNum   = obra.capituloAtualUsuario > 0 ? obra.capituloAtualUsuario : null;

  return (
    <button className="cal-panel-card" onClick={() => onViewDetail?.(obra)}>
      {/* CRÍTICO: position:relative */}
      <div className="cal-panel-cover">
        {coverUrl && !imgError
          ? <img
              src={coverUrl}
              alt={obra.nome}
              className="cal-panel-img"
              onError={() => setImgError(true)}
            />
          : <div className="cal-panel-no-cover" />
        }
      </div>
      <div className="cal-panel-info">
        <div className="cal-panel-title">{obra.nome}</div>
        {capNum !== null && (
          <div className="cal-panel-cap">cap {capNum}</div>
        )}
        <div className="cal-panel-flag">
          <FlagIcon tipo={obra.tipo} size={11} />
        </div>
      </div>
    </button>
  );
}

export default Calendar;
