import { useState, useEffect, useRef } from 'react';
import {
  BarChart3,
  Settings,
  Plus,
  ArrowLeftRight,
  Pencil,
  Trash2,
  Download,
  Upload,
  FolderOpen,
  ChevronDown,
  Library,
  Check,
  User,
} from 'lucide-react';
import storage from '../../services/storage/storageService';
import './WorkspaceMenu.css';

/**
 * WorkspaceMenu — Menu de perfil/workspace no canto superior direito
 *
 * Mostra o workspace ativo e abre um dropdown com:
 * - Meu Perfil (dashboard do workspace)
 * - Estatísticas, Configurações
 * - CRUD de workspaces
 * - Futuras opções (export, import, temas)
 */
function WorkspaceMenu({ workspace, onShowStats, onShowConfig, onShowProfile, onWorkspaceChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeAll();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Foca o input quando abre
  useEffect(() => {
    if ((isCreating || isRenaming) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating, isRenaming]);

  const closeAll = () => {
    setIsOpen(false);
    setShowSwitcher(false);
    setIsCreating(false);
    setIsRenaming(false);
    setInputValue('');
  };

  const toggleMenu = () => {
    if (isOpen) {
      closeAll();
    } else {
      setIsOpen(true);
    }
  };

  const handleMenuAction = (action) => {
    closeAll();
    action();
  };

  // ─── WORKSPACE CRUD ─────────────────────────────────

  const handleOpenSwitcher = async () => {
    const list = await storage.listWorkspaces();
    setWorkspaces(list);
    setShowSwitcher(true);
  };

  const handleSwitchWorkspace = async (ws) => {
    if (ws.id === workspace.id) {
      closeAll();
      return;
    }
    await storage.switchWorkspace(ws.id);
    closeAll();
    onWorkspaceChange(ws);
  };

  const handleStartCreate = () => {
    setShowSwitcher(false);
    setIsCreating(true);
    setInputValue('');
  };

  const handleCreate = async () => {
    const name = inputValue.trim();
    if (!name) return;

    const newWs = await storage.createWorkspace(name);
    await storage.switchWorkspace(newWs.id);
    closeAll();
    onWorkspaceChange(newWs);
  };

  const handleStartRename = () => {
    setIsRenaming(true);
    setInputValue(workspace.name);
  };

  const handleRename = async () => {
    const name = inputValue.trim();
    if (!name || name === workspace.name) {
      setIsRenaming(false);
      setInputValue('');
      return;
    }

    const updated = await storage.renameWorkspace(workspace.id, name);
    closeAll();
    onWorkspaceChange(updated);
  };

  const handleDelete = async () => {
    const list = await storage.listWorkspaces();
    if (list.length <= 1) {
      alert('Não é possível excluir o único workspace.');
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir "${workspace.name}"?\n\nTodos os dados desta biblioteca serão perdidos permanentemente.`)) {
      return;
    }

    await storage.deleteWorkspace(workspace.id);
    const active = await storage.getActiveWorkspace();
    closeAll();
    onWorkspaceChange(active);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (isCreating) handleCreate();
      if (isRenaming) handleRename();
    }
    if (e.key === 'Escape') {
      setIsCreating(false);
      setIsRenaming(false);
      setInputValue('');
    }
  };

  // Gera iniciais para o avatar
  const initials = workspace?.name
    ? workspace.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'YK';

  return (
    <div className="ws-menu" ref={menuRef}>
      {/* Botão trigger */}
      <button className={`ws-trigger ${isOpen ? 'ws-trigger--active' : ''}`} onClick={toggleMenu}>
        <div className="ws-avatar">{initials}</div>
        <span className="ws-trigger-name">{workspace?.name || 'Workspace'}</span>
        <ChevronDown size={14} className={`ws-chevron ${isOpen ? 'ws-chevron--open' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="ws-dropdown">
          {/* Header do dropdown */}
          <div className="ws-dropdown-header">
            <div className="ws-dropdown-avatar">{initials}</div>
            <div className="ws-dropdown-info">
              {isRenaming ? (
                <input
                  ref={inputRef}
                  type="text"
                  className="ws-inline-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  onBlur={handleRename}
                  maxLength={40}
                />
              ) : (
                <span className="ws-dropdown-name">{workspace?.name}</span>
              )}
              <span className="ws-dropdown-label">Workspace ativo</span>
            </div>
          </div>

          <div className="ws-divider" />

          {/* Ações da biblioteca */}
          <div className="ws-section">
            <span className="ws-section-title">Biblioteca</span>
            <button className="ws-item" onClick={() => handleMenuAction(onShowProfile)}>
              <User size={16} />
              <span>Meu Perfil</span>
            </button>
            <button className="ws-item" onClick={() => handleMenuAction(onShowStats)}>
              <BarChart3 size={16} />
              <span>Estatísticas</span>
            </button>
            <button className="ws-item" onClick={() => handleMenuAction(onShowConfig)}>
              <Settings size={16} />
              <span>Configurações</span>
            </button>
          </div>

          <div className="ws-divider" />

          {/* Ações de workspace */}
          <div className="ws-section">
            <span className="ws-section-title">Workspace</span>

            {showSwitcher ? (
              <div className="ws-switcher">
                {workspaces.map(ws => (
                  <button
                    key={ws.id}
                    className={`ws-item ws-switch-item ${ws.id === workspace.id ? 'ws-switch-item--active' : ''}`}
                    onClick={() => handleSwitchWorkspace(ws)}
                  >
                    <Library size={16} />
                    <span>{ws.name}</span>
                    {ws.id === workspace.id && <Check size={14} className="ws-check" />}
                  </button>
                ))}
                <div className="ws-divider" />
                <button className="ws-item ws-item--accent" onClick={handleStartCreate}>
                  <Plus size={16} />
                  <span>Novo workspace</span>
                </button>
              </div>
            ) : isCreating ? (
              <div className="ws-create">
                <input
                  ref={inputRef}
                  type="text"
                  className="ws-inline-input"
                  placeholder="Nome do workspace..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  maxLength={40}
                />
                <div className="ws-create-actions">
                  <button className="ws-btn ws-btn--primary" onClick={handleCreate} disabled={!inputValue.trim()}>
                    Criar
                  </button>
                  <button className="ws-btn ws-btn--ghost" onClick={() => { setIsCreating(false); setInputValue(''); }}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button className="ws-item" onClick={handleOpenSwitcher}>
                  <ArrowLeftRight size={16} />
                  <span>Trocar workspace</span>
                </button>
                <button className="ws-item" onClick={handleStartRename}>
                  <Pencil size={16} />
                  <span>Renomear</span>
                </button>
                <button className="ws-item ws-item--accent" onClick={handleStartCreate}>
                  <Plus size={16} />
                  <span>Novo workspace</span>
                </button>
              </>
            )}
          </div>

          <div className="ws-divider" />

          {/* Ações futuras (disabled) */}
          <div className="ws-section">
            <button className="ws-item" disabled>
              <Download size={16} />
              <span>Exportar biblioteca</span>
              <span className="ws-badge-soon">Em breve</span>
            </button>
            <button className="ws-item" disabled>
              <Upload size={16} />
              <span>Importar biblioteca</span>
              <span className="ws-badge-soon">Em breve</span>
            </button>
            <button className="ws-item" disabled>
              <FolderOpen size={16} />
              <span>Abrir pasta</span>
              <span className="ws-badge-soon">Em breve</span>
            </button>
          </div>

          {/* Danger zone */}
          <div className="ws-divider" />
          <div className="ws-section">
            <button className="ws-item ws-item--danger" onClick={handleDelete}>
              <Trash2 size={16} />
              <span>Excluir workspace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkspaceMenu;
