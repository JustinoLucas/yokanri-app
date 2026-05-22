/**
 * OnboardingApp — Container raiz do fluxo de onboarding
 *
 * Renderiza a tela correta baseado no passo atual do state machine.
 * Exibe barra de progresso (dots) na parte superior.
 *
 * Props:
 *   onComplete {function} (workspace: Object) => void
 *     Chamado pelo StepWorkspace após workspace criado/importado e
 *     onboarding.json marcado como concluído.
 *     O App.jsx usa isso para iniciar o app normalmente.
 */

import { useOnboarding, STEPS } from './hooks/useOnboarding';
import StepWelcome from './steps/StepWelcome';
import StepEdition from './steps/StepEdition';
import StepSupporter from './steps/StepSupporter';
import StepWorkspace from './steps/StepWorkspace';
import './OnboardingApp.css';

function OnboardingApp({ onComplete }) {
  const ob = useOnboarding();

  return (
    <div className="ob-root">
      {/* ── Cabeçalho ────────────────────────────────── */}
      <header className="ob-header">
        <span className="ob-wordmark">Yokanri</span>
        <div className="ob-progress" aria-label="Progresso do setup">
          {Array.from({ length: ob.totalVisualSteps }).map((_, i) => (
            <div
              key={i}
              className={[
                'ob-dot',
                i < ob.currentVisualStep ? 'ob-dot--done' : '',
                i === ob.currentVisualStep - 1 ? 'ob-dot--active' : '',
              ].filter(Boolean).join(' ')}
            />
          ))}
        </div>
      </header>

      {/* ── Área central ─────────────────────────────── */}
      <main className="ob-main">
        <div className="ob-card">
          {ob.step === STEPS.WELCOME && (
            <StepWelcome
              language={ob.language}
              onLanguageChange={ob.setLanguage}
              onNext={ob.goToEdition}
            />
          )}

          {ob.step === STEPS.EDITION && (
            <StepEdition
              language={ob.language}
              onCore={ob.chooseCore}
              onSupporter={ob.chooseSupporter}
              onBack={ob.back}
            />
          )}

          {ob.step === STEPS.SUPPORTER && (
            <StepSupporter
              language={ob.language}
              onConfirm={ob.confirmSupporterCode}
              onSkip={ob.skipSupporterCode}
              onBack={ob.back}
            />
          )}

          {ob.step === STEPS.WORKSPACE && (
            <StepWorkspace
              language={ob.language}
              isSupporter={ob.isSupporter}
              supporterCode={ob.supporterCode}
              onComplete={onComplete}
              onBack={ob.back}
            />
          )}
        </div>
      </main>

      {/* ── Rodapé discreto ──────────────────────────── */}
      <footer className="ob-footer">
        <span>Yokanri v1.0.0</span>
      </footer>
    </div>
  );
}

export default OnboardingApp;
