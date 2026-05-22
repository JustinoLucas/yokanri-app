/**
 * useOnboarding — State machine do fluxo de onboarding
 *
 * Fluxo Core (3 passos visuais):
 *   WELCOME → EDITION → WORKSPACE
 *
 * Fluxo Supporter (4 passos visuais):
 *   WELCOME → EDITION → SUPPORTER → WORKSPACE
 *
 * Uso:
 *   const ob = useOnboarding();
 *   ob.step        // passo atual (0–3)
 *   ob.language    // idioma selecionado
 *   ob.isSupporter // true se escolheu Supporter
 */

import { useState, useCallback } from 'react';
import * as onboardingService from '../services/onboardingService';

// ─── Constantes de passo ────────────────────────────────

export const STEPS = {
  WELCOME:   0,
  EDITION:   1,
  SUPPORTER: 2,
  WORKSPACE: 3,
};

// ─── Hook ───────────────────────────────────────────────

export function useOnboarding() {
  const [step, setStep] = useState(STEPS.WELCOME);
  const [language, setLanguageState] = useState('pt-BR');
  const [isSupporter, setIsSupporter] = useState(false);
  const [supporterCode, setSupporterCode] = useState(null);

  // ── Ações ─────────────────────────────────────────────

  /**
   * Troca o idioma e persiste no onboarding.json.
   * (Não avança de passo — só atualiza a preferência)
   */
  const setLanguage = useCallback(async (lang) => {
    setLanguageState(lang);
    try {
      await onboardingService.saveLanguage(lang);
    } catch {
      // Falha silenciosa — idioma fica em memória e será salvo no markCompleted
    }
  }, []);

  /** Step 1 → Step 2 */
  const goToEdition = useCallback(() => {
    setStep(STEPS.EDITION);
  }, []);

  /** Step 2 → Step 4 (Core) */
  const chooseCore = useCallback(() => {
    setIsSupporter(false);
    setSupporterCode(null);
    setStep(STEPS.WORKSPACE);
  }, []);

  /** Step 2 → Step 3 (Supporter) */
  const chooseSupporter = useCallback(() => {
    setIsSupporter(true);
    setStep(STEPS.SUPPORTER);
  }, []);

  /** Step 3 → Step 4 (código validado) */
  const confirmSupporterCode = useCallback(async (code) => {
    setSupporterCode(code);
    try {
      await onboardingService.activateSupporter(code);
    } catch {
      // Persiste em memória — markCompleted salva tudo no final
    }
    setStep(STEPS.WORKSPACE);
  }, []);

  /** Step 3 → Step 4 (pulou o código, volta para Core) */
  const skipSupporterCode = useCallback(() => {
    setIsSupporter(false);
    setSupporterCode(null);
    setStep(STEPS.WORKSPACE);
  }, []);

  /**
   * Volta um passo.
   * Leva em conta o fluxo (Supporter tem step extra).
   */
  const back = useCallback(() => {
    setStep(prev => {
      if (prev === STEPS.WORKSPACE) {
        return isSupporter ? STEPS.SUPPORTER : STEPS.EDITION;
      }
      if (prev === STEPS.SUPPORTER) return STEPS.EDITION;
      if (prev === STEPS.EDITION)   return STEPS.WELCOME;
      return prev;
    });
  }, [isSupporter]);

  // ── Progresso visual ──────────────────────────────────

  /**
   * Número de passos visuais totais.
   * Core: 3 (Welcome, Edition, Workspace)
   * Supporter: 4 (Welcome, Edition, Supporter Code, Workspace)
   */
  const totalVisualSteps = isSupporter ? 4 : 3;

  /**
   * Índice visual do passo atual (1-based para exibição).
   * O passo SUPPORTER só aparece no fluxo Supporter.
   */
  const currentVisualStep = (() => {
    if (step === STEPS.WELCOME)   return 1;
    if (step === STEPS.EDITION)   return 2;
    if (step === STEPS.SUPPORTER) return 3; // só chegamos aqui se isSupporter=true
    if (step === STEPS.WORKSPACE) return isSupporter ? 4 : 3;
    return 1;
  })();

  return {
    // Estado
    step,
    language,
    isSupporter,
    supporterCode,
    // Progresso visual
    currentVisualStep,
    totalVisualSteps,
    // Ações
    setLanguage,
    goToEdition,
    chooseCore,
    chooseSupporter,
    confirmSupporterCode,
    skipSupporterCode,
    back,
  };
}
