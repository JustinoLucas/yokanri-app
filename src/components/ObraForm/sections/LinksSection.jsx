import { Square, CheckSquare } from 'lucide-react';

/**
 * Links section
 * Manages multiple links with principal selection and auto-increment feature
 */
function LinksSection({ formData, onChange, linksManager }) {
  const { linksState, handleAddLink, handleRemoveLink, handleLinkChange, handleSetLinkPrincipal } = linksManager;

  return (
    <section className="form-section">
      <h3>Links</h3>

      {/* List of links */}
      {linksState.length > 0 && (
        <div className="links-list">
          {linksState.map((link, index) => (
            <div key={index} className={`link-item-form ${link.principal ? 'principal' : ''}`}>
              <div className="link-fields">
                <div className="form-group">
                  <label>Nome do Site</label>
                  <input
                    type="text"
                    value={link.nome}
                    onChange={(e) => handleLinkChange(index, 'nome', e.target.value)}
                    placeholder="Ex: Se Liga Nerd"
                  />
                </div>

                <div className="form-group">
                  <label>URL</label>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="link-actions">
                {link.principal && <span className="badge-principal-link">Principal</span>}
                {!link.principal && (
                  <button
                    type="button"
                    className="btn-small"
                    onClick={() => handleSetLinkPrincipal(index)}
                    title="Definir como principal"
                  >
                    Definir Principal
                  </button>
                )}
                <button
                  type="button"
                  className="btn-small btn-danger"
                  onClick={() => handleRemoveLink(index)}
                  title="Remover link"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Button to add new link */}
      <button
        type="button"
        className="btn-secondary"
        onClick={handleAddLink}
        style={{ marginTop: linksState.length > 0 ? '16px' : '0' }}
      >
        + Adicionar Link
      </button>

      {/* Auto-increment feature */}
      <div className="form-group" style={{ marginTop: '16px' }}>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.autoIncrementOnLink}
            onChange={(e) => onChange('autoIncrementOnLink', e.target.checked)}
            style={{ display: 'none' }}
          />
          {formData.autoIncrementOnLink ? (
            <CheckSquare size={18} className="checkbox-icon-checked" />
          ) : (
            <Square size={18} className="checkbox-icon-unchecked" />
          )}
          Auto-incrementar capítulo ao clicar no link principal
        </label>
      </div>
    </section>
  );
}

export default LinksSection;
