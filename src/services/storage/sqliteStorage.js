/**
 * Implementação de storage usando SQLite + Tauri filesystem (para capas)
 *
 * Substitui jsonStorage.js — mesma interface pública.
 * Obras e config vão para SQLite (data.db no workspace ativo).
 * Capas continuam no filesystem (são arquivos binários).
 *
 * A conexão com o banco é gerenciada por sqliteConnection.js,
 * que lida com migrations e troca de workspace automaticamente.
 */

import {
  readFile,
  writeFile,
  exists,
  remove,
} from '@tauri-apps/plugin-fs';
import { getCoverPath } from '../workspace/workspacePaths';
import { getDb, insertObra } from './sqliteConnection';
import { getCachedCover, setCachedCover, hasCachedCover } from './coverCache';

// ─── OBRAS ──────────────────────────────────────────────

/**
 * Carrega todas as obras do workspace ativo
 * @returns {Promise<Array>} Array de obras
 */
export async function loadObras() {
  const db = await getDb();
  const rows = await db.select('SELECT * FROM obras ORDER BY nome COLLATE NOCASE');
  return rows.map(rowToObra);
}

/**
 * Salva todas as obras no workspace ativo
 * Estratégia: DELETE ALL + INSERT ALL
 * (compatível com o padrão atual de salvar array completo)
 *
 * NOTA: Sem transação explícita — tauri-plugin-sql usa connection pool
 * e cada execute() pode rodar em conexões diferentes do pool.
 * Cada operação é auto-committed individualmente.
 * @param {Array} obras - Array completo de obras
 */
export async function saveObras(obras) {
  const db = await getDb();

  await db.execute('DELETE FROM obras');

  for (const obra of obras) {
    await insertObra(db, obra);
  }
}

// ─── CONFIG ─────────────────────────────────────────────

/**
 * Carrega as configurações do workspace ativo
 * @returns {Promise<Object|null>} Configurações ou null se não existir
 */
export async function loadConfig() {
  const db = await getDb();
  const rows = await db.select("SELECT value FROM settings WHERE key = 'config'");

  if (rows.length === 0) {
    return null;
  }

  try {
    return JSON.parse(rows[0].value);
  } catch {
    return null;
  }
}

/**
 * Salva as configurações do workspace ativo
 * @param {Object} config - Objeto de configuração
 */
export async function saveConfig(config) {
  const db = await getDb();
  const json = JSON.stringify(config);

  await db.execute(
    "INSERT OR REPLACE INTO settings (key, value) VALUES ('config', $1)",
    [json]
  );
}

// ─── CAPAS (filesystem — mesmo código do jsonStorage) ───

/**
 * Salva uma imagem de capa no workspace ativo
 * @param {File|Blob|Uint8Array} fileData - Dados do arquivo
 * @param {string} fileName - Nome do arquivo destino
 * @returns {Promise<string>} Nome do arquivo salvo
 */
export async function saveCover(fileData, fileName) {
  const filePath = await getCoverPath(fileName);

  let bytes;
  if (fileData instanceof Uint8Array) {
    bytes = fileData;
  } else {
    const buffer = await fileData.arrayBuffer();
    bytes = new Uint8Array(buffer);
  }

  await writeFile(filePath, bytes);
  return fileName;
}

/**
 * Carrega uma imagem de capa e retorna como Object URL.
 *
 * Usa cache em memória (coverCache) para evitar leituras repetidas de disco.
 * Na primeira chamada para um arquivo: lê disco + cria URL + armazena no cache.
 * Nas chamadas seguintes: retorna a URL cacheada imediatamente (sem I/O).
 *
 * @param {string} fileName - Nome do arquivo da capa
 * @returns {Promise<string|null>} URL da imagem ou null se não encontrada
 */
export async function loadCover(fileName) {
  // Cache hit — retorna sem I/O
  if (hasCachedCover(fileName)) {
    return getCachedCover(fileName);
  }

  try {
    const filePath = await getCoverPath(fileName);
    const fileExists = await exists(filePath);

    if (!fileExists) {
      return null;
    }

    const content = await readFile(filePath);

    const ext = fileName.split('.').pop().toLowerCase();
    const mimeTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      avif: 'image/avif',
    };
    const mimeType = mimeTypes[ext] || 'image/png';

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    // Armazena no cache para evitar releituras
    setCachedCover(fileName, url);

    return url;
  } catch (error) {
    console.error(`Erro ao carregar capa "${fileName}":`, error);
    return null;
  }
}

/**
 * Remove uma imagem de capa do workspace ativo
 * @param {string} fileName - Nome do arquivo a remover
 */
export async function deleteCover(fileName) {
  try {
    const filePath = await getCoverPath(fileName);
    const fileExists = await exists(filePath);

    if (fileExists) {
      await remove(filePath);
    }
  } catch (error) {
    console.error(`Erro ao deletar capa "${fileName}":`, error);
  }
}

// ─── CONVERTERS ─────────────────────────────────────────

/**
 * Converte uma row do SQLite para o formato de objeto Obra
 * - Booleans: SQLite usa 0/1, JS usa true/false
 * - JSON arrays: SQLite armazena como TEXT, JS espera arrays/objetos
 */
function rowToObra(row) {
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
 * Parse seguro de JSON — retorna fallback em caso de erro
 */
function safeJsonParse(text, fallback) {
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}
