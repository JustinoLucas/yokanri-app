import Topbar from './Topbar';
import Sidebar from './Sidebar';
import './AppShell.css';

/**
 * AppShell V3F — Layout principal do app
 *
 * Estrutura:
 *   ┌──────────────────────────────────────┐
 *   │             Topbar (48px)            │
 *   ├──────────┬───────────────────────────┤
 *   │ Sidebar  │                           │
 *   │ (216px)  │      Main Content         │
 *   │          │                           │
 *   └──────────┴───────────────────────────┘
 *
 * Props:
 *   workspace      — workspace ativo
 *   activePage     — pagina atual para highlight na sidebar
 *   obraCount      — total de obras
 *   onNavigate     — (page) => void
 *   onNewObra      — criar nova obra
 *   onShowStats    — ir para stats
 *   onShowConfig   — ir para config
 *   workspaceMenu  — ReactNode do WorkspaceMenu (com dropdown completo)
 *   colecoes        — lista de coleções do usuário
 *   activeColecaoId — id da coleção atualmente aberta (ou null)
 *   onNavigateColecao — (id) => void
 *   onCreateColecao — () => void
 *   children       — conteudo principal
 */
function AppShell({
  workspace,
  activePage,
  obraCount,
  onNavigate,
  onNewObra,
  onShowStats,
  onShowConfig,
  workspaceMenu,
  obras,
  onNavigateObra,
  colecoes,
  activeColecaoId,
  onNavigateColecao,
  onCreateColecao,
  children,
}) {
  return (
    <div className="app-shell">
      <Topbar
        onNewObra={onNewObra}
        onShowStats={onShowStats}
        onShowConfig={onShowConfig}
        workspaceMenu={workspaceMenu}
        obras={obras}
        onNavigate={onNavigateObra}
      />
      <div className="app-shell-body">
        <Sidebar
          activePage={activePage}
          workspace={workspace}
          obraCount={obraCount}
          onNavigate={onNavigate}
          colecoes={colecoes}
          activeColecaoId={activeColecaoId}
          onNavigateColecao={onNavigateColecao}
          onCreateColecao={onCreateColecao}
        />
        <main className="app-shell-main">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;
