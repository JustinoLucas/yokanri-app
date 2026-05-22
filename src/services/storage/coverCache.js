/**
 * coverCache — Cache em memória para Object URLs de capas
 *
 * Problema que resolve:
 *   Sem cache, cada chamada a loadCover() faz:
 *     readFile (disco) → new Blob → URL.createObjectURL → nova string blob:...
 *   Isso acontece toda vez que o hook re-executa (troca de filtro, quick update,
 *   troca de aba em Lançamentos, remount de card), causando:
 *     - releituras de disco desnecessárias
 *     - flickering de imagem (null → url → null → url)
 *     - vazamento de memória (Object URLs nunca revogados)
 *
 * Como funciona:
 *   - Map<fileName, objectUrl> a nível de módulo (singleton por sessão)
 *   - get(fileName) → retorna URL cacheada ou null
 *   - set(fileName, url) → armazena URL
 *   - clear() → revoga todos os Object URLs e limpa o Map
 *   - Ao trocar workspace: clear() é chamado para evitar URLs stale
 *
 * Ciclo de vida:
 *   App start   → cache vazio
 *   loadCover() → miss → lê disco → cria URL → set() → retorna URL
 *   loadCover() → hit  → retorna URL cacheada (sem I/O)
 *   switchWorkspace → clear() → novos carregamentos do workspace novo
 */

/** @type {Map<string, string>} */
const _cache = new Map();

/**
 * Retorna a URL cacheada para um arquivo de capa, ou null se não cacheada.
 * @param {string} fileName
 * @returns {string|null}
 */
export function getCachedCover(fileName) {
  return _cache.get(fileName) ?? null;
}

/**
 * Armazena uma URL de capa no cache.
 * @param {string} fileName
 * @param {string} url - Object URL (blob:...)
 */
export function setCachedCover(fileName, url) {
  _cache.set(fileName, url);
}

/**
 * Verifica se uma capa está no cache.
 * @param {string} fileName
 * @returns {boolean}
 */
export function hasCachedCover(fileName) {
  return _cache.has(fileName);
}

/**
 * Limpa o cache inteiro, revogando todos os Object URLs primeiro.
 * Deve ser chamado ao trocar ou deletar workspace.
 */
export function clearCoverCache() {
  for (const url of _cache.values()) {
    if (url && url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // Ignorar — URL já pode ter sido revogada
      }
    }
  }
  _cache.clear();
}

/**
 * Retorna o número de capas em cache (utilitário/debug).
 * @returns {number}
 */
export function getCacheSize() {
  return _cache.size;
}
