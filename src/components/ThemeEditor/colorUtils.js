// ─── Conversões base ────────────────────────────────────────────────────────

export function hexToRgb(hex) {
  const c = hex.replace('#', '');
  return [
    parseInt(c.substring(0, 2), 16),
    parseInt(c.substring(2, 4), 16),
    parseInt(c.substring(4, 6), 16),
  ];
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const v = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * v).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// ─── Manipulação de cor ─────────────────────────────────────────────────────

export function lighten(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  return hslToHex(h, s, Math.min(95, l + amount * 100));
}

export function darken(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  return hslToHex(h, Math.min(s * 1.1, 100), Math.max(5, l - amount * 100));
}

// ─── Gradiente ──────────────────────────────────────────────────────────────

export function gradientString(colors, angle = 135) {
  if (!colors || colors.length === 0) return '#888';
  if (colors.length === 1) return colors[0];
  return `linear-gradient(${angle}deg, ${colors.join(', ')})`;
}

/**
 * Extrai cores e ângulo de uma string CSS de gradiente.
 * Retorna fallback seguro se não conseguir parsear.
 */
export function parseGradientColors(gradient = '') {
  const match = gradient.match(/linear-gradient\((\d+)deg,\s*(.+)\)/);
  if (!match) return { angle: 135, colors: [gradient || '#888888'] };
  const angle  = parseInt(match[1], 10);
  const colors = match[2].split(',').map(s => s.trim()).filter(s => /^#[0-9a-fA-F]{6}$/.test(s));
  return { angle, colors: colors.length ? colors : ['#888888'] };
}

// ─── Derivação automática de variáveis ─────────────────────────────────────

/**
 * Dado um array de cores base, ângulo e intensidade,
 * deriva todos os valores das CSS variables do tema.
 *
 * @param {string[]} colors - Array de cores hex (#rrggbb)
 * @param {number}   angle  - Ângulo do gradiente (0-360)
 * @param {number}   intensity - Intensidade (0-100), afeta opacidade de bg/border/glow
 * @param {'dark'|'light'} mode
 * @returns {Object} mapa de CSS variable → valor
 */
export function deriveAccentVars(colors, angle = 135, intensity = 100, mode = 'dark') {
  const c1 = colors?.[0] || '#2dd4bf';
  const c2 = colors?.[colors.length - 1] || c1;
  const [r, g, b] = hexToRgb(c1);
  const scale = Math.max(0.1, intensity / 100);
  const op = (alpha) => `rgba(${r},${g},${b},${(alpha * scale).toFixed(2)})`;

  const fg    = mode === 'dark' ? lighten(c1, 0.22) : darken(c1, 0.32);
  const hover = mode === 'dark' ? lighten(c1, 0.08) : darken(c1, 0.12);

  const gradFrom = mode === 'dark' ? lighten(c1, 0.07) : c1;
  const gradTo   = mode === 'dark' ? lighten(c2, 0.07) : c2;

  return {
    '--accent-fg':             fg,
    '--accent-bg':             op(0.10),
    '--accent-border':         op(0.22),
    '--accent-hover':          hover,
    '--accent-secondary':      c2,
    '--shadow-glow':           `0 0 20px ${op(0.18)}`,
    '--accent-grad-from':      gradFrom,
    '--accent-grad-to':        gradTo,
    '--accent-grad-icon-from': c1,
    '--accent-grad-icon-to':   c2,
  };
}
