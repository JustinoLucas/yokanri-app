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
import * as onboardingService from './onboarding/services/onboardingService';
import OnboardingApp from './onboarding/OnboardingApp';
import { useMigration } from './components/ObraForm/hooks/useMigration'; // ⚠️ REMOVER NA v4.0
import { calculateStatusDateUpdates } from './utils/statusDateHelpers';
import { useConfiguracoes } from './hooks/useConfiguracoes';
import { ConfigProvider } from './context/ConfigContext';
import { setSplashStatus, hideSplash, SPLASH_STATUS } from './utils/splashUtils';
import './App.css';

function App() {
  const [obras, setObras] = useState([]);
  const [ready, setReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(null); // null = ainda verificando
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

  const { config, addItem, renameItem, deleteItem, updateColor, toggleHideSchedule, toggleGenreNsfw, setNsfwMode } = useConfiguracoes(obras, saveData, ready);

  // Inicialização do app — roda uma vez
  useEffect(() => {
    initApp();
  }, []);

  /**
   * Sequência de inicialização do app, com fases visíveis no splash screen.
   *
   * Fluxo:
   *   Fase 1 — Verifica se o onboarding é necessário
   *   Fase 2 — Inicializa o workspace ativo (SQLite, paths)
   *   Fase 3 — Carrega o acervo de obras
   *   Pronto  — Revela o app com fade do splash
   *
   * O HTML splash (#app-splash) cobre o React durante todo o processo,
   * então não há flashes ou estados de loading visíveis ao usuário.
   */
  const initApp = async () => {
    try {
      // ── Fase 1: Verificar onboarding ──────────────────
      setSplashStatus(SPLASH_STATUS.CHECKING);
      const needed = await onboardingService.isNeeded();

      if (needed) {
        // Esconde o splash antes de mostrar o onboarding
        setNeedsOnboarding(true);
        hideSplash();
        return;
      }

      setNeedsOnboarding(false);

      // ── Fase 2: Inicializar workspace ─────────────────
      setSplashStatus(SPLASH_STATUS.WORKSPACE);
      const workspace = await storage.init();
      setActiveWorkspace(workspace);

      // ── Fase 3: Carregar obras ────────────────────────
      setSplashStatus(SPLASH_STATUS.DATA);
      const data = await storage.loadObras();
      // ⚠️ REMOVER NA v4.0 — migração de dados legados
      const migratedData = data.map(migrateObraData);
      setObras(migratedData);

      // ── Pronto: revela o app ──────────────────────────
      // setReady(true) e hideSplash() são chamados juntos:
      // React re-renderiza o app completo "por baixo" durante o fade de 350ms.
      setReady(true);
      hideSplash();
    } catch (error) {
      console.error('Erro ao inicializar o app:', error);
      setSplashStatus(SPLASH_STATUS.ERROR);
      // Não esconde o splash em caso de erro — o usuário vê a mensagem
    }
  };

  /**
   * Chamado pelo OnboardingApp quando o onboarding termina com sucesso.
   * O workspace já está ativo (storage.switchWorkspace foi chamado internamente).
   * O splash já foi escondido antes do onboarding aparecer.
   */
  const handleOnboardingComplete = async (workspace) => {
    setNeedsOnboarding(false);
    setActiveWorkspace(workspace);
    setReady(true);
    loadData(); // Carrega obras do workspace recém-criado/importado
  };

  /**
   * Recarrega o acervo (usado em refresh manual e troca de workspace).
   * Não usada no startup inicial — o initApp carrega diretamente.
   */
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await storage.loadObras();
      // ⚠️ REMOVER NA v4.0 — migração de dados legados
      const migratedData = data.map(migrateObraData);
      setObras(migratedData);
      // ⚠️ NA v4.0 substituir por: setObras(data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados:\n\n' + (error?.message || error));
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

  // Verificação inicial do onboarding ainda não concluída.
  // O HTML splash cobre tudo — o usuário não vê este estado.
  if (needsOnboarding === null || (!needsOnboarding && !ready)) {
    return null; // App monta silenciosamente por baixo do splash
  }

  // Primeiro uso — mostra o onboarding (splash já foi escondido)
  if (needsOnboarding) {
    return <OnboardingApp onComplete={handleOnboardingComplete} />;
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
                  onToggleGenreNsfw={toggleGenreNsfw}
                  onSetNsfwMode={setNsfwMode}
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
