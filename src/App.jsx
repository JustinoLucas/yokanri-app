import { useState, useEffect } from 'react';
import Header from './components/Header';
import ReleasesToday from './components/ReleasesToday';
import ObraList from './components/ObraList';
import ObraForm from './components/ObraForm';
import ObraDetail from './components/ObraDetail/index';
import Statistics from './components/Statistics';
import Configuracoes from './components/Configuracoes';
import WorkspaceProfile from './components/WorkspaceProfile';
import storage from './services/storage/storageService';
import { useMigration } from './components/ObraForm/hooks/useMigration'; // ⚠️ REMOVER NA v4.0
import { calculateStatusDateUpdates } from './utils/statusDateHelpers';
import { useConfiguracoes } from './hooks/useConfiguracoes';
import { ConfigProvider } from './context/ConfigContext';
import './App.css';

function App() {
  const [obras, setObras] = useState([]);
  const [ready, setReady] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [currentView, setCurrentView] = useState('list');
  const [selectedObra, setSelectedObra] = useState(null);
  const [loading, setLoading] = useState(false);

  // ⚠️ REMOVER NA v4.0 - Hook de migração centralizada (apenas para dados antigos)
  const { migrateObraData } = useMigration();

  const saveData = async (updatedManwhas) => {
    try {
      await storage.saveObras(updatedManwhas);
      setObras(updatedManwhas);
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      alert('Erro ao salvar dados.');
      return false;
    }
  };

  const { config, addItem, renameItem, deleteItem, updateColor, toggleHideSchedule } = useConfiguracoes(obras, saveData, ready);

  // Inicialização do app — roda uma vez
  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      // Inicializa workspaces e define o ativo
      const workspace = await storage.init();
      setActiveWorkspace(workspace);
      setReady(true);
      loadData();
    } catch (error) {
      console.error('Erro ao inicializar o app:', error);
      alert('Erro ao inicializar o armazenamento. Reinicie o aplicativo.');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await storage.loadObras();
      // ⚠️ REMOVER NA v4.0 - Migra todos os obras para o novo formato (apenas para dados antigos)
      const migratedData = data.map(migrateObraData);
      setObras(migratedData);
      // ⚠️ NA v4.0 substituir por: setObras(data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddManwha = (newManwha) => {
    const updatedManwhas = [...obras, newManwha];
    saveData(updatedManwhas);
    setCurrentView('list');
  };

  const handleUpdateManwha = (updatedManwha) => {
    const updatedManwhas = obras.map(m =>
      m.id === updatedManwha.id ? updatedManwha : m
    );
    saveData(updatedManwhas);
    setCurrentView('list');
  };

  const handleDeleteManwha = async (id) => {
    const obra = obras.find(m => m.id === id);

    if (!confirm(`Tem certeza que deseja excluir "${obra.nome}"?`)) {
      return;
    }

    if (Array.isArray(obra.capas) && obra.capas.length > 0) {
      for (const capa of obra.capas) {
        if (capa.local && capa.nome) {
          await storage.deleteCover(capa.nome);
        }
      }
    }

    const updatedManwhas = obras.filter(m => m.id !== id);
    saveData(updatedManwhas);
    setCurrentView('list');
  };

  const handleViewDetail = (obra) => {
    setSelectedObra(obra);
    setCurrentView('detail');
  };

  const handleEditManwha = (obra) => {
    setSelectedObra(obra);
    setCurrentView('form');
  };

  const handleNewManwha = () => {
    setSelectedObra(null);
    setCurrentView('form');
  };

  const handleBackToList = () => {
    setSelectedObra(null);
    setCurrentView('list');
  };

  const handleShowStats = () => setCurrentView('stats');
  const handleShowConfig = () => setCurrentView('config');
  const handleShowProfile = () => setCurrentView('profile');

  const handleWorkspaceChange = (newWorkspace) => {
    setActiveWorkspace(newWorkspace);
    setCurrentView('list');
    setSelectedObra(null);
    loadData();
  };

  const handleQuickUpdate = async (id, updates) => {
    const updatedManwhas = obras.map(m => {
      if (m.id !== id) return m;

      let dateUpdates = {};
      if (updates.statusUsuario && updates.statusUsuario !== m.statusUsuario) {
        dateUpdates = calculateStatusDateUpdates(m, updates.statusUsuario, m.statusUsuario, config);
      }

      return {
        ...m,
        ...updates,
        ...dateUpdates,
        dataAtualizado: new Date().toISOString()
      };
    });
    await saveData(updatedManwhas);
  };

  // Enquanto o storage não inicializou, mostra loading
  if (!ready) {
    return (
      <div className="app">
        <div className="loading">Iniciando Yokanri...</div>
      </div>
    );
  }

  return (
    <ConfigProvider config={config}>
      <div className="app">
        <Header
          workspace={activeWorkspace}
          onNewObra={handleNewManwha}
          onRefresh={loadData}
          onShowStats={handleShowStats}
          onShowConfig={handleShowConfig}
          onShowProfile={handleShowProfile}
          showBackButton={currentView !== 'list'}
          onBack={handleBackToList}
          onWorkspaceChange={handleWorkspaceChange}
        />

        <main className="main-content">
          {loading ? (
            <div className="loading">Carregando...</div>
          ) : (
            <>
              {currentView === 'list' && (
                <>
                  <ReleasesToday
                    obras={obras}
                    onViewDetail={handleViewDetail}
                    onEdit={handleEditManwha}
                    onDelete={handleDeleteManwha}
                    onQuickUpdate={handleQuickUpdate}
                  />
                  <ObraList
                    obras={obras}
                    config={config}
                    onViewDetail={handleViewDetail}
                    onEdit={handleEditManwha}
                    onDelete={handleDeleteManwha}
                    onQuickUpdate={handleQuickUpdate}
                  />
                </>
              )}

              {currentView === 'form' && (
                <ObraForm
                  obra={selectedObra}
                  config={config}
                  onSave={selectedObra ? handleUpdateManwha : handleAddManwha}
                  onCancel={handleBackToList}
                />
              )}

              {currentView === 'detail' && selectedObra && (
                <ObraDetail
                  obra={selectedObra}
                  onEdit={() => handleEditManwha(selectedObra)}
                  onDelete={() => handleDeleteManwha(selectedObra.id)}
                  onClose={handleBackToList}
                />
              )}

              {currentView === 'stats' && (
                <Statistics obras={obras} />
              )}

              {currentView === 'config' && (
                <Configuracoes
                  config={config}
                  obras={obras}
                  onAdd={addItem}
                  onRename={renameItem}
                  onDelete={deleteItem}
                  onUpdateColor={updateColor}
                  onToggleHideSchedule={toggleHideSchedule}
                />
              )}

              {currentView === 'profile' && (
                <WorkspaceProfile
                  workspace={activeWorkspace}
                  obras={obras}
                  onShowStats={handleShowStats}
                  onShowConfig={handleShowConfig}
                  onViewDetail={handleViewDetail}
                />
              )}
            </>
          )}
        </main>
      </div>
    </ConfigProvider>
  );
}

export default App;
