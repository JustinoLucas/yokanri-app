/**
 * WorkspaceMerge — Merge de dados importados com o workspace ativo
 *
 * Responsabilidades:
 *   - Abrir o data.db importado como conexão temporária
 *   - Comparar obras importadas vs existentes (deduplicação)
 *   - Inserir apenas obras novas no workspace ativo
 *   - Copiar capas das obras novas
 *   - Gerar relatório do que foi feito
 *
 * Estratégia de deduplicação:
 *   1. Match por ID exato → duplicata (skip)
 *   2. Match por nome normalizado (case-insensitive, trimmed) → duplicata (skip)
 *   3. Sem match → obra nova → inserir
 *
 * Resolução de conflitos: workspace atual SEMPRE vence.
 * O objetivo é ADICIONAR conteúdo novo, nunca sobrescrever.
 */

import Database from '@tauri-apps/plugin-sql';
import {
  writeFile,
  exists,
  mkdir,
  remove,
} from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { getActiveWorkspaceDir, DIRS } from './workspacePaths';
import { getDb, insertObra } from '../storage/sqliteConnection';

// ─── PUBLIC API ────────────────────────────────────────

/**
 * Analisa o conteúdo importado e retorna preview do merge
 * (quantas novas, quantas duplicatas, quais capas)
 *
 * @param {Object} unzipped - Dados descompactados do .yokanri (fflate)
 * @returns {Promise<{success: boolean, message?: string, stats?: MergeStats}>}
 *
 * @typedef {Object} MergeStats
 * @property {number} totalImported - Total de obras no arquivo
 * @property {number} newObras - Obras que serão adicionadas
 * @property {number} duplicates - Obras duplicadas (serão ignoradas)
 * @property {number} newCovers - Capas novas que serão copiadas
 * @property {Array} newObraNames - Nomes das obras novas (para preview)
 * @property {Array} duplicateNames - Nomes das obras duplicadas (para preview)
 */
export async function analyzeMerge(unzipped) {
  let tempDb = null;
  let tempDbPath = null;

  try {
    // 1. Escreve o data.db importado em arquivo temporário
    tempDbPath = await writeTempDb(unzipped['data.db']);

    // 2. Abre conexão temporária com o banco importado
    tempDb = await Database.load(`sqlite:${tempDbPath}`);

    // 3. Lê todas as obras do banco importado
    const importedObras = await tempDb.select('SELECT * FROM obras');

    // 4. Lê todas as obras do workspace ativo
    const db = await getDb();
    const currentObras = await db.select('SELECT id, nome FROM obras');

    // 5. Compara e classifica
    const currentIds = new Set(currentObras.map(o => o.id));
    const currentNames = new Set(currentObras.map(o => normalizeName(o.nome)));

    const newObras = [];
    const duplicates = [];

    for (const obra of importedObras) {
      if (currentIds.has(obra.id)) {
        duplicates.push(obra);
      } else if (currentNames.has(normalizeName(obra.nome))) {
        duplicates.push(obra);
      } else {
        newObras.push(obra);
      }
    }

    // 6. Conta capas novas
    const existingCoversDir = await join(await getActiveWorkspaceDir(), DIRS.COVERS);
    let newCovers = 0;

    for (const [path] of Object.entries(unzipped)) {
      if (path.startsWith('covers/') && path !== 'covers/') {
        const fileName = path.replace('covers/', '');
        if (!fileName) continue;

        // Verifica se a capa pertence a uma obra nova
        const isNewObraCover = newObras.some(obra => {
          const capas = safeJsonParse(obra.capas, []);
          return capas.some(c => c.nome === fileName);
        });

        if (isNewObraCover) {
          newCovers++;
        }
      }
    }

    return {
      success: true,
      stats: {
        totalImported: importedObras.length,
        newObras: newObras.length,
        duplicates: duplicates.length,
        newCovers,
        newObraNames: newObras.slice(0, 20).map(o => o.nome),
        duplicateNames: duplicates.slice(0, 10).map(o => o.nome),
      },
    };
  } catch (error) {
    console.error('[Merge] Erro na análise:', error);
    return {
      success: false,
      message: `Erro ao analisar dados: ${error?.message || error}`,
    };
  } finally {
    // Fecha e limpa o banco temporário
    await cleanupTempDb(tempDb, tempDbPath);
  }
}

/**
 * Executa o merge: insere obras novas no workspace ativo
 *
 * @param {Object} unzipped - Dados descompactados do .yokanri
 * @returns {Promise<{success: boolean, message: string, inserted?: number, coversAdded?: number}>}
 */
export async function executeMerge(unzipped) {
  let tempDb = null;
  let tempDbPath = null;

  try {
    // 1. Abre banco temporário
    tempDbPath = await writeTempDb(unzipped['data.db']);
    tempDb = await Database.load(`sqlite:${tempDbPath}`);

    // 2. Lê obras importadas
    const importedObras = await tempDb.select('SELECT * FROM obras');

    // 3. Lê obras atuais para deduplicação
    const db = await getDb();
    const currentObras = await db.select('SELECT id, nome FROM obras');
    const currentIds = new Set(currentObras.map(o => o.id));
    const currentNames = new Set(currentObras.map(o => normalizeName(o.nome)));

    // 4. Filtra apenas obras novas
    const newObras = importedObras.filter(obra => {
      if (currentIds.has(obra.id)) return false;
      if (currentNames.has(normalizeName(obra.nome))) return false;
      return true;
    });

    // 5. Insere obras novas no workspace ativo
    let inserted = 0;
    for (const obra of newObras) {
      try {
        // Converte row do SQLite para o formato esperado pelo insertObra
        const obraObj = rowToObraObj(obra);
        await insertObra(db, obraObj);
        inserted++;
      } catch (err) {
        console.warn(`[Merge] Erro ao inserir "${obra.nome}", pulando:`, err);
      }
    }

    // 6. Copia capas das obras novas
    const wsDir = await getActiveWorkspaceDir();
    const coversDir = await join(wsDir, DIRS.COVERS);
    await mkdir(coversDir, { recursive: true });

    // Coleta nomes de capas das obras novas
    const newCoverNames = new Set();
    for (const obra of newObras) {
      const capas = safeJsonParse(obra.capas, []);
      for (const capa of capas) {
        if (capa.nome) {
          newCoverNames.add(capa.nome);
        }
      }
    }

    let coversAdded = 0;
    for (const [path, data] of Object.entries(unzipped)) {
      if (path.startsWith('covers/') && path !== 'covers/') {
        const fileName = path.replace('covers/', '');
        if (!fileName || fileName.includes('/')) continue;

        // Só copia capas que pertencem a obras novas
        if (!newCoverNames.has(fileName)) continue;

        // Não sobrescreve capas existentes
        const coverPath = await join(coversDir, fileName);
        const coverExists = await exists(coverPath);
        if (coverExists) continue;

        try {
          await writeFile(coverPath, data);
          coversAdded++;
        } catch (err) {
          console.warn(`[Merge] Erro ao copiar capa "${fileName}":`, err);
        }
      }
    }

    return {
      success: true,
      message: `Merge concluído!\n${inserted} obra${inserted !== 1 ? 's' : ''} adicionada${inserted !== 1 ? 's' : ''}, ${coversAdded} capa${coversAdded !== 1 ? 's' : ''} copiada${coversAdded !== 1 ? 's' : ''}.`,
      inserted,
      coversAdded,
    };
  } catch (error) {
    console.error('[Merge] Erro ao executar:', error);
    return {
      success: false,
      message: `Erro ao mesclar dados: ${error?.message || error}`,
    };
  } finally {
    await cleanupTempDb(tempDb, tempDbPath);
  }
}

// ─── HELPERS ───────────────────────────────────────────

/**
 * Normaliza nome para comparação (case-insensitive, trimmed)
 */
function normalizeName(name) {
  if (!name) return '';
  return name.trim().toLowerCase();
}

/**
 * Escreve o data.db importado em um arquivo temporário
 * @param {Uint8Array} dbBytes
 * @returns {Promise<string>} Caminho absoluto do arquivo temporário
 */
async function writeTempDb(dbBytes) {
  const wsDir = await getActiveWorkspaceDir();
  // Usa nome único (timestamp) para evitar colisão de pool no tauri-plugin-sql.
  // O plugin mantém pools por URI — reusar o mesmo nome após close pode
  // retornar um pool fechado do cache interno.
  const tempName = `_import_temp_${Date.now()}.db`;
  const tempPath = await join(wsDir, tempName);

  await writeFile(tempPath, dbBytes);
  return tempPath;
}

/**
 * Fecha conexão e remove arquivo temporário
 */
async function cleanupTempDb(tempDb, tempDbPath) {
  if (tempDb) {
    try {
      // IMPORTANTE: sempre passar o path para fechar SOMENTE este pool.
      // Sem argumento, tauri-plugin-sql fecha TODOS os pools (inclusive o DB principal),
      // causando "attempted to acquire a connection on a closed pool".
      await tempDb.close(tempDb.path);
    } catch (e) {
      console.warn('[Merge] Erro ao fechar DB temporário:', e);
    }
  }
  if (tempDbPath) {
    try {
      const tempExists = await exists(tempDbPath);
      if (tempExists) {
        await remove(tempDbPath);
      }
    } catch (e) {
      console.warn('[Merge] Erro ao remover DB temporário:', e);
    }
  }
}

/**
 * Converte uma row do SQLite importado para o formato de objeto
 * que o insertObra espera (com arrays JS em vez de JSON strings)
 */
function rowToObraObj(row) {
  return {
    ...row,
    favorito: Boolean(row.favorito),
    autoIncrementOnLink: Boolean(row.autoIncrementOnLink),
    generos: safeJsonParse(row.generos, []),
    diasLancamento: safeJsonParse(row.diasLancamento, []),
    links: safeJsonParse(row.links, []),
    capas: safeJsonParse(row.capas, []),
  };
}

/**
 * Parse seguro de JSON
 */
function safeJsonParse(text, fallback) {
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}
