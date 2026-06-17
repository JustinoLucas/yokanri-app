import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';

function CoversSection({ capasManager }) {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const {
    capasPreviews,
    novasCapas,
    handleAddCapas,
    handleRemoveCapa,
    handleSetPrincipal
  } = capasManager;

  return (
    <section className="form-section">
      <h3>{t('form_section_covers')}</h3>

      {capasPreviews.length > 0 && (
        <div className="capas-gallery">
          {capasPreviews.map((capa, index) => (
            <div key={index} className={`capa-item ${capa.principal ? 'principal' : ''}`}>
              <img src={capa.url} alt={`Capa ${index + 1}`} />
              <div className="capa-overlay">
                {capa.principal && <span className="badge-principal">{t('cover_principal')}</span>}
                <div className="capa-actions">
                  {!capa.principal && (
                    <button
                      type="button"
                      className="btn-small"
                      onClick={() => handleSetPrincipal(index)}
                    >
                      {t('form_cover_set_main')}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-small btn-danger"
                    onClick={() => handleRemoveCapa(index)}
                  >
                    {t('form_cover_remove')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="form-group">
        <label>{t('form_cover_add_label')}</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleAddCapas(e.target.files)}
          style={{ display: 'none' }}
        />
        <div className="cover-upload-btn-row">
          <button
            type="button"
            className="cover-upload-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={14} />
            {t('form_cover_select_btn')}
          </button>
          <span className="cover-upload-status">
            {novasCapas.length > 0
              ? `${novasCapas.length} ${novasCapas.length === 1 ? t('form_cover_file_singular') : t('form_cover_file_plural')}`
              : t('form_cover_no_files')
            }
          </span>
        </div>
        <small className="cover-upload-hint">
          {t('form_cover_hint')}
        </small>
      </div>
    </section>
  );
}

export default CoversSection;
