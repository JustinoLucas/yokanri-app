import { useEffect, useState } from 'react';
import { ArrowLeft, Edit2, Trash2, Star, ExternalLink, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
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
  const { t } = useLanguage();
  const { coverUrl, allCovers, selectedCoverIndex, selectCover } = useCoverLoader(obra);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

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
          {t('detail_back')}
        </button>
        <div className="detail-bar-spacer" />
        <button className="detail-edit-btn" onClick={onEdit}>
          <Edit2 size={12} />
          {t('detail_edit')}
        </button>
        <div className="detail-bar-divider" />
        <button className="detail-delete-btn" onClick={() => setConfirmDeleteOpen(true)} title="Excluir">
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
                  <span className="detail-rating-general">{t('detail_rating_general')} {obra.nota}/5</span>
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
              <span className="detail-meta-label">{t('detail_studio')}</span>
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
            <span className="detail-section-label">{t('detail_covers')}</span>
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
            <span className="detail-section-label">{t('detail_notes')}</span>
            <p className="detail-notes">{obra.notas}</p>
          </section>
        )}

        {/* Metadata footer */}
        <div className="detail-meta-footer">
          <span>{t('detail_added')} {formatDate(obra.dataAdicionado)}</span>
          <span className="detail-meta-dot" />
          <span>{t('detail_updated')} {formatDate(obra.dataAtualizado)}</span>
        </div>

      </div>

      {confirmDeleteOpen && (
        <div className="detail-confirm-overlay" onClick={() => setConfirmDeleteOpen(false)}>
          <div className="detail-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="detail-confirm-icon">
              <AlertTriangle size={22} />
            </div>
            <h2 className="detail-confirm-title">{t('detail_confirm_delete_title')}</h2>
            <p className="detail-confirm-text">
              {t('detail_confirm_delete_text').replace('{name}', obra.nome)}
            </p>
            <div className="detail-confirm-actions">
              <button className="detail-confirm-btn detail-confirm-btn--ghost" onClick={() => setConfirmDeleteOpen(false)}>
                {t('detail_confirm_delete_cancel')}
              </button>
              <button className="detail-confirm-btn detail-confirm-btn--danger" onClick={() => { setConfirmDeleteOpen(false); onDelete(); }}>
                {t('detail_confirm_delete_confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ObraDetail;
