/**
 * MangaDex API Service
 * Handles authentication and manga search from MangaDex API
 * Documentation: https://api.mangadex.org/docs/
 */
import { apiFetch } from './httpClient';
import { mangadexLimiter } from './apiRateLimiter';

const MANGADEX_API_URL = 'https://api.mangadex.org';
const MANGADEX_AUTH_URL = 'https://auth.mangadex.org/realms/mangadex/protocol/openid-connect';

// Cache for access token and refresh token
let cachedToken = null;
let cachedRefreshToken = null;
let tokenExpiry = null;

/**
 * Get OAuth2 access token using personal client credentials
 */
/**
 * Refresh the access token using refresh_token
 */
async function refreshAccessToken() {
  const clientId = import.meta.env.VITE_MANGADEX_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_MANGADEX_CLIENT_SECRET;

  if (!cachedRefreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await mangadexLimiter.schedule(() => apiFetch(`${MANGADEX_AUTH_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: cachedRefreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    }));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('MangaDex token refresh error:', response.status, errorData);
      // If refresh fails, clear tokens to force re-login
      cachedToken = null;
      cachedRefreshToken = null;
      tokenExpiry = null;
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    cachedToken = data.access_token;
    cachedRefreshToken = data.refresh_token; // Update refresh token too
    // Token expires in 15 minutes, cache for 14 minutes to be safe
    tokenExpiry = Date.now() + (14 * 60 * 1000);

    return cachedToken;
  } catch (error) {
    console.error('MangaDex token refresh error:', error);
    throw error;
  }
}

/**
 * Get OAuth2 access token using personal client credentials
 * Automatically refreshes token if expired
 */
async function getAccessToken() {
  // Return cached token if still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  // Try to refresh token if we have one
  if (cachedRefreshToken) {
    try {
      return await refreshAccessToken();
    } catch (error) {
      console.warn('Token refresh failed, attempting fresh login:', error);
      // Continue to fresh login below
    }
  }

  // Fresh login with username/password
  const clientId = import.meta.env.VITE_MANGADEX_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_MANGADEX_CLIENT_SECRET;
  const username = import.meta.env.VITE_MANGADEX_USERNAME;
  const password = import.meta.env.VITE_MANGADEX_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) {
    throw new Error('MangaDex credentials not configured. Check your .env file (need client_id, client_secret, username, and password).');
  }

  try {
    const response = await mangadexLimiter.schedule(() => apiFetch(`${MANGADEX_AUTH_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: username,
        password: password,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    }));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('MangaDex auth error:', response.status, errorData);
      throw new Error(`Authentication failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    cachedToken = data.access_token;
    cachedRefreshToken = data.refresh_token; // Store refresh token
    // Token expires in 15 minutes, cache for 14 minutes to be safe
    tokenExpiry = Date.now() + (14 * 60 * 1000);

    console.log('MangaDex: Successfully authenticated');
    return cachedToken;
  } catch (error) {
    console.error('MangaDex authentication error:', error);
    throw error;
  }
}

/**
 * Search for manga on MangaDex
 * @param {string} searchTerm - The search query
 * @returns {Promise<Array>} Array of manga results
 */
export async function searchManga(searchTerm) {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return [];
  }

  try {
    const token = await getAccessToken();

    // Build search URL with includes for cover art and author
    // URLSearchParams doesn't handle arrays well, so we build manually
    const params = new URLSearchParams();
    params.append('title', searchTerm.trim());
    params.append('limit', '10');
    params.append('includes[]', 'cover_art');
    params.append('includes[]', 'author');
    params.append('includes[]', 'artist');
    params.append('contentRating[]', 'safe');
    params.append('contentRating[]', 'suggestive');
    params.append('contentRating[]', 'erotica');
    params.append('order[relevance]', 'desc');

    console.log('MangaDex search:', searchTerm);
    const url = `${MANGADEX_API_URL}/manga?${params}`;
    console.log('Request URL:', url);

    const response = await mangadexLimiter.schedule(() => apiFetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MangaDex API error:', response.status, errorText);
      throw new Error(`MangaDex API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('MangaDex results:', data.data?.length || 0, 'manga(s) found');
    return data.data || [];
  } catch (error) {
    console.error('MangaDex search error:', error);
    throw error;
  }
}

/**
 * Get cover image URL for a manga
 * @param {string} mangaId - The manga ID
 * @param {string} fileName - The cover filename
 * @param {string} quality - 'original', 'medium', or 'small'
 * @returns {string} Cover image URL
 */
export function getCoverUrl(mangaId, fileName, quality = 'medium') {
  const qualityMap = {
    original: '',
    medium: '.512.jpg',
    small: '.256.jpg',
  };

  const suffix = qualityMap[quality] || qualityMap.medium;
  return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}${suffix}`;
}

/**
 * Extract title from MangaDex manga object
 * Prioritizes: Portuguese > Romanized > English > Native
 */
function extractTitle(titleObj, altTitleArray = []) {
  if (!titleObj) return '';

  // Try Portuguese first
  if (titleObj['pt-br']) return titleObj['pt-br'];
  if (titleObj['pt']) return titleObj['pt'];

  // Try romanized/English
  if (titleObj['en']) return titleObj['en'];
  if (titleObj['ja-ro']) return titleObj['ja-ro'];
  if (titleObj['ko-ro']) return titleObj['ko-ro'];
  if (titleObj['zh-ro']) return titleObj['zh-ro'];

  // Try alternative titles for Portuguese
  for (const altTitle of altTitleArray) {
    if (altTitle['pt-br']) return altTitle['pt-br'];
    if (altTitle['pt']) return altTitle['pt'];
  }

  // Fallback to first available
  return Object.values(titleObj)[0] || '';
}

/**
 * Extract alternative title (different from main title)
 */
function extractAltTitle(titleObj, mainTitle) {
  if (!titleObj) return '';

  // Try English if main is not English
  if (titleObj['en'] && titleObj['en'] !== mainTitle) {
    return titleObj['en'];
  }

  // Try romanized if available
  if (titleObj['ja-ro'] && titleObj['ja-ro'] !== mainTitle) {
    return titleObj['ja-ro'];
  }
  if (titleObj['ko-ro'] && titleObj['ko-ro'] !== mainTitle) {
    return titleObj['ko-ro'];
  }

  // Try native language
  if (titleObj['ja'] && titleObj['ja'] !== mainTitle) {
    return titleObj['ja'];
  }
  if (titleObj['ko'] && titleObj['ko'] !== mainTitle) {
    return titleObj['ko'];
  }
  if (titleObj['zh'] && titleObj['zh'] !== mainTitle) {
    return titleObj['zh'];
  }

  return '';
}

/**
 * Map MangaDex status to our status format
 */
function mapStatus(mangadexStatus) {
  const statusMap = {
    'completed': 'completo',
    'ongoing':   'em-andamento',
    'cancelled': 'cancelado',
    'hiatus':    'hiato',
  };
  return statusMap[mangadexStatus] || 'em-andamento';
}

/**
 * Map MangaDex original language to our type format
 */
function mapOriginalLanguage(language) {
  const languageMap = {
    'ko': 'Coreano',
    'zh': 'Chinês',
    'zh-hk': 'Chinês',
    'ja': 'Japonês',
  };
  return languageMap[language] || 'Desconhecido';
}

/**
 * Map MangaDex tags to our genres
 * MangaDex uses detailed tags, we'll map them to our simpler genre list
 */
function mapTags(tags) {
  const GENEROS = [
    'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Terror',
    'Mistério', 'Romance', 'Ficção Científica', 'Slice of Life',
    'Esportes', 'Sobrenatural', 'Thriller', 'Psicológico',
    'Histórico', 'Murim', 'Regressão', 'Sistema', 'Cultivo',
    'Isekai', 'Harém', 'Ecchi'
  ];

  const tagMap = {
    'Action': 'Ação',
    'Adventure': 'Aventura',
    'Comedy': 'Comédia',
    'Drama': 'Drama',
    'Fantasy': 'Fantasia',
    'Horror': 'Terror',
    'Mystery': 'Mistério',
    'Romance': 'Romance',
    'Sci-Fi': 'Ficção Científica',
    'Slice of Life': 'Slice of Life',
    'Sports': 'Esportes',
    'Supernatural': 'Sobrenatural',
    'Thriller': 'Thriller',
    'Psychological': 'Psicológico',
    'Historical': 'Histórico',
    'Martial Arts': 'Murim',
    'Wuxia': 'Murim',
    'Reincarnation': 'Regressão',
    'Time Travel': 'Regressão',
    'Isekai': 'Isekai',
    'Harem': 'Harém',
    'Ecchi': 'Ecchi',
  };

  const mappedGenres = [];

  for (const tag of tags) {
    const tagName = tag.attributes?.name?.en;
    if (tagName && tagMap[tagName]) {
      const genre = tagMap[tagName];
      if (GENEROS.includes(genre) && !mappedGenres.includes(genre)) {
        mappedGenres.push(genre);
      }
    }
  }

  return mappedGenres;
}

/**
 * Get author/artist name from relationships
 */
function getAuthorName(relationships) {
  const author = relationships.find(rel => rel.type === 'author');
  return author?.attributes?.name || '';
}

/**
 * Get artist name from relationships
 */
function getArtistName(relationships) {
  const artist = relationships.find(rel => rel.type === 'artist');
  return artist?.attributes?.name || '';
}

/**
 * Get cover filename from relationships
 */
function getCoverFileName(relationships) {
  const cover = relationships.find(rel => rel.type === 'cover_art');
  return cover?.attributes?.fileName || null;
}

/**
 * Convert MangaDex manga object to our Obra format
 */
export function convertMangaDexToObra(mangadexManga) {
  const attrs = mangadexManga.attributes;
  const relationships = mangadexManga.relationships || [];

  const mainTitle = extractTitle(attrs.title, attrs.altTitles);
  const altTitle = extractAltTitle(attrs.title, mainTitle);
  const author = getAuthorName(relationships);
  const artist = getArtistName(relationships);
  const coverFileName = getCoverFileName(relationships);

  return {
    nome: mainTitle,
    nomeAlternativo: altTitle,
    autor: author,
    estudio: artist !== author ? artist : '', // Only set if different from author
    tipo: mapOriginalLanguage(attrs.originalLanguage),
    status: mapStatus(attrs.status),
    capituloAtual: attrs.lastChapter ? parseInt(attrs.lastChapter) : 0,
    generos: mapTags(attrs.tags || []),
    sinopse: attrs.description?.en || attrs.description?.['pt-br'] || attrs.description?.pt || '',
    ano: attrs.year || new Date().getFullYear(),
    _coverUrl: coverFileName ? getCoverUrl(mangadexManga.id, coverFileName, 'original') : null,
    _mangadexId: mangadexManga.id,
    _source: 'mangadex',
  };
}
