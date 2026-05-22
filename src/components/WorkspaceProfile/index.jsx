import { useMemo } from 'react';
import {
  Book,
  BookOpen,
  CheckCircle,
  Star,
  TrendingUp,
  Heart,
  Clock,
  Settings,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import './WorkspaceProfile.css';

/**
 * WorkspaceProfile — Página dedicada do workspace/perfil
 *
 * Hub central do usuário: mostra identidade da biblioteca,
 * estatísticas visuais, favoritas e leituras recentes.
 */
function WorkspaceProfile({ workspace, obras, onShowStats, onShowConfig, onViewDetail }) {
  const config = useConfig();

  const profile = useMemo(() => {
    const statusLeitura = config?.statusLeitura ?? [];
    // Labels para exibição (podem ser renomeados pelo usuário)
    const labelLendo    = statusLeitura.find(s => s.id === 'lendo')?.label      ?? 'Lendo';
    const labelCompleto = statusLeitura.find(s => s.id === 'completo')?.label   ?? 'Completo';
    const labelPausado  = statusLeitura.find(s => s.id === 'pausado')?.label    ?? 'Pausado';
    const labelPlaneja  = statusLeitura.find(s => s.id === 'planeja-ler')?.label ?? 'Planeja ler';

    const total = obras.length;
    // Filtro por ID estável — obras armazenam IDs desde a v2
    const lendo     = obras.filter(o => o.statusUsuario === 'lendo').length;
    const completas = obras.filter(o => o.statusUsuario === 'completo').length;
    const pausadas  = obras.filter(o => o.statusUsuario === 'pausado').length;
    const planejadas = obras.filter(o => o.statusUsuario === 'planeja-ler').length;

    const totalChapters = obras.reduce((acc, o) => acc + (o.capituloAtualUsuario || 0), 0);

    const ratedObras = obras.filter(o => o.notaUsuario > 0);
    const avgRating = ratedObras.length > 0
      ? ratedObras.reduce((acc, o) => acc + o.notaUsuario, 0) / ratedObras.length
      : 0;

    // Favoritas (com estrela)
    const favorites = obras
      .filter(o => o.favorito)
      .slice(0, 8);

    // Leituras recentes (por dataAtualizado)
    const recent = [...obras]
      .filter(o => o.dataAtualizado)
      .sort((a, b) => new Date(b.dataAtualizado) - new Date(a.dataAtualizado))
      .slice(0, 6);

    // Top gêneros
    const genreCount = {};
    obras.forEach(o => {
      if (Array.isArray(o.generos)) {
        o.generos.forEach(g => { genreCount[g] = (genreCount[g] || 0) + 1; });
      }
    });
    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Dia mais forte (com mais lançamentos configurados)
    const dayCount = {};
    obras.forEach(o => {
      if (Array.isArray(o.diasLancamento)) {
        o.diasLancamento.forEach(d => { dayCount[d] = (dayCount[d] || 0) + 1; });
      }
    });
    const topDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0];

    return {
      total, lendo, completas, pausadas, planejadas,
      totalChapters, avgRating, favorites, recent,
      topGenres, topDay,
      labelLendo, labelCompleto,
    };
  }, [obras, config]);

  const initials = workspace?.name
    ? workspace.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'YK';

  const memberSince = workspace?.createdAt
    ? new Date(workspace.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="wsp-page">
      {/* ─── BANNER + AVATAR ─────────────────────────── */}
      <div className="wsp-banner">
        <div className="wsp-banner-gradient" />
        <div className="wsp-banner-content">
          <div className="wsp-avatar-large">{initials}</div>
          <div className="wsp-identity">
            <h1 className="wsp-name">{workspace?.name}</h1>
            <p className="wsp-meta">
              {memberSince && <span>Criado em {memberSince}</span>}
              <span className="wsp-meta-dot" />
              <span>{profile.total} obras na biblioteca</span>
            </p>
          </div>
        </div>
      </div>

      {/* ─── QUICK STATS ─────────────────────────────── */}
      <div className="wsp-stats-row">
        <div className="wsp-stat">
          <div className="wsp-stat-icon wsp-stat-icon--blue"><Book size={18} /></div>
          <div className="wsp-stat-info">
            <span className="wsp-stat-value">{profile.total}</span>
            <span className="wsp-stat-label">Total</span>
          </div>
        </div>
        <div className="wsp-stat">
          <div className="wsp-stat-icon wsp-stat-icon--green"><BookOpen size={18} /></div>
          <div className="wsp-stat-info">
            <span className="wsp-stat-value">{profile.lendo}</span>
            <span className="wsp-stat-label">Lendo</span>
          </div>
        </div>
        <div className="wsp-stat">
          <div className="wsp-stat-icon wsp-stat-icon--cyan"><CheckCircle size={18} /></div>
          <div className="wsp-stat-info">
            <span className="wsp-stat-value">{profile.completas}</span>
            <span className="wsp-stat-label">Completas</span>
          </div>
        </div>
        <div className="wsp-stat">
          <div className="wsp-stat-icon wsp-stat-icon--yellow"><Star size={18} /></div>
          <div className="wsp-stat-info">
            <span className="wsp-stat-value">{profile.avgRating > 0 ? profile.avgRating.toFixed(1) : '-'}</span>
            <span className="wsp-stat-label">Nota média</span>
          </div>
        </div>
        <div className="wsp-stat">
          <div className="wsp-stat-icon wsp-stat-icon--purple"><TrendingUp size={18} /></div>
          <div className="wsp-stat-info">
            <span className="wsp-stat-value">{profile.totalChapters.toLocaleString()}</span>
            <span className="wsp-stat-label">Capítulos lidos</span>
          </div>
        </div>
      </div>

      {/* ─── CONTENT GRID ────────────────────────────── */}
      <div className="wsp-grid">

        {/* Favoritas */}
        <div className="wsp-card wsp-card--wide">
          <div className="wsp-card-header">
            <Heart size={16} className="wsp-card-icon" />
            <h3>Favoritas</h3>
          </div>
          {profile.favorites.length > 0 ? (
            <div className="wsp-favorites">
              {profile.favorites.map(obra => (
                <button
                  key={obra.id}
                  className="wsp-fav-item"
                  onClick={() => onViewDetail(obra)}
                  title={obra.nome}
                >
                  <div className="wsp-fav-avatar">
                    {obra.nome.charAt(0).toUpperCase()}
                  </div>
                  <span className="wsp-fav-name">{obra.nome}</span>
                  {obra.notaUsuario > 0 && (
                    <span className="wsp-fav-rating">
                      <Star size={10} />
                      {obra.notaUsuario}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="wsp-empty">Nenhuma obra marcada como favorita</p>
          )}
        </div>

        {/* Leituras recentes */}
        <div className="wsp-card wsp-card--wide">
          <div className="wsp-card-header">
            <Clock size={16} className="wsp-card-icon" />
            <h3>Atividade recente</h3>
          </div>
          {profile.recent.length > 0 ? (
            <div className="wsp-recent">
              {profile.recent.map(obra => (
                <button
                  key={obra.id}
                  className="wsp-recent-item"
                  onClick={() => onViewDetail(obra)}
                >
                  <div className="wsp-recent-avatar">
                    {obra.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="wsp-recent-info">
                    <span className="wsp-recent-name">{obra.nome}</span>
                    <span className="wsp-recent-detail">
                      Cap. {obra.capituloAtualUsuario || 0} · {obra.statusUsuario}
                    </span>
                  </div>
                  <span className="wsp-recent-time">
                    {formatTimeAgo(obra.dataAtualizado)}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="wsp-empty">Nenhuma atividade recente</p>
          )}
        </div>

        {/* Top gêneros */}
        <div className="wsp-card">
          <div className="wsp-card-header">
            <Sparkles size={16} className="wsp-card-icon" />
            <h3>Top gêneros</h3>
          </div>
          {profile.topGenres.length > 0 ? (
            <div className="wsp-genres">
              {profile.topGenres.map(([genre, count], i) => (
                <div key={genre} className="wsp-genre-item">
                  <span className="wsp-genre-rank">#{i + 1}</span>
                  <span className="wsp-genre-name">{genre}</span>
                  <span className="wsp-genre-count">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="wsp-empty">Sem dados de gêneros</p>
          )}
        </div>

        {/* Quick links */}
        <div className="wsp-card">
          <div className="wsp-card-header">
            <Settings size={16} className="wsp-card-icon" />
            <h3>Atalhos</h3>
          </div>
          <div className="wsp-shortcuts">
            <button className="wsp-shortcut" onClick={onShowStats}>
              <BarChart3 size={18} />
              <span>Estatísticas completas</span>
            </button>
            <button className="wsp-shortcut" onClick={onShowConfig}>
              <Settings size={18} />
              <span>Configurações</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HELPERS ──────────────────────────────────────────────

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}min`;
  if (diffHrs < 24) return `${diffHrs}h`;
  if (diffDays < 7) return `${diffDays}d`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default WorkspaceProfile;
