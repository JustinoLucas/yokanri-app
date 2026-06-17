import { useEffect, useState } from 'react';
import { getVersion } from '@tauri-apps/api/app';
import {
  Library,
  Calendar,
  BarChart3,
  Bookmark,
  Layers,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

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
 *   colecoes         — lista de coleções do usuário [{ id, nome, obraIds }]
 *   activeColecaoId  — id da coleção atualmente aberta (ou null)
 *   onNavigateColecao — (id: string) => void
 *   onCreateColecao  — () => void
 */
function Sidebar({
  activePage = 'library',
  workspace,
  obraCount = 0,
  onNavigate,
  colecoes = [],
  activeColecaoId = null,
  onNavigateColecao,
  onCreateColecao,
}) {
  const { t } = useLanguage();
  const initials = workspace?.name
    ? workspace.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'YK';

  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    getVersion().then(setAppVersion).catch(() => {});
  }, []);

  return (
    <aside className="sidebar">
      {/* Workspace header */}
      <div className="sidebar-ws-header">
        <span className="sidebar-ws-eyebrow">{t('sidebar_workspace_eyebrow')}</span>
        <div className="sidebar-ws-name">
          <span className="sidebar-ws-badge">{initials}</span>
          {workspace?.name || 'Workspace'}
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <NavItem
          icon={Library}
          label={t('sidebar_library')}
          active={activePage === 'library'}
          onClick={() => onNavigate('library')}
        />
        <NavItem
          icon={Bookmark}
          label={t('sidebar_profile')}
          active={activePage === 'profile'}
          onClick={() => onNavigate('profile')}
        />
        <NavItem
          icon={Calendar}
          label={t('sidebar_calendar')}
          active={activePage === 'calendar'}
          onClick={() => onNavigate('calendar')}
        />
        <NavItem
          icon={BarChart3}
          label={t('sidebar_stats')}
          active={activePage === 'stats'}
          onClick={() => onNavigate('stats')}
        />

        <div className="sidebar-divider" />

        {/* Colecoes */}
        <SectionLabel>{t('sidebar_collections')}</SectionLabel>
        {colecoes.map(colecao => (
          <NavItem
            key={colecao.id}
            icon={Layers}
            label={colecao.nome}
            count={colecao.obraIds?.length ?? 0}
            active={activeColecaoId === colecao.id}
            onClick={() => onNavigateColecao?.(colecao.id)}
          />
        ))}
        <NavItem icon={Plus} label={t('sidebar_new_collection')} muted onClick={() => onCreateColecao(t('collection_new_name'))} />
      </nav>

      {/* Footer — sync status */}
      <div className="sidebar-footer">
        <span className="sidebar-footer-dot" />
        <span className="sidebar-footer-text">
          Yokanri {appVersion && `v${appVersion}`}
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
