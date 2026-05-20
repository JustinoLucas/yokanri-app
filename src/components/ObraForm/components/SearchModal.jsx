import { useState } from 'react';
import { Search, X, Loader } from 'lucide-react';
import { searchManga as searchAniList } from '../../../services/anilistService';
import { searchManga as searchMangaDex } from '../../../services/mangadexService';
import './SearchModal.css';

/**
 * SearchModal - Modal for searching manga on AniList and MangaDex
 */
function SearchModal({ isOpen, onClose, onSelect, initialSearch = '' }) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();

    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      // Use only AniList (MangaDex has CORS issues in development)
      const anilistResults = await searchAniList(searchTerm);

      // Add source tag to results
      const combinedResults = anilistResults.map(manga => ({
        ...manga,
        _source: 'anilist',
      }));

      setResults(combinedResults);
    } catch (err) {
      setError('Erro ao buscar mangás. Tente novamente.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (manga) => {
    onSelect(manga);
    onClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    setResults([]);
    setError(null);
    setSearched(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Buscar Manga/Manhwa</h2>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-group">
            <input
              type="text"
              className="search-input"
              placeholder="Digite o nome do manga..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="search-submit-btn"
              disabled={loading || !searchTerm.trim()}
            >
              {loading ? <Loader size={18} className="spinning" /> : <Search size={18} />}
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </form>

        <div className="search-results">
          {error && (
            <div className="search-error">
              <p>{error}</p>
            </div>
          )}

          {loading && (
            <div className="search-loading">
              <Loader size={32} className="spinning" />
              <p>Buscando mangás...</p>
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="search-empty">
              <p>Nenhum resultado encontrado para "{searchTerm}"</p>
              <p className="search-empty-hint">Tente buscar com outro nome ou em inglês</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="search-results-list">
              {results.map((manga) => {
                const isMangaDex = manga._source === 'mangadex';

                // Get data based on source
                const title = isMangaDex
                  ? manga.attributes?.title
                  : manga.title;

                const displayTitle = isMangaDex
                  ? (title?.['pt-br'] || title?.['pt'] || title?.en || Object.values(title || {})[0] || 'Sem título')
                  : (title?.english || title?.romaji || 'Sem título');

                const altTitle = isMangaDex
                  ? (title?.en !== displayTitle ? title?.en : title?.['ja-ro'] || '')
                  : (title?.native || '');

                const coverUrl = isMangaDex
                  ? (() => {
                      const coverRel = manga.relationships?.find(r => r.type === 'cover_art');
                      return coverRel ? `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes?.fileName}.256.jpg` : null;
                    })()
                  : manga.coverImage?.medium;

                const country = isMangaDex
                  ? manga.attributes?.originalLanguage
                  : manga.countryOfOrigin;

                const status = isMangaDex
                  ? manga.attributes?.status
                  : manga.status;

                const chapters = isMangaDex
                  ? manga.attributes?.lastChapter
                  : manga.chapters;

                const score = isMangaDex
                  ? null
                  : manga.averageScore;

                const genres = isMangaDex
                  ? manga.attributes?.tags?.slice(0, 4).map(t => t.attributes?.name?.en).filter(Boolean) || []
                  : manga.genres || [];

                return (
                  <div
                    key={`${manga._source}-${manga.id}`}
                    className="search-result-item"
                    onClick={() => handleSelect(manga)}
                  >
                    <div className="result-cover">
                      {coverUrl ? (
                        <img src={coverUrl} alt={displayTitle} />
                      ) : (
                        <div className="result-cover-placeholder">?</div>
                      )}
                    </div>
                    <div className="result-info">
                      <h3 className="result-title">{displayTitle}</h3>
                      {altTitle && <p className="result-title-alt">{altTitle}</p>}
                      <div className="result-meta">
                        <span className="result-badge" style={{
                          background: isMangaDex ? '#ff6740' : '#3db4f2',
                          color: 'white'
                        }}>
                          {isMangaDex ? 'MangaDex' : 'AniList'}
                        </span>
                        {country && (
                          <span className="result-badge">
                            {country === 'KR' || country === 'ko' ? '🇰🇷 Manhwa' : ''}
                            {country === 'CN' || country === 'zh' || country === 'zh-hk' ? '🇨🇳 Manhua' : ''}
                            {country === 'JP' || country === 'ja' ? '🇯🇵 Manga' : ''}
                            {country === 'TW' ? '🇹🇼 Manhua' : ''}
                          </span>
                        )}
                        {status && <span className="result-badge">{status}</span>}
                        {chapters && <span className="result-badge">{chapters} caps</span>}
                        {score && <span className="result-badge">⭐ {score}%</span>}
                      </div>
                      {genres.length > 0 && (
                        <div className="result-genres">
                          {genres.slice(0, 4).map((genre, idx) => (
                            <span key={idx} className="result-genre-tag">{genre}</span>
                          ))}
                          {genres.length > 4 && (
                            <span className="result-genre-tag">+{genres.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !searched && (
            <div className="search-hint">
              <Search size={48} />
              <p>Digite o nome do manga e clique em buscar</p>
              <p className="search-hint-small">
                Busca em <strong>AniList</strong> (use títulos em inglês ou romanizados)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
