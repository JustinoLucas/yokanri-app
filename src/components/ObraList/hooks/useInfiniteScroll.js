import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook de scroll infinito baseado em IntersectionObserver.
 *
 * @param {Array}  allItems  - Lista completa (já filtrada/ordenada)
 * @param {number} batchSize - Quantos itens carregar por vez
 * @returns {{ visibleItems: Array, sentinelRef: React.RefObject, hasMore: boolean }}
 */
export function useInfiniteScroll(allItems, batchSize) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const sentinelRef = useRef(null);

  // Reseta ao trocar a lista (filtro, ordenação, etc.)
  useEffect(() => {
    setVisibleCount(batchSize);
  }, [allItems, batchSize]);

  const loadMore = useCallback(() => {
    setVisibleCount(prev => {
      const next = prev + batchSize;
      return next > allItems.length ? allItems.length : next;
    });
  }, [allItems.length, batchSize]);

  // Observa o sentinel e carrega mais quando visível
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const visibleItems = allItems.slice(0, visibleCount);
  const hasMore = visibleCount < allItems.length;

  return { visibleItems, sentinelRef, hasMore };
}
