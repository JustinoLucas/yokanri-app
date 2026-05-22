import { useState, useEffect } from 'react';
import storage from '../../../services/storage/storageService';

/**
 * Hook para carregar todas as capas de uma obra no ObraDetail.
 * Suporta múltiplas capas (galeria) e seleção manual.
 *
 * Usa a mesma estratégia de chave estável do useCover:
 *   - Dependência é um string derivado de obra.id + nomes das capas
 *   - Não dispara re-load quando outros campos da obra mudam
 *   - storage.loadCover() usa o coverCache automaticamente (sem releitura de disco)
 */
export const useCoverLoader = (obra) => {
  const [coverUrl, setCoverUrl] = useState(null);
  const [allCovers, setAllCovers] = useState([]);
  const [selectedCoverIndex, setSelectedCoverIndex] = useState(0);

  // Chave estável: só muda quando o id da obra ou os nomes das capas mudam
  const capasKey = Array.isArray(obra?.capas) && obra.capas.length > 0
    ? `${obra.id}:${obra.capas.map(c => c.nome).join('|')}`
    : `${obra?.id}:empty`;

  useEffect(() => {
    if (!Array.isArray(obra?.capas) || obra.capas.length === 0) {
      setCoverUrl(null);
      setAllCovers([]);
      return;
    }

    let cancelled = false;

    async function loadAllCovers() {
      const covers = await Promise.all(
        obra.capas.map(async (capa) => {
          if (capa.local && capa.nome) {
            // storage.loadCover usa o coverCache — sem releitura de disco se já cacheada
            const url = await storage.loadCover(capa.nome);
            return { ...capa, url };
          }
          return { ...capa, url: capa.nome };
        })
      );

      if (cancelled) return;

      setAllCovers(covers);

      const principalIndex = covers.findIndex(c => c.principal);
      const activeIndex = principalIndex !== -1 ? principalIndex : 0;
      setSelectedCoverIndex(activeIndex);
      setCoverUrl(covers[activeIndex]?.url ?? null);
    }

    loadAllCovers();

    return () => {
      cancelled = true;
    };
  }, [capasKey]); // Só re-executa quando capas REALMENTE mudam

  const selectCover = (index) => {
    setSelectedCoverIndex(index);
    setCoverUrl(allCovers[index]?.url ?? null);
  };

  return {
    coverUrl,
    allCovers,
    selectedCoverIndex,
    selectCover
  };
};
