import { useState, useEffect } from 'react';
import storage from '../../../services/storage/storageService';
import { getCachedCover } from '../../../services/storage/coverCache';

/**
 * Extrai a capa principal de uma obra e retorna metadados estáveis.
 *
 * Retorna null se não há capas.
 * Retorna { nome, isLocal } se há capa principal.
 */
function getPrincipalCapa(capas) {
  if (!Array.isArray(capas) || capas.length === 0) return null;
  const principal = capas.find(c => c.principal) || capas[0];
  if (!principal?.nome) return null;
  return {
    nome: principal.nome,
    isLocal: Boolean(principal.local),
  };
}

/**
 * Gera uma chave estável (string primitiva) para a capa principal.
 *
 * Por quê: obra.capas é um array recriado a cada loadObras() (safeJsonParse
 * sempre retorna new Array). Se usarmos obra.capas como dependência do
 * useEffect, o effect dispara a cada mudança em QUALQUER campo da obra
 * (ex: capituloAtualUsuario), mesmo que as capas não tenham mudado.
 *
 * A string gerada só muda quando a capa principal REALMENTE muda
 * (fileName ou isLocal diferente), tornando o effect estável.
 *
 * @param {Array|null} capas
 * @returns {string} String estável: 'local:nome.jpg' | 'url:https://...' | ''
 */
function getCapaKey(capas) {
  const capa = getPrincipalCapa(capas);
  if (!capa) return '';
  return capa.isLocal ? `local:${capa.nome}` : `url:${capa.nome}`;
}

/**
 * Hook para carregar e cachear a URL da capa principal de uma obra.
 *
 * Melhorias em relação à versão anterior:
 *
 * 1. Init síncrono do cache:
 *    Se a capa já foi carregada antes (está no coverCache), o useState
 *    inicializa diretamente com a URL — sem null → url → null → url.
 *    Isso elimina o flickering ao voltar para uma lista ou trocar abas.
 *
 * 2. Dependência estável (capaKey):
 *    Em vez de [obra.capas] (referência de array que muda a cada
 *    loadObras()), usa uma string derivada do nome/tipo da capa.
 *    O effect só re-executa quando a capa REALMENTE muda.
 *
 * 3. Cache em loadCover():
 *    sqliteStorage.loadCover() checa o coverCache antes de ler o disco.
 *    Mesmo que o effect re-execute, não há I/O de disco redundante.
 *
 * 4. Cancelamento de async:
 *    Flag 'cancelled' evita setState em componentes desmontados.
 *
 * @param {Object} obra - O objeto obra com o campo `capas`
 * @returns {string|null} URL da capa ou null
 */
export const useCover = (obra) => {
  // Init síncrono: se a capa já está no cache, começa com ela
  // imediatamente — sem nenhum flash de "sem capa"
  const [coverUrl, setCoverUrl] = useState(() => {
    const capaKey = getCapaKey(obra.capas);
    if (!capaKey) return null;
    if (capaKey.startsWith('url:')) return capaKey.slice(4) || null;
    if (capaKey.startsWith('local:')) return getCachedCover(capaKey.slice(6));
    return null;
  });

  // String estável: só muda quando o nome/tipo da capa muda de verdade
  const capaKey = getCapaKey(obra.capas);

  useEffect(() => {
    if (!capaKey) {
      setCoverUrl(null);
      return;
    }

    // Capa remota (URL direta) — sem async, sem I/O
    if (capaKey.startsWith('url:')) {
      const url = capaKey.slice(4) || null;
      setCoverUrl(url);
      return;
    }

    // Capa local — checa cache primeiro, depois disco (via sqliteStorage)
    const fileName = capaKey.slice(6); // remove 'local:'

    // Cache hit síncrono — evita setState desnecessário se já temos a URL
    const cached = getCachedCover(fileName);
    if (cached) {
      if (coverUrl !== cached) setCoverUrl(cached);
      return;
    }

    // Cache miss — carrega do disco (sqliteStorage já faz cache automaticamente)
    let cancelled = false;

    storage.loadCover(fileName).then(url => {
      if (!cancelled) setCoverUrl(url);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capaKey]);
  // Nota: coverUrl intencionalmente omitido das dependências para evitar
  // loop (coverUrl → effect → setCoverUrl → coverUrl → ...)

  return coverUrl;
};

export default useCover;
