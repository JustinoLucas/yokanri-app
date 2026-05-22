import { useState, useEffect } from 'react';
import storage from '../services/storage/storageService';

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Ordena lista de gêneros em ordem alfabética pt-BR (respeita acentos)
 * Ação vem junto com A, não depois de Z.
 */
function sortGeneros(list) {
  return [...list].sort((a, b) =>
    a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' })
  );
}

export const DEFAULT_CONFIG = {
  // Modo de exibição de conteúdo adulto/NSFW:
  //   'show'   — exibe normalmente
  //   'blur'   — capa com blur (remove no hover)
  //   'hidden' — oculta completamente da lista
  nsfwMode: 'show',

  statusObra: [
    // hidden: não aparece na UI (fallback interno para obras sem status definido)
    // isFixed: pode renomear/recolorir, mas NÃO pode excluir
    { id: 'nao-definido', label: 'Não definido', isFixed: true, hidden: true,  color: '#666666', hideSchedule: false },
    { id: 'em-andamento', label: 'Em andamento', isFixed: true,                color: '#10b981', hideSchedule: false },
    { id: 'completo',     label: 'Completo',      isFixed: true,                color: '#3b82f6', hideSchedule: true  },
    { id: 'hiato',        label: 'Hiato',          isFixed: true,                color: '#f59e0b', hideSchedule: false },
    { id: 'cancelado',    label: 'Cancelado',      isFixed: true,                color: '#ef4444', hideSchedule: true  },
  ],
  statusLeitura: [
    { id: 'nao-definido', label: 'Não definido', isFixed: true, hidden: true,  color: '#666666' },
    { id: 'lendo',        label: 'Lendo',          isFixed: true,                color: '#4caf50' },
    { id: 'completo',     label: 'Completo',        isFixed: true,                color: '#2196f3' },
    { id: 'dropado',      label: 'Dropado',          isFixed: true,                color: '#f44336' },
    { id: 'planeja-ler',  label: 'Planeja ler',    isFixed: true,                color: '#ff9800' },
    { id: 'pausado',      label: 'Pausado',          isFixed: true,                color: '#9e9e9e' },
  ],
  tipoLancamento: [
    { id: 'nao-definido', label: 'Não definido', protected: true },
    { id: 'semanal', label: 'Semanal', protected: true },
    { id: 'quinzenal', label: 'Quinzenal', protected: true },
    { id: 'mensal', label: 'Mensal', protected: true },
    { id: 'irregular', label: 'Irregular', protected: true },
  ],
  generos: [
    { id: 'acao', label: 'Ação' },
    { id: 'adulto', label: 'Adulto' },
    { id: 'apocaliptico', label: 'Apocalíptico' },
    { id: 'artes-marciais', label: 'Artes Marciais' },
    { id: 'aventura', label: 'Aventura' },
    { id: 'comedia', label: 'Comédia' },
    { id: 'crime', label: 'Crime' },
    { id: 'cultivo', label: 'Cultivo' },
    { id: 'drama', label: 'Drama' },
    { id: 'dungeon', label: 'Dungeon' },
    { id: 'escolar', label: 'Escolar' },
    { id: 'esportes', label: 'Esportes' },
    { id: 'fantasia', label: 'Fantasia' },
    { id: 'ficcao-cientifica', label: 'Ficção Científica' },
    { id: 'game', label: 'Game' },
    { id: 'harem', label: 'Harém' },
    { id: 'historico', label: 'Histórico' },
    { id: 'horror', label: 'Horror' },
    { id: 'isekai', label: 'Isekai' },
    { id: 'magia', label: 'Magia' },
    { id: 'mecha', label: 'Mecha' },
    { id: 'militar', label: 'Militar' },
    { id: 'misterio', label: 'Mistério' },
    { id: 'mitologia', label: 'Mitologia' },
    { id: 'murim', label: 'Murim' },
    { id: 'musica', label: 'Música' },
    { id: 'psicologico', label: 'Psicológico' },
    { id: 'realidade-virtual', label: 'Realidade Virtual' },
    { id: 'reencarnacao', label: 'Reencarnação' },
    { id: 'regressao', label: 'Regressão' },
    { id: 'romance', label: 'Romance' },
    { id: 'shoujo', label: 'Shoujo' },
    { id: 'shounen', label: 'Shounen' },
    { id: 'sistema', label: 'Sistema' },
    { id: 'slice-of-life', label: 'Slice of Life' },
    { id: 'sobrenatural', label: 'Sobrenatural' },
    { id: 'super-poderes', label: 'Super Poderes' },
    { id: 'suspense', label: 'Suspense' },
    { id: 'thriller', label: 'Thriller' },
    { id: 'viagem-no-tempo', label: 'Viagem no Tempo' },
    { id: 'zumbi', label: 'Zumbi' },
  ],
};

const CATEGORY_TO_OBRA_FIELD = {
  statusObra: 'status',
  statusLeitura: 'statusUsuario',
  tipoLancamento: 'tipoLancamento',
  generos: 'generos',
};

export function useConfiguracoes(obras, onSaveObras, ready) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    if (ready) {
      loadConfig();
    }
  }, [ready]);

  const mergeColors = (saved) => {
    const mergeList = (list, defaults) =>
      list.map(item => {
        const def = defaults.find(d => d.id === item.id);
        const merged = {
          ...item,
          color: item.color ?? def?.color,
          ...(item.hideSchedule === undefined && def?.hideSchedule !== undefined
            ? { hideSchedule: def.hideSchedule }
            : {}),
          // Flags de sistema: sempre sobrescritas pelos defaults (não são editáveis pelo usuário)
          ...(def?.isFixed !== undefined ? { isFixed: def.isFixed } : {}),
          ...(def?.hidden  !== undefined ? { hidden:  def.hidden  } : {}),
        };
        // Remove campo legado 'protected' de configs salvas anteriormente
        delete merged.protected;
        return merged;
      });
    return {
      ...saved,
      // Garante que nsfwMode existe mesmo em configs salvas antes desta versão
      nsfwMode: saved.nsfwMode ?? DEFAULT_CONFIG.nsfwMode,
      statusObra: mergeList(saved.statusObra, DEFAULT_CONFIG.statusObra),
      statusLeitura: mergeList(saved.statusLeitura, DEFAULT_CONFIG.statusLeitura),
      // Garante que gêneros carregados do disco estejam em ordem alfabética
      generos: sortGeneros(saved.generos ?? DEFAULT_CONFIG.generos),
    };
  };

  const loadConfig = async () => {
    const saved = await storage.loadConfig();
    if (saved?.statusObra && saved?.statusLeitura && saved?.tipoLancamento && saved?.generos) {
      setConfig(mergeColors(saved));
    } else {
      try {
        await storage.saveConfig(DEFAULT_CONFIG);
      } catch {
        // Storage might not be ready yet; defaults stay in memory
      }
    }
  };

  const persistConfig = async (newConfig) => {
    await storage.saveConfig(newConfig);
    setConfig(newConfig);
  };

  const isDuplicate = (category, label, excludeId = null) =>
    config[category].some(i =>
      i.label.toLowerCase() === label.toLowerCase() && i.id !== excludeId
    );

  const addItem = async (category, label, color = '#888888') => {
    const trimmed = label.trim();
    if (!trimmed) return null;
    if (isDuplicate(category, trimmed)) return 'duplicate';
    const hasColor = category === 'statusObra' || category === 'statusLeitura';
    const newItem = { id: generateId(), label: trimmed, ...(hasColor ? { color } : {}) };
    let updatedList = [...config[category], newItem];
    // Gêneros sempre em ordem alfabética pt-BR
    if (category === 'generos') {
      updatedList = sortGeneros(updatedList);
    }
    await persistConfig({
      ...config,
      [category]: updatedList,
    });
    return 'ok';
  };

  const renameItem = async (category, id, newLabel) => {
    const trimmed = newLabel.trim();
    if (!trimmed) return null;

    const item = config[category].find(i => i.id === id);
    // Itens protegidos (tipoLancamento) ou ocultos (nao-definido) não podem ser renomeados
    if (!item || item.protected || item.hidden) return null;
    if (isDuplicate(category, trimmed, id)) return 'duplicate';

    // Gêneros armazenam o label nas obras — precisa atualizar
    // Statuses armazenam o ID nas obras — renomear o label não afeta as obras
    if (category === 'generos') {
      const oldLabel = item.label;
      const updatedObras = obras.map(obra => ({
        ...obra,
        generos: obra.generos.map(g => g === oldLabel ? trimmed : g),
      }));
      await onSaveObras(updatedObras);
    }

    await persistConfig({
      ...config,
      [category]: config[category].map(i => i.id === id ? { ...i, label: trimmed } : i),
    });
  };

  const deleteItem = async (category, id) => {
    const item = config[category].find(i => i.id === id);
    // Itens protegidos (tipoLancamento) ou fixos (core statuses) não podem ser excluídos
    if (!item || item.protected || item.isFixed) return 0;

    const obraField = CATEGORY_TO_OBRA_FIELD[category];

    let affectedCount = 0;
    const updatedObras = obras.map(obra => {
      if (category === 'generos') {
        // Gêneros armazenam o label nas obras
        if (obra.generos.includes(item.label)) {
          affectedCount++;
          return { ...obra, generos: obra.generos.filter(g => g !== item.label) };
        }
        return obra;
      }
      // Statuses armazenam o ID nas obras — comparar por ID, fallback para 'nao-definido'
      if (obra[obraField] === id) {
        affectedCount++;
        return { ...obra, [obraField]: 'nao-definido' };
      }
      return obra;
    });

    if (affectedCount > 0) {
      await onSaveObras(updatedObras);
    }

    await persistConfig({
      ...config,
      [category]: config[category].filter(i => i.id !== id),
    });

    return affectedCount;
  };

  const toggleHideSchedule = async (id) => {
    await persistConfig({
      ...config,
      statusObra: config.statusObra.map(i =>
        i.id === id ? { ...i, hideSchedule: !i.hideSchedule } : i
      ),
    });
  };

  const updateColor = async (category, id, color) => {
    await persistConfig({
      ...config,
      [category]: config[category].map(i => i.id === id ? { ...i, color } : i),
    });
  };

  /** Alterna a flag NSFW de um gênero específico */
  const toggleGenreNsfw = async (id) => {
    await persistConfig({
      ...config,
      generos: config.generos.map(g =>
        g.id === id ? { ...g, nsfw: !g.nsfw } : g
      ),
    });
  };

  /** Define o modo global de exibição de conteúdo NSFW */
  const setNsfwMode = async (mode) => {
    await persistConfig({ ...config, nsfwMode: mode });
  };

  return { config, addItem, renameItem, deleteItem, updateColor, toggleHideSchedule, toggleGenreNsfw, setNsfwMode };
}
