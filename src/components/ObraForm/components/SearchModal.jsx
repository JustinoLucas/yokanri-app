import { useState } from 'react';
import { Search, X, Loader } from 'lucide-react';
import { searchManga as searchAniList } from '../../../services/anilistService';
import { searchManga as searchMangaDex } from '../../../services/mangadexService';
import { searchManga as searchMangaUpdates, getSeriesDetails as getMangaUpdatesDetails } from '../../../services/mangaUpdatesService';
import './SearchModal.css';

/**
 * Normaliza os dados de exibição de um resultado de busca, que tem
 * formatos diferentes dependendo da fonte (AniList, MangaDex, MangaUpdates).
 */
function getDisplayInfo(manga) {
  switch (manga._source) {
    case 'mangadex': {
      const title = manga.attributes?.title;
      const displayTitle = title?.['pt-br'] || title?.['pt'] || title?.en || Object.values(title || {})[0] || 'Sem título';
      const coverRel = manga.relationships?.find(r => r.type === 'cover_art');

      return {
        id: manga.id,
        displayTitle,
        altTitle: title?.en !== displayTitle ? title?.en : title?.['ja-ro'] || '',
        coverUrl: coverRel ? `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes?.fileName}.256.jpg` : null,
        country: manga.attributes?.originalLanguage,
        status: manga.attributes?.status,
        chapters: manga.attributes?.lastChapter,
        scoreLabel: null,
        genres: manga.attributes?.tags?.slice(0, 4).map(t => t.attributes?.name?.en).filter(Boolean) || [],
        badgeLabel: 'MangaDex',
        badgeColor: '#ff6740',
      };
    }

    case 'mangaupdates': {
      const typeToCountry = { 'Manga': 'JP', 'Manhwa': 'KR', 'Manhua': 'CN' };

      return {
        id: manga.series_id,
        displayTitle: manga.title || 'Sem título',
        altTitle: '',
        coverUrl: manga.image?.url?.thumb || manga.image?.url?.original || null,
        country: typeToCountry[manga.type] || null,
        status: null,
        chapters: null,
        scoreLabel: manga.bayesian_rating ? `⭐ ${manga.bayesian_rating.toFixed(1)}/10` : null,
        genres: (manga.genres || []).slice(0, 4).map(g => g.genre),
        badgeLabel: 'MangaUpdates',
        badgeColor: '#2563eb',
      };
    }

    default: { // anilist
      const title = manga.title;

      return {
        id: manga.id,
        displayTitle: title?.english || title?.romaji || 'Sem título',
        altTitle: title?.native || '',
        coverUrl: manga.coverImage?.medium,
        country: manga.countryOfOrigin,
        status: manga.status,
        chapters: manga.chapters,
        scoreLabel: manga.averageScore ? `⭐ ${manga.averageScore}%` : null,
        genres: manga.genres || [],
        badgeLabel: 'AniList',
        badgeColor: '#3db4f2',
      };
    }
  }
}

/**
 * SearchModal - Modal for searching manga on AniList, MangaDex and MangaUpdates
 */
function SearchModal({ isOpen, onClose, onSelect, initialSearch = '' }) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [selectingKey, setSelectingKey] = useState(null);

  const handleSearch = async (e) => {
    e?.preventDefault();

    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const [anilistResult, mangadexResult, mangaUpdatesResult] = await Promise.allSettled([
        searchAniList(searchTerm),
        searchMangaDex(searchTerm),
        searchMangaUpdates(searchTerm),
      ]);

      const combinedResults = [];

      if (anilistResult.status === 'fulfilled') {
        combinedResults.push(...anilistResult.value.map(manga => ({ ...manga, _source: 'anilist' })));
      } else {
        console.error('AniList search error:', anilistResult.reason);
      }

      if (mangadexResult.status === 'fulfilled') {
        combinedResults.push(...mangadexResult.value.map(manga => ({ ...manga, _source: 'mangadex' })));
      } else {
        console.error('MangaDex search error:', mangadexResult.reason);
      }

      if (mangaUpdatesResult.status === 'fulfilled') {
        combinedResults.push(...mangaUpdatesResult.value.map(manga => ({ ...manga, _source: 'mangaupdates' })));
      } else {
        console.error('MangaUpdates search error:', mangaUpdatesResult.reason);
      }

      const allFailed = [anilistResult, mangadexResult, mangaUpdatesResult].every(r => r.status === 'rejected');
      if (combinedResults.length === 0 && allFailed) {
        setError('Erro ao buscar mangás. Tente novamente.');
      }

      setResults(combinedResults);
    } catch (err) {
      setError('Erro ao buscar mangás. Tente novamente.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (manga, key) => {
    if (manga._source === 'mangaupdates') {
      setSelectingKey(key);
      try {
        const details = await getMangaUpdatesDetails(manga.series_id);
        onSelect({ ...details, _source: 'mangaupdates' });
        onClose();
      } catch (err) {
        console.error('MangaUpdates details error:', err);
        setError('Erro ao carregar detalhes da obra. Tente novamente.');
      } finally {
        setSelectingKey(null);
      }
      return;
    }

    onSelect(manga);
    onClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    setResults([]);
    setError(null);
    setSearched(false);
    setSelectingKey(null);
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
                const info = getDisplayInfo(manga);
                const key = `${manga._source}-${info.id}`;
                const isSelecting = selectingKey === key;

                return (
                  <div
                    key={key}
                    className={`search-result-item${isSelecting ? ' search-result-item--loading' : ''}`}
                    onClick={() => handleSelect(manga, key)}
                  >
                    <div className="result-cover">
                      {info.coverUrl ? (
                        <img src={info.coverUrl} alt={info.displayTitle} />
                      ) : (
                        <div className="result-cover-placeholder">?</div>
                      )}
                    </div>
                    <div className="result-info">
                      <h3 className="result-title">{info.displayTitle}</h3>
                      {info.altTitle && <p className="result-title-alt">{info.altTitle}</p>}
                      <div className="result-meta">
                        <span className="result-badge" style={{
                          background: info.badgeColor,
                          color: 'white'
                        }}>
                          {info.badgeLabel}
                        </span>
                        {info.country && (
                          <span className="result-badge">
                            {info.country === 'KR' || info.country === 'ko' ? '🇰🇷 Manhwa' : ''}
                            {info.country === 'CN' || info.country === 'zh' || info.country === 'zh-hk' ? '🇨🇳 Manhua' : ''}
                            {info.country === 'JP' || info.country === 'ja' ? '🇯🇵 Manga' : ''}
                            {info.country === 'TW' ? '🇹🇼 Manhua' : ''}
                          </span>
                        )}
                        {info.status && <span className="result-badge">{info.status}</span>}
                        {info.chapters && <span className="result-badge">{info.chapters} caps</span>}
                        {info.scoreLabel && <span className="result-badge">{info.scoreLabel}</span>}
                      </div>
                      {info.genres.length > 0 && (
                        <div className="result-genres">
                          {info.genres.slice(0, 4).map((genre, idx) => (
                            <span key={idx} className="result-genre-tag">{genre}</span>
                          ))}
                          {info.genres.length > 4 && (
                            <span className="result-genre-tag">+{info.genres.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>
                    {isSelecting && (
                      <div className="result-loading-overlay">
                        <Loader size={20} className="spinning" />
                      </div>
                    )}
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
                Busca em <strong>AniList</strong>, <strong>MangaDex</strong> e <strong>MangaUpdates</strong> (use títulos em inglês ou romanizados)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
