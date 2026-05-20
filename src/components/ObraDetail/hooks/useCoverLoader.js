import { useState, useEffect } from 'react';
import storage from '../../../services/storage/storageService';

/**
 * Custom hook to handle cover loading logic
 * Supports v3.0 multiple covers array
 */
export const useCoverLoader = (obra) => {
  const [coverUrl, setCoverUrl] = useState(null);
  const [allCovers, setAllCovers] = useState([]);
  const [selectedCoverIndex, setSelectedCoverIndex] = useState(0);

  useEffect(() => {
    loadCover();
  }, [obra]);

  const loadCover = async () => {
    if (Array.isArray(obra.capas) && obra.capas.length > 0) {
      const covers = await Promise.all(
        obra.capas.map(async (capa) => {
          if (capa.local && capa.nome) {
            const url = await storage.loadCover(capa.nome);
            return { ...capa, url };
          }
          return { ...capa, url: capa.nome };
        })
      );

      setAllCovers(covers);

      // Define a capa principal como selecionada
      const principalIndex = covers.findIndex(c => c.principal);
      if (principalIndex !== -1) {
        setSelectedCoverIndex(principalIndex);
        setCoverUrl(covers[principalIndex].url);
      } else {
        setSelectedCoverIndex(0);
        setCoverUrl(covers[0].url);
      }
    }
  };

  const selectCover = (index) => {
    setSelectedCoverIndex(index);
    setCoverUrl(allCovers[index].url);
  };

  return {
    coverUrl,
    allCovers,
    selectedCoverIndex,
    selectCover
  };
};
