/**
 * Limitador de requisições por provedor de API externa.
 *
 * Cada provedor (AniList, MangaDex, MangaUpdates) tem seus próprios
 * limites de taxa documentados. Esta fila garante que as chamadas feitas
 * pelo app respeitem esses limites, evitando respostas 429.
 */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, Math.max(ms, 0)));
}

class RateLimiter {
  constructor(maxRequests, intervalMs) {
    this.maxRequests = maxRequests;
    this.intervalMs = intervalMs;
    this.timestamps = [];
    this.queue = [];
    this.running = false;
  }

  /**
   * Agenda uma tarefa assíncrona respeitando o limite de taxa configurado.
   * @param {() => Promise<any>} task
   * @returns {Promise<any>}
   */
  schedule(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this._run();
    });
  }

  async _run() {
    if (this.running) return;
    this.running = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      this.timestamps = this.timestamps.filter(t => now - t < this.intervalMs);

      if (this.timestamps.length >= this.maxRequests) {
        const waitMs = this.intervalMs - (now - this.timestamps[0]);
        await sleep(waitMs);
        continue;
      }

      const { task, resolve, reject } = this.queue.shift();
      this.timestamps.push(Date.now());
      try {
        resolve(await task());
      } catch (error) {
        reject(error);
      }
    }

    this.running = false;
  }
}

// Limites conservadores baseados na documentação de cada API:
// - AniList: 30 requisições/minuto — https://docs.anilist.co/guide/rate-limiting
// - MangaDex: ~5 requisições/segundo — https://api.mangadex.org/docs/2-limitations/
// - MangaUpdates: 1 requisição/segundo — https://api.mangaupdates.com/
export const anilistLimiter = new RateLimiter(28, 60_000);
export const mangadexLimiter = new RateLimiter(5, 1_000);
export const mangaUpdatesLimiter = new RateLimiter(1, 1_000);
