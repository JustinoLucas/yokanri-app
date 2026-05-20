import { useState, useEffect } from 'react';
import storage from '../services/storage/storageService';

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export const DEFAULT_CONFIG = {
  statusObra: [
    { id: 'nao-definido', label: 'Não definido', protected: true, color: '#666666', hideSchedule: false },
    { id: 'em-andamento', label: 'Em andamento', color: '#10b981', hideSchedule: false },
    { id: 'completo', label: 'Completo', color: '#3b82f6', hideSchedule: true },
    { id: 'hiato', label: 'Hiato', color: '#f59e0b', hideSchedule: false },
    { id: 'cancelado', label: 'Cancelado', color: '#ef4444', hideSchedule: true },
  ],
  statusLeitura: [
    { id: 'nao-definido', label: 'Não definido', protected: true, color: '#666666' },
    { id: 'lendo', label: 'Lendo', color: '#4caf50' },
    { id: 'completo', label: 'Completo', color: '#2196f3' },
    { id: 'dropado', label: 'Dropado', color: '#f44336' },
    { id: 'planeja-ler', label: 'Planeja ler', color: '#ff9800' },
    { id: 'pausado', label: 'Pausado', color: '#9e9e9e' },
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
        return {
          ...item,
          color: item.color ?? def?.color,
          ...(item.hideSchedule === undefined && def?.hideSchedule !== undefined
            ? { hideSchedule: def.hideSchedule }
            : {}),
        };
      });
    return {
      ...saved,
      statusObra: mergeList(saved.statusObra, DEFAULT_CONFIG.statusObra),
      statusLeitura: mergeList(saved.statusLeitura, DEFAULT_CONFIG.statusLeitura),
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
    await persistConfig({
      ...config,
      [category]: [...config[category], newItem],
    });
    return 'ok';
  };

  const renameItem = async (category, id, newLabel) => {
    const trimmed = newLabel.trim();
    if (!trimmed) return null;

    const item = config[category].find(i => i.id === id);
    if (!item || item.protected) return null;
    if (isDuplicate(category, trimmed, id)) return 'duplicate';

    const oldLabel = item.label;
    const obraField = CATEGORY_TO_OBRA_FIELD[category];

    const updatedObras = obras.map(obra => {
      if (category === 'generos') {
        return { ...obra, generos: obra.generos.map(g => g === oldLabel ? trimmed : g) };
      }
      if (obra[obraField] === oldLabel) {
        return { ...obra, [obraField]: trimmed };
      }
      return obra;
    });

    await onSaveObras(updatedObras);

    await persistConfig({
      ...config,
      [category]: config[category].map(i => i.id === id ? { ...i, label: trimmed } : i),
    });
  };

  const deleteItem = async (category, id) => {
    const item = config[category].find(i => i.id === id);
    if (!item || item.protected) return 0;

    const labelToDelete = item.label;
    const naoDefinidoLabel = config[category].find(i => i.id === 'nao-definido')?.label || 'Não definido';
    const obraField = CATEGORY_TO_OBRA_FIELD[category];

    let affectedCount = 0;
    const updatedObras = obras.map(obra => {
      if (category === 'generos') {
        if (obra.generos.includes(labelToDelete)) {
          affectedCount++;
          return { ...obra, generos: obra.generos.filter(g => g !== labelToDelete) };
        }
        return obra;
      }
      if (obra[obraField] === labelToDelete) {
        affectedCount++;
        return { ...obra, [obraField]: naoDefinidoLabel };
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

  return { config, addItem, renameItem, deleteItem, updateColor, toggleHideSchedule };
}
