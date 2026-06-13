import {
  Library,
  Calendar,
  BarChart3,
  Bookmark,
  Heart,
  Layers,
  Plus,
  RefreshCw,
} from 'lucide-react';

/**
 * AppSidebar V3F — 216px lateral de navegação semântica
 *
 * Regra do design: a lateral é navegação pura. Filtros ficam no conteúdo.
 *
 * Props:
 *   activePage       — 'library' | 'calendar' | 'stats' | 'profile'
 *   workspace        — objeto workspace ativo
 *   obraCount        — total de obras na biblioteca
 *   onNavigate       — (page: string) => void
 */
function Sidebar({ activePage = 'library', workspace, obraCount = 0, onNavigate }) {
  const initials = workspace?.name
    ? workspace.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'YK';

  return (
    <aside className="sidebar">
      {/* Workspace header */}
      <div className="sidebar-ws-header">
        <span className="sidebar-ws-eyebrow">espaco de trabalho</span>
        <div className="sidebar-ws-name">
          <span className="sidebar-ws-badge">{initials}</span>
          {workspace?.name || 'Workspace'}
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {/* Principal */}
        <NavItem
          icon={Library}
          label="Biblioteca"
          active={activePage === 'library'}
          onClick={() => onNavigate('library')}
        />
        <NavItem
          icon={Calendar}
          label="Calendario"
          active={activePage === 'calendar'}
          onClick={() => onNavigate('calendar')}
        />

        <div className="sidebar-divider" />

        {/* Colecoes */}
        <SectionLabel>Colecoes</SectionLabel>
        <NavItem dot="#fca5a5" label="Favoritos" count="—" />
        <NavItem icon={Layers} label="Murim / Wuxia" count="—" />
        <NavItem icon={Plus} label="Nova colecao" muted />

        <div className="sidebar-divider" />

        {/* Conta */}
        <NavItem
          icon={BarChart3}
          label="Estatisticas"
          active={activePage === 'stats'}
          onClick={() => onNavigate('stats')}
        />
        <NavItem
          icon={Bookmark}
          label="Meu Perfil"
          active={activePage === 'profile'}
          onClick={() => onNavigate('profile')}
        />
      </nav>

      {/* Footer — sync status */}
      <div className="sidebar-footer">
        <span className="sidebar-footer-dot" />
        <span className="sidebar-footer-text">
          {obraCount} obras · local
        </span>
        <RefreshCw size={11} className="sidebar-footer-icon" />
      </div>
    </aside>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function NavItem({ icon: Icon, dot, label, count, active, muted, onClick }) {
  return (
    <button
      className={`sidebar-nav-item ${active ? 'sidebar-nav-item--active' : ''} ${muted ? 'sidebar-nav-item--muted' : ''}`}
      onClick={onClick}
    >
      {active && <span className="sidebar-nav-indicator" />}
      {dot && <span className="sidebar-nav-dot" style={{ background: dot }} />}
      {Icon && !dot && <Icon size={14} className="sidebar-nav-icon" />}
      <span className="sidebar-nav-label">{label}</span>
      {count != null && <span className="sidebar-nav-count">{count}</span>}
    </button>
  );
}

function SectionLabel({ children }) {
  return <div className="sidebar-section-label">{children}</div>;
}

export default Sidebar;
