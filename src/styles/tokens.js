/**
 * V3F Design Tokens — JS export
 *
 * Uso: quando componentes precisam de valores de token em JS (ex: inline styles,
 * canvas, ou logica condicional baseada em tema).
 *
 * Para a maioria dos casos, use CSS variables diretamente nos estilos.
 * Este arquivo e para casos especiais onde CSS vars nao sao acessiveis.
 */

export const STATUS_TOKENS = {
  dark: {
    reading:   { label: 'Lendo',       fg: '#6ee7b7', bg: 'rgba(110,231,183,0.10)', dot: '#34d399' },
    completed: { label: 'Completo',    fg: '#a5b4fc', bg: 'rgba(165,180,252,0.12)', dot: '#818cf8' },
    paused:    { label: 'Pausado',     fg: '#fcd34d', bg: 'rgba(252,211,77,0.10)',  dot: '#fbbf24' },
    dropped:   { label: 'Dropado',     fg: '#fca5a5', bg: 'rgba(252,165,165,0.10)', dot: '#f87171' },
    planned:   { label: 'Planeja ler', fg: '#cbd5e1', bg: 'rgba(203,213,225,0.08)', dot: '#94a3b8' },
  },
  light: {
    reading:   { label: 'Lendo',       fg: '#0a7a54', bg: 'rgba(10,122,84,0.08)',   dot: '#0d9467' },
    completed: { label: 'Completo',    fg: '#4b5bd6', bg: 'rgba(75,91,214,0.10)',   dot: '#5b6bbf' },
    paused:    { label: 'Pausado',     fg: '#a07010', bg: 'rgba(160,112,16,0.10)',  dot: '#b08920' },
    dropped:   { label: 'Dropado',     fg: '#c04040', bg: 'rgba(192,64,64,0.08)',   dot: '#c84040' },
    planned:   { label: 'Planeja ler', fg: '#5a7080', bg: 'rgba(90,112,128,0.08)', dot: '#6a808d' },
  },
};

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
};

export const RADII = {
  sharp: 0,
  2: 2,
  4: 4,
  6: 6,
  8: 8,
  10: 10,
  14: 14,
  pill: 999,
};

export const DURATION = {
  instant:  80,
  quick:    160,
  standard: 240,
  slow:     360,
};

export const EASE_OUT = 'cubic-bezier(0.2, 0.7, 0.2, 1)';

/**
 * Retorna os status tokens de acordo com o tema atual.
 * @param {'dark'|'light'} theme
 */
export function getStatusTokens(theme = 'dark') {
  return STATUS_TOKENS[theme] || STATUS_TOKENS.dark;
}
