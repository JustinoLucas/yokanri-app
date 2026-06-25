import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2, Palette, RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ACCENT_THEMES } from '../../context/accentThemes';
import { defaultComponents, gradientString, parseGradientColors } from './colorUtils';
import './ThemeEditor.css';

// ─── Helpers ────────────────────────────────────────────────────────────────

function swatchFor(theme) {
  if (theme?.gradient) return theme.gradient;
  if (theme?.components?.logoIcon) {
    const c = theme.components.logoIcon;
    return gradientString(c.colors, c.angle ?? 145);
  }
  return '#888';
}

function initialComponents(theme) {
  if (!theme) return defaultComponents();
  if (theme.components) return JSON.parse(JSON.stringify(theme.components));
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

// ─── Painel principal ────────────────────────────────────────────────────────

export default function ThemeEditor({ onClose }) {
  const {
    accent, setAccent,
    customThemes, setCustomThemes,
    hiddenIds, setHiddenIds,
  } = useTheme();

  const [selected, setSelected] = useState(accent);
  const [name,     setName]     = useState('');

  const builtIn        = ACCENT_THEMES.find(t => t.id === selected);
  const customOverride = customThemes.find(t => t.id === selected);
  const hasOverride    = !!builtIn && !!customOverride;
  const activeTheme    = customOverride || builtIn;
  const pureCustom     = customThemes.filter(t => !ACCENT_THEMES.find(b => b.id === t.id));
  const visibleBuiltIn = ACCENT_THEMES.filter(t => !hiddenIds.includes(t.id));

  // Carrega nome ao mudar seleção
  useEffect(() => {
    setName(customOverride?.name || builtIn?.id || '');
  }, [selected]);

  const handleSelectTheme = useCallback((id) => {
    setSelected(id);
    setAccent(id);
  }, [setAccent]);

  const handleNameChange = useCallback((v) => {
    setName(v);
    // Persiste nome no override
    const existing = customThemes.find(t => t.id === selected);
    if (existing) {
      setCustomThemes(customThemes.map(t => t.id === selected ? { ...t, name: v } : t));
    } else if (builtIn) {
      // Cria override só com o nome
      const comps = initialComponents(builtIn);
      setCustomThemes([...customThemes, {
        id: selected,
        name: v,
        components: comps,
        gradient: builtIn.gradient,
      }]);
    }
  }, [selected, builtIn, customThemes, setCustomThemes]);

  const handleAddTheme = useCallback(() => {
    const id    = `custom-${Date.now()}`;
    const comps = initialComponents(activeTheme);
    setCustomThemes([...customThemes, {
      id,
      name: 'Novo Tema',
      components: comps,
      gradient: swatchFor(activeTheme),
    }]);
    handleSelectTheme(id);
  }, [activeTheme, customThemes, setCustomThemes, handleSelectTheme]);

  const handleRemoveTheme = useCallback((id) => {
    // Custom puro: deleta
    setCustomThemes(customThemes.filter(t => t.id !== id));
    if (selected === id) handleSelectTheme(visibleBuiltIn[0]?.id || ACCENT_THEMES[0].id);
  }, [customThemes, selected, setCustomThemes, handleSelectTheme, visibleBuiltIn]);

  const handleHideBuiltIn = useCallback((id) => {
    // Remove override se existir
    const updated = customThemes.filter(t => t.id !== id);
    if (updated.length !== customThemes.length) setCustomThemes(updated);
    // Oculta da lista
    setHiddenIds([...hiddenIds, id]);
    if (selected === id) {
      const next = visibleBuiltIn.find(t => t.id !== id);
      handleSelectTheme(next?.id || pureCustom[0]?.id || ACCENT_THEMES[0].id);
    }
  }, [hiddenIds, setHiddenIds, customThemes, setCustomThemes, selected, visibleBuiltIn, pureCustom, handleSelectTheme]);

  const handleReset = useCallback(() => {
    setCustomThemes(customThemes.filter(t => t.id !== selected));
    setName(builtIn?.id || '');
  }, [selected, builtIn, customThemes, setCustomThemes]);

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
            {visibleBuiltIn.map(t => {
              const ov = customThemes.find(c => c.id === t.id);
              return (
                <button key={t.id}
                  className={`te-theme-item ${selected === t.id ? 'te-theme-item--active' : ''}`}
                  onClick={() => handleSelectTheme(t.id)}
                >
                  <span className="te-swatch" style={{ background: swatchFor(ov || t) }} />
                  <span className="te-theme-name">{ov?.name || t.id}</span>
                  {ov && <span className="te-modified-dot" />}
                  <button className="te-item-delete te-item-delete--visible"
                    onClick={e => { e.stopPropagation(); handleHideBuiltIn(t.id); }}
                    title="Remover da lista"
                  ><Trash2 size={10} /></button>
                </button>
              );
            })}

            {hiddenIds.length > 0 && (
              <button className="te-restore-btn" onClick={() => setHiddenIds([])}>
                Restaurar todos ({hiddenIds.length})
              </button>
            )}

            {pureCustom.length > 0 && <>
              <span className="te-section-label" style={{ marginTop: 14 }}>Personalizados</span>
              {pureCustom.map(t => (
                <button key={t.id}
                  className={`te-theme-item ${selected === t.id ? 'te-theme-item--active' : ''}`}
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

          {/* ── Editor simplificado ── */}
          <div className="te-editor te-editor--simple">
            <div className="te-simple-swatch" style={{ background: swatchFor(customOverride || builtIn) }} />

            <div className="te-field">
              <label className="te-label">Nome</label>
              <input
                className="te-input"
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="Nome do tema"
              />
            </div>

            {hasOverride && (
              <button className="te-reset-btn" onClick={handleReset}>
                <RotateCcw size={11} /> Restaurar padrão
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
