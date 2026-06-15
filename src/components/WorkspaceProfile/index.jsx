import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Book,
  BookOpen,
  CheckCircle,
  Star,
  TrendingUp,
  Heart,
  Clock,
  Plus,
  PlusCircle,
  Trash2,
  Hash,
  RefreshCw,
  Pencil,
  ImagePlus,
  ArrowLeft,
} from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import useCover from '../ObraCard/hooks/useCover';
import storage from '../../services/storage/storageService';
import './WorkspaceProfile.css';

const BANNER_RECOMMENDED_SIZE = '1500x400px';

const EMPTY_OBRA = { capas: [] };
const DESTAQUES_SLOTS = 5;

/**
 * WorkspaceProfile — Página dedicada do workspace/perfil
 *
 * Hub central do usuário: mostra identidade da biblioteca,
 * estatísticas visuais, destaques escolhidos e leituras recentes.
 */
function WorkspaceProfile({ workspace, obras, onViewDetail, onSetDestaques, onSetBanner, onClose }) {
  const config = useConfig();
  const activityLog = config?.activityLog ?? [];

  const banner = config?.perfilBanner ?? null;
  const bannerFileName = banner?.fileName ?? null;
  const [bannerUrl, setBannerUrl] = useState(null);
  const [previewPositionY, setPreviewPositionY] = useState(null);
  const bannerInputRef = useRef(null);

  useEffect(() => {
    if (!bannerFileName) {
      setBannerUrl(null);
      return;
    }
    let cancelled = false;
    storage.loadBanner(bannerFileName).then(url => {
      if (!cancelled) setBannerUrl(url);
    });
    return () => { cancelled = true; };
  }, [bannerFileName]);

  const positionY = previewPositionY ?? banner?.positionY ?? 50;

  const handleBannerPick = () => {
    alert(`Tamanho recomendado para o banner: ${BANNER_RECOMMENDED_SIZE}.`);
    bannerInputRef.current?.click();
  };

  const handleBannerFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;

    const extension = file.name.split('.').pop();
    const fileName = `profile-banner-${Date.now()}.${extension}`;
    await storage.saveBanner(file, fileName);

    if (bannerFileName) {
      await storage.deleteBanner(bannerFileName);
    }

    setPreviewPositionY(null);
    onSetBanner({ fileName, positionY: 50 });
  };

  const handleRemoveBanner = async () => {
    if (bannerFileName) {
      await storage.deleteBanner(bannerFileName);
    }
    setPreviewPositionY(null);
    onSetBanner(null);
  };

  const handlePositionInput = (e) => {
    setPreviewPositionY(Number(e.target.value));
  };

  const handlePositionCommit = (e) => {
    const value = Number(e.target.value);
    setPreviewPositionY(null);
    onSetBanner({ ...banner, positionY: value });
  };

  const profile = useMemo(() => {
    const total = obras.length;
    // Filtro por ID estável — obras armazenam IDs desde a v2
    const lendo     = obras.filter(o => o.statusUsuario === 'lendo').length;
    const completas = obras.filter(o => o.statusUsuario === 'completo').length;

    const totalChapters = obras.reduce((acc, o) => acc + (o.capituloAtualUsuario || 0), 0);

    const ratedObras = obras.filter(o => o.notaUsuario > 0);
    const avgRating = ratedObras.length > 0
      ? ratedObras.reduce((acc, o) => acc + o.notaUsuario, 0) / ratedObras.length
      : 0;

    return {
      total, lendo, completas,
      totalChapters, avgRating,
    };
  }, [obras]);

  const initials = workspace?.name
    ? workspace.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'YK';

  const memberSince = workspace?.createdAt
    ? new Date(workspace.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="wsp-v3f">

      {/* ── Back bar ──────────────────────────────────────── */}
      <div className="wsp-bar">
        {onClose && (
          <button className="wsp-bar-back" onClick={onClose}>
            <ArrowLeft size={13} />
            Biblioteca
          </button>
        )}
        <div className="wsp-bar-divider" />
        <span className="wsp-bar-title">Perfil</span>
      </div>

      {/* ── Scrollable content ────────────────────────────── */}
      <div className="wsp-scroll">

      {/* ─── BANNER + AVATAR ─────────────────────────── */}
      <div className="wsp-banner">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt=""
            className="wsp-banner-img"
            style={{ objectPosition: `center ${positionY}%` }}
          />
        ) : null}
        <div className={`wsp-banner-gradient${bannerUrl ? ' wsp-banner-gradient--image' : ''}`} />

        <div className="wsp-banner-actions">
          <button className="wsp-banner-action-btn" onClick={handleBannerPick}>
            <ImagePlus size={13} />
            {bannerUrl ? 'Alterar banner' : 'Adicionar banner'}
          </button>
          {bannerUrl && (
            <button
              className="wsp-banner-action-btn wsp-banner-action-btn--icon wsp-banner-action-btn--danger"
              onClick={handleRemoveBanner}
              title="Remover banner"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          className="wsp-banner-file-input"
          onChange={handleBannerFileChange}
        />

        {bannerUrl && (
          <div className="wsp-banner-position">
            <span className="wsp-banner-position-label">Posição</span>
            <input
              type="range"
              min="0"
              max="100"
              value={positionY}
              onChange={handlePositionInput}
              onMouseUp={handlePositionCommit}
              onTouchEnd={handlePositionCommit}
            />
          </div>
        )}

        <div className="wsp-identity-row">
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

      <div className="wsp-page">

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

      {/* ─── CONTENT ─────────────────────────────────── */}
      <div className="wsp-grid">

        {/* Destaques */}
        <DestaquesCard
          obras={obras}
          destaques={config?.perfilDestaques ?? []}
          onSetDestaques={onSetDestaques}
          onViewDetail={onViewDetail}
        />

        {/* Atividade recente */}
        <div className="wsp-card wsp-card--wide">
          <div className="wsp-card-header">
            <Clock size={16} className="wsp-card-icon" />
            <h3>Atividade recente</h3>
          </div>
          {activityLog.length > 0 ? (
            <div className="wsp-recent">
              {activityLog.map(entry => (
                <ActivityItem
                  key={entry.id}
                  entry={entry}
                  obras={obras}
                  config={config}
                  onViewDetail={onViewDetail}
                />
              ))}
            </div>
          ) : (
            <p className="wsp-empty">Nenhuma atividade recente</p>
          )}
        </div>
      </div>

      </div>{/* wsp-page */}
      </div>{/* wsp-scroll */}
    </div>
  );
}

// ─── DESTAQUES ──────────────────────────────────────────────

/**
 * Card de destaques — grade de capas escolhidas manualmente pelo usuário.
 * Cada slot pode ser editado, abrindo um seletor com busca por nome
 * e lista ordenada pela nota do usuário (maior para menor).
 */
function DestaquesCard({ obras, destaques, onSetDestaques, onViewDetail }) {
  const [activeSlot, setActiveSlot] = useState(null);
  const [search, setSearch] = useState('');

  const slots = Array.from({ length: DESTAQUES_SLOTS }, (_, i) => destaques[i] ?? null);

  const options = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...obras]
      .filter(o => !term || o.nome.toLowerCase().includes(term))
      .sort((a, b) => (b.notaUsuario || 0) - (a.notaUsuario || 0));
  }, [obras, search]);

  const handleEditSlot = (index) => {
    setSearch('');
    setActiveSlot(activeSlot === index ? null : index);
  };

  const handlePick = (obraId) => {
    const updated = [...slots];
    updated[activeSlot] = obraId;
    onSetDestaques(updated);
    setActiveSlot(null);
    setSearch('');
  };

  const handleClear = () => {
    const updated = [...slots];
    updated[activeSlot] = null;
    onSetDestaques(updated);
    setActiveSlot(null);
    setSearch('');
  };

  return (
    <div className="wsp-card wsp-card--wide">
      <div className="wsp-card-header">
        <Heart size={16} className="wsp-card-icon" />
        <h3>Destaques</h3>
      </div>

      <div className="wsp-destaques-grid">
        {slots.map((obraId, i) => {
          const obra = obraId ? obras.find(o => o.id === obraId) ?? null : null;
          return (
            <DestaqueSlot
              key={i}
              obra={obra}
              active={activeSlot === i}
              onView={() => onViewDetail(obra)}
              onEdit={() => handleEditSlot(i)}
            />
          );
        })}
      </div>

      {activeSlot !== null && (
        <div className="wsp-destaque-picker">
          <div className="wsp-destaque-picker-header">
            <input
              className="wsp-destaque-search"
              placeholder="Buscar obra pelo nome…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
            {slots[activeSlot] && (
              <button className="wsp-destaque-clear" onClick={handleClear}>
                Remover
              </button>
            )}
          </div>
          <div className="wsp-destaque-picker-list">
            {options.length > 0 ? (
              options.slice(0, 30).map(obra => (
                <button
                  key={obra.id}
                  className="wsp-destaque-option"
                  onClick={() => handlePick(obra.id)}
                >
                  <span className="wsp-destaque-option-name">{obra.nome}</span>
                  {obra.notaUsuario > 0 && (
                    <span className="wsp-destaque-option-rating">
                      <Star size={10} />
                      {obra.notaUsuario}
                    </span>
                  )}
                </button>
              ))
            ) : (
              <p className="wsp-empty">Nenhuma obra encontrada</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DestaqueSlot({ obra, active, onView, onEdit }) {
  const coverUrl = useCover(obra ?? EMPTY_OBRA);
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`wsp-destaque-slot${active ? ' active' : ''}`}>
      <button
        className="wsp-destaque-cover-btn"
        onClick={obra ? onView : onEdit}
        title={obra ? obra.nome : 'Escolher obra'}
      >
        {obra && coverUrl && !imgError ? (
          <img
            src={coverUrl}
            alt={obra.nome}
            className="wsp-destaque-cover"
            onError={() => setImgError(true)}
          />
        ) : obra ? (
          <div className="wsp-destaque-cover wsp-destaque-cover--empty">
            {obra.nome.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="wsp-destaque-cover wsp-destaque-cover--placeholder">
            <Plus size={20} />
          </div>
        )}
        {obra && <span className="wsp-destaque-name">{obra.nome}</span>}
      </button>

      <button
        className="wsp-destaque-edit-btn"
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        title={obra ? 'Trocar destaque' : 'Escolher obra'}
      >
        <Pencil size={11} />
      </button>
    </div>
  );
}

// ─── ATIVIDADE RECENTE ──────────────────────────────────────

const ACTIVITY_META = {
  chapter_read:    { icon: BookOpen,   label: 'Leu um novo capítulo',     cls: 'wsp-recent-icon--blue' },
  chapter_changed: { icon: Hash,       label: 'Alterou o capítulo atual', cls: 'wsp-recent-icon--purple' },
  added:           { icon: PlusCircle, label: 'Adicionado à biblioteca',  cls: 'wsp-recent-icon--green' },
  removed:         { icon: Trash2,     label: 'Removido da biblioteca',   cls: 'wsp-recent-icon--red' },
  status_changed:  { icon: RefreshCw,  label: 'Status alterado',          cls: 'wsp-recent-icon--yellow' },
};

/**
 * Item de atividade — mostra o que aconteceu com a obra, o status
 * atual dela (quando ainda existe) e há quanto tempo ocorreu.
 */
function ActivityItem({ entry, obras, config, onViewDetail }) {
  const meta = ACTIVITY_META[entry.type] ?? ACTIVITY_META.chapter_read;
  const Icon = meta.icon;
  const obra = obras.find(o => o.id === entry.obraId) ?? null;
  const coverUrl = useCover(obra ?? EMPTY_OBRA);
  const [imgError, setImgError] = useState(false);

  const statusInfo = entry.statusUsuario
    ? config?.statusLeitura?.find(s => s.id === entry.statusUsuario)
    : null;

  const detailText = entry.detail ? `${meta.label} · ${entry.detail}` : meta.label;

  const Tag = obra ? 'button' : 'div';

  return (
    <Tag
      className={`wsp-recent-item${!obra ? ' wsp-recent-item--disabled' : ''}`}
      {...(obra ? { onClick: () => onViewDetail(obra) } : {})}
    >
      <div className="wsp-recent-avatar">
        {obra && coverUrl && !imgError ? (
          <img
            src={coverUrl}
            alt={entry.obraNome}
            className="wsp-recent-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="wsp-recent-cover wsp-recent-cover--empty">
            {entry.obraNome.charAt(0).toUpperCase()}
          </div>
        )}
        <span className={`wsp-recent-badge ${meta.cls}`}>
          <Icon size={11} />
        </span>
      </div>
      <div className="wsp-recent-info">
        <span className="wsp-recent-name">
          <span className="wsp-recent-name-text">{entry.obraNome}</span>
          {statusInfo && (
            <span className="wsp-recent-status" style={{ color: statusInfo.color }}>
              {statusInfo.label}
            </span>
          )}
        </span>
        <span className="wsp-recent-detail">{detailText}</span>
      </div>
      <span className="wsp-recent-time">{formatTimeAgo(entry.timestamp)}</span>
    </Tag>
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
