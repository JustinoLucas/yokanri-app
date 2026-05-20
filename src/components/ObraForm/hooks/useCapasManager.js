import { useState, useEffect } from 'react';
import storage from '../../../services/storage/storageService';

/**
 * Custom hook for managing multiple cover images
 * Handles adding, removing, setting principal cover, and file uploads
 */
export const useCapasManager = (obra) => {
  const [capasPreviews, setCapasPreviews] = useState([]); // Array of { url, nome, local, principal }
  const [novasCapas, setNovasCapas] = useState([]); // New covers to upload
  const [coverPreview, setCoverPreview] = useState(null); // Principal cover preview URL

  useEffect(() => {
    if (obra) {
      loadExistingCovers();
    }
  }, [obra]);

  /**
   * Loads existing covers from obra data
   */
  const loadExistingCovers = async () => {
    if (Array.isArray(obra.capas) && obra.capas.length > 0) {
      const previews = await Promise.all(
        obra.capas.map(async (capa) => {
          if (capa.local && capa.nome) {
            const url = await storage.loadCover(capa.nome);
            return { ...capa, url };
          }
          return { ...capa, url: capa.nome };
        })
      );
      setCapasPreviews(previews);

      // Set principal preview
      const principal = previews.find(c => c.principal);
      if (principal) setCoverPreview(principal.url);
    }
  };

  /**
   * Adds multiple cover images
   * @param {FileList} files - Files from input element
   */
  const handleAddCapas = (files) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const validFiles = fileArray.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== fileArray.length) {
      alert('Alguns arquivos foram ignorados por não serem imagens válidas.');
    }

    // Check if there's already a principal cover
    const hasMainCover = capasPreviews.length > 0;

    // Create previews with reference to file index
    const startIndex = novasCapas.length;
    const newPreviews = validFiles.map((file, index) => ({
      url: URL.createObjectURL(file),
      nome: file.name,
      local: true,
      principal: !hasMainCover && index === 0, // Only first is principal if no other exists
      isNew: true,
      fileIndex: startIndex + index // Store file index in novasCapas array
    }));

    // Add new files to list
    setNovasCapas(prev => [...prev, ...validFiles]);
    setCapasPreviews(prev => [...prev, ...newPreviews]);

    // If it's the first cover, set as main preview
    if (capasPreviews.length === 0 && !coverPreview) {
      setCoverPreview(newPreviews[0].url);
    }
  };

  /**
   * Removes a cover image
   * @param {number} index - Index of cover to remove
   */
  const handleRemoveCapa = (index) => {
    const capa = capasPreviews[index];

    // If it's a new cover, remove from novasCapas array using fileIndex
    if (capa.isNew && capa.fileIndex !== undefined) {
      setNovasCapas(prev => prev.filter((_, i) => i !== capa.fileIndex));

      // Update fileIndex for covers that come after
      setCapasPreviews(prev => prev.map(c => {
        if (c.isNew && c.fileIndex > capa.fileIndex) {
          return { ...c, fileIndex: c.fileIndex - 1 };
        }
        return c;
      }).filter((_, i) => i !== index));
    } else {
      // Just remove from previews array if not new
      setCapasPreviews(prev => prev.filter((_, i) => i !== index));
    }

    // If removed the principal cover, set first one as principal
    if (capa.principal && capasPreviews.length > 1) {
      setCapasPreviews(prev => {
        const updated = prev.filter((_, i) => i !== index);
        if (updated.length > 0) {
          updated[0] = { ...updated[0], principal: true };
          setCoverPreview(updated[0].url);
        }
        return updated;
      });
    } else if (capasPreviews.length === 1) {
      setCoverPreview(null);
    }
  };

  /**
   * Sets a cover as principal
   * @param {number} index - Index of cover to set as principal
   */
  const handleSetPrincipal = (index) => {
    const updatedPreviews = capasPreviews.map((capa, i) => ({
      ...capa,
      principal: i === index
    }));
    setCapasPreviews(updatedPreviews);
    setCoverPreview(updatedPreviews[index].url);
  };

  /**
   * Saves cover images and returns the final capas array
   * @param {string} obraId - ID of the obra
   * @returns {Promise<Array>} - Array of saved covers
   */
  const saveCapas = async (obraId) => {
    if (novasCapas.length > 0) {
      try {
        const savedCapas = [];

        // Save each new cover
        for (let i = 0; i < novasCapas.length; i++) {
          const file = novasCapas[i];
          const extension = file.name.split('.').pop();
          const timestamp = Date.now();
          const fileName = `${obraId}_${timestamp}_${i}.${extension}`;
          await storage.saveCover(file, fileName);

          // Find corresponding preview to get principal status
          const previewIndex = capasPreviews.findIndex(p => p.isNew && p.nome === file.name);
          const isPrincipal = previewIndex !== -1 ? capasPreviews[previewIndex].principal : false;

          savedCapas.push({
            nome: fileName,
            local: true,
            principal: isPrincipal
          });
        }

        // Combine existing covers (not removed) with new covers
        const existingCapas = capasPreviews
          .filter(p => !p.isNew)
          .map(p => ({
            nome: p.nome,
            local: p.local,
            principal: p.principal
          }));

        return [...existingCapas, ...savedCapas];
      } catch (error) {
        console.error('Error saving covers:', error);
        throw error;
      }
    } else if (capasPreviews.length > 0) {
      // If no new covers but has previews, keep existing covers
      return capasPreviews.map(p => ({
        nome: p.nome,
        local: p.local,
        principal: p.principal
      }));
    }

    return [];
  };

  return {
    capasPreviews,
    novasCapas,
    coverPreview,
    handleAddCapas,
    handleRemoveCapa,
    handleSetPrincipal,
    saveCapas
  };
};

export default useCapasManager;
