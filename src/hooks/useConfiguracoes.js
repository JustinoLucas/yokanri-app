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

  // Destaques do perfil: até 5 IDs de obra escolhidos pelo usuário
  // (null = slot vazio)
  perfilDestaques: [],

  // Log de atividades recentes do perfil (mais recente primeiro)
  activityLog: [],

  // Banner customizado do perfil: { fileName, positionY } ou null (sem banner)
  perfilBanner: null,

  // Coleções personalizadas do usuário
  // cada item: { id, nome, banner: { fileName, positionY } | null, obraIds: [] }
  colecoes: [],

  statusObra: [
    // hidden: não aparece na UI (fallback interno para obras sem status definido)
    // isFixed: pode renomear/recolorir, mas NÃO pode excluir
    { id: 'nao-definido', label: 'Não definido', translationKey: 'status_obra_nao_definido', isFixed: true, hidden: true,  color: '#666666', hideSchedule: false },
    { id: 'em-andamento', label: 'Em andamento', translationKey: 'status_obra_em_andamento', isFixed: true,                color: '#10b981', hideSchedule: false },
    { id: 'completo',     label: 'Completo',      translationKey: 'status_obra_completo',     isFixed: true,                color: '#3b82f6', hideSchedule: true  },
    { id: 'hiato',        label: 'Hiato',          translationKey: 'status_obra_hiato',         isFixed: true,                color: '#f59e0b', hideSchedule: false },
    { id: 'cancelado',    label: 'Cancelado',      translationKey: 'status_obra_cancelado',     isFixed: true,                color: '#ef4444', hideSchedule: true  },
  ],
  statusLeitura: [
    { id: 'nao-definido', label: 'Não definido', translationKey: 'status_leitura_nao_definido', isFixed: true, hidden: true,  color: '#666666' },
    { id: 'lendo',        label: 'Lendo',          translationKey: 'status_leitura_lendo',        isFixed: true,                color: '#4caf50' },
    { id: 'completo',     label: 'Completo',        translationKey: 'status_leitura_completo',      isFixed: true,                color: '#2196f3' },
    { id: 'dropado',      label: 'Dropado',          translationKey: 'status_leitura_dropado',       isFixed: true,                color: '#f44336' },
    { id: 'planeja-ler',  label: 'Planeja ler',    translationKey: 'status_leitura_planeja_ler',  isFixed: true,                color: '#ff9800' },
    { id: 'pausado',      label: 'Pausado',          translationKey: 'status_leitura_pausado',       isFixed: true,                color: '#9e9e9e' },
  ],
  tipoLancamento: [
    { id: 'nao-definido', label: 'Não definido', protected: true },
    { id: 'semanal', label: 'Semanal', protected: true },
    { id: 'quinzenal', label: 'Quinzenal', protected: true },
    { id: 'mensal', label: 'Mensal', protected: true },
    { id: 'irregular', label: 'Irregular', protected: true },
  ],
  generos: [
    { id: 'acao',              label: 'Ação',               translationKey: 'genero_acao'              },
    { id: 'adulto',            label: 'Adulto',             translationKey: 'genero_adulto',            nsfw: true },
    { id: 'apocaliptico',      label: 'Apocalíptico',       translationKey: 'genero_apocaliptico'      },
    { id: 'artes-marciais',    label: 'Artes Marciais',     translationKey: 'genero_artes_marciais'    },
    { id: 'aventura',          label: 'Aventura',           translationKey: 'genero_aventura'          },
    { id: 'comedia',           label: 'Comédia',            translationKey: 'genero_comedia'           },
    { id: 'crime',             label: 'Crime',              translationKey: 'genero_crime'             },
    { id: 'cultivo',           label: 'Cultivo',            translationKey: 'genero_cultivo'           },
    { id: 'drama',             label: 'Drama',              translationKey: 'genero_drama'             },
    { id: 'dungeon',           label: 'Dungeon',            translationKey: 'genero_dungeon'           },
    { id: 'escolar',           label: 'Escolar',            translationKey: 'genero_escolar'           },
    { id: 'esportes',          label: 'Esportes',           translationKey: 'genero_esportes'          },
    { id: 'fantasia',          label: 'Fantasia',           translationKey: 'genero_fantasia'          },
    { id: 'ficcao-cientifica', label: 'Ficção Científica',  translationKey: 'genero_ficcao_cientifica' },
    { id: 'game',              label: 'Game',               translationKey: 'genero_game'              },
    { id: 'harem',             label: 'Harém',              translationKey: 'genero_harem'             },
    { id: 'historico',         label: 'Histórico',          translationKey: 'genero_historico'         },
    { id: 'horror',            label: 'Horror',             translationKey: 'genero_horror'            },
    { id: 'isekai',            label: 'Isekai',             translationKey: 'genero_isekai'            },
    { id: 'magia',             label: 'Magia',              translationKey: 'genero_magia'             },
    { id: 'mecha',             label: 'Mecha',              translationKey: 'genero_mecha'             },
    { id: 'militar',           label: 'Militar',            translationKey: 'genero_militar'           },
    { id: 'misterio',          label: 'Mistério',           translationKey: 'genero_misterio'          },
    { id: 'mitologia',         label: 'Mitologia',          translationKey: 'genero_mitologia'         },
    { id: 'murim',             label: 'Murim',              translationKey: 'genero_murim'             },
    { id: 'musica',            label: 'Música',             translationKey: 'genero_musica'            },
    { id: 'psicologico',       label: 'Psicológico',        translationKey: 'genero_psicologico'       },
    { id: 'realidade-virtual', label: 'Realidade Virtual',  translationKey: 'genero_realidade_virtual' },
    { id: 'reencarnacao',      label: 'Reencarnação',       translationKey: 'genero_reencarnacao'      },
    { id: 'regressao',         label: 'Regressão',          translationKey: 'genero_regressao'         },
    { id: 'romance',           label: 'Romance',            translationKey: 'genero_romance'           },
    { id: 'shoujo',            label: 'Shoujo',             translationKey: 'genero_shoujo'            },
    { id: 'shounen',           label: 'Shounen',            translationKey: 'genero_shounen'           },
    { id: 'sistema',           label: 'Sistema',            translationKey: 'genero_sistema'           },
    { id: 'slice-of-life',     label: 'Slice of Life',      translationKey: 'genero_slice_of_life'     },
    { id: 'sobrenatural',      label: 'Sobrenatural',       translationKey: 'genero_sobrenatural'      },
    { id: 'super-poderes',     label: 'Super Poderes',      translationKey: 'genero_super_poderes'     },
    { id: 'suspense',          label: 'Suspense',           translationKey: 'genero_suspense'          },
    { id: 'thriller',          label: 'Thriller',           translationKey: 'genero_thriller'          },
    { id: 'viagem-no-tempo',   label: 'Viagem no Tempo',    translationKey: 'genero_viagem_no_tempo'   },
    { id: 'zumbi',             label: 'Zumbi',              translationKey: 'genero_zumbi'             },
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
        // translationKey nunca é persistido no SQLite — sempre vem dos defaults em runtime.
        // Se o usuário renomeou o item (customized: true), não re-injeta a chave.
        const { translationKey: _discarded, ...itemWithoutTk } = item;
        const merged = {
          ...itemWithoutTk,
          color: item.color ?? def?.color,
          ...(item.hideSchedule === undefined && def?.hideSchedule !== undefined
            ? { hideSchedule: def.hideSchedule }
            : {}),
          // Flags de sistema: sempre sobrescritas pelos defaults (não são editáveis pelo usuário)
          ...(def?.isFixed !== undefined ? { isFixed: def.isFixed } : {}),
          ...(def?.hidden  !== undefined ? { hidden:  def.hidden  } : {}),
          // Re-injeta translationKey do default somente se o item não foi customizado
          ...(def?.translationKey && !item.customized ? { translationKey: def.translationKey } : {}),
        };
        // Remove campo legado 'protected' de configs salvas anteriormente
        delete merged.protected;
        return merged;
      });
    return {
      ...saved,
      // Garante que nsfwMode existe mesmo em configs salvas antes desta versão
      nsfwMode: saved.nsfwMode ?? DEFAULT_CONFIG.nsfwMode,
      // Garante que perfilDestaques existe mesmo em configs salvas antes desta versão
      perfilDestaques: saved.perfilDestaques ?? DEFAULT_CONFIG.perfilDestaques,
      // Garante que activityLog existe mesmo em configs salvas antes desta versão
      activityLog: saved.activityLog ?? DEFAULT_CONFIG.activityLog,
      // Garante que perfilBanner existe mesmo em configs salvas antes desta versão
      perfilBanner: saved.perfilBanner ?? DEFAULT_CONFIG.perfilBanner,
      // Garante que colecoes existe mesmo em configs salvas antes desta versão
      colecoes: saved.colecoes ?? DEFAULT_CONFIG.colecoes,
      statusObra: mergeList(saved.statusObra, DEFAULT_CONFIG.statusObra),
      statusLeitura: mergeList(saved.statusLeitura, DEFAULT_CONFIG.statusLeitura),
      // Gêneros: merge para re-injetar translationKey + ordena alfabeticamente
      generos: sortGeneros(mergeList(saved.generos ?? DEFAULT_CONFIG.generos, DEFAULT_CONFIG.generos)),
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
      [category]: config[category].map(i => {
        if (i.id !== id) return i;
        // Remove translationKey ao renomear: a partir daqui o app usa o label do usuário
        const { translationKey: _discarded, ...rest } = i;
        return { ...rest, label: trimmed, customized: true };
      }),
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

  const resetCategory = async (category) => {
    const defaults = DEFAULT_CONFIG[category];
    if (!defaults) return;

    let updatedObras = obras;

    const resetList = config[category].map(item => {
      const def = defaults.find(d => d.id === item.id);
      if (!def) return item; // item criado pelo usuário — mantém

      // Gêneros guardam o label nas obras: restaurar o label original nas obras também
      if (category === 'generos' && item.customized && item.label !== def.label) {
        updatedObras = updatedObras.map(obra => ({
          ...obra,
          generos: obra.generos.map(g => g === item.label ? def.label : g),
        }));
      }

      // Restaura o label padrão, remove customized e re-injeta translationKey
      // (translationKey em memória permite tradução imediata sem F5;
      //  mergeColors descarta e re-injeta novamente no próximo loadConfig)
      const { customized: _c, translationKey: _tk, ...rest } = item;
      return { ...rest, label: def.label, ...(def.translationKey ? { translationKey: def.translationKey } : {}) };
    });

    // Reinsere defaults que foram excluídos pelo usuário
    const existingIds = new Set(resetList.map(i => i.id));
    for (const def of defaults) {
      if (!existingIds.has(def.id)) {
        resetList.push({ ...def });
      }
    }

    if (updatedObras !== obras) {
      await onSaveObras(updatedObras);
    }

    await persistConfig({ ...config, [category]: resetList });
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

  /** Define os destaques do perfil (até 5 IDs de obra, null = slot vazio) */
  const setPerfilDestaques = async (destaques) => {
    await persistConfig({ ...config, perfilDestaques: destaques });
  };

  /** Define o banner customizado do perfil ({ fileName, positionY } ou null) */
  const setPerfilBanner = async (banner) => {
    await persistConfig({ ...config, perfilBanner: banner });
  };

  /** Registra novas entradas no log de atividades (mais recente primeiro, máx. 30) */
  const ACTIVITY_LOG_LIMIT = 30;
  const addActivityEntries = async (entries) => {
    const timestamp = new Date().toISOString();
    const newEntries = entries.map(e => ({ id: generateId(), timestamp, ...e }));
    const updated = [...newEntries, ...(config.activityLog ?? [])].slice(0, ACTIVITY_LOG_LIMIT);
    await persistConfig({ ...config, activityLog: updated });
  };

  /** Cria uma nova coleção vazia e retorna seu id */
  const addColecao = async (nome = 'Nova coleção') => {
    const novaColecao = { id: generateId(), nome, banner: null, obraIds: [] };
    await persistConfig({
      ...config,
      colecoes: [...(config.colecoes ?? []), novaColecao],
    });
    return novaColecao.id;
  };

  /** Renomeia uma coleção existente */
  const renameColecao = async (id, nome) => {
    const trimmed = nome.trim();
    if (!trimmed) return;
    await persistConfig({
      ...config,
      colecoes: config.colecoes.map(c => c.id === id ? { ...c, nome: trimmed } : c),
    });
  };

  /** Remove uma coleção */
  const deleteColecao = async (id) => {
    await persistConfig({
      ...config,
      colecoes: config.colecoes.filter(c => c.id !== id),
    });
  };

  /** Define o banner customizado de uma coleção ({ fileName, positionY } ou null) */
  const setColecaoBanner = async (id, banner) => {
    await persistConfig({
      ...config,
      colecoes: config.colecoes.map(c => c.id === id ? { ...c, banner } : c),
    });
  };

  /** Define a lista de IDs de obras pertencentes a uma coleção */
  const setColecaoObras = async (id, obraIds) => {
    await persistConfig({
      ...config,
      colecoes: config.colecoes.map(c => c.id === id ? { ...c, obraIds } : c),
    });
  };

  return { config, addItem, renameItem, deleteItem, updateColor, toggleHideSchedule, toggleGenreNsfw, setNsfwMode, setPerfilDestaques, addActivityEntries, setPerfilBanner, addColecao, renameColecao, deleteColecao, setColecaoBanner, setColecaoObras, resetCategory };
}
