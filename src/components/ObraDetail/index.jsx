import { useEffect } from 'react';
import { ArrowLeft, Edit2, Trash2, Star, ExternalLink } from 'lucide-react';
import { useCoverLoader } from './hooks/useCoverLoader';
import CoversGallery from './components/CoversGallery';
import ObraStatusBadge from '../ObraCard/shared/ObraStatusBadge';
import StatusBadge from '../ObraCard/shared/StatusBadge';
import TipoBadge from '../ObraCard/shared/TipoBadge';
import { getDescricaoLancamento } from '../../types/obra';
import { formatDate } from './utils/formatters';
import './ObraDetail.css';

/**
 * ObraDetail V3F — Cinematic hero layout
 *
 * Layout:
 *   [52px bar: ← Biblioteca | spacer | Editar · Excluir]
 *   [Hero: cover (200px) | info panel]
 *   [Body: galeria · anotações · metadados]
 */
function ObraDetail({ obra, onEdit, onDelete, onClose }) {
  const { coverUrl, allCovers, selectedCoverIndex, selectCover } = useCoverLoader(obra);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [obra]);

  const pct = obra.capituloAtual > 0
    ? Math.min(100, Math.round((obra.capituloAtualUsuario / obra.capituloAtual) * 100))
    : 0;

  const hasLinks = Array.isArray(obra.links) && obra.links.length > 0;
  const hasRating = obra.nota > 0 || obra.notaUsuario > 0;

  return (
    <div className="obra-detail-v3f">

      {/* ── Back bar ─────────────────────────────────────────────── */}
      <div className="detail-bar">
        <button className="detail-back-btn" onClick={onClose}>
          <ArrowLeft size={13} />
          Biblioteca
        </button>
        <div className="detail-bar-spacer" />
        <button className="detail-edit-btn" onClick={onEdit}>
          <Edit2 size={12} />
          Editar
        </button>
        <div className="detail-bar-divider" />
        <button className="detail-delete-btn" onClick={onDelete} title="Excluir">
          <Trash2 size={13} />
        </button>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="detail-hero">

        {/* Gradientes cinematográficos (position:absolute, z-index:0) */}
        <div className="detail-hero-backdrop-tint" />
        <div className="detail-hero-backdrop-fade" />

        {/* Cover */}
        <div className="detail-hero-cover-wrap">
          <div className="detail-hero-cover">
            {coverUrl
              ? <img src={coverUrl} alt={obra.nome} />
              : <div className="detail-hero-no-cover" />
            }
          </div>
          {obra.favorito && (
            <div className="detail-cover-fav">
              <Star size={15} fill="var(--gold)" color="var(--gold)" />
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="detail-hero-info">

          {/* Badges row: tipo + status obra + meu status */}
          <div className="detail-hero-badges">
            <TipoBadge tipo={obra.tipo} className="badge-tipo badge-lg" />
            <ObraStatusBadge status={obra.status} className="badge-flat badge-lg" />
            <StatusBadge status={obra.statusUsuario} className="badge-outlined badge-lg" />
          </div>

          {/* Title */}
          <div className="detail-hero-titles">
            <h1 className="detail-hero-title">{obra.nome}</h1>
            {obra.nomeAlternativo && (
              <p className="detail-hero-alt">{obra.nomeAlternativo}</p>
            )}
          </div>

          {/* Meta row */}
          {(obra.autor || obra.anoLancamento) && (
            <div className="detail-hero-meta">
              {obra.autor && <span className="detail-meta-item">{obra.autor}</span>}
              {obra.autor && obra.anoLancamento && <span className="detail-meta-dot" />}
              {obra.anoLancamento && <span className="detail-meta-item">{obra.anoLancamento}</span>}
              <span className="detail-meta-dot" />
              <span className="detail-meta-item detail-meta-launch">
                {getDescricaoLancamento(obra)}
              </span>
            </div>
          )}

          {/* Progress + rating */}
          <div className="detail-hero-stats">
            {obra.capituloAtual > 0 && (
              <div className="detail-progress-row">
                <span className="detail-progress-label">
                  Cap.&nbsp;{obra.capituloAtualUsuario}/{obra.capituloAtual}
                </span>
                <div className="detail-progress-track">
                  <div className="detail-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="detail-progress-pct">{pct}%</span>
              </div>
            )}
            {hasRating && (
              <div className="detail-rating-row">
                <Star size={12} fill="var(--status-rating)" color="var(--status-rating)" />
                <span className="detail-rating-val">
                  {obra.notaUsuario > 0 ? obra.notaUsuario : obra.nota}
                  <span className="detail-rating-max">/5</span>
                </span>
                {obra.nota > 0 && obra.notaUsuario > 0 && obra.nota !== obra.notaUsuario && (
                  <span className="detail-rating-general">Geral: {obra.nota}/5</span>
                )}
              </div>
            )}
          </div>

          {/* Genres */}
          {obra.generos?.length > 0 && (
            <div className="detail-hero-genres">
              {obra.generos.map(g => (
                <span key={g} className="detail-genre-chip">{g}</span>
              ))}
            </div>
          )}

          {/* Studio */}
          {obra.studio && (
            <div className="detail-hero-studio">
              <span className="detail-meta-label">Estúdio</span>
              <span className="detail-meta-val">{obra.studio}</span>
            </div>
          )}

          {/* Links */}
          {hasLinks && (
            <div className="detail-hero-links">
              {obra.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`detail-link-pill ${link.principal ? 'detail-link-pill--primary' : ''}`}
                >
                  <ExternalLink size={10} />
                  {link.nome}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="detail-body">

        {/* Covers gallery (só aparece se houver múltiplas capas) */}
        {allCovers.length > 1 && (
          <section className="detail-section-v3f">
            <span className="detail-section-label">Capas</span>
            <CoversGallery
              covers={allCovers}
              selectedIndex={selectedCoverIndex}
              onSelectCover={selectCover}
            />
          </section>
        )}

        {/* Notes */}
        {obra.notas && (
          <section className="detail-section-v3f">
            <span className="detail-section-label">Anotações</span>
            <p className="detail-notes">{obra.notas}</p>
          </section>
        )}

        {/* Metadata footer */}
        <div className="detail-meta-footer">
          <span>Adicionado em {formatDate(obra.dataAdicionado)}</span>
          <span className="detail-meta-dot" />
          <span>Atualizado em {formatDate(obra.dataAtualizado)}</span>
        </div>

      </div>
    </div>
  );
}

export default ObraDetail;
