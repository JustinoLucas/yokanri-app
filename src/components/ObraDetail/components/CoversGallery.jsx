import { useLanguage } from '../../../i18n/LanguageContext';

function CoversGallery({ covers, selectedIndex, onSelectCover }) {
  const { t } = useLanguage();

  if (covers.length <= 1) return null;

  return (
    <div className="covers-gallery-detail">
      {covers.map((cover, index) => (
        <div
          key={index}
          className={`gallery-thumb ${index === selectedIndex ? 'active' : ''} ${cover.principal ? 'principal' : ''}`}
          onClick={() => onSelectCover(index)}
        >
          <img src={cover.url} alt={`Capa ${index + 1}`} />
          {cover.principal && <span className="thumb-badge">{t('cover_principal')}</span>}
        </div>
      ))}
    </div>
  );
}

export default CoversGallery;
