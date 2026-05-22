import { useState, useMemo, useCallback, useEffect } from 'react';
import { FILTER_ALL } from '../constants';
import { filterNsfwObras } from '../../../utils/nsfwUtils';

const STORAGE_KEY = 'obraListFilters';
// Versão dos filtros — incrementar quando o formato mudar (ex: label → ID nos status)
const FILTERS_VERSION = 2;

// Helper to load filters from localStorage
const loadFiltersFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Se a versão não bater, descarta os filtros salvos (evita filtros com labels antigos)
      if (parsed.version !== FILTERS_VERSION) return null;
      return parsed;
    }
  } catch (error) {
    console.error('Erro ao carregar filtros do localStorage:', error);
  }
  return null;
};

// Helper to save filters to localStorage
const saveFiltersToStorage = (filters) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...filters, version: FILTERS_VERSION }));
  } catch (error) {
    console.error('Erro ao salvar filtros no localStorage:', error);
  }
};

export function useFiltering(obras, config) {
  // Load initial state from localStorage
  const savedFilters = loadFiltersFromStorage();

  const [searchTerm, setSearchTerm] = useState(savedFilters?.searchTerm || '');
  const [filterTipo, setFilterTipo] = useState(savedFilters?.filterTipo || FILTER_ALL);
  const [filterStatusObra, setFilterStatusObra] = useState(savedFilters?.filterStatusObra || FILTER_ALL);
  const [filterStatusLeitura, setFilterStatusLeitura] = useState(savedFilters?.filterStatusLeitura || FILTER_ALL);
  const [filterGenero, setFilterGenero] = useState(savedFilters?.filterGenero || FILTER_ALL);
  const [showFavoritosOnly, setShowFavoritosOnly] = useState(savedFilters?.showFavoritosOnly || false);
  const [sortBy, setSortBy] = useState(savedFilters?.sortBy || 'dataAdicionado');
  const [sortOrder, setSortOrder] = useState(savedFilters?.sortOrder || 'desc');

  // Save filters to localStorage whenever they change
  useEffect(() => {
    saveFiltersToStorage({
      searchTerm,
      filterTipo,
      filterStatusObra,
      filterStatusLeitura,
      filterGenero,
      showFavoritosOnly,
      sortBy,
      sortOrder
    });
  }, [searchTerm, filterTipo, filterStatusObra, filterStatusLeitura, filterGenero, showFavoritosOnly, sortBy, sortOrder]);

  const filteredAndSortedObras = useMemo(() => {
    // Aplica filtro NSFW primeiro (remove obras se modo for 'hidden')
    let result = filterNsfwObras(obras, config);

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(m =>
        m.nome.toLowerCase().includes(term) ||
        m.nomeAlternativo.toLowerCase().includes(term) ||
        m.autor.toLowerCase().includes(term)
      );
    }

    // Filter by type
    if (filterTipo !== FILTER_ALL) {
      result = result.filter(m => m.tipo === filterTipo);
    }

    // Filter by obra status
    if (filterStatusObra !== FILTER_ALL) {
      result = result.filter(m => m.status === filterStatusObra);
    }

    // Filter by reading status
    if (filterStatusLeitura !== FILTER_ALL) {
      result = result.filter(m => m.statusUsuario === filterStatusLeitura);
    }

    // Filter by genre
    if (filterGenero !== FILTER_ALL) {
      result = result.filter(m => m.generos.includes(filterGenero));
    }

    // Filter favorites
    if (showFavoritosOnly) {
      result = result.filter(m => m.favorito);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'nome':
          comparison = a.nome.localeCompare(b.nome);
          break;
        case 'nota':
          comparison = (a.notaUsuario || 0) - (b.notaUsuario || 0);
          break;
        case 'dataAdicionado':
          comparison = new Date(a.dataAdicionado) - new Date(b.dataAdicionado);
          break;
        case 'capituloAtualUsuario':
          comparison = a.capituloAtualUsuario - b.capituloAtualUsuario;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [obras, config, searchTerm, filterTipo, filterStatusObra, filterStatusLeitura, filterGenero, showFavoritosOnly, sortBy, sortOrder]);

  const handleSortChange = useCallback((newSortBy) => {
    setSortBy(newSortBy);
    // For rating and chapter, start with highest first (desc)
    // For name and date, ascending order (asc)
    setSortOrder(newSortBy === 'nota' || newSortBy === 'capituloAtualUsuario' ? 'desc' : 'asc');
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterTipo(FILTER_ALL);
    setFilterStatusObra(FILTER_ALL);
    setFilterStatusLeitura(FILTER_ALL);
    setFilterGenero(FILTER_ALL);
    setShowFavoritosOnly(false);
  }, []);

  const hasActiveFilters = searchTerm ||
    filterTipo !== FILTER_ALL ||
    filterStatusObra !== FILTER_ALL ||
    filterStatusLeitura !== FILTER_ALL ||
    filterGenero !== FILTER_ALL ||
    showFavoritosOnly;

  return {
    // State
    searchTerm,
    filterTipo,
    filterStatusObra,
    filterStatusLeitura,
    filterGenero,
    showFavoritosOnly,
    sortBy,
    sortOrder,

    // Setters
    setSearchTerm,
    setFilterTipo,
    setFilterStatusObra,
    setFilterStatusLeitura,
    setFilterGenero,
    setShowFavoritosOnly,

    // Handlers
    handleSortChange,
    toggleSortOrder,
    clearFilters,

    // Computed
    filteredAndSortedObras,
    hasActiveFilters
  };
}
