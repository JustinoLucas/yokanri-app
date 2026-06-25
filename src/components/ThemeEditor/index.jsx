import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2, Copy, Check, Palette, RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ACCENT_THEMES } from '../../context/accentThemes';
import {
  COMPONENT_DEFS,
  defaultComponents,
  deriveAllVars,
  gradientString,
  parseGradientColors,
} from './colorUtils';
import ThemePreview from './ThemePreview';
import './ThemeEditor.css';

// ─── Helpers ────────────────────────────────────────────────────────────────

function isValidHex(v) { return /^#[0-9a-fA-F]{6}$/.test(v); }

function swatchFor(theme) {
  if (theme.gradient) return theme.gradient;
  if (theme.components?.logoIcon) {
    const c = theme.components.logoIcon;
    return gradientString(c.colors, c.angle ?? 145);
  }
  return '#888';
}

function buildTheme(id, name, components) {
  return { id, name, components, gradient: swatchFor({ components }) };
}

function initialComponents(theme) {
  if (!theme) return defaultComponents();
  if (theme.components) return JSON.parse(JSON.stringify(theme.components));
  // Built-in: parseia gradiente e inicializa
  const parsed = parseGradientColors(theme.gradient || '');
  return defaultComponents(parsed.colors);
}

// ─── Botão flutuante ─────────────────────────────────────────────────────────

export function ThemeEditorButton({ onClick }) {
  return (
    <button className="te-fab" onClick={onClick} title="Theme Editor (dev)">
      <Palette size={16} />
    </button>
  );
}

// ─── Editor de um componente ─────────────────────────────────────────────────

function ComponentEditor({ def, value, onChange }) {
  const colors    = value?.colors    || def.defaultColors;
  const angle     = value?.angle     ?? def.defaultAngle ?? 0;
  const intensity = value?.intensity ?? def.defaultIntensity ?? 100;

  const update = (patch) => onChange({ colors, angle, intensity, ...patch });

  const handleColorChange = (idx, v) => {
    const next = [...colors]; next[idx] = v;
    update({ colors: next });
  };

  const addColor = () => {
    if (colors.length >= 3) return;
    update({ colors: [...colors, colors[colors.length - 1]] });
  };

  const removeColor = (idx) => {
    if (colors.length <= 1) return;
    update({ colors: colors.filter((_, i) => i !== idx) });
  };

  const preview = def.supportsGradient && colors.length > 1
    ? gradientString(colors, angle)
    : colors[0] || '#888';

  return (
    <div className="te-comp-card">
      <div className="te-comp-header">
        <div className="te-comp-swatch" style={{ background: preview }} />
        <div className="te-comp-info">
          <span className="te-comp-label">{def.label}</span>
          <span className="te-comp-desc">{def.desc}</span>
        </div>
      </div>

      {/* Color stops */}
      <div className="te-comp-colors">
        {colors.map((color, i) => (
          <div key={i} className="te-color-stop">
            <input
              type="color"
              className="te-color-native"
              value={isValidHex(color) ? color : '#000000'}
              onChange={e => handleColorChange(i, e.target.value)}
            />
            <input
              type="text"
              className="te-input te-hex"
              value={color}
              maxLength={7}
              onChange={e => {
                if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value))
                  handleColorChange(i, e.target.value);
              }}
            />
            {colors.length > 1 && (
              <button className="te-color-remove" onClick={() => removeColor(i)}>
                <X size={9} />
              </button>
            )}
          </div>
        ))}
        {def.supportsGradient && colors.length < 3 && (
          <button className="te-add-color-btn" onClick={addColor}>
            <Plus size={10} /> cor
          </button>
        )}
      </div>

      {/* Gradient preview strip */}
      {def.supportsGradient && colors.length > 1 && (
        <div className="te-comp-grad-bar" style={{ background: preview }} />
      )}

      {/* Angle (only for gradient) */}
      {def.supportsGradient && colors.length > 1 && (
        <div className="te-comp-row">
          <span className="te-comp-row-label">Ângulo</span>
          <input
            type="range" min="0" max="360" step="1"
            className="te-range te-range--sm"
            value={angle}
            onChange={e => update({ angle: Number(e.target.value) })}
          />
          <span className="te-comp-row-val">{angle}°</span>
        </div>
      )}

      {/* Intensity */}
      <div className="te-comp-row">
        <span className="te-comp-row-label">Intensidade</span>
        <input
          type="range" min="10" max="100" step="1"
          className="te-range te-range--sm"
          value={intensity}
          onChange={e => update({ intensity: Number(e.target.value) })}
        />
        <span className="te-comp-row-val">{intensity}%</span>
      </div>
    </div>
  );
}

// ─── Painel principal ────────────────────────────────────────────────────────

export default function ThemeEditor({ onClose }) {
  const { isDark, accent, setAccent, setTheme, customThemes, setCustomThemes } = useTheme();

  const [selected,    setSelected]    = useState(accent);
  const [components,  setComponents]  = useState(defaultComponents());
  const [name,        setName]        = useState('');
  const [editMode,    setEditMode]    = useState(isDark ? 'dark' : 'light');
  const [copied,      setCopied]      = useState(false);
  const [hiddenIds,   setHiddenIds]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('te-hidden-themes') || '[]'); } catch { return []; }
  });

  const saveHiddenIds = (ids) => {
    setHiddenIds(ids);
    try { localStorage.setItem('te-hidden-themes', JSON.stringify(ids)); } catch {}
  };

  const builtIn        = ACCENT_THEMES.find(t => t.id === selected);
  const customOverride = customThemes.find(t => t.id === selected);
  const isBuiltIn      = !!builtIn;
  const hasOverride    = isBuiltIn && !!customOverride;
  const activeTheme    = customOverride || builtIn;
  const pureCustom     = customThemes.filter(t => !ACCENT_THEMES.find(b => b.id === t.id));
  const visibleBuiltIn = ACCENT_THEMES.filter(t => !hiddenIds.includes(t.id));

  // Carrega quando muda seleção
  useEffect(() => {
    const comps = initialComponents(activeTheme);
    setComponents(comps);
    setName(customOverride?.name || builtIn?.id || '');
  }, [selected]);

  // Aplica ao vivo
  const liveVars = deriveAllVars(components, editMode);
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(liveVars).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [liveVars]);

  // Persiste no customThemes
  const persist = useCallback((comps, n) => {
    const theme = buildTheme(selected, n, comps);
    const exists = customThemes.find(t => t.id === selected);
    if (exists) setCustomThemes(customThemes.map(t => t.id === selected ? theme : t));
    else setCustomThemes([...customThemes, theme]);
  }, [selected, customThemes, setCustomThemes]);

  const handleCompChange = useCallback((compId, value) => {
    const next = { ...components, [compId]: value };
    setComponents(next);
    persist(next, name);
  }, [components, name, persist]);

  const handleNameChange = useCallback((v) => {
    setName(v);
    persist(components, v);
  }, [components, persist]);

  const handleSelectTheme = useCallback((id) => {
    setSelected(id);
    setAccent(id);
  }, [setAccent]);

  const handleAddTheme = useCallback(() => {
    const id = `custom-${Date.now()}`;
    const comps = initialComponents(activeTheme);
    const theme = buildTheme(id, 'Novo Tema', comps);
    setCustomThemes([...customThemes, theme]);
    handleSelectTheme(id);
  }, [activeTheme, customThemes, setCustomThemes, handleSelectTheme]);

  const handleRemoveTheme = useCallback((id) => {
    setCustomThemes(customThemes.filter(t => t.id !== id));
    if (selected === id) handleSelectTheme(ACCENT_THEMES[0].id);
  }, [customThemes, selected, setCustomThemes, handleSelectTheme]);

  const handleReset = useCallback(() => {
    setCustomThemes(customThemes.filter(t => t.id !== selected));
    const comps = initialComponents(builtIn);
    setComponents(comps);
  }, [selected, builtIn, customThemes, setCustomThemes]);

  const handleExport = useCallback(() => {
    const dark  = deriveAllVars(components, 'dark');
    const light = deriveAllVars(components, 'light');
    const code  = `  {\n    id: '${selected}',\n    labelKey: 'theme_${name.toLowerCase().replace(/\s+/g,'_')}',\n    gradient: '${swatchFor({components})}',\n    dark: ${JSON.stringify(dark,null,6).replace(/"/g,"'")},\n    light: ${JSON.stringify(light,null,6).replace(/"/g,"'")},\n  },`;
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }, [selected, name, components]);

  return (
    <div className="te-backdrop" onClick={onClose}>
      <div className="te-panel te-panel--wide" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="te-header">
          <Palette size={14} />
          <span className="te-header-title">Theme Editor</span>
          <span className="te-header-badge">DEV</span>
          <div style={{ flex: 1 }} />
          <button className="te-close" onClick={onClose}><X size={14} /></button>
        </div>

        <div className="te-body">

          {/* ── Lista de temas ── */}
          <div className="te-sidebar">
            <span className="te-section-label">Sistema</span>
            {visibleBuiltIn.map(t => {
              const ov = customThemes.find(c => c.id === t.id);
              return (
                <button key={t.id}
                  className={`te-theme-item ${selected===t.id?'te-theme-item--active':''}`}
                  onClick={() => handleSelectTheme(t.id)}
                >
                  <span className="te-swatch" style={{ background: swatchFor(ov||t) }} />
                  <span className="te-theme-name">{t.id}</span>
                  {ov && <span className="te-modified-dot" />}
                  <button className="te-item-delete te-item-delete--visible"
                    onClick={e => {
                      e.stopPropagation();
                      // Remove override se existir
                      if (ov) setCustomThemes(customThemes.filter(c => c.id !== t.id));
                      // Oculta da lista
                      saveHiddenIds([...hiddenIds, t.id]);
                      if (selected === t.id) handleSelectTheme(visibleBuiltIn.find(x => x.id !== t.id)?.id || pureCustom[0]?.id || ACCENT_THEMES[0].id);
                    }}
                    title="Remover da lista"
                  ><Trash2 size={10} /></button>
                </button>
              );
            })}
            {hiddenIds.length > 0 && (
              <button className="te-restore-btn" onClick={() => saveHiddenIds([])}>
                Restaurar todos ({hiddenIds.length})
              </button>
            )}

            {pureCustom.length > 0 && <>
              <span className="te-section-label" style={{ marginTop: 14 }}>Personalizados</span>
              {pureCustom.map(t => (
                <button key={t.id}
                  className={`te-theme-item ${selected===t.id?'te-theme-item--active':''}`}
                  onClick={() => handleSelectTheme(t.id)}
                >
                  <span className="te-swatch" style={{ background: swatchFor(t) }} />
                  <span className="te-theme-name">{t.name}</span>
                  <button className="te-item-delete te-item-delete--visible"
                    onClick={e => { e.stopPropagation(); handleRemoveTheme(t.id); }}
                    title="Remover tema"
                  ><Trash2 size={10} /></button>
                </button>
              ))}
            </>}

            <button className="te-add-theme-btn" onClick={handleAddTheme}>
              <Plus size={12} /> Novo tema
            </button>
          </div>

          {/* ── Editor ── */}
          <div className="te-editor">

            {/* Cabeçalho do tema */}
            <div className="te-builtin-header">
              <div className="te-swatch te-swatch--lg" style={{ background: swatchFor({ components }) }} />
              <div style={{ flex: 1 }}>
                {!isBuiltIn ? (
                  <input className="te-input" value={name}
                    onChange={e => handleNameChange(e.target.value)}
                    placeholder="Nome do tema" style={{ width: '100%' }}
                  />
                ) : (
                  <span className="te-builtin-name">{selected}</span>
                )}
                {hasOverride && (
                  <button className="te-reset-btn" onClick={handleReset}>
                    <RotateCcw size={11} /> Restaurar padrão
                  </button>
                )}
              </div>
              <div className="te-mode-row" style={{ margin: 0 }}>
                <button className={`te-mode-btn ${editMode==='dark'?'te-mode-btn--active':''}`}
                  onClick={() => { setEditMode('dark'); setTheme('dark'); }}>🌙</button>
                <button className={`te-mode-btn ${editMode==='light'?'te-mode-btn--active':''}`}
                  onClick={() => { setEditMode('light'); setTheme('light'); }}>☀</button>
              </div>
            </div>

            {/* Grid de componentes */}
            <div className="te-comp-grid">
              {COMPONENT_DEFS.map(def => (
                <ComponentEditor
                  key={def.id}
                  def={def}
                  value={components[def.id]}
                  onChange={v => handleCompChange(def.id, v)}
                />
              ))}
            </div>

            {/* Preview + export */}
            <ThemePreview vars={liveVars} />

            <button className="te-export-btn" onClick={handleExport}>
              {copied ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Exportar JS</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
