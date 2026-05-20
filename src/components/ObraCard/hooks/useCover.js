import { useState, useEffect } from 'react';
import storage from '../../../services/storage/storageService';

/**
 * Custom hook to load and manage cover images
 * @param {Object} obra - The obra object with cover information
 * @returns {string|null} The cover URL or null
 */
export const useCover = (obra) => {
  const [coverUrl, setCoverUrl] = useState(null);

  useEffect(() => {
    loadCover();
  }, [obra.capas]);

  const loadCover = async () => {
    if (Array.isArray(obra.capas) && obra.capas.length > 0) {
      const principal = obra.capas.find(c => c.principal) || obra.capas[0];

      if (principal.local && principal.nome) {
        const url = await storage.loadCover(principal.nome);
        setCoverUrl(url);
      } else if (principal.nome) {
        setCoverUrl(principal.nome);
      } else {
        setCoverUrl(null);
      }
    } else {
      setCoverUrl(null);
    }
  };

  return coverUrl;
};

export default useCover;
