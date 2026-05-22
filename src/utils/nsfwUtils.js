/**
 * nsfwUtils — Lógica centralizada de conteúdo NSFW
 *
 * Uma obra é considerada NSFW se qualquer um dos seus gêneros
 * estiver marcado como nsfw:true na configuração.
 *
 * Modos de exibição (config.nsfwMode):
 *   'show'   — exibe normalmente (padrão)
 *   'blur'   — capa com blur; remove no hover
 *   'hidden' — obras NSFW não aparecem na lista
 */

/**
 * Retorna um Set com os labels dos gêneros marcados como NSFW.
 * O Set é recalculado apenas quando config.generos muda.
 *
 * @param {Object} config
 * @returns {Set<string>}
 */
export function getNsfwGenreLabels(config) {
  if (!config?.generos) return new Set();
  return new Set(
    config.generos
      .filter(g => g.nsfw === true)
      .map(g => g.label)
  );
}

/**
 * Verifica se uma obra possui algum gênero marcado como NSFW.
 *
 * @param {Object} obra
 * @param {Object} config
 * @returns {boolean}
 */
export function isObraNsfw(obra, config) {
  if (!obra?.generos?.length) return false;
  const nsfwLabels = getNsfwGenreLabels(config);
  if (nsfwLabels.size === 0) return false;
  return obra.generos.some(g => nsfwLabels.has(g));
}

/**
 * Retorna o modo NSFW atual da configuração.
 *
 * @param {Object} config
 * @returns {'show' | 'blur' | 'hidden'}
 */
export function getNsfwMode(config) {
  return config?.nsfwMode ?? 'show';
}

/**
 * Filtra uma lista de obras removendo as NSFW quando nsfwMode === 'hidden'.
 * Nos outros modos, retorna a lista original sem modificação.
 *
 * @param {Object[]} obras
 * @param {Object} config
 * @returns {Object[]}
 */
export function filterNsfwObras(obras, config) {
  if (getNsfwMode(config) !== 'hidden') return obras;
  const nsfwLabels = getNsfwGenreLabels(config);
  if (nsfwLabels.size === 0) return obras;
  return obras.filter(obra => !isObraNsfw(obra, config));
}
