/**
 * Covers section
 * Manages multiple cover images with principal selection
 */
function CoversSection({ capasManager }) {
  const {
    capasPreviews,
    novasCapas,
    handleAddCapas,
    handleRemoveCapa,
    handleSetPrincipal
  } = capasManager;

  return (
    <section className="form-section">
      <h3>Capas</h3>

      {/* Gallery of covers */}
      {capasPreviews.length > 0 && (
        <div className="capas-gallery">
          {capasPreviews.map((capa, index) => (
            <div key={index} className={`capa-item ${capa.principal ? 'principal' : ''}`}>
              <img src={capa.url} alt={`Capa ${index + 1}`} />
              <div className="capa-overlay">
                {capa.principal && <span className="badge-principal">Principal</span>}
                <div className="capa-actions">
                  {!capa.principal && (
                    <button
                      type="button"
                      className="btn-small"
                      onClick={() => handleSetPrincipal(index)}
                      title="Definir como principal"
                    >
                      Definir Principal
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-small btn-danger"
                    onClick={() => handleRemoveCapa(index)}
                    title="Remover capa"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload new covers */}
      <div className="form-group">
        <label>Adicionar Capas (múltiplas)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleAddCapas(e.target.files)}
        />
        {novasCapas.length > 0 && (
          <small style={{ fontSize: '12px', color: 'var(--accent-primary)', marginTop: '4px', display: 'block' }}>
            {novasCapas.length} {novasCapas.length === 1 ? 'arquivo selecionado' : 'arquivos selecionados'}
          </small>
        )}
        <small style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Você pode selecionar múltiplas imagens de uma vez. A primeira será definida como principal.
        </small>
      </div>
    </section>
  );
}

export default CoversSection;
