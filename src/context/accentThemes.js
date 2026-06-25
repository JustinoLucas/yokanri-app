/**
 * accentThemes.js — Paletas de cor de destaque do Yokanri
 *
 * Cada tema define o mapa completo de CSS variables para dark e light.
 * O ThemeContext aplica esses valores no :root via style.setProperty.
 */

// Helper: gera vars de gradiente por componente a partir de duas cores
function grad(c1, c2, { r1, g1, b1 } = {}) {
  const op85d = r1 != null
    ? `linear-gradient(0deg, rgba(${r1},${g1},${b1},0.85), ${c2})`
    : `linear-gradient(0deg, ${c1}, ${c2})`;
  return {
    '--accent-comp-gradient':      `linear-gradient(90deg,  ${c1}, ${c2})`,
    '--accent-btn-gradient':       `linear-gradient(90deg,  ${c1}, ${c2})`,
    '--accent-progress-gradient':  `linear-gradient(90deg,  ${c1}, ${c2})`,
    '--accent-indicator-gradient': `linear-gradient(180deg, ${c1}, ${c2})`,
    '--accent-grad-icon-from':     c1,
    '--accent-grad-icon-to':       c2,
  };
}

export const ACCENT_THEMES = [
  // ─────────────────────────────────────────────────────────────────────────
  //  YOKANRI — Turquesa #2DD4BF · Violeta #7C5CFF
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'yokanri',
    labelKey: 'theme_yokanri',
    gradient: 'linear-gradient(145deg, #2dd4bf, #7c5cff)',
    dark: {
      // ── Cor base de destaque ─────────────────────────────────────────────
      '--accent-fg':             '#4be3d0',          // turquesa clara — texto/ícone ativo
      '--accent-bg':             'rgba(45,212,191,0.08)',   // tint fundo item ativo / badge
      '--accent-border':         'rgba(45,212,191,0.22)',   // borda item ativo / card hover
      '--accent-hover':          '#2dd4bf',          // hover de botões/links
      '--accent-secondary':      '#7c5cff',          // violeta pura — cor secundária
      // ── Sombra e glow ───────────────────────────────────────────────────
      '--shadow-glow':           '0 0 20px rgba(45,212,191,0.15)',
      // ── Focus ring ──────────────────────────────────────────────────────
      '--accent-focus-color':    'rgba(45,212,191,0.80)',
      // ── Gradiente wordmark "Yo" (textos) — levemente mais claro ─────────
      '--accent-grad-from':      '#4be3d0',
      '--accent-grad-to':        '#8b6dff',
      // ── Gradientes por componente ────────────────────────────────────────
      '--accent-comp-gradient':      'linear-gradient(90deg,  #2dd4bf, #7c5cff)',
      '--accent-btn-gradient':       'linear-gradient(90deg,  #2dd4bf, #7c5cff)',
      '--accent-progress-gradient':  'linear-gradient(90deg,  rgba(45,212,191,0.85), rgba(124,92,255,0.85))',
      '--accent-indicator-gradient': 'linear-gradient(180deg, #2dd4bf, #7c5cff)',
      '--accent-grad-icon-from':     '#2dd4bf',
      '--accent-grad-icon-to':       '#7c5cff',
      // Carousel
      '--carousel-accent':           '#2dd4bf',
      '--carousel-bg':               'rgba(45,212,191,0.07)',
      '--carousel-border':           'rgba(45,212,191,0.16)',
      '--carousel-pill-bg':          'rgba(45,212,191,0.11)',
      '--carousel-pill-border':      'rgba(45,212,191,0.26)',
    },
    light: {
      '--accent-fg':             '#0d9488',          // turquesa escura — legível no fundo claro
      '--accent-bg':             'rgba(13,148,136,0.06)',
      '--accent-border':         'rgba(13,148,136,0.22)',
      '--accent-hover':          '#0f766e',
      '--accent-secondary':      '#6d28d9',
      '--shadow-glow':           '0 0 20px rgba(13,148,136,0.10)',
      '--accent-focus-color':    'rgba(13,148,136,0.80)',
      '--accent-grad-from':      '#2dd4bf',
      '--accent-grad-to':        '#7c5cff',
      '--accent-comp-gradient':      'linear-gradient(90deg,  #2dd4bf, #7c5cff)',
      '--accent-btn-gradient':       'linear-gradient(90deg,  #2dd4bf, #7c5cff)',
      '--accent-progress-gradient':  'linear-gradient(90deg,  rgba(45,212,191,0.75), rgba(124,92,255,0.75))',
      '--accent-indicator-gradient': 'linear-gradient(180deg, #2dd4bf, #7c5cff)',
      '--accent-grad-icon-from':     '#2dd4bf',
      '--accent-grad-icon-to':       '#7c5cff',
      // Carousel
      '--carousel-accent':           '#0d9488',
      '--carousel-bg':               'rgba(13,148,136,0.06)',
      '--carousel-border':           'rgba(13,148,136,0.14)',
      '--carousel-pill-bg':          'rgba(13,148,136,0.09)',
      '--carousel-pill-border':      'rgba(13,148,136,0.22)',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  //  RUBI
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'rubi',
    labelKey: 'theme_rubi',
    gradient: 'linear-gradient(135deg, #f87171, #f43f5e)',
    dark: {
      '--accent-fg':           '#fca5a5',
      '--accent-bg':           'rgba(239,68,68,0.10)',
      '--accent-border':       'rgba(239,68,68,0.22)',
      '--accent-hover':        '#ef4444',
      '--accent-secondary':    '#f43f5e',
      '--shadow-glow':         '0 0 20px rgba(239,68,68,0.15)',
      '--accent-focus-color':  'rgba(239,68,68,0.80)',
      '--accent-grad-from':    '#f87171',
      '--accent-grad-to':      '#f43f5e',
      ...grad('#f87171', '#f43f5e'),
    },
    light: {
      '--accent-fg':           '#dc2626',
      '--accent-bg':           'rgba(220,38,38,0.08)',
      '--accent-border':       'rgba(220,38,38,0.22)',
      '--accent-hover':        '#b91c1c',
      '--accent-secondary':    '#e11d48',
      '--shadow-glow':         '0 0 20px rgba(220,38,38,0.12)',
      '--accent-focus-color':  'rgba(220,38,38,0.80)',
      '--accent-grad-from':    '#f87171',
      '--accent-grad-to':      '#f43f5e',
      ...grad('#f87171', '#f43f5e'),
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  //  ÂMBAR
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'amber',
    labelKey: 'theme_amber',
    gradient: 'linear-gradient(135deg, #fbbf24, #f97316)',
    dark: {
      '--accent-fg':           '#fcd34d',
      '--accent-bg':           'rgba(245,158,11,0.10)',
      '--accent-border':       'rgba(245,158,11,0.22)',
      '--accent-hover':        '#f59e0b',
      '--accent-secondary':    '#f97316',
      '--shadow-glow':         '0 0 20px rgba(245,158,11,0.15)',
      '--accent-focus-color':  'rgba(245,158,11,0.80)',
      '--accent-grad-from':    '#fbbf24',
      '--accent-grad-to':      '#f97316',
      ...grad('#fbbf24', '#f97316'),
    },
    light: {
      '--accent-fg':           '#b45309',
      '--accent-bg':           'rgba(180,83,9,0.08)',
      '--accent-border':       'rgba(180,83,9,0.22)',
      '--accent-hover':        '#92400e',
      '--accent-secondary':    '#c2410c',
      '--shadow-glow':         '0 0 20px rgba(180,83,9,0.12)',
      '--accent-focus-color':  'rgba(180,83,9,0.80)',
      '--accent-grad-from':    '#fbbf24',
      '--accent-grad-to':      '#f97316',
      ...grad('#fbbf24', '#f97316'),
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  //  ESMERALDA
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'esmeralda',
    labelKey: 'theme_esmeralda',
    gradient: 'linear-gradient(135deg, #34d399, #059669)',
    dark: {
      '--accent-fg':           '#6ee7b7',
      '--accent-bg':           'rgba(16,185,129,0.10)',
      '--accent-border':       'rgba(16,185,129,0.22)',
      '--accent-hover':        '#10b981',
      '--accent-secondary':    '#059669',
      '--shadow-glow':         '0 0 20px rgba(16,185,129,0.15)',
      '--accent-focus-color':  'rgba(16,185,129,0.80)',
      '--accent-grad-from':    '#34d399',
      '--accent-grad-to':      '#059669',
      ...grad('#34d399', '#059669'),
    },
    light: {
      '--accent-fg':           '#047857',
      '--accent-bg':           'rgba(4,120,87,0.08)',
      '--accent-border':       'rgba(4,120,87,0.22)',
      '--accent-hover':        '#065f46',
      '--accent-secondary':    '#064e3b',
      '--shadow-glow':         '0 0 20px rgba(4,120,87,0.12)',
      '--accent-focus-color':  'rgba(4,120,87,0.80)',
      '--accent-grad-from':    '#34d399',
      '--accent-grad-to':      '#059669',
      ...grad('#34d399', '#059669'),
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  //  SAFIRA
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'safira',
    labelKey: 'theme_safira',
    gradient: 'linear-gradient(135deg, #60a5fa, #6366f1)',
    dark: {
      '--accent-fg':           '#93c5fd',
      '--accent-bg':           'rgba(59,130,246,0.10)',
      '--accent-border':       'rgba(59,130,246,0.22)',
      '--accent-hover':        '#3b82f6',
      '--accent-secondary':    '#6366f1',
      '--shadow-glow':         '0 0 20px rgba(59,130,246,0.15)',
      '--accent-focus-color':  'rgba(59,130,246,0.80)',
      '--accent-grad-from':    '#60a5fa',
      '--accent-grad-to':      '#6366f1',
      ...grad('#60a5fa', '#6366f1'),
    },
    light: {
      '--accent-fg':           '#1d4ed8',
      '--accent-bg':           'rgba(29,78,216,0.08)',
      '--accent-border':       'rgba(29,78,216,0.22)',
      '--accent-hover':        '#1e40af',
      '--accent-secondary':    '#4338ca',
      '--shadow-glow':         '0 0 20px rgba(29,78,216,0.12)',
      '--accent-focus-color':  'rgba(29,78,216,0.80)',
      '--accent-grad-from':    '#60a5fa',
      '--accent-grad-to':      '#6366f1',
      ...grad('#60a5fa', '#6366f1'),
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  //  ROSA
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'rosa',
    labelKey: 'theme_rosa',
    gradient: 'linear-gradient(135deg, #f472b6, #e879f9)',
    dark: {
      '--accent-fg':           '#f9a8d4',
      '--accent-bg':           'rgba(236,72,153,0.10)',
      '--accent-border':       'rgba(236,72,153,0.22)',
      '--accent-hover':        '#ec4899',
      '--accent-secondary':    '#e879f9',
      '--shadow-glow':         '0 0 20px rgba(236,72,153,0.15)',
      '--accent-focus-color':  'rgba(236,72,153,0.80)',
      '--accent-grad-from':    '#f472b6',
      '--accent-grad-to':      '#e879f9',
      ...grad('#f472b6', '#e879f9'),
    },
    light: {
      '--accent-fg':           '#be185d',
      '--accent-bg':           'rgba(190,24,93,0.08)',
      '--accent-border':       'rgba(190,24,93,0.22)',
      '--accent-hover':        '#9d174d',
      '--accent-secondary':    '#a21caf',
      '--shadow-glow':         '0 0 20px rgba(190,24,93,0.12)',
      '--accent-focus-color':  'rgba(190,24,93,0.80)',
      '--accent-grad-from':    '#f472b6',
      '--accent-grad-to':      '#e879f9',
      ...grad('#f472b6', '#e879f9'),
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  //  UVA
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'uva',
    labelKey: 'theme_uva',
    gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
    dark: {
      '--accent-fg':           '#c4b5fd',
      '--accent-bg':           'rgba(139,92,246,0.10)',
      '--accent-border':       'rgba(139,92,246,0.22)',
      '--accent-hover':        '#8b5cf6',
      '--accent-secondary':    '#7c3aed',
      '--shadow-glow':         '0 0 20px rgba(139,92,246,0.15)',
      '--accent-focus-color':  'rgba(139,92,246,0.80)',
      '--accent-grad-from':    '#a78bfa',
      '--accent-grad-to':      '#7c3aed',
      ...grad('#a78bfa', '#7c3aed'),
    },
    light: {
      '--accent-fg':           '#6d28d9',
      '--accent-bg':           'rgba(109,40,217,0.08)',
      '--accent-border':       'rgba(109,40,217,0.22)',
      '--accent-hover':        '#5b21b6',
      '--accent-secondary':    '#4c1d95',
      '--shadow-glow':         '0 0 20px rgba(109,40,217,0.12)',
      '--accent-focus-color':  'rgba(109,40,217,0.80)',
      '--accent-grad-from':    '#a78bfa',
      '--accent-grad-to':      '#7c3aed',
      ...grad('#a78bfa', '#7c3aed'),
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  //  ARDÓSIA
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'ardosia',
    labelKey: 'theme_ardosia',
    gradient: 'linear-gradient(135deg, #94a3b8, #475569)',
    dark: {
      '--accent-fg':           '#cbd5e1',
      '--accent-bg':           'rgba(100,116,139,0.10)',
      '--accent-border':       'rgba(100,116,139,0.22)',
      '--accent-hover':        '#94a3b8',
      '--accent-secondary':    '#64748b',
      '--shadow-glow':         '0 0 20px rgba(100,116,139,0.15)',
      '--accent-focus-color':  'rgba(100,116,139,0.80)',
      '--accent-grad-from':    '#94a3b8',
      '--accent-grad-to':      '#475569',
      ...grad('#94a3b8', '#475569'),
    },
    light: {
      '--accent-fg':           '#475569',
      '--accent-bg':           'rgba(71,85,105,0.08)',
      '--accent-border':       'rgba(71,85,105,0.22)',
      '--accent-hover':        '#334155',
      '--accent-secondary':    '#1e293b',
      '--shadow-glow':         '0 0 20px rgba(71,85,105,0.12)',
      '--accent-focus-color':  'rgba(71,85,105,0.80)',
      '--accent-grad-from':    '#94a3b8',
      '--accent-grad-to':      '#475569',
      ...grad('#94a3b8', '#475569'),
    },
  },
];

export const DEFAULT_ACCENT_ID = 'yokanri';

export function getAccentTheme(id) {
  return ACCENT_THEMES.find(t => t.id === id) ?? ACCENT_THEMES[0];
}
