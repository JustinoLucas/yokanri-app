import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2, Copy, Check, Palette, RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ACCENT_THEMES } from '../../context/accentThemes';
import { deriveAccentVars, gradientString, parseGradientColors } from './colorUtils';
import ThemePreview from './ThemePreview';
import './ThemeEditor.css';

// ─── Helpers ────────────────────────────────────────────────────────────────

function isValidHex(v) { return /^#[0-9a-fA-F]{6}$/.test(v); }

function buildTheme(id, name, colors, angle, intensity) {
  return {
    id, name, colors, angle, intensity,
    gradient: gradientString(colors, angle),
    dark:  deriveAccentVars(colors, angle, intensity, 'dark'),
    light: deriveAccentVars(colors, angle, intensity, 'light'),
  };
}

// Extrai estado de edição inicial de qualquer tema (custom ou built-in)
function initialEditState(theme) {
  if (!theme) return { colors: ['#2dd4bf', '#7c5cff'], angle: 135, intensity: 100, name: '' };
  if (theme.colors) {
    return { colors: theme.colors, angle: theme.angle ?? 135, intensity: theme.intensity ?? 100, name: theme.name || theme.id };
  }
  // Built-in sem overrides: parseia o gradiente
  const parsed = parseGradientColors(theme.gradient || '');
  return { colors: parsed.colors, angle: parsed.angle, intensity: 100, name: theme.id };
}

// ─── Botão flutuante ─────────────────────────────────────────────────────────

export function ThemeEditorButton({ onClick }) {
  return (
    <button className="te-fab" onClick={onClick} title="Theme Editor (dev)">
      <Palette size={16} />
    </button>
  );
}

// ─── Painel principal ────────────────────────────────────────────────────────

export default function ThemeEditor({ onClose }) {
  const { isDark, accent, setAccent, customThemes, setCustomThemes } = useTheme();

  const [editMode,   setEditMode]   = useState(isDark ? 'dark' : 'light');
  const [selected,   setSelected]   = useState(accent);
  const [copied,     setCopied]     = useState(false);
  const [colors,     setColors]     = useState(['#2dd4bf', '#7c5cff']);
  const [angle,      setAngle]      = useState(135);
  const [intensity,  setIntensity]  = useState(100);
  const [name,       setName]       = useState('');

  const builtInTheme  = ACCENT_THEMES.find(t => t.id === selected);
  const customOverride = customThemes.find(t => t.id === selected);
  // Qualquer tema é editável. Se o ID existe nos built-ins, é um override.
  const isBuiltIn     = !!builtInTheme;
  const hasOverride   = isBuiltIn && !!customOverride;
  // Mostra editor para todos os temas (built-in ou custom puro)
  const activeTheme   = customOverride || builtInTheme;

  // Carrega estado quando muda o tema selecionado
  useEffect(() => {
    const state = initialEditState(activeTheme);
    setColors(state.colors);
    setAngle(state.angle);
    setIntensity(state.intensity);
    setName(state.name);
  }, [selected]);

  // Variáveis derivadas ao vivo
  const liveVars = deriveAccentVars(colors, angle, intensity, editMode);

  // Aplica ao vivo no DOM
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(liveVars).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [liveVars]);

  // ── Ações ──────────────────────────────────────────────────────────────────

  const handleSelectTheme = useCallback((id) => {
    setSelected(id);
    setAccent(id);
  }, [setAccent]);

  const persist = useCallback((nextColors, nextAngle, nextIntensity, nextName) => {
    const existing = customThemes.find(t => t.id === selected);
    const theme = buildTheme(selected, nextName, nextColors, nextAngle, nextIntensity);
    if (existing) {
      setCustomThemes(customThemes.map(t => t.id === selected ? theme : t));
    } else {
      setCustomThemes([...customThemes, theme]);
    }
  }, [selected, customThemes, setCustomThemes]);

  const handleColorChange = useCallback((idx, value) => {
    const next = [...colors]; next[idx] = value;
    setColors(next);
    persist(next, angle, intensity, name);
  }, [colors, angle, intensity, name, persist]);

  const handleAngleChange = useCallback((v) => {
    setAngle(v);
    persist(colors, v, intensity, name);
  }, [colors, intensity, name, persist]);

  const handleIntensityChange = useCallback((v) => {
    setIntensity(v);
    persist(colors, angle, v, name);
  }, [colors, angle, name, persist]);

  const handleNameChange = useCallback((v) => {
    setName(v);
    persist(colors, angle, intensity, v);
  }, [colors, angle, intensity, persist]);

  const handleAddColor = useCallback(() => {
    if (colors.length >= 3) return;
    const next = [...colors, '#7c5cff'];
    setColors(next);
    persist(next, angle, intensity, name);
  }, [colors, angle, intensity, name, persist]);

  const handleRemoveColor = useCallback((idx) => {
    if (colors.length <= 1) return;
    const next = colors.filter((_, i) => i !== idx);
    setColors(next);
    persist(next, angle, intensity, name);
  }, [colors, angle, intensity, name, persist]);

  const handleAddNewTheme = useCallback(() => {
    const id = `custom-${Date.now()}`;
    const src = initialEditState(activeTheme);
    const theme = buildTheme(id, 'Novo Tema', src.colors, src.angle, src.intensity);
    setCustomThemes([...customThemes, theme]);
    handleSelectTheme(id);
  }, [activeTheme, customThemes, setCustomThemes, handleSelectTheme]);

  const handleRemoveTheme = useCallback((id) => {
    setCustomThemes(customThemes.filter(t => t.id !== id));
    if (selected === id) handleSelectTheme(ACCENT_THEMES[0].id);
  }, [customThemes, selected, setCustomThemes, handleSelectTheme]);

  const handleResetBuiltIn = useCallback(() => {
    // Remove o override do tema built-in
    setCustomThemes(customThemes.filter(t => t.id !== selected));
    const state = initialEditState(builtInTheme);
    setColors(state.colors);
    setAngle(state.angle);
    setIntensity(state.intensity);
    setName(state.name);
  }, [selected, builtInTheme, customThemes, setCustomThemes]);

  const handleExportJS = useCallback(() => {
    const theme = buildTheme(selected, name, colors, angle, intensity);
    const dark  = JSON.stringify(theme.dark, null, 6).replace(/"/g, "'");
    const light = JSON.stringify(theme.light, null, 6).replace(/"/g, "'");
    const code  = `  {\n    id: '${selected}',\n    labelKey: 'theme_${name.toLowerCase().replace(/\s+/g, '_')}',\n    gradient: '${theme.gradient}',\n    dark: ${dark},\n    light: ${light},\n  },`;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [selected, name, colors, angle, intensity]);

  // ── Render ─────────────────────────────────────────────────────────────────

  // Temas custom puros (ID não existe nos built-ins)
  const pureCustomThemes = customThemes.filter(t => !ACCENT_THEMES.find(b => b.id === t.id));

  return (
    <div className="te-backdrop" onClick={onClose}>
      <div className="te-panel" onClick={e => e.stopPropagation()}>

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
            {ACCENT_THEMES.map(t => {
              const override = customThemes.find(c => c.id === t.id);
              return (
                <button
                  key={t.id}
                  className={`te-theme-item ${selected === t.id ? 'te-theme-item--active' : ''}`}
                  onClick={() => handleSelectTheme(t.id)}
                >
                  <span className="te-swatch" style={{ background: override?.gradient || t.gradient }} />
                  <span className="te-theme-name">{t.id}</span>
                  {override && <span className="te-modified-dot" title="Modificado" />}
                </button>
              );
            })}

            {pureCustomThemes.length > 0 && (
              <>
                <span className="te-section-label" style={{ marginTop: 14 }}>Personalizados</span>
                {pureCustomThemes.map(t => (
                  <button
                    key={t.id}
                    className={`te-theme-item ${selected === t.id ? 'te-theme-item--active' : ''}`}
                    onClick={() => handleSelectTheme(t.id)}
                  >
                    <span className="te-swatch" style={{ background: t.gradient }} />
                    <span className="te-theme-name">{t.name}</span>
                    <button
                      className="te-item-delete"
                      onClick={e => { e.stopPropagation(); handleRemoveTheme(t.id); }}
                      title="Remover"
                    >
                      <Trash2 size={10} />
                    </button>
                  </button>
                ))}
              </>
            )}

            <button className="te-add-theme-btn" onClick={handleAddNewTheme}>
              <Plus size={12} /> Novo tema
            </button>
          </div>

          {/* ── Editor ── */}
          <div className="te-editor">

            {/* Nome (só para temas custom puros) */}
            {!isBuiltIn && (
              <div className="te-field">
                <label className="te-label">Nome</label>
                <input
                  className="te-input"
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="Meu Tema"
                />
              </div>
            )}

            {/* Cabeçalho built-in com botão de reset */}
            {isBuiltIn && (
              <div className="te-builtin-header">
                <div className="te-swatch te-swatch--lg" style={{ background: gradientString(colors, angle) }} />
                <div>
                  <span className="te-builtin-name">{selected}</span>
                  {hasOverride && (
                    <button className="te-reset-btn" onClick={handleResetBuiltIn} title="Restaurar padrão">
                      <RotateCcw size={11} /> Restaurar padrão
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Toggle dark / light */}
            <div className="te-mode-row">
              <button
                className={`te-mode-btn ${editMode === 'dark' ? 'te-mode-btn--active' : ''}`}
                onClick={() => setEditMode('dark')}
              >🌙 Escuro</button>
              <button
                className={`te-mode-btn ${editMode === 'light' ? 'te-mode-btn--active' : ''}`}
                onClick={() => setEditMode('light')}
              >☀ Claro</button>
            </div>

            {/* Cores base */}
            <div className="te-field">
              <label className="te-label">Cores</label>
              <div className="te-color-stops">
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
                      onChange={e => {
                        const v = e.target.value;
                        if (/^#[0-9a-fA-F]{0,6}$/.test(v)) handleColorChange(i, v);
                      }}
                      maxLength={7}
                    />
                    {colors.length > 1 && (
                      <button className="te-color-remove" onClick={() => handleRemoveColor(i)}>
                        <X size={10} />
                      </button>
                    )}
                  </div>
                ))}
                {colors.length < 3 && (
                  <button className="te-add-color-btn" onClick={handleAddColor}>
                    <Plus size={11} /> Adicionar cor
                  </button>
                )}
              </div>
            </div>

            {/* Gradiente ao vivo */}
            <div className="te-gradient-bar" style={{ background: gradientString(colors, angle) }} />

            {/* Direção */}
            <div className="te-field">
              <div className="te-field-header">
                <label className="te-label">Direção do gradiente</label>
                <span className="te-value">{angle}°</span>
              </div>
              <input
                type="range" min="0" max="360" step="1"
                className="te-range"
                value={angle}
                onChange={e => handleAngleChange(Number(e.target.value))}
              />
            </div>

            {/* Intensidade */}
            <div className="te-field">
              <div className="te-field-header">
                <label className="te-label">Intensidade de cor</label>
                <span className="te-value">{intensity}%</span>
              </div>
              <input
                type="range" min="20" max="100" step="1"
                className="te-range"
                value={intensity}
                onChange={e => handleIntensityChange(Number(e.target.value))}
              />
            </div>

            {/* Preview */}
            <ThemePreview vars={liveVars} />

            {/* Exportar */}
            <button className="te-export-btn" onClick={handleExportJS}>
              {copied ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Exportar JS</>}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
