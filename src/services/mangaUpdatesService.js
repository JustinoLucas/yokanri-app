/**
 * MangaUpdates API Service
 * Documentation: https://api.mangaupdates.com/
 *
 * A busca (POST /series/search) retorna apenas dados resumidos de cada
 * série. Para obter títulos alternativos, autores/artistas e status
 * detalhado é necessário um segundo request em GET /series/{id}, feito
 * via getSeriesDetails() quando o usuário seleciona um resultado.
 */
import { apiFetch } from './httpClient';
import { mangaUpdatesLimiter } from './apiRateLimiter';

const MANGAUPDATES_API_URL = 'https://api.mangaupdates.com/v1';

/**
 * Search for series by name
 * @param {string} searchTerm
 * @returns {Promise<Array>} Array of series records (dados resumidos)
 */
export async function searchManga(searchTerm) {
  if (!searchTerm || !searchTerm.trim()) {
    return [];
  }

  try {
    return await mangaUpdatesLimiter.schedule(async () => {
      const response = await apiFetch(`${MANGAUPDATES_API_URL}/series/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // O WAF do MangaUpdates retorna 403 quando o header Origin está
          // presente. O tauri-plugin-http adiciona esse header por padrão,
          // mas remove se ele vier vazio (feature "unsafe-headers").
          'Origin': '',
        },
        body: JSON.stringify({
          search: searchTerm.trim(),
          page: 1,
          perpage: 10,
        }),
      });

      if (!response.ok) {
        throw new Error(`MangaUpdates API error: ${response.status}`);
      }

      const data = await response.json();
      return (data.results || []).map(r => r.record);
    });
  } catch (error) {
    console.error('MangaUpdates search error:', error);
    throw error;
  }
}

/**
 * Get full details for a series (autores, títulos associados, status, etc.)
 * @param {number} seriesId
 * @returns {Promise<Object>} Série completa
 */
export async function getSeriesDetails(seriesId) {
  try {
    return await mangaUpdatesLimiter.schedule(async () => {
      const response = await apiFetch(`${MANGAUPDATES_API_URL}/series/${seriesId}`, {
        headers: {
          'Origin': '',
        },
      });

      if (!response.ok) {
        throw new Error(`MangaUpdates API error: ${response.status}`);
      }

      return response.json();
    });
  } catch (error) {
    console.error('MangaUpdates series details error:', error);
    throw error;
  }
}

/**
 * Map MangaUpdates type to our type format
 */
function mapType(type) {
  const typeMap = {
    'Manga': 'Japonês',
    'Manhwa': 'Coreano',
    'Manhua': 'Chinês',
  };
  return typeMap[type] || 'Coreano';
}

/**
 * Map MangaUpdates status/completed to our status format
 */
function mapStatus(series) {
  if (series.completed) return 'Completo';

  const status = (series.status || '').toLowerCase();
  if (status.includes('hiatus')) return 'Hiato';
  if (status.includes('cancelled') || status.includes('dropped')) return 'Cancelado';
  if (status.includes('complete')) return 'Completo';
  return 'Em andamento';
}

/**
 * Map MangaUpdates genres to our genre format
 */
function mapGenres(genres) {
  const availableGenres = [
    'Ação', 'Adulto', 'Apocalíptico', 'Artes Marciais', 'Aventura', 'Comédia',
    'Crime', 'Cultivo', 'Drama', 'Dungeon', 'Escolar', 'Esportes', 'Fantasia',
    'Ficção Científica', 'Game', 'Harém', 'Histórico', 'Horror', 'Isekai',
    'Magia', 'Mecha', 'Militar', 'Mistério', 'Mitologia', 'Murim', 'Música',
    'Psicológico', 'Realidade Virtual', 'Reencarnação', 'Regressão', 'Romance',
    'Shoujo', 'Shounen', 'Sistema', 'Slice of Life', 'Sobrenatural',
    'Super Poderes', 'Suspense', 'Thriller', 'Viagem no Tempo', 'Zumbi'
  ];

  const genreMap = {
    'Action': 'Ação',
    'Adult': 'Adulto',
    'Adventure': 'Aventura',
    'Comedy': 'Comédia',
    'Crime': 'Crime',
    'Drama': 'Drama',
    'Ecchi': 'Adulto',
    'Fantasy': 'Fantasia',
    'Harem': 'Harém',
    'Hentai': 'Adulto',
    'Historical': 'Histórico',
    'Horror': 'Horror',
    'Martial Arts': 'Artes Marciais',
    'Mecha': 'Mecha',
    'Mystery': 'Mistério',
    'Psychological': 'Psicológico',
    'Romance': 'Romance',
    'School Life': 'Escolar',
    'Sci-fi': 'Ficção Científica',
    'Shoujo': 'Shoujo',
    'Shounen': 'Shounen',
    'Slice of Life': 'Slice of Life',
    'Sports': 'Esportes',
    'Supernatural': 'Sobrenatural',
  };

  return (genres || [])
    .map(g => genreMap[g.genre] || null)
    .filter(genre => genre && availableGenres.includes(genre));
}

/**
 * Convert MangaUpdates series details to our Obra format
 * @param {Object} series - Resultado de getSeriesDetails()
 */
export function convertMangaUpdatesToObra(series) {
  const authors = (series.authors || []).filter(a => a.type === 'Author').map(a => a.name);
  const artists = (series.authors || []).filter(a => a.type === 'Artist').map(a => a.name);
  const altTitle = series.associated?.[0]?.title || '';

  const obraData = {
    nome: series.title,
    nomeAlternativo: altTitle,
    autor: authors.join(', '),
    estudio: artists.length && artists.join(', ') !== authors.join(', ') ? artists.join(', ') : '',
    tipo: mapType(series.type),
    status: mapStatus(series),
    capituloAtual: series.latest_chapter || 0,
    generos: mapGenres(series.genres),
    sinopse: series.description ? series.description.replace(/\r?\n+/g, ' ').trim() : '',
    ano: series.year ? parseInt(series.year, 10) : new Date().getFullYear(),
    _coverUrl: series.image?.url?.original || series.image?.url?.thumb || null,
    _mangaUpdatesId: series.series_id,
    _source: 'mangaupdates',
  };

  if (series.bayesian_rating) {
    obraData.nota = Number(series.bayesian_rating.toFixed(1));
  }

  return obraData;
}

export default {
  searchManga,
  getSeriesDetails,
  convertMangaUpdatesToObra,
};
