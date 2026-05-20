import { Plus, RefreshCw, ArrowLeft } from 'lucide-react';
import WorkspaceMenu from '../WorkspaceMenu';
import './Header.css';

function Header({ workspace, onNewObra, onRefresh, onShowStats, onShowConfig, onShowProfile, showBackButton, onBack, onWorkspaceChange }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          {showBackButton && (
            <button className="btn-icon" onClick={onBack} title="Voltar">
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="header-title">Yokanri</h1>
        </div>

        <div className="header-actions">
          <button className="btn-icon" onClick={onRefresh} title="Recarregar dados">
            <RefreshCw size={18} />
          </button>
          <button className="btn-expandable" onClick={onNewObra}>
            <Plus size={18} />
            <span className="btn-expandable-text">Adicionar</span>
          </button>
          <WorkspaceMenu
            workspace={workspace}
            onShowStats={onShowStats}
            onShowConfig={onShowConfig}
            onShowProfile={onShowProfile}
            onWorkspaceChange={onWorkspaceChange}
          />
        </div>
      </div>
    </header>
  );
}

export default Header;
