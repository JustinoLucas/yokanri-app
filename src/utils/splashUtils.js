/**
 * splashUtils — Controle do splash screen nativo (HTML)
 *
 * O splash screen (#app-splash) é definido diretamente no index.html
 * e aparece ANTES do React montar. Isso elimina o flash branco ao abrir o app.
 *
 * Essas funções manipulam o DOM diretamente, sem React.
 * São seguras para uso em qualquer contexto: hooks, utils, funções async.
 *
 * Fluxo normal:
 *   1. index.html renderiza #app-splash (visível imediatamente)
 *   2. React monta, começa init silencioso por baixo do splash
 *   3. setSplashStatus() atualiza o texto de status em cada fase
 *   4. hideSplash() anima a saída e remove o elemento do DOM
 *   5. App renderizado aparece sem flash
 */

/**
 * Duração da animação de saída do splash (ms).
 * Deve coincidir com o valor de `transition` no CSS do splash em index.html.
 */
export const SPLASH_HIDE_DURATION = 350;

/**
 * Textos de status para cada fase de inicialização.
 * Centralizados aqui para facilitar internacionalização futura.
 */
export const SPLASH_STATUS = {
  INITIALIZING: 'Iniciando...',
  CHECKING: 'Verificando...',
  WORKSPACE: 'Carregando workspace...',
  DATA: 'Carregando biblioteca...',
  SETTINGS: 'Carregando configurações...',
  READY: '',
  ERROR: 'Erro ao inicializar. Reinicie o aplicativo.',
};

// ─── API pública ─────────────────────────────────────────

/**
 * Atualiza o texto de status visível no splash.
 * Não-op seguro se o splash já foi removido do DOM.
 *
 * @param {string} text - Texto a exibir
 */
export function setSplashStatus(text) {
  const el = document.getElementById('splash-status');
  if (!el) return;
  el.textContent = text;
}

/**
 * Inicia a animação de saída do splash e o remove do DOM ao final.
 *
 * Adiciona a classe CSS `.hiding` (que dispara a transição de opacidade)
 * e após SPLASH_HIDE_DURATION ms remove o elemento completamente.
 *
 * Não-op seguro se o splash já foi removido.
 */
export function hideSplash() {
  const splash = document.getElementById('app-splash');
  if (!splash) return;

  // Inicia fade-out via CSS transition
  splash.classList.add('hiding');

  // Remove do DOM após a transição terminar
  setTimeout(() => {
    if (splash.parentNode) {
      splash.parentNode.removeChild(splash);
    }
  }, SPLASH_HIDE_DURATION + 50); // +50ms de margem para a transition completar
}

/**
 * Verifica se o splash ainda está presente no DOM.
 * Útil para debugging e testes.
 *
 * @returns {boolean}
 */
export function isSplashVisible() {
  return !!document.getElementById('app-splash');
}
