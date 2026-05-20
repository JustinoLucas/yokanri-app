import { useState, useRef, useEffect } from 'react';

/**
 * Hook personalizado para gerenciar a navegação de scroll horizontal
 * @param {Array} currentLancamentos - Lista atual de lançamentos
 * @param {string} activeTab - Tab ativa
 * @returns {Object} Objeto com refs, estados e funções de navegação
 */
export const useScrollNavigation = (currentLancamentos, activeTab) => {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Verifica se precisa mostrar as setas de navegação
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Atualiza as setas quando mudar de aba ou a lista de lançamentos mudar
  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [currentLancamentos, activeTab]);

  // Função para scroll à esquerda
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  // Função para scroll à direita
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return {
    scrollContainerRef,
    showLeftArrow,
    showRightArrow,
    checkScroll,
    scrollLeft,
    scrollRight
  };
};
