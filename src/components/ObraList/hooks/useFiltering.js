import { useState, useMemo, useCallback, useEffect } from 'react';
import { FILTER_ALL } from '../constants';
import { filterNsfwObras } from '../../../utils/nsfwUtils';

const STORAGE_KEY = 'obraListFilters';
const FILTERS_VERSION = 3;

const loadFiltersFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.version !== FILTERS_VERSION) return null;
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
};

const saveFiltersToStorage = (filters) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...filters, version: FILTERS_VERSION }));
  } catch {
    // ignore
  }
};

/**
 * Hook de filtragem e ordenação da biblioteca.
 *
 * @param {Array}  obras              - Lista completa de obras
 * @param {Object} config             - Config do app (statusObra, statusLeitura, generos, nsfwMode)
 * @param {string} externalSearchTerm - Busca vinda do topbar (prioridade sobre estado interno)
 */
export function useFiltering(obras, config, externalSearchTerm = '') {
  const savedFilters = loadFiltersFromStorage();

  const [filterTipo, setFilterTipo]                 = useState(savedFilters?.filterTipo || FILTER_ALL);
  const [filterStatusObra, setFilterStatusObra]     = useState(savedFilters?.filterStatusObra || FILTER_ALL);
  const [filterStatusLeitura, setFilterStatusLeitura] = useState(savedFilters?.filterStatusLeitura || FILTER_ALL);
  const [filterGenero, setFilterGenero]             = useState(savedFilters?.filterGenero || FILTER_ALL);
  const [filterAutor, setFilterAutor]               = useState(savedFilters?.filterAutor || '');
  const [filterArtista, setFilterArtista]           = useState(savedFilters?.filterArtista || '');
  const [filterAnoMin, setFilterAnoMin]             = useState(savedFilters?.filterAnoMin || '');
  const [filterAnoMax, setFilterAnoMax]             = useState(savedFilters?.filterAnoMax || '');
  const [filterCapMin, setFilterCapMin]             = useState(savedFilters?.filterCapMin || '');
  const [filterCapMax, setFilterCapMax]             = useState(savedFilters?.filterCapMax || '');
  const [filterMode, setFilterMode]                 = useState(savedFilters?.filterMode || 'or');
  const [showFavoritosOnly, setShowFavoritosOnly]   = useState(savedFilters?.showFavoritosOnly || false);
  const [sortBy, setSortBy]                         = useState(savedFilters?.sortBy || 'dataAdicionado');
  const [sortOrder, setSortOrder]                   = useState(savedFilters?.sortOrder || 'desc');

  useEffect(() => {
    saveFiltersToStorage({
      filterTipo, filterStatusObra, filterStatusLeitura, filterGenero,
      filterAutor, filterArtista,
      filterAnoMin, filterAnoMax,
      filterCapMin, filterCapMax,
      filterMode,
      showFavoritosOnly, sortBy, sortOrder,
    });
  }, [
    filterTipo, filterStatusObra, filterStatusLeitura, filterGenero,
    filterAutor, filterArtista,
    filterAnoMin, filterAnoMax,
    filterCapMin, filterCapMax,
    filterMode,
    showFavoritosOnly, sortBy, sortOrder,
  ]);

  const filteredAndSortedObras = useMemo(() => {
    let result = filterNsfwObras(obras, config);

    // Busca (topbar tem prioridade)
    const searchTerm = externalSearchTerm || '';
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(m =>
        m.nome.toLowerCase().includes(term) ||
        (m.nomeAlternativo || '').toLowerCase().includes(term) ||
        (m.autor || '').toLowerCase().includes(term)
      );
    }

    // Autor
    if (filterAutor) {
      const term = filterAutor.toLowerCase();
      result = result.filter(m => (m.autor || '').toLowerCase().includes(term));
    }

    // Artista / Studio
    if (filterArtista) {
      const term = filterArtista.toLowerCase();
      result = result.filter(m => (m.studio || '').toLowerCase().includes(term));
    }

    // Tipo
    if (filterTipo !== FILTER_ALL) {
      result = result.filter(m => m.tipo === filterTipo);
    }

    // Status da obra
    if (filterStatusObra !== FILTER_ALL) {
      result = result.filter(m => m.status === filterStatusObra);
    }

    // Status de leitura
    if (filterStatusLeitura !== FILTER_ALL) {
      result = result.filter(m => m.statusUsuario === filterStatusLeitura);
    }

    // Gênero
    if (filterGenero !== FILTER_ALL) {
      result = result.filter(m => m.generos.includes(filterGenero));
    }

    // Ano de lançamento
    if (filterAnoMin) {
      const min = parseInt(filterAnoMin, 10);
      result = result.filter(m => m.anoLancamento != null && m.anoLancamento >= min);
    }
    if (filterAnoMax) {
      const max = parseInt(filterAnoMax, 10);
      result = result.filter(m => m.anoLancamento != null && m.anoLancamento <= max);
    }

    // Quantidade de capítulos
    if (filterCapMin) {
      const min = parseInt(filterCapMin, 10);
      result = result.filter(m => m.capituloAtual >= min);
    }
    if (filterCapMax) {
      const max = parseInt(filterCapMax, 10);
      result = result.filter(m => m.capituloAtual <= max);
    }

    // Favoritos
    if (showFavoritosOnly) {
      result = result.filter(m => m.favorito);
    }

    // Ordenação (copia o array para garantir nova referência e disparar re-render)
    result = [...result].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'nome':
          comparison = a.nome.localeCompare(b.nome, 'pt-BR');
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
  }, [
    obras, config, externalSearchTerm,
    filterTipo, filterStatusObra, filterStatusLeitura, filterGenero,
    filterAutor, filterArtista,
    filterAnoMin, filterAnoMax,
    filterCapMin, filterCapMax,
    showFavoritosOnly, sortBy, sortOrder,
  ]);

  const handleSortChange = useCallback((newSortBy) => {
    setSortBy(newSortBy);
    setSortOrder(newSortBy === 'nota' || newSortBy === 'capituloAtualUsuario' ? 'desc' : 'asc');
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  const clearFilters = useCallback(() => {
    setFilterTipo(FILTER_ALL);
    setFilterStatusObra(FILTER_ALL);
    setFilterStatusLeitura(FILTER_ALL);
    setFilterGenero(FILTER_ALL);
    setFilterAutor('');
    setFilterArtista('');
    setFilterAnoMin('');
    setFilterAnoMax('');
    setFilterCapMin('');
    setFilterCapMax('');
    setFilterMode('or');
    setShowFavoritosOnly(false);
  }, []);

  return {
    // Estado dos filtros
    filterTipo, filterStatusObra, filterStatusLeitura, filterGenero,
    filterAutor, filterArtista,
    filterAnoMin, filterAnoMax,
    filterCapMin, filterCapMax,
    filterMode,
    showFavoritosOnly,
    sortBy, sortOrder,

    // Setters
    setFilterTipo, setFilterStatusObra, setFilterStatusLeitura, setFilterGenero,
    setFilterAutor, setFilterArtista,
    setFilterAnoMin, setFilterAnoMax,
    setFilterCapMin, setFilterCapMax,
    setFilterMode,
    setShowFavoritosOnly,

    // Handlers
    handleSortChange, toggleSortOrder, clearFilters,

    // Resultado
    filteredAndSortedObras,
  };
}
