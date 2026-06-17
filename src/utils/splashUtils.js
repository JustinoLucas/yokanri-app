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
 * Textos do splash por idioma.
 * Devem ser strings simples — sem React, sem i18n, rodamos antes do React montar.
 * Chave de localStorage: 'yokanri-language'
 */
const SPLASH_TEXTS = {
  'pt-BR': {
    INITIALIZING: 'Iniciando...',
    CHECKING:     'Verificando...',
    WORKSPACE:    'Carregando workspace...',
    DATA:         'Carregando biblioteca...',
    SETTINGS:     'Carregando configurações...',
    ERROR:        'Erro ao inicializar. Reinicie o aplicativo.',
  },
  'en': {
    INITIALIZING: 'Starting...',
    CHECKING:     'Checking...',
    WORKSPACE:    'Loading workspace...',
    DATA:         'Loading library...',
    SETTINGS:     'Loading settings...',
    ERROR:        'Error initializing. Please restart the application.',
  },
  'es': {
    INITIALIZING: 'Iniciando...',
    CHECKING:     'Verificando...',
    WORKSPACE:    'Cargando espacio de trabajo...',
    DATA:         'Cargando biblioteca...',
    SETTINGS:     'Cargando configuración...',
    ERROR:        'Error al inicializar. Reinicia la aplicación.',
  },
  'ja': {
    INITIALIZING: '起動中...',
    CHECKING:     '確認中...',
    WORKSPACE:    'ワークスペースを読み込み中...',
    DATA:         'ライブラリを読み込み中...',
    SETTINGS:     '設定を読み込み中...',
    ERROR:        '初期化エラー。アプリを再起動してください。',
  },
};

function getLang() {
  try { return localStorage.getItem('yokanri-language') || 'pt-BR'; } catch { return 'pt-BR'; }
}

export function getSplashText(key) {
  const lang = getLang();
  return (SPLASH_TEXTS[lang] ?? SPLASH_TEXTS['pt-BR'])[key] ?? '';
}

// Mantido para retrocompatibilidade — usa idioma detectado dinamicamente
export const SPLASH_STATUS = {
  get INITIALIZING() { return getSplashText('INITIALIZING'); },
  get CHECKING()     { return getSplashText('CHECKING'); },
  get WORKSPACE()    { return getSplashText('WORKSPACE'); },
  get DATA()         { return getSplashText('DATA'); },
  get SETTINGS()     { return getSplashText('SETTINGS'); },
  get READY()        { return ''; },
  get ERROR()        { return getSplashText('ERROR'); },
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
