import { GENEROS } from '../../../types/obra';
import GenreCheckbox from '../components/GenreCheckbox';

function GenresSection({ formData, onGenreToggle, generosList }) {
  const generos = generosList?.map(g => g.label) ?? GENEROS;

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
