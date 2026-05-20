/**
 * CoversGallery - Thumbnail gallery for multiple covers
 * Displays all available covers with visual indication of selected and principal cover
 */
function CoversGallery({ covers, selectedIndex, onSelectCover }) {
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
          {cover.principal && <span className="thumb-badge">Principal</span>}
        </div>
      ))}
    </div>
  );
}

export default CoversGallery;
