import { ChevronDown, Search } from 'lucide-react';
import { TIPO_OBRA } from '../../../types/obra';

/**
 * Basic information section of the form
 * Includes: name, alternative name, author, studio, type, and year
 */
function BasicInfoSection({ formData, onChange, onSearchClick }) {
  return (
    <section className="form-section">
      <h3>Informações Básicas</h3>

      <div className="form-group">
        <label>Nome *</label>
        <div className="input-with-button">
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => onChange('nome', e.target.value)}
            placeholder="Nome da obra"
            required
          />
          {formData.nome.trim() && (
            <button
              type="button"
              className="search-btn"
              onClick={onSearchClick}
              title="Buscar dados na AniList"
            >
              <Search size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="form-group">
        <label>Nome Alternativo</label>
        <input
          type="text"
          value={formData.nomeAlternativo}
          onChange={(e) => onChange('nomeAlternativo', e.target.value)}
          placeholder="Nome em coreano/chinês/japonês"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Autor</label>
          <input
            type="text"
            value={formData.autor}
            onChange={(e) => onChange('autor', e.target.value)}
            placeholder="Nome do autor"
          />
        </div>

        <div className="form-group">
          <label>Estúdio/Artista</label>
          <input
            type="text"
            value={formData.studio}
            onChange={(e) => onChange('studio', e.target.value)}
            placeholder="Estúdio ou grupo"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Tipo</label>
          <div className="custom-select-wrapper">
            <select
              className="custom-select"
              value={formData.tipo}
              onChange={(e) => onChange('tipo', e.target.value)}
            >
              {Object.values(TIPO_OBRA).map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
            <ChevronDown size={16} className="custom-select-icon" />
          </div>
        </div>

        <div className="form-group">
          <label>Ano de Lançamento</label>
          <input
            type="number"
            value={formData.anoLancamento || ''}
            onChange={(e) => onChange('anoLancamento', e.target.value ? parseInt(e.target.value) : null)}
            placeholder="Ano do 1º capítulo"
            min="1900"
            max={new Date().getFullYear() + 1}
          />
        </div>
      </div>
    </section>
  );
}

export default BasicInfoSection;
