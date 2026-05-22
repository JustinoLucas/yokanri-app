/**
 * WorkspaceExport — Exportar e importar workspaces do Yokanri
 *
 * Formato de exportação: arquivo .yokanri (ZIP internamente)
 *   ├── manifest.json       ← metadados do export
 *   ├── data.db             ← banco SQLite completo
 *   └── covers/             ← imagens de capa
 *
 * Dependências:
 *   - fflate (compressão/descompressão ZIP em JS puro)
 *   - @tauri-apps/plugin-dialog (diálogos nativos de salvar/abrir)
 *   - @tauri-apps/plugin-fs (leitura/escrita de arquivos)
 */

import { zipSync, unzipSync, strToU8, strFromU8 } from 'fflate';
import { save, open } from '@tauri-apps/plugin-dialog';
import {
  readFile,
  writeFile,
  exists,
  readDir,
  mkdir,
  remove,
  stat,
} from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { getActiveWorkspaceDir, getWorkspaceDir, FILES, DIRS } from './workspacePaths';
import { closeDb, getDb } from '../storage/sqliteConnection';

// ─── CONSTANTS ─────────────────────────────────────────

const MANIFEST_VERSION = 1;
const APP_VERSION = '1.0.0';
const MAX_IMPORT_SIZE = 500 * 1024 * 1024; // 500MB limite de segurança

// ─── EXPORT ────────────────────────────────────────────

/**
 * Exporta o workspace ativo para um arquivo .yokanri
 *
 * Fluxo:
 *   1. Abre diálogo "Salvar como" para escolher destino
 *   2. Fecha a conexão SQLite (garante integridade do data.db)
 *   3. Lê data.db + todas as capas
 *   4. Empacota num ZIP com manifest
 *   5. Escreve o arquivo no destino escolhido
 *
 * @param {Object} workspace - Objeto do workspace ativo (com name, slug, etc.)
 * @returns {Promise<{success: boolean, message: string, path?: string}>}
 */
export async function exportWorkspace(workspace) {
  try {
    // 1. Diálogo nativo para escolher onde salvar
    const savePath = await save({
      title: 'Exportar biblioteca',
      defaultPath: `${workspace.name}.yokanri`,
      filters: [
        { name: 'Yokanri Backup', extensions: ['yokanri'] },
      ],
    });

    // Usuário cancelou o diálogo
    if (!savePath) {
      return { success: false, message: 'cancelled' };
    }

    // 2. Conta obras ANTES de fechar o DB
    let obraCount = 0;
    try {
      const db = await getDb();
      const countResult = await db.select('SELECT COUNT(*) as total FROM obras');
      obraCount = countResult[0]?.total || 0;
    } catch {
      // Se falhar, exporta mesmo assim com count 0
    }

    // 3. Fecha conexão SQLite para garantir integridade do arquivo
    await closeDb();

    // 4. Coleta todos os arquivos do workspace
    const wsDir = await getActiveWorkspaceDir();
    const zipContents = {};

    // 4a. Lê data.db
    const dbPath = await join(wsDir, FILES.DATABASE);
    const dbExists = await exists(dbPath);

    if (!dbExists) {
      return {
        success: false,
        message: 'Banco de dados não encontrado. O workspace pode estar vazio.',
      };
    }

    const dbBytes = await readFile(dbPath);
    zipContents['data.db'] = new Uint8Array(dbBytes);

    // 4b. Lê todas as capas
    const coversDir = await join(wsDir, DIRS.COVERS);
    const coversExist = await exists(coversDir);
    let coverCount = 0;

    if (coversExist) {
      const coverEntries = await readDir(coversDir);

      for (const entry of coverEntries) {
        // Ignora subdiretórios, processa apenas arquivos
        if (entry.isDirectory) continue;

        try {
          const coverPath = await join(coversDir, entry.name);
          const coverBytes = await readFile(coverPath);
          zipContents[`covers/${entry.name}`] = new Uint8Array(coverBytes);
          coverCount++;
        } catch (err) {
          console.warn(`[Export] Erro ao ler capa "${entry.name}", pulando:`, err);
          // Continua com as outras capas — não aborta tudo
        }
      }
    }

    // 4c. Cria manifest
    const manifest = {
      version: MANIFEST_VERSION,
      appVersion: APP_VERSION,
      workspaceName: workspace.name,
      exportDate: new Date().toISOString(),
      obraCount,
      coverCount,
      dbSizeBytes: dbBytes.byteLength,
    };

    zipContents['manifest.json'] = strToU8(JSON.stringify(manifest, null, 2));

    // 5. Comprime tudo em ZIP
    const zipData = zipSync(zipContents, { level: 6 });

    // 6. Escreve no destino
    await writeFile(savePath, zipData);

    return {
      success: true,
      message: `Biblioteca exportada com sucesso!\n${manifest.obraCount} obras e ${coverCount} capas.`,
      path: savePath,
    };
  } catch (error) {
    console.error('[Export] Erro:', error);
    return {
      success: false,
      message: `Erro ao exportar: ${error?.message || error}`,
    };
  }
}

// ─── EXPORT (SPLIT API) ────────────────────────────

/**
 * Abre o diálogo de salvar e coleta metadados do workspace SEM exportar.
 * Retorna preview para confirmação do usuário.
 *
 * @param {Object} workspace - Objeto do workspace ativo
 * @returns {Promise<{cancelled, error?, savePath, workspaceName, obraCount, coverCount, estimatedSizeBytes, fileExists}>}
 */
export async function getExportPreviewData(workspace) {
  try {
    // 1. Diálogo nativo para escolher onde salvar
    const savePath = await save({
      title: 'Exportar biblioteca',
      defaultPath: `${workspace.name}.yokanri`,
      filters: [{ name: 'Yokanri Backup', extensions: ['yokanri'] }],
    });

    if (!savePath) return { cancelled: true };

    // 2. Verifica se já existe um arquivo nesse local
    const fileExists = await exists(savePath);

    // 3. Conta obras do banco de dados
    let obraCount = 0;
    try {
      const db = await getDb();
      const result = await db.select('SELECT COUNT(*) as total FROM obras');
      obraCount = result[0]?.total || 0;
    } catch { /* continua mesmo sem contagem */ }

    // 4. Calcula tamanho estimado (DB + capas) sem ler os arquivos
    const wsDir = await getActiveWorkspaceDir();
    const dbPath = await join(wsDir, FILES.DATABASE);
    const coversDir = await join(wsDir, DIRS.COVERS);

    let estimatedSizeBytes = 0;
    let coverCount = 0;

    if (await exists(dbPath)) {
      try {
        const dbStat = await stat(dbPath);
        estimatedSizeBytes += dbStat.size;
      } catch { /* ignora */ }
    }

    if (await exists(coversDir)) {
      try {
        const entries = await readDir(coversDir);
        for (const entry of entries) {
          if (entry.isDirectory) continue;
          coverCount++;
          try {
            const coverStat = await stat(await join(coversDir, entry.name));
            estimatedSizeBytes += coverStat.size;
          } catch { /* ignora */ }
        }
      } catch { /* ignora */ }
    }

    return {
      cancelled: false,
      savePath,
      workspaceName: workspace.name,
      obraCount,
      coverCount,
      estimatedSizeBytes,
      fileExists,
    };
  } catch (error) {
    console.error('[Export] Erro ao coletar preview:', error);
    return { cancelled: false, error: error?.message || String(error) };
  }
}

/**
 * Executa a exportação real dado um caminho já confirmado pelo usuário.
 *
 * @param {Object} workspace - Objeto do workspace ativo
 * @param {string} savePath - Caminho completo de destino (escolhido em getExportPreviewData)
 * @returns {Promise<{success, message, obraCount?, coverCount?, path?}>}
 */
export async function executeExport(workspace, savePath) {
  try {
    // 1. Conta obras ANTES de fechar o DB
    let obraCount = 0;
    try {
      const db = await getDb();
      const result = await db.select('SELECT COUNT(*) as total FROM obras');
      obraCount = result[0]?.total || 0;
    } catch { /* continua */ }

    // 2. Fecha conexão SQLite para garantir integridade do arquivo
    await closeDb();

    // 3. Coleta todos os arquivos
    const wsDir = await getActiveWorkspaceDir();
    const zipContents = {};

    const dbPath = await join(wsDir, FILES.DATABASE);
    if (!(await exists(dbPath))) {
      return { success: false, message: 'Banco de dados não encontrado. O workspace pode estar vazio.' };
    }

    const dbBytes = await readFile(dbPath);
    zipContents['data.db'] = new Uint8Array(dbBytes);

    const coversDir = await join(wsDir, DIRS.COVERS);
    let coverCount = 0;

    if (await exists(coversDir)) {
      const entries = await readDir(coversDir);
      for (const entry of entries) {
        if (entry.isDirectory) continue;
        try {
          const bytes = await readFile(await join(coversDir, entry.name));
          zipContents[`covers/${entry.name}`] = new Uint8Array(bytes);
          coverCount++;
        } catch (err) {
          console.warn(`[Export] Capa "${entry.name}" ignorada:`, err);
        }
      }
    }

    // 4. Cria manifest
    const manifest = {
      version: MANIFEST_VERSION,
      appVersion: APP_VERSION,
      workspaceName: workspace.name,
      exportDate: new Date().toISOString(),
      obraCount,
      coverCount,
      dbSizeBytes: dbBytes.byteLength,
    };
    zipContents['manifest.json'] = strToU8(JSON.stringify(manifest, null, 2));

    // 5. Comprime e escreve
    const zipData = zipSync(zipContents, { level: 6 });
    await writeFile(savePath, zipData);

    return { success: true, message: 'Exportado com sucesso.', obraCount, coverCount, path: savePath };
  } catch (error) {
    console.error('[Export] Erro ao executar:', error);
    return { success: false, message: `Erro ao exportar: ${error?.message || error}` };
  }
}

// ─── IMPORT ────────────────────────────────────────────

/**
 * Importa um workspace a partir de um arquivo .yokanri
 *
 * Fluxo:
 *   1. Abre diálogo "Abrir arquivo" para selecionar o .yokanri
 *   2. Lê e descompacta o ZIP
 *   3. Valida: manifest, data.db, versão
 *   4. Retorna preview para confirmação do usuário
 *
 * @returns {Promise<{success: boolean, message: string, preview?: Object, _zipData?: Object}>}
 */
export async function importWorkspaceSelect() {
  try {
    // 1. Diálogo nativo para escolher arquivo
    const filePath = await open({
      title: 'Importar biblioteca',
      multiple: false,
      filters: [
        { name: 'Yokanri Backup', extensions: ['yokanri'] },
      ],
    });

    // Usuário cancelou
    if (!filePath) {
      return { success: false, message: 'cancelled' };
    }

    // 2. Lê o arquivo
    const fileBytes = await readFile(filePath);

    // Verifica tamanho
    if (fileBytes.byteLength > MAX_IMPORT_SIZE) {
      return {
        success: false,
        message: `Arquivo muito grande (${formatBytes(fileBytes.byteLength)}). Limite: ${formatBytes(MAX_IMPORT_SIZE)}.`,
      };
    }

    // 3. Descompacta
    let unzipped;
    try {
      unzipped = unzipSync(new Uint8Array(fileBytes));
    } catch {
      return {
        success: false,
        message: 'Arquivo inválido. Não é um backup válido do Yokanri.',
      };
    }

    // 4. Valida estrutura
    const validation = validateImport(unzipped);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    // 5. Retorna preview para confirmação
    return {
      success: true,
      message: 'ready',
      preview: validation.manifest,
      fileSizeBytes: fileBytes.byteLength,
      _zipData: unzipped,
    };
  } catch (error) {
    console.error('[Import] Erro ao selecionar:', error);
    return {
      success: false,
      message: `Erro ao ler arquivo: ${error?.message || error}`,
    };
  }
}

/**
 * Confirma e efetiva a importação de um workspace
 *
 * @param {Object} unzipped - Dados descompactados (do _zipData retornado por importWorkspaceSelect)
 * @param {Object} manifest - Manifest do import (do preview retornado)
 * @param {Function} createWorkspaceFn - Função para criar workspace no registro (workspaceManager.createWorkspace)
 * @returns {Promise<{success: boolean, message: string, workspace?: Object}>}
 */
export async function importWorkspaceConfirm(unzipped, manifest, createWorkspaceFn) {
  try {
    // 1. Cria o workspace no registro (gera slug único automaticamente)
    const importName = manifest.workspaceName || 'Importado';
    const newWorkspace = await createWorkspaceFn(importName);

    // 2. Resolve o diretório do novo workspace
    const wsDir = await getWorkspaceDir(newWorkspace.slug);

    // 3. Escreve data.db
    if (unzipped['data.db']) {
      const dbPath = await join(wsDir, FILES.DATABASE);
      await writeFile(dbPath, unzipped['data.db']);
    }

    // 4. Escreve as capas
    const coversDir = await join(wsDir, DIRS.COVERS);
    await mkdir(coversDir, { recursive: true });

    let coversWritten = 0;
    for (const [path, data] of Object.entries(unzipped)) {
      if (path.startsWith('covers/') && path !== 'covers/') {
        const fileName = path.replace('covers/', '');
        if (!fileName || fileName.includes('/')) continue; // segurança

        try {
          const coverPath = await join(coversDir, fileName);
          await writeFile(coverPath, data);
          coversWritten++;
        } catch (err) {
          console.warn(`[Import] Erro ao escrever capa "${fileName}":`, err);
        }
      }
    }

    return {
      success: true,
      message: `Biblioteca "${importName}" importada com sucesso!\n${manifest.obraCount || '?'} obras e ${coversWritten} capas.`,
      workspace: newWorkspace,
    };
  } catch (error) {
    console.error('[Import] Erro ao confirmar:', error);
    return {
      success: false,
      message: `Erro ao importar: ${error?.message || error}`,
    };
  }
}

// ─── REPLACE (OVERWRITE) ──────────────────────────────

/**
 * Substitui completamente o workspace ativo com dados do arquivo importado
 *
 * Fluxo:
 *   1. Fecha conexão SQLite
 *   2. Remove data.db e covers/ atuais
 *   3. Escreve data.db e covers/ do arquivo importado
 *   4. Conexão será reaberta automaticamente no próximo acesso
 *
 * @param {Object} unzipped - Dados descompactados do .yokanri
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function replaceWorkspace(unzipped) {
  try {
    // 1. Fecha conexão SQLite
    await closeDb();

    const wsDir = await getActiveWorkspaceDir();

    // 2. Remove data.db atual
    const dbPath = await join(wsDir, FILES.DATABASE);
    const dbExists = await exists(dbPath);
    if (dbExists) {
      await remove(dbPath);
    }

    // 3. Remove todas as capas atuais
    const coversDir = await join(wsDir, DIRS.COVERS);
    const coversExist = await exists(coversDir);
    if (coversExist) {
      await remove(coversDir, { recursive: true });
    }
    await mkdir(coversDir, { recursive: true });

    // 4. Escreve data.db do arquivo importado
    if (unzipped['data.db']) {
      await writeFile(dbPath, unzipped['data.db']);
    }

    // 5. Escreve capas do arquivo importado
    let coversWritten = 0;
    for (const [path, data] of Object.entries(unzipped)) {
      if (path.startsWith('covers/') && path !== 'covers/') {
        const fileName = path.replace('covers/', '');
        if (!fileName || fileName.includes('/')) continue;

        try {
          const coverPath = await join(coversDir, fileName);
          await writeFile(coverPath, data);
          coversWritten++;
        } catch (err) {
          console.warn(`[Replace] Erro ao escrever capa "${fileName}":`, err);
        }
      }
    }

    return {
      success: true,
      message: `Biblioteca substituída com sucesso!\n${coversWritten} capa${coversWritten !== 1 ? 's' : ''} restaurada${coversWritten !== 1 ? 's' : ''}.`,
    };
  } catch (error) {
    console.error('[Replace] Erro:', error);
    return {
      success: false,
      message: `Erro ao substituir: ${error?.message || error}`,
    };
  }
}

// ─── VALIDATION ────────────────────────────────────────

/**
 * Valida a estrutura de um arquivo .yokanri descompactado
 * @param {Object} unzipped - Conteúdo descompactado pelo fflate
 * @returns {{valid: boolean, message?: string, manifest?: Object}}
 */
function validateImport(unzipped) {
  // Deve ter manifest.json
  if (!unzipped['manifest.json']) {
    return {
      valid: false,
      message: 'Arquivo inválido: manifest.json não encontrado.',
    };
  }

  // Parse do manifest
  let manifest;
  try {
    const manifestText = strFromU8(unzipped['manifest.json']);
    manifest = JSON.parse(manifestText);
  } catch {
    return {
      valid: false,
      message: 'Arquivo corrompido: manifest.json não pode ser lido.',
    };
  }

  // Verifica versão do manifest
  if (!manifest.version || manifest.version > MANIFEST_VERSION) {
    return {
      valid: false,
      message: `Versão incompatível. Este backup foi criado com uma versão mais recente do Yokanri (v${manifest.version}). Atualize o app para importar.`,
    };
  }

  // Deve ter data.db
  if (!unzipped['data.db']) {
    return {
      valid: false,
      message: 'Arquivo inválido: banco de dados (data.db) não encontrado.',
    };
  }

  return { valid: true, manifest };
}

// ─── HELPERS ───────────────────────────────────────────

/**
 * Formata bytes para exibição legível
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
