import { Square, CheckSquare } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';

function LinksSection({ formData, onChange, linksManager }) {
  const { t } = useLanguage();
  const { linksState, handleAddLink, handleRemoveLink, handleLinkChange, handleSetLinkPrincipal } = linksManager;

  return (
    <section className="form-section">
      <h3>{t('form_section_links')}</h3>

      {linksState.length > 0 && (
        <div className="links-list">
          {linksState.map((link, index) => (
            <div key={index} className={`link-item-form ${link.principal ? 'principal' : ''}`}>
              <div className="link-fields">
                <div className="form-group">
                  <label>{t('form_link_name_label')}</label>
                  <input
                    type="text"
                    value={link.nome}
                    onChange={(e) => handleLinkChange(index, 'nome', e.target.value)}
                    placeholder={t('form_link_name_ph')}
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
                {link.principal && <span className="badge-principal-link">{t('cover_principal')}</span>}
                {!link.principal && (
                  <button
                    type="button"
                    className="btn-small"
                    onClick={() => handleSetLinkPrincipal(index)}
                  >
                    {t('form_link_set_main')}
                  </button>
                )}
                <button
                  type="button"
                  className="btn-small btn-danger"
                  onClick={() => handleRemoveLink(index)}
                >
                  {t('form_link_remove')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        className="btn-secondary"
        onClick={handleAddLink}
        style={{ marginTop: linksState.length > 0 ? '16px' : '0' }}
      >
        + {t('form_link_add')}
      </button>

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
          {t('form_link_auto_increment')}
        </label>
      </div>
    </section>
  );
}

export default LinksSection;
