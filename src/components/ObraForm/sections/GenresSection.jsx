import { GENEROS } from '../../../types/obra';
import GenreCheckbox from '../components/GenreCheckbox';

function GenresSection({ formData, onGenreToggle, generosList }) {
  // Ordena em pt-BR (defensivo — garante ordem mesmo em dados legados)
  const generos = (generosList ?? GENEROS.map(label => ({ label })))
    .slice()
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }))
    .map(g => g.label);

  return (
    <section className="form-section">
      <h3>Gêneros</h3>
      <div className="generos-grid">
        {generos.map(genero => (
          <GenreCheckbox
            key={genero}
            genre={genero}
            isSelected={formData.generos.includes(genero)}
            onToggle={onGenreToggle}
          />
        ))}
      </div>
    </section>
  );
}

export default GenresSection;
