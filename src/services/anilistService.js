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
          staff(sort: RELEVANCE, perPage: 6) {
            edges {
              role
              node {
                name {
                  full
                }
              }
            }
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
 * Extract author(s) and artist(s) from AniList staff edges
 * @param {Array} staffEdges - Edges from anilistManga.staff.edges
 * @returns {{ authors: string[], artists: string[] }}
 */
function extractStaff(staffEdges) {
  const authors = [];
  const artists = [];

  for (const edge of staffEdges || []) {
    const role = (edge.role || '').toLowerCase();
    const name = edge.node?.name?.full;
    if (!name) continue;

    if (role.includes('story') || role.includes('original creator')) {
      authors.push(name);
    }
    if (role.includes('art') && !role.includes('character design')) {
      artists.push(name);
    }
  }

  return {
    authors: [...new Set(authors)],
    artists: [...new Set(artists)],
  };
}

/**
 * Convert AniList manga data to our obra format
 * @param {Object} anilistManga - Manga data from AniList
 * @returns {Object} Partial obra data that can be used to fill the form
 */
export function convertAniListToObra(anilistManga) {
  const primaryTitle = anilistManga.title.english || anilistManga.title.romaji;
  const alternativeTitle = anilistManga.title.native || anilistManga.title.romaji;
  const { authors, artists } = extractStaff(anilistManga.staff?.edges);

  return {
    nome: primaryTitle,
    nomeAlternativo: alternativeTitle !== primaryTitle ? alternativeTitle : '',
    autor: authors.join(', '),
    estudio: artists.length && artists.join(', ') !== authors.join(', ') ? artists.join(', ') : '',
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
    _anilistId: anilistManga.id,
    _source: 'anilist',
  };
}

export default {
  searchManga,
  convertAniListToObra
};
