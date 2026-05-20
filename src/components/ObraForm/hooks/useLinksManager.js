import { useState, useEffect } from 'react';

/**
 * Custom hook for managing multiple links
 * Handles adding, removing, editing, and setting principal link
 */
export const useLinksManager = (obra) => {
  const [linksState, setLinksState] = useState([]); // Array of { nome, url, principal }

  useEffect(() => {
    if (obra && obra.links) {
      setLinksState(obra.links);
    }
  }, [obra]);

  /**
   * Adds a new link
   */
  const handleAddLink = () => {
    const newLink = {
      nome: '',
      url: '',
      principal: linksState.length === 0 // First link is principal
    };
    setLinksState([...linksState, newLink]);
  };

  /**
   * Removes a link
   * @param {number} index - Index of link to remove
   */
  const handleRemoveLink = (index) => {
    const link = linksState[index];
    const updatedLinks = linksState.filter((_, i) => i !== index);

    // If removed the principal link, set first one as principal
    if (link.principal && updatedLinks.length > 0) {
      updatedLinks[0].principal = true;
    }

    setLinksState(updatedLinks);
  };

  /**
   * Updates a link field
   * @param {number} index - Index of link to update
   * @param {string} field - Field name (nome or url)
   * @param {string} value - New value
   */
  const handleLinkChange = (index, field, value) => {
    const updatedLinks = [...linksState];
    updatedLinks[index][field] = value;
    setLinksState(updatedLinks);
  };

  /**
   * Sets a link as principal
   * @param {number} index - Index of link to set as principal
   */
  const handleSetLinkPrincipal = (index) => {
    const updatedLinks = linksState.map((link, i) => ({
      ...link,
      principal: i === index
    }));
    setLinksState(updatedLinks);
  };

  /**
   * Gets the final links array (filters empty links)
   * @returns {Array} - Array of valid links
   */
  const getValidLinks = () => {
    return linksState.filter(link => link.nome && link.url);
  };

  return {
    linksState,
    handleAddLink,
    handleRemoveLink,
    handleLinkChange,
    handleSetLinkPrincipal,
    getValidLinks
  };
};

export default useLinksManager;
