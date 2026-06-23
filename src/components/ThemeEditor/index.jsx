import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2, Copy, Check, Palette } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ACCENT_THEMES } from '../../context/accentThemes';
import { deriveAccentVars, gradientString, hexToRgb } from './colorUtils';
import ThemePreview from './ThemePreview';
import './ThemeEditor.css';

// ─── Helpers ────────────────────────────────────────────────────────────────

function isValidHex(v) { return /^#[0-9a-fA-F]{6}$/.test(v); }

function buildCustomTheme(id, name, colors, angle, intensity) {
  return {
    id,
    name,
    colors,
    angle,
    intensity,
    gradient: gradientString(colors, angle),
    dark:  deriveAccentVars(colors, angle, intensity, 'dark'),
    light: deriveAccentVars(colors, angle, intensity, 'light'),
  };
}

// ─── Botão flutuante (renderizado em App.jsx) ────────────────────────────────

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

  const [editMode, setEditMode]   = useState(isDark ? 'dark' : 'light');
  const [selected, setSelected]   = useState(accent);
  const [copied, setCopied]       = useState(false);

  // Estado de edição local (colors, angle, intensity)
  const [colors,    setColors]    = useState(['#2dd4bf', '#7c5cff']);
  const [angle,     setAngle]     = useState(135);
  const [intensity, setIntensity] = useState(100);
  const [name,      setName]      = useState('');

  const allBuiltIn = ACCENT_THEMES;
  const selectedCustom = customThemes.find(t => t.id === selected);
  const selectedBuiltIn = allBuiltIn.find(t => t.id === selected);
  const isCustom = !!selectedCustom;

  // Carrega estado quando muda o tema selecionado
  useEffect(() => {
    if (selectedCustom) {
      setColors(selectedCustom.colors || ['#2dd4bf']);
      setAngle(selectedCustom.angle ?? 135);
      setIntensity(selectedCustom.intensity ?? 100);
      setName(selectedCustom.name || '');
    } else if (selectedBuiltIn) {
      setName(selectedBuiltIn.id);
    }
  }, [selected]);

  // Variáveis derivadas ao vivo (para preview)
  const liveVars = isCustom
    ? deriveAccentVars(colors, angle, intensity, editMode)
    : null;

  // Aplica ao vivo no DOM quando editando tema custom
  useEffect(() => {
    if (!isCustom || !liveVars) return;
    const root = document.documentElement;
    Object.entries(liveVars).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [liveVars, isCustom]);

  // ── Ações ─────────────────────────────────────────────────────────────────

  const handleSelectTheme = useCallback((id) => {
    setSelected(id);
    setAccent(id);
  }, [setAccent]);

  const handleAddTheme = useCallback(() => {
    const id = `custom-${Date.now()}`;
    const srcTheme = selectedCustom || { colors: ['#2dd4bf', '#7c5cff'], angle: 135, intensity: 100 };
    const newTheme = buildCustomTheme(id, 'Novo Tema', srcTheme.colors, srcTheme.angle ?? 135, srcTheme.intensity ?? 100);
    setCustomThemes([...customThemes, newTheme]);
    handleSelectTheme(id);
  }, [customThemes, selectedCustom, setCustomThemes, handleSelectTheme]);

  const handleRemoveTheme = useCallback((id) => {
    const updated = customThemes.filter(t => t.id !== id);
    setCustomThemes(updated);
    if (selected === id) handleSelectTheme(allBuiltIn[0].id);
  }, [customThemes, selected, setCustomThemes, handleSelectTheme, allBuiltIn]);

  const handleSave = useCallback(() => {
    if (!isCustom) return;
    const updated = customThemes.map(t =>
      t.id === selected ? buildCustomTheme(t.id, name, colors, angle, intensity) : t
    );
    setCustomThemes(updated);
  }, [isCustom, customThemes, selected, name, colors, angle, intensity, setCustomThemes]);

  // Salva automaticamente ao mudar qualquer campo
  useEffect(() => {
    if (!isCustom) return;
    const updated = customThemes.map(t =>
      t.id === selected ? buildCustomTheme(t.id, name || t.name, colors, angle, intensity) : t
    );
    setCustomThemes(updated);
  }, [colors, angle, intensity, name]);

  const handleColorChange = useCallback((idx, value) => {
    const next = [...colors];
    next[idx] = value;
    setColors(next);
  }, [colors]);

  const handleAddColor = useCallback(() => {
    if (colors.length >= 3) return;
    setColors([...colors, '#7c5cff']);
  }, [colors]);

  const handleRemoveColor = useCallback((idx) => {
    if (colors.length <= 1) return;
    setColors(colors.filter((_, i) => i !== idx));
  }, [colors]);

  const handleExportJS = useCallback(() => {
    if (!isCustom) return;
    const theme = customThemes.find(t => t.id === selected);
    if (!theme) return;

    const darkStr  = JSON.stringify(theme.dark, null, 6).replace(/"/g, "'");
    const lightStr = JSON.stringify(theme.light, null, 6).replace(/"/g, "'");
    const code = `  {
    id: '${theme.id}',
    labelKey: 'theme_${name.toLowerCase().replace(/\s+/g, '_')}',
    gradient: '${theme.gradient}',
    dark: ${darkStr},
    light: ${lightStr},
  },`;

    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [isCustom, customThemes, selected, name]);

  // ── Render ─────────────────────────────────────────────────────────────────

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

          {/* ── Coluna esquerda: lista de temas ── */}
          <div className="te-sidebar">

            <span className="te-section-label">Sistema</span>
            {allBuiltIn.map(t => (
              <button
                key={t.id}
                className={`te-theme-item ${selected === t.id ? 'te-theme-item--active' : ''}`}
                onClick={() => handleSelectTheme(t.id)}
              >
                <span className="te-swatch" style={{ background: t.gradient }} />
                <span className="te-theme-name">{t.id}</span>
              </button>
            ))}

            {customThemes.length > 0 && (
              <>
                <span className="te-section-label" style={{ marginTop: 14 }}>Personalizados</span>
                {customThemes.map(t => (
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

            <button className="te-add-theme-btn" onClick={handleAddTheme}>
              <Plus size={12} /> Novo tema
            </button>
          </div>

          {/* ── Coluna direita: editor ── */}
          <div className="te-editor">

            {!isCustom ? (
              /* Tema built-in — somente leitura */
              <div className="te-readonly">
                <div className="te-readonly-swatch" style={{ background: selectedBuiltIn?.gradient }} />
                <span className="te-readonly-name">{selectedBuiltIn?.id}</span>
                <span className="te-readonly-hint">Tema do sistema — somente leitura</span>
                <button className="te-add-theme-btn" onClick={handleAddTheme}>
                  <Plus size={12} /> Criar baseado neste
                </button>
              </div>
            ) : (
              /* Tema customizado — editável */
              <>
                {/* Nome */}
                <div className="te-field">
                  <label className="te-label">Nome</label>
                  <input
                    className="te-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Meu Tema"
                  />
                </div>

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
                <div
                  className="te-gradient-bar"
                  style={{ background: gradientString(colors, angle) }}
                />

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
                    onChange={e => setAngle(Number(e.target.value))}
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
                    onChange={e => setIntensity(Number(e.target.value))}
                  />
                </div>

                {/* Preview */}
                <ThemePreview vars={liveVars} />

                {/* Exportar */}
                <button className="te-export-btn" onClick={handleExportJS}>
                  {copied
                    ? <><Check size={12} /> Copiado!</>
                    : <><Copy size={12} /> Exportar JS</>
                  }
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
