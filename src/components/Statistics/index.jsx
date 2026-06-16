import { useMemo } from 'react';
import { Book, TrendingUp, Clock, Heart, Flag, CheckCircle, Star, Award, ArrowLeft } from 'lucide-react';
import FlagIcon from '../ObraCard/shared/FlagIcon';
import { useConfig } from '../../context/ConfigContext';
import './Statistics.css';


function Statistics({ obras, onClose }) {
  const config = useConfig();

  const stats = useMemo(() => {
    const statusLeituraList = config?.statusLeitura ?? [];
    const statusObraList = config?.statusObra ?? [];

    // Por status do usuário — keyed by ID estável
    const byStatus = {};
    statusLeituraList.forEach(s => {
      byStatus[s.id] = obras.filter(o => o.statusUsuario === s.id).length;
    });

    // By type
    const byType = {
      'Coreano': obras.filter(o => o.tipo === 'Coreano').length,
      'Chinês': obras.filter(o => o.tipo === 'Chinês').length,
      'Japonês': obras.filter(o => o.tipo === 'Japonês').length
    };

    // Por status da obra — keyed by ID estável
    const byObraStatus = {};
    statusObraList.forEach(s => {
      byObraStatus[s.id] = obras.filter(o => o.status === s.id).length;
    });

    const labelCompleto = statusLeituraList.find(s => s.id === 'completo')?.label ?? 'Completo';
    const labelLendo    = statusLeituraList.find(s => s.id === 'lendo')?.label    ?? 'Lendo';

    const topRead = [...obras]
      .sort((a, b) => (b.capituloAtualUsuario || 0) - (a.capituloAtualUsuario || 0))
      .slice(0, 5)
      .filter(o => o.capituloAtualUsuario > 0);

    const completedCount = byStatus['completo'] ?? 0;
    const completionRate = obras.length > 0 ? (completedCount / obras.length) * 100 : 0;

    const ratingDistribution = {
      '5': obras.filter(o => o.notaUsuario >= 4.5).length,
      '4': obras.filter(o => o.notaUsuario >= 3.5 && o.notaUsuario < 4.5).length,
      '3': obras.filter(o => o.notaUsuario >= 2.5 && o.notaUsuario < 3.5).length,
      '2': obras.filter(o => o.notaUsuario >= 1.5 && o.notaUsuario < 2.5).length,
      '1': obras.filter(o => o.notaUsuario > 0 && o.notaUsuario < 1.5).length,
      'Sem nota': obras.filter(o => !o.notaUsuario || o.notaUsuario === 0).length
    };

    const genreCount = {};
    obras.forEach(obra => {
      if (Array.isArray(obra.generos)) {
        obra.generos.forEach(genero => {
          genreCount[genero] = (genreCount[genero] || 0) + 1;
        });
      }
    });

    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const readingObras = obras.filter(o => o.statusUsuario === 'lendo');
    const totalProgress = readingObras.reduce((acc, obra) => {
      if (obra.capituloAtual > 0) {
        return acc + (obra.capituloAtualUsuario / obra.capituloAtual) * 100;
      }
      return acc;
    }, 0);
    const avgProgress = readingObras.length > 0 ? totalProgress / readingObras.length : 0;

    // Calculate total chapters read
    const totalChaptersRead = obras.reduce((acc, obra) => acc + (obra.capituloAtualUsuario || 0), 0);

    // Calculate average rating
    const ratedObras = obras.filter(o => o.notaUsuario > 0);
    const totalRating = ratedObras.reduce((acc, obra) => acc + obra.notaUsuario, 0);
    const avgRating = ratedObras.length > 0 ? totalRating / ratedObras.length : 0;

    return {
      byStatus,
      byType,
      byObraStatus,
      topRead,
      completionRate,
      ratingDistribution,
      topGenres,
      avgProgress,
      totalChaptersRead,
      avgRating,
      total: obras.length,
      labelLendo,
      labelCompleto,
      labelDropado:   statusLeituraList.find(s => s.id === 'dropado')?.label  ?? 'Dropado',
      statusLeituraList,
      statusObraList: config?.statusObra ?? [],
    };
  }, [obras]);

  return (
    <div className="statistics-v3f">

      {/* ── Back bar ──────────────────────────────────────── */}
      <div className="stats-bar">
        {onClose && (
          <button className="stats-bar-back" onClick={onClose}>
            <ArrowLeft size={13} />
            Biblioteca
          </button>
        )}
        <div className="stats-bar-divider" />
        <span className="stats-bar-title">Estatísticas</span>
      </div>

      {/* ── Scrollable content ────────────────────────────── */}
      <div className="statistics-scroll">
      <div className="statistics-inner">

      <div className="stats-grid">
        {/* Total Overview Cards */}
        <div className="stat-card stat-card-highlight">
          <div className="stat-icon" style={{ backgroundColor: 'var(--accent-primary)' }}>
            <Book size={24} />
          </div>
          <div className="stat-content">
            <h3>Total de Obras</h3>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-color)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.labelLendo}</h3>
            <p className="stat-value">{stats.byStatus['lendo'] ?? 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--status-completo)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.labelCompleto}</h3>
            <p className="stat-value">{stats.byStatus['completo'] ?? 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--danger-color)' }}>
            <Book size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.labelDropado}</h3>
            <p className="stat-value">{stats.byStatus['dropado'] ?? 0}</p>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--status-andamento)' }}>
            <Award size={24} />
          </div>
          <div className="stat-content">
            <h3>Taxa de Conclusão</h3>
            <p className="stat-value">{stats.completionRate.toFixed(1)}%</p>
            <p className="stat-detail">{stats.byStatus['completo'] ?? 0} de {stats.total} obras</p>
          </div>
        </div>

        {/* Average Rating */}
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fbbf24' }}>
            <Star size={24} />
          </div>
          <div className="stat-content">
            <h3>Nota Média</h3>
            <p className="stat-value">{stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '-'}</p>
            <p className="stat-detail">de 5 estrelas</p>
          </div>
        </div>

        {/* Average Progress */}
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--accent-secondary)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>Progresso Médio</h3>
            <p className="stat-value">{stats.avgProgress.toFixed(1)}%</p>
            <p className="stat-detail">de obras em andamento</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--status-andamento)' }}>
            <Book size={24} />
          </div>
          <div className="stat-content">
            <h3>Capítulos Lidos</h3>
            <p className="stat-value">{stats.totalChaptersRead}</p>
          </div>
        </div>

        {/* Distribution by Type */}
        <div className="stat-card stat-card-wide">
          <h3 className="stat-card-title">
            <Flag size={18} />
            Distribuição por Tipo
          </h3>
          <div className="type-chart">
            {Object.entries(stats.byType)
              .sort((a, b) => b[1] - a[1])
              .map(([tipo, count]) => {
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                const typeColor = {
                  'Coreano': '#003478',
                  'Chinês':  '#DE2910',
                  'Japonês': '#FFFFFF',
                }[tipo] ?? 'var(--accent-fg)';
                const formatName = {
                  'Coreano': 'Manhwa',
                  'Chinês':  'Manhua',
                  'Japonês': 'Manga',
                }[tipo] ?? tipo;

                return (
                  <div key={tipo} className="type-bar-item">
                    <div className="type-bar-label">
                      <div className="type-bar-name">
                        <FlagIcon tipo={tipo} size={20} />
                        <span className="type-bar-format">{formatName}</span>
                        <span className="type-bar-separator">•</span>
                        <span className="type-bar-nationality">{tipo}</span>
                      </div>
                      <span className="type-bar-count">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="type-bar-track">
                      <div
                        className="type-bar-fill"
                        style={{ width: `${percentage}%`, backgroundColor: typeColor }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Distribution by Obra Status */}
        <div className="stat-card stat-card-wide">
          <h3 className="stat-card-title">Status de Publicação</h3>
          <div className="status-chart">
            {stats.statusObraList
              .filter(s => !s.hidden)
              .map(s => {
                const count = stats.byObraStatus[s.id] ?? 0;
                if (count === 0) return null;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={s.id} className="status-bar-item">
                    <div className="status-bar-label">
                      <span>{s.label}</span>
                      <span className="status-bar-count">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="status-bar-track">
                      <div className="status-bar-fill" style={{ width: `${percentage}%`, backgroundColor: s.color || 'var(--text-tertiary)' }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Progress Chart - User Reading Status */}
        <div className="stat-card stat-card-wide">
          <h3 className="stat-card-title">Meu Status de Leitura</h3>
          <div className="status-chart">
            {stats.statusLeituraList
              .filter(s => !s.hidden)
              .map(s => {
                const count = stats.byStatus[s.id] ?? 0;
                if (count === 0) return null;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={s.id} className="status-bar-item">
                    <div className="status-bar-label">
                      <span>{s.label}</span>
                      <span className="status-bar-count">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="status-bar-track">
                      <div className="status-bar-fill" style={{ width: `${percentage}%`, backgroundColor: s.color || 'var(--text-tertiary)' }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Top 5 Most Read */}
        <div className="stat-card stat-card-wide">
          <h3 className="stat-card-title">
            <Award size={18} />
            Top 5 Mais Lidas
          </h3>
          <div className="top-read-list">
            {stats.topRead.length > 0 ? (
              stats.topRead.map((obra, index) => (
                <div key={obra.id} className="top-read-item">
                  <div className="top-read-rank">#{index + 1}</div>
                  <div className="top-read-info">
                    <div className="top-read-name">{obra.nome}</div>
                    <div className="top-read-chapters">{obra.capituloAtualUsuario} capítulos</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-message">Nenhuma obra com capítulos lidos</p>
            )}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="stat-card stat-card-wide">
          <h3 className="stat-card-title">
            <Star size={18} />
            Distribuição de Notas
          </h3>
          <div className="rating-chart">
            {Object.entries(stats.ratingDistribution).map(([rating, count]) => {
              const maxCount = Math.max(...Object.values(stats.ratingDistribution));
              const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

              return (
                <div key={rating} className="rating-bar-item">
                  <div className="rating-bar-label">
                    <span className="rating-stars">{rating === 'Sem nota' ? rating : `${rating} ⭐`}</span>
                    <span className="rating-count">{count}</span>
                  </div>
                  <div className="rating-bar-track">
                    <div
                      className="rating-bar-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Genres */}
        <div className="stat-card stat-card-wide">
          <h3 className="stat-card-title">
            <Heart size={18} />
            Gêneros Favoritos
          </h3>
          <div className="genre-chart">
            {stats.topGenres.map(([genre, count], index) => {
              const maxCount = stats.topGenres[0][1];
              const percentage = (count / maxCount) * 100;

              return (
                <div key={genre} className="genre-bar-item">
                  <div className="genre-bar-label">
                    <span className="genre-rank">#{index + 1}</span>
                    <span className="genre-name">{genre}</span>
                    <span className="genre-count">{count}</span>
                  </div>
                  <div className="genre-bar-track">
                    <div
                      className="genre-bar-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      </div>{/* statistics-inner */}
      </div>{/* statistics-scroll */}
    </div>
  );
}

export default Statistics;
