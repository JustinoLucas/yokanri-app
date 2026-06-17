import { GENEROS } from '../../../types/obra';
import GenreCheckbox from '../components/GenreCheckbox';
import { useLanguage } from '../../../i18n/LanguageContext';
import { getItemLabel } from '../../../i18n/itemLabel';

function GenresSection({ formData, onGenreToggle, generosList }) {
  const { t } = useLanguage();
  const generos = (generosList ?? GENEROS.map(label => ({ label })))
    .slice()
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }));

  return (
    <section className="form-section">
      <h3>{t('form_section_genres')}</h3>
      <div className="generos-grid">
        {generos.map(g => (
          <GenreCheckbox
            key={g.label}
            genre={g.label}
            displayLabel={getItemLabel(g, t)}
            isSelected={formData.generos.includes(g.label)}
            onToggle={onGenreToggle}
          />
        ))}
      </div>
    </section>
  );
}

export default GenresSection;
