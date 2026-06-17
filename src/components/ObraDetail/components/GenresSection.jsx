import { useConfig } from '../../../context/ConfigContext';
import { useLanguage } from '../../../i18n/LanguageContext';
import { getItemLabel } from '../../../i18n/itemLabel';

function GenresSection({ generos }) {
  const config = useConfig();
  const { t } = useLanguage();

  if (!generos || generos.length === 0) return null;

  return (
    <section className="detail-section">
      <h3>Gêneros</h3>
      <div className="generos-tags">
        {generos.map(genero => {
          const item = config?.generos?.find(g => g.label === genero);
          return (
            <span key={genero} className="genero-tag">
              {getItemLabel(item, t) || genero}
            </span>
          );
        })}
      </div>
    </section>
  );
}

export default GenresSection;
