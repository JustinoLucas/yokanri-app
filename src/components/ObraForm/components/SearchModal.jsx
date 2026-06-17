import { useState } from 'react';
import { Search, X, Loader } from 'lucide-react';
import { searchManga as searchAniList } from '../../../services/anilistService';
import { searchManga as searchMangaDex } from '../../../services/mangadexService';
import { searchManga as searchMangaUpdates, getSeriesDetails as getMangaUpdatesDetails } from '../../../services/mangaUpdatesService';
import { useLanguage } from '../../../i18n/LanguageContext';
import './SearchModal.css';

/**
 * Fontes de busca disponíveis. O usuário pode escolher quais delas
 * são consultadas a cada busca.
 */
const SOURCES = [
  { key: 'anilist', label: 'AniList', color: '#3db4f2', search: searchAniList },
  { key: 'mangadex', label: 'MangaDex', color: '#ff6740', search: searchMangaDex },
  { key: 'mangaupdates', label: 'MangaUpdates', color: '#2563eb', search: searchMangaUpdates },
];

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
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [selectingKey, setSelectingKey] = useState(null);
  const [enabledSources, setEnabledSources] = useState(
    () => Object.fromEntries(SOURCES.map(s => [s.key, true]))
  );

  const activeSources = SOURCES.filter(s => enabledSources[s.key]);

  const toggleSource = (key) => {
    setEnabledSources(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSearch = async (e) => {
    e?.preventDefault();

    if (!searchTerm.trim() || activeSources.length === 0) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const settled = await Promise.allSettled(activeSources.map(source => source.search(searchTerm)));

      const combinedResults = [];
      let allFailed = true;

      settled.forEach((result, idx) => {
        const source = activeSources[idx];
        if (result.status === 'fulfilled') {
          allFailed = false;
          combinedResults.push(...result.value.map(manga => ({ ...manga, _source: source.key })));
        } else {
          console.error(`${source.label} search error:`, result.reason);
        }
      });

      if (combinedResults.length === 0 && allFailed) {
        setError(t('search_error'));
      }

      setResults(combinedResults);
    } catch (err) {
      setError(t('search_error'));
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
        setError(t('search_error_details'));
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
          <h2>{t('search_title')}</h2>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-group">
            <input
              type="text"
              className="search-input"
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="search-submit-btn"
              disabled={loading || !searchTerm.trim() || activeSources.length === 0}
            >
              {loading ? <Loader size={18} className="spinning" /> : <Search size={18} />}
              {loading ? t('search_loading_btn') : t('search_btn')}
            </button>
          </div>

          <div className="search-source-toggles">
            {SOURCES.map((source) => {
              const active = enabledSources[source.key];
              return (
                <button
                  key={source.key}
                  type="button"
                  className={`search-source-toggle${active ? ' search-source-toggle--active' : ''}`}
                  style={active ? { borderColor: source.color, color: source.color } : undefined}
                  onClick={() => toggleSource(source.key)}
                >
                  {source.label}
                </button>
              );
            })}
          </div>

          {activeSources.length === 0 && (
            <p className="search-source-warning">{t('search_no_source')}</p>
          )}
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
              <p>{t('search_loading_msg')}</p>
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="search-empty">
              <p>{t('search_no_results').replace('{term}', searchTerm)}</p>
              <p className="search-empty-hint">{t('search_no_results_hint')}</p>
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
                        {info.chapters && <span className="result-badge">{t('search_chapters').replace('{n}', info.chapters)}</span>}
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
              <p>{t('search_hint_title')}</p>
              <p className="search-hint-small">{t('search_hint_subtitle')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
