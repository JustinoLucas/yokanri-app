// ─── Conversões base ────────────────────────────────────────────────────────

export function hexToRgb(hex) {
  const c = hex.replace('#', '');
  return [parseInt(c.substring(0,2),16), parseInt(c.substring(2,4),16), parseInt(c.substring(4,6),16)];
}

function rgbToHsl(r,g,b) {
  r/=255; g/=255; b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b);
  let h=0,s=0,l=(max+min)/2;
  if(max!==min){
    const d=max-min;
    s=l>0.5?d/(2-max-min):d/(max+min);
    switch(max){
      case r: h=((g-b)/d+(g<b?6:0))/6; break;
      case g: h=((b-r)/d+2)/6; break;
      case b: h=((r-g)/d+4)/6; break;
    }
  }
  return [h*360,s*100,l*100];
}

function hslToHex(h,s,l) {
  s/=100; l/=100;
  const a=s*Math.min(l,1-l);
  const f=n=>{const k=(n+h/30)%12;return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,Math.min(9-k,1))))).toString(16).padStart(2,'0');};
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function lighten(hex, amount) {
  const [r,g,b]=hexToRgb(hex);
  const [h,s,l]=rgbToHsl(r,g,b);
  return hslToHex(h,s,Math.min(95,l+amount*100));
}

export function darken(hex, amount) {
  const [r,g,b]=hexToRgb(hex);
  const [h,s,l]=rgbToHsl(r,g,b);
  return hslToHex(h,Math.min(s*1.1,100),Math.max(5,l-amount*100));
}

// ─── Gradiente ──────────────────────────────────────────────────────────────

export function gradientString(colors, angle=135) {
  if(!colors||colors.length===0) return '#888';
  if(colors.length===1) return colors[0];
  return `linear-gradient(${angle}deg, ${colors.join(', ')})`;
}

export function parseGradientColors(gradient='') {
  const match=gradient.match(/linear-gradient\((\d+)deg,\s*(.+)\)/);
  if(!match) return {angle:135,colors:[gradient||'#888888']};
  const angle=parseInt(match[1],10);
  const colors=match[2].split(',').map(s=>s.trim()).filter(s=>/^#[0-9a-fA-F]{6}$/.test(s));
  return {angle,colors:colors.length?colors:['#888888']};
}

// ─── Definição dos componentes editáveis ────────────────────────────────────

export const COMPONENT_DEFS = [
  {
    id: 'base',
    label: 'Cor base',
    desc: 'Card hover, sidebar ativo, badge',
    supportsGradient: false,
    defaultColors: ['#2dd4bf'],
    defaultIntensity: 100,
  },
  {
    id: 'focus',
    label: 'Focus ring',
    desc: 'Contorno ao focar inputs',
    supportsGradient: false,
    defaultColors: ['#2dd4bf'],
    defaultIntensity: 80,
  },
  {
    id: 'btn',
    label: 'Botão primário',
    desc: 'Fundo do botão + Adicionar',
    supportsGradient: true,
    defaultColors: ['#2dd4bf', '#7c5cff'],
    defaultAngle: 90,
    defaultIntensity: 100,
  },
  {
    id: 'progress',
    label: 'Barra de progresso',
    desc: 'Fill das barras de leitura',
    supportsGradient: true,
    defaultColors: ['#2dd4bf', '#7c5cff'],
    defaultAngle: 0,
    defaultIntensity: 85,
  },
  {
    id: 'indicator',
    label: 'Indicador sidebar',
    desc: 'Barra lateral do item ativo',
    supportsGradient: true,
    defaultColors: ['#2dd4bf', '#7c5cff'],
    defaultAngle: 180,
    defaultIntensity: 100,
  },
  {
    id: 'logoIcon',
    label: 'Ícone logo',
    desc: 'Fundo do ícone quadrado "Yo"',
    supportsGradient: true,
    defaultColors: ['#2dd4bf', '#7c5cff'],
    defaultAngle: 145,
    defaultIntensity: 100,
  },
  {
    id: 'logoText',
    label: 'Texto "Yo"',
    desc: 'Gradiente do wordmark',
    supportsGradient: true,
    defaultColors: ['#4be3d0', '#8b6dff'],
    defaultAngle: 120,
    defaultIntensity: 100,
  },
];

// Componentes padrão inicializados das cores base
export function defaultComponents(colors = ['#2dd4bf', '#7c5cff']) {
  const c1 = colors[0] || '#2dd4bf';
  const c2 = colors[colors.length - 1] || c1;
  return {
    base:      { colors: [c1],     intensity: 100 },
    focus:     { colors: [c1],     intensity: 80 },
    btn:       { colors: [c1, c2], angle: 90,  intensity: 100 },
    progress:  { colors: [c1, c2], angle: 0,   intensity: 85 },
    indicator: { colors: [c1, c2], angle: 180, intensity: 100 },
    logoIcon:  { colors: [c1, c2], angle: 145, intensity: 100 },
    logoText:  { colors: [lighten(c1, 0.07), lighten(c2, 0.07)], angle: 120, intensity: 100 },
  };
}

// ─── Derivação por componente ────────────────────────────────────────────────

function buildCompGradient(comp) {
  const colors   = comp.colors || ['#2dd4bf'];
  const angle    = comp.angle ?? 90;
  const scale    = Math.max(0.1, (comp.intensity ?? 100) / 100);
  const stops    = colors.map(c => {
    const [r,g,b] = hexToRgb(c);
    return `rgba(${r},${g},${b},${scale.toFixed(2)})`;
  });
  if (stops.length === 1) return stops[0];
  return `linear-gradient(${angle}deg, ${stops.join(', ')})`;
}

/**
 * Deriva todas as CSS variables a partir do mapa de componentes.
 */
export function deriveAllVars(components = {}, mode = 'dark') {
  const base      = components.base      || { colors: ['#2dd4bf'], intensity: 100 };
  const focus     = components.focus     || { colors: [base.colors[0]], intensity: 80 };
  const btn       = components.btn       || { colors: base.colors, angle: 90,  intensity: 100 };
  const progress  = components.progress  || { colors: base.colors, angle: 0,   intensity: 85 };
  const indicator = components.indicator || { colors: base.colors, angle: 180, intensity: 100 };
  const logoIcon  = components.logoIcon  || { colors: base.colors, angle: 145, intensity: 100 };
  const logoText  = components.logoText  || { colors: base.colors, angle: 120, intensity: 100 };

  const c1 = base.colors[0] || '#2dd4bf';
  const [r,g,b] = hexToRgb(c1);
  const baseScale = Math.max(0.1, (base.intensity ?? 100) / 100);
  const op = (a) => `rgba(${r},${g},${b},${(a*baseScale).toFixed(2)})`;

  const fg    = mode === 'dark' ? lighten(c1, 0.22) : darken(c1, 0.32);
  const hover = mode === 'dark' ? lighten(c1, 0.08) : darken(c1, 0.12);

  const [fr,fg2,fb] = hexToRgb(focus.colors[0] || c1);
  const focusScale  = Math.max(0.1, (focus.intensity ?? 80) / 100);
  const focusColor  = `rgba(${fr},${fg2},${fb},${(0.80*focusScale).toFixed(2)})`;

  const liFrom = logoIcon.colors[0] || c1;
  const liTo   = logoIcon.colors[logoIcon.colors.length-1] || c1;

  const ltRaw0 = logoText.colors[0] || c1;
  const ltRawN = logoText.colors[logoText.colors.length-1] || c1;
  const ltFrom = mode === 'dark' ? lighten(ltRaw0, 0.07) : ltRaw0;
  const ltTo   = mode === 'dark' ? lighten(ltRawN, 0.07) : ltRawN;

  return {
    '--accent-fg':                 fg,
    '--accent-bg':                 op(0.10),
    '--accent-border':             op(0.22),
    '--accent-hover':              hover,
    '--accent-secondary':          base.colors[1] || c1,
    '--shadow-glow':               `0 0 20px ${op(0.18)}`,
    '--accent-focus-color':        focusColor,
    '--accent-btn-gradient':       buildCompGradient(btn),
    '--accent-progress-gradient':  buildCompGradient(progress),
    '--accent-indicator-gradient': buildCompGradient(indicator),
    '--accent-comp-gradient':      buildCompGradient(btn), // compat
    '--accent-grad-from':          ltFrom,
    '--accent-grad-to':            ltTo,
    '--accent-grad-icon-from':     liFrom,
    '--accent-grad-icon-to':       liTo,
  };
}

// Mantém compat para código legado
export function deriveAccentVars(colors, angle=135, intensity=100, mode='dark', compAngle=90) {
  const comps = defaultComponents(colors);
  comps.btn.angle       = compAngle;
  comps.progress.angle  = compAngle;
  comps.indicator.angle = compAngle;
  comps.btn.intensity       = intensity;
  comps.progress.intensity  = Math.round(intensity * 0.85);
  comps.base.intensity      = intensity;
  comps.focus.intensity     = Math.round(intensity * 0.80);
  return deriveAllVars(comps, mode);
}
