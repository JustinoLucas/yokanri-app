export const ITEMS_PER_PAGE = 12;
export const BATCH_SIZE = 24; // itens carregados por vez no scroll infinito

export const LISTING_MODES = {
  PAGINATION: 'pagination',
  INFINITE: 'infinite',
};

export const SORT_OPTIONS = [
  { value: 'nome', label: 'Nome' },
  { value: 'nota', label: 'Nota' },
  { value: 'dataAdicionado', label: 'Data Adicionado' },
  { value: 'capituloAtualUsuario', label: 'Capítulo Atual' }
];

export const VIEW_MODES = {
  GRID: 'grid',
  TABLE: 'table',
  COMPACT: 'compact'
};

export const FILTER_ALL = 'TODOS';
