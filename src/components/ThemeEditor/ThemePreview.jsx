export default function ThemePreview({ vars }) {
  if (!vars) return null;

  return (
    <div className="te-preview">
      <span className="te-section-label">Preview</span>
      <div className="te-preview-grid">

        {/* Card hover */}
        <div className="te-preview-item">
          <span className="te-preview-item-label">Card hover</span>
          <div className="te-preview-card" style={{
            borderColor: vars['--accent-border'],
            boxShadow: `0 0 0 1px ${vars['--accent-border']}, 0 6px 20px ${vars['--accent-bg']}`,
          }}>
            <div className="te-preview-card-cover" style={{
              background: `linear-gradient(145deg, ${vars['--accent-grad-icon-from']}, ${vars['--accent-grad-icon-to']})`,
              opacity: 0.25,
            }} />
            <div className="te-preview-card-body">
              <div className="te-preview-card-title" />
              <div className="te-preview-progress-track">
                <div className="te-preview-progress-fill" style={{
                  background: vars['--accent-progress-gradient'],
                  width: '60%',
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar ativo */}
        <div className="te-preview-item">
          <span className="te-preview-item-label">Sidebar ativo</span>
          <div className="te-preview-sidebar-item" style={{
            background: vars['--accent-bg'],
            border: `1px solid ${vars['--accent-border']}`,
            color: vars['--accent-fg'],
          }}>
            <div className="te-preview-indicator" style={{ background: vars['--accent-indicator-gradient'] }} />
            <span>Biblioteca</span>
          </div>
        </div>

        {/* Botão primário */}
        <div className="te-preview-item">
          <span className="te-preview-item-label">Botão primário</span>
          <div className="te-preview-btn" style={{ background: vars['--accent-btn-gradient'] }}>
            + Adicionar
          </div>
        </div>

        {/* Focus ring */}
        <div className="te-preview-item">
          <span className="te-preview-item-label">Focus ring</span>
          <div className="te-preview-input" style={{
            outline: `2px solid ${vars['--accent-focus-color']}`,
          }}>
            Buscar obras...
          </div>
        </div>

        {/* Logo lockup */}
        <div className="te-preview-item">
          <span className="te-preview-item-label">Logo</span>
          <div className="te-preview-logo">
            <div className="te-preview-logo-icon" style={{
              background: `linear-gradient(145deg, ${vars['--accent-grad-icon-from']}, ${vars['--accent-grad-icon-to']})`,
            }}>
              <span>Yo</span>
            </div>
            <span className="te-preview-logo-text">
              <span style={{
                background: `linear-gradient(120deg, ${vars['--accent-grad-from']}, ${vars['--accent-grad-to']})`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Yo</span>kanri
            </span>
          </div>
        </div>

        {/* Badge */}
        <div className="te-preview-item">
          <span className="te-preview-item-label">Badge</span>
          <div className="te-preview-badge" style={{
            background: vars['--accent-bg'],
            border: `1px solid ${vars['--accent-border']}`,
            color: vars['--accent-fg'],
          }}>
            ♥ Supporter
          </div>
        </div>

      </div>
    </div>
  );
}
