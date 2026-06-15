/**
 * AniList API Service
 * Documentation: https://anilist.github.io/ApiV2-GraphQL-Docs/
 */
import { apiFetch } from './httpClient';
import { anilistLimiter } from './apiRateLimiter';

const ANILIST_API_URL = 'https://graphql.anilist.co';

/**
 * Search for manga by name
 * @param {string} searchTerm - The manga name to search for
 * @returns {Promise<Array>} Array of manga results
 */
export async function searchManga(searchTerm) {
  const query = `
    query ($search: String) {
      Page(page: 1, perPage: 10) {
        media(search: $search, type: MANGA, sort: POPULARITY_DESC) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            large
            medium
          }
          description
          chapters
          status
          genres
          averageScore
          countryOfOrigin
          startDate {
            year
            month
            day
          }
        }
      }
    }
  `;

  const variables = {
    search: searchTerm
  };

  try {
    return await anilistLimiter.schedule(async () => {
      const response = await apiFetch(ANILIST_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return data.data.Page.media;
    });
  } catch (error) {
    console.error('Error searching manga on AniList:', error);
    throw error;
  }
}

/**
 * Map AniList status to our status format
 */
function mapStatus(anilistStatus) {
  const statusMap = {
    'FINISHED': 'Completo',
    'RELEASING': 'Em andamento',
    'NOT_YET_RELEASED': 'Em andamento',
    'CANCELLED': 'Cancelado',
    'HIATUS': 'Hiato'
  };

  return statusMap[anilistStatus] || 'Em andamento';
}

/**
 * Map AniList country to our type format
 */
function mapCountryToType(countryOfOrigin) {
  const countryMap = {
    'KR': 'Coreano',    // South Korea
    'CN': 'Chinês',     // China
    'JP': 'Japonês',    // Japan
    'TW': 'Chinês',     // Taiwan
    'HK': 'Chinês'      // Hong Kong
  };

  return countryMap[countryOfOrigin] || 'Coreano'; // Default to Korean for manhwa
}

/**
 * Map AniList genres to our genre format
 */
function mapGenres(anilistGenres) {
  // Our available genres
  const availableGenres = [
    'Ação', 'Adulto', 'Apocalíptico', 'Artes Marciais', 'Aventura', 'Comédia',
    'Crime', 'Cultivo', 'Drama', 'Dungeon', 'Escolar', 'Esportes', 'Fantasia',
    'Ficção Científica', 'Game', 'Harém', 'Histórico', 'Horror', 'Isekai',
    'Magia', 'Mecha', 'Militar', 'Mistério', 'Mitologia', 'Murim', 'Música',
    'Psicológico', 'Realidade Virtual', 'Reencarnação', 'Regressão', 'Romance',
    'Shoujo', 'Shounen', 'Sistema', 'Slice of Life', 'Sobrenatural',
    'Super Poderes', 'Suspense', 'Thriller', 'Viagem no Tempo', 'Zumbi'
  ];

  // Map AniList genres to Portuguese
  const genreMap = {
    'Action': 'Ação',
    'Adventure': 'Aventura',
    'Comedy': 'Comédia',
    'Drama': 'Drama',
    'Fantasy': 'Fantasia',
    'Horror': 'Horror',
    'Mystery': 'Mistério',
    'Psychological': 'Psicológico',
    'Romance': 'Romance',
    'Sci-Fi': 'Ficção Científica',
    'Slice of Life': 'Slice of Life',
    'Sports': 'Esportes',
    'Supernatural': 'Sobrenatural',
    'Thriller': 'Thriller',
    'Mecha': 'Mecha',
    'Music': 'Música',
    'Ecchi': 'Adulto',
    'Hentai': 'Adulto'
  };

  const mappedGenres = anilistGenres
    .map(genre => genreMap[genre] || genre)
    .filter(genre => availableGenres.includes(genre));

  return mappedGenres;
}

/**
 * Convert AniList manga data to our obra format
 * @param {Object} anilistManga - Manga data from AniList
 * @returns {Object} Partial obra data that can be used to fill the form
 */
export function convertAniListToObra(anilistManga) {
  const primaryTitle = anilistManga.title.english || anilistManga.title.romaji;
  const alternativeTitle = anilistManga.title.native || anilistManga.title.romaji;

  return {
    nome: primaryTitle,
    nomeAlternativo: alternativeTitle !== primaryTitle ? alternativeTitle : '',
    tipo: mapCountryToType(anilistManga.countryOfOrigin),
    status: mapStatus(anilistManga.status),
    capituloAtual: anilistManga.chapters || 0,
    generos: mapGenres(anilistManga.genres),
    sinopse: anilistManga.description
      ? anilistManga.description.replace(/<[^>]*>/g, '') // Remove HTML tags
      : '',
    // Store cover URL for user to optionally save
    _coverUrl: anilistManga.coverImage.large || anilistManga.coverImage.medium,
    // Store AniList ID for reference
    _anilistId: anilistManga.id
  };
}

export default {
  searchManga,
  convertAniListToObra
};
