/**
 * GenresSection - Genres tags display
 * Shows all genres associated with the work as styled tags
 */
function GenresSection({ generos }) {
  if (!generos || generos.length === 0) return null;

  return (
    <section className="detail-section">
      <h3>Gêneros</h3>
      <div className="generos-tags">
        {generos.map(genero => (
          <span key={genero} className="genero-tag">{genero}</span>
        ))}
      </div>
    </section>
  );
}

export default GenresSection;
