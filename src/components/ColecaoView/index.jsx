import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ImagePlus, Trash2, Plus, Pencil, X, AlertTriangle } from 'lucide-react';
import ObraCard from '../ObraCard';
import storage from '../../services/storage/storageService';
import ColecaoPickerModal from '../ColecaoPickerModal';
import './ColecaoView.css';

const BANNER_RECOMMENDED_SIZE = '1500x400px';

/**
 * ColecaoView — Página dedicada de uma coleção do usuário
 *
 * Banner customizável + título editável, com grade de obras
 * adicionadas pelo usuário (via modal de seleção).
 */
function ColecaoView({ colecao, obras, onClose, onRename, onSetBanner, onSetObraIds, onDelete, onViewDetail, onQuickUpdate }) {
  const banner = colecao.banner ?? null;
  const bannerFileName = banner?.fileName ?? null;
  const [bannerUrl, setBannerUrl] = useState(null);
  const [previewPositionY, setPreviewPositionY] = useState(null);
  const bannerInputRef = useRef(null);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(colecao.nome);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    setTitleDraft(colecao.nome);
  }, [colecao.id, colecao.nome]);

  useEffect(() => {
    if (!bannerFileName) {
      setBannerUrl(null);
      return;
    }
    let cancelled = false;
    storage.loadCover(bannerFileName).then(url => {
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
    const fileName = `colecao-banner-${Date.now()}.${extension}`;
    await storage.saveCover(file, fileName);

    if (bannerFileName) {
      await storage.deleteCover(bannerFileName);
    }

    setPreviewPositionY(null);
    onSetBanner(colecao.id, { fileName, positionY: 50 });
  };

  const handleRemoveBanner = async () => {
    if (bannerFileName) {
      await storage.deleteCover(bannerFileName);
    }
    setPreviewPositionY(null);
    onSetBanner(colecao.id, null);
  };

  const handlePositionInput = (e) => {
    setPreviewPositionY(Number(e.target.value));
  };

  const handlePositionCommit = (e) => {
    const value = Number(e.target.value);
    setPreviewPositionY(null);
    onSetBanner(colecao.id, { ...banner, positionY: value });
  };

  const handleTitleCommit = () => {
    setEditingTitle(false);
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== colecao.nome) {
      onRename(colecao.id, trimmed);
    } else {
      setTitleDraft(colecao.nome);
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') handleTitleCommit();
    if (e.key === 'Escape') {
      setTitleDraft(colecao.nome);
      setEditingTitle(false);
    }
  };

  const handleDeleteColecao = () => {
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    setConfirmDeleteOpen(false);
    onDelete(colecao.id);
    onClose();
  };

  const handleRemoveObra = (obraId) => {
    onSetObraIds(colecao.id, colecao.obraIds.filter(id => id !== obraId));
  };

  const handlePickerConfirm = (selectedIds) => {
    const merged = [...new Set([...colecao.obraIds, ...selectedIds])];
    onSetObraIds(colecao.id, merged);
    setPickerOpen(false);
  };

  const colecaoObras = colecao.obraIds
    .map(id => obras.find(o => o.id === id))
    .filter(Boolean);

  return (
    <div className="colv-v3f">

      {/* ── Back bar ──────────────────────────────────────── */}
      <div className="colv-bar">
        {onClose && (
          <button className="colv-bar-back" onClick={onClose}>
            <ArrowLeft size={13} />
            Biblioteca
          </button>
        )}
        <div className="colv-bar-divider" />
        <span className="colv-bar-title">Coleção</span>
        <button className="colv-bar-delete" onClick={handleDeleteColecao} title="Excluir coleção">
          <Trash2 size={13} />
        </button>
      </div>

      {/* ── Scrollable content ────────────────────────────── */}
      <div className="colv-scroll">

        {/* ─── BANNER + TÍTULO ─────────────────────────── */}
        <div className="colv-banner">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt=""
              className="colv-banner-img"
              style={{ objectPosition: `center ${positionY}%` }}
            />
          ) : null}
          <div className={`colv-banner-gradient${bannerUrl ? ' colv-banner-gradient--image' : ''}`} />

          <div className="colv-banner-actions">
            <button className="colv-banner-action-btn" onClick={handleBannerPick}>
              <ImagePlus size={13} />
              {bannerUrl ? 'Alterar banner' : 'Adicionar banner'}
            </button>
            {bannerUrl && (
              <button
                className="colv-banner-action-btn colv-banner-action-btn--icon colv-banner-action-btn--danger"
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
            className="colv-banner-file-input"
            onChange={handleBannerFileChange}
          />

          {bannerUrl && (
            <div className="colv-banner-position">
              <span className="colv-banner-position-label">Posição</span>
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

          <div className="colv-identity-row">
            {editingTitle ? (
              <input
                className="colv-title-input"
                value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                onBlur={handleTitleCommit}
                onKeyDown={handleTitleKeyDown}
                autoFocus
              />
            ) : (
              <h1 className="colv-title" onClick={() => setEditingTitle(true)} title="Clique para renomear">
                {colecao.nome}
                <Pencil size={14} className="colv-title-edit-icon" />
              </h1>
            )}
            <p className="colv-meta">{colecaoObras.length} obra{colecaoObras.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="colv-page">

          {/* ─── TOOLBAR ─────────────────────────────────── */}
          <div className="colv-toolbar">
            <button className="colv-add-btn" onClick={() => setPickerOpen(true)}>
              <Plus size={14} />
              Adicionar obras
            </button>
          </div>

          {/* ─── GRADE DE OBRAS ──────────────────────────── */}
          {colecaoObras.length > 0 ? (
            <div className="obra-list grid colv-grid">
              {colecaoObras.map(obra => (
                <div className="colv-grid-item" key={obra.id}>
                  <button
                    className="colv-remove-btn"
                    onClick={() => handleRemoveObra(obra.id)}
                    title="Remover da coleção"
                  >
                    <X size={13} />
                  </button>
                  <ObraCard
                    obra={obra}
                    viewMode="grid"
                    onViewDetail={() => onViewDetail(obra)}
                    onQuickUpdate={onQuickUpdate}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="colv-empty">
              <p>Nenhuma obra nesta coleção ainda.</p>
              <button className="colv-add-btn" onClick={() => setPickerOpen(true)}>
                <Plus size={14} />
                Adicionar obras
              </button>
            </div>
          )}

        </div>
      </div>

      {pickerOpen && (
        <ColecaoPickerModal
          obras={obras}
          selectedIds={colecao.obraIds}
          onClose={() => setPickerOpen(false)}
          onConfirm={handlePickerConfirm}
        />
      )}

      {confirmDeleteOpen && (
        <div className="colv-confirm-overlay" onClick={() => setConfirmDeleteOpen(false)}>
          <div className="colv-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="colv-confirm-icon">
              <AlertTriangle size={22} />
            </div>
            <h2 className="colv-confirm-title">Excluir coleção</h2>
            <p className="colv-confirm-text">
              Tem certeza que deseja excluir a coleção <strong>{colecao.nome}</strong>?
              As obras não serão removidas da sua biblioteca.
            </p>
            <div className="colv-confirm-actions">
              <button className="colv-confirm-btn colv-confirm-btn--ghost" onClick={() => setConfirmDeleteOpen(false)}>
                Cancelar
              </button>
              <button className="colv-confirm-btn colv-confirm-btn--danger" onClick={handleConfirmDelete}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ColecaoView;
