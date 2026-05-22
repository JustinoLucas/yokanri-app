/**
 * WorkspaceMove — Mover workspace para outro diretório
 *
 * Estratégia segura: Copy → Verify → Update Registry → Delete Original
 *
 * Fluxo:
 *   1. Usuário escolhe pasta destino via dialog
 *   2. Sistema cria pastaDestino/Yokanri/nomeWorkspace/
 *   3. COPIA todos os arquivos para destino
 *   4. Verifica integridade (tamanho de cada arquivo)
 *   5. Atualiza registry com novo path
 *   6. Deleta pasta original
 *   7. Se qualquer passo falhar -> rollback (limpa destino, mantém original)
 *
 * Dependências:
 *   - @tauri-apps/plugin-dialog (escolher pasta destino)
 *   - @tauri-apps/plugin-fs (operações de arquivo)
 *   - workspaceManager (atualizar registry)
 *   - sqliteConnection (fechar DB antes de mover)
 */

import { open } from '@tauri-apps/plugin-dialog';
import {
  readFile,
  writeFile,
  readDir,
  exists,
  mkdir,
  remove,
  stat,
} from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { getWorkspaceDir, APP_FOLDER_NAME } from './workspacePaths';
import { closeDb } from '../storage/sqliteConnection';
import workspaceManager from './workspaceManager';

// ─── PUBLIC API ────────────────────────────────────────

/**
 * Abre o diálogo de pasta e coleta metadados do move SEM executar.
 * Retorna preview para confirmação do usuário.
 *
 * @param {Object} workspace - Objeto do workspace ativo
 * @returns {Promise<{cancelled, error?, workspaceName, sourcePath, destPath, fileCount, totalSizeBytes, destExists}>}
 */
export async function getMovePreviewData(workspace) {
  try {
    // 1. Diálogo para escolher pasta destino
    const destFolder = await open({
      title: 'Escolher pasta de destino',
      directory: true,
      multiple: false,
    });

    if (!destFolder) return { cancelled: true };

    // 2. Calcula caminho de destino
    const yokanriDir = await join(destFolder, APP_FOLDER_NAME);
    const destDir = await join(yokanriDir, sanitizeFolderName(workspace.name));
    const sourceDir = await getWorkspaceDir(workspace.slug, workspace.path);

    // 3. Valida source
    if (!(await exists(sourceDir))) {
      return { cancelled: false, error: 'Pasta do workspace atual não encontrada. O workspace pode estar corrompido.' };
    }

    // 4. Verifica se destino já existe
    const destExists = await exists(destDir);

    // 5. Lista arquivos e calcula tamanho total
    let fileCount = 0;
    let totalSizeBytes = 0;
    try {
      const files = await listFilesRecursive(sourceDir);
      fileCount = files.length;
      for (const file of files) {
        try {
          const fileStat = await stat(await join(sourceDir, file));
          totalSizeBytes += fileStat.size;
        } catch { /* ignora */ }
      }
    } catch { /* ignora */ }

    return {
      cancelled: false,
      workspaceName: workspace.name,
      sourcePath: sourceDir,
      destPath: destDir,
      fileCount,
      totalSizeBytes,
      destExists,
    };
  } catch (error) {
    console.error('[Move] Erro ao coletar preview:', error);
    return { cancelled: false, error: error?.message || String(error) };
  }
}

/**
 * Executa o move real dado um destino já confirmado pelo usuário.
 *
 * @param {Object} workspace - Objeto do workspace ativo
 * @param {string} destDir - Caminho de destino completo (retornado por getMovePreviewData)
 * @returns {Promise<{success, message, workspace?}>}
 */
export async function executeMoveToDestination(workspace, destDir) {
  const sourceDir = await getWorkspaceDir(workspace.slug, workspace.path);

  // Valida novamente (por segurança — o estado do disco pode ter mudado)
  if (await exists(destDir)) {
    return {
      success: false,
      message: `A pasta de destino já existe:\n${destDir}\n\nEscolha outro local ou renomeie a pasta existente.`,
    };
  }

  if (!(await exists(sourceDir))) {
    return { success: false, message: 'Pasta do workspace atual não encontrada.' };
  }

  // Fecha conexão SQLite
  await closeDb();

  try {
    // Copia tudo
    await copyDirectory(sourceDir, destDir);

    // Verifica integridade
    const integrityOk = await verifyIntegrity(sourceDir, destDir);
    if (!integrityOk) {
      await safeRemove(destDir);
      return { success: false, message: 'Falha na verificação de integridade. Os arquivos originais foram mantidos.' };
    }

    // Atualiza registry
    const updatedWorkspace = await workspaceManager.updateWorkspacePath(workspace.id, destDir);

    // Remove pasta original
    await safeRemove(sourceDir);

    return { success: true, message: 'Workspace movido com sucesso!', workspace: updatedWorkspace };
  } catch (error) {
    console.error('[Move] Erro:', error);
    try {
      await workspaceManager.updateWorkspacePath(workspace.id, workspace.path || null);
    } catch (e) {
      console.warn('[Move] Erro ao restaurar registry:', e);
    }
    await safeRemove(destDir);
    return {
      success: false,
      message: `Erro ao mover workspace: ${error?.message || error}\nOs arquivos originais foram mantidos.`,
    };
  }
}

/**
 * Move o workspace ativo para um novo diretório
 *
 * @param {Object} workspace - Objeto do workspace ativo
 * @returns {Promise<{success: boolean, message: string, workspace?: Object}>}
 */
export async function moveWorkspace(workspace) {
  // 1. Diálogo para escolher pasta destino
  const destFolder = await open({
    title: 'Escolher pasta de destino',
    directory: true,
    multiple: false,
  });

  if (!destFolder) {
    return { success: false, message: 'cancelled' };
  }

  // O destino final será: pastaEscolhida/Yokanri/nomeWorkspace/
  // Sempre cria a pasta raiz do app antes do workspace
  const yokanriDir = await join(destFolder, APP_FOLDER_NAME);
  const destDir = await join(yokanriDir, sanitizeFolderName(workspace.name));

  // 2. Validações
  const validation = await validateMove(workspace, destDir);
  if (!validation.valid) {
    return { success: false, message: validation.message };
  }

  // 3. Fecha conexão SQLite (obrigatório antes de copiar o data.db)
  await closeDb();

  // 4. Resolve o diretório atual do workspace
  const sourceDir = await getWorkspaceDir(workspace.slug, workspace.path);

  try {
    // 5. Copia tudo para o destino
    await copyDirectory(sourceDir, destDir);

    // 6. Verifica integridade
    const integrityOk = await verifyIntegrity(sourceDir, destDir);
    if (!integrityOk) {
      // Rollback: limpa destino
      await safeRemove(destDir);
      return {
        success: false,
        message: 'Falha na verificação de integridade. Os arquivos originais foram mantidos.',
      };
    }

    // 7. Atualiza registry com novo path
    const updatedWorkspace = await workspaceManager.updateWorkspacePath(workspace.id, destDir);

    // 8. Remove pasta original
    await safeRemove(sourceDir);

    return {
      success: true,
      message: `Workspace movido com sucesso para:\n${destDir}`,
      workspace: updatedWorkspace,
    };
  } catch (error) {
    console.error('[Move] Erro:', error);

    // Rollback: tenta limpar destino e restaurar registry
    try {
      await workspaceManager.updateWorkspacePath(workspace.id, workspace.path || null);
    } catch (e) {
      console.warn('[Move] Erro ao restaurar registry:', e);
    }
    await safeRemove(destDir);

    return {
      success: false,
      message: `Erro ao mover workspace: ${error?.message || error}\nOs arquivos originais foram mantidos.`,
    };
  }
}

// ─── VALIDATION ────────────────────────────────────────

/**
 * Valida se o move é possível
 */
async function validateMove(workspace, destDir) {
  // Destino já existe?
  const destExists = await exists(destDir);
  if (destExists) {
    return {
      valid: false,
      message: `A pasta de destino já existe:\n${destDir}\n\nEscolha outro local ou renomeie a pasta existente.`,
    };
  }

  // Source existe?
  const sourceDir = await getWorkspaceDir(workspace.slug, workspace.path);
  const sourceExists = await exists(sourceDir);
  if (!sourceExists) {
    return {
      valid: false,
      message: 'Pasta do workspace atual não encontrada. O workspace pode estar corrompido.',
    };
  }

  return { valid: true };
}

// ─── FILE OPERATIONS ───────────────────────────────────

/**
 * Copia um diretório inteiro recursivamente
 * @param {string} source - Diretório de origem
 * @param {string} dest - Diretório de destino
 */
async function copyDirectory(source, dest) {
  await mkdir(dest, { recursive: true });

  const entries = await readDir(source);

  for (const entry of entries) {
    const sourcePath = await join(source, entry.name);
    const destPath = await join(dest, entry.name);

    if (entry.isDirectory) {
      await copyDirectory(sourcePath, destPath);
    } else {
      const content = await readFile(sourcePath);
      await writeFile(destPath, content);
    }
  }
}

/**
 * Verifica integridade comparando tamanhos de arquivos
 * @param {string} source - Diretório original
 * @param {string} dest - Diretório copiado
 * @returns {Promise<boolean>}
 */
async function verifyIntegrity(source, dest) {
  try {
    const sourceFiles = await listFilesRecursive(source);
    const destFiles = await listFilesRecursive(dest);

    // Deve ter o mesmo número de arquivos
    if (sourceFiles.length !== destFiles.length) {
      console.error(`[Move] Integrity: file count mismatch (${sourceFiles.length} vs ${destFiles.length})`);
      return false;
    }

    // Verifica tamanho de cada arquivo
    for (const relativePath of sourceFiles) {
      const sourcePath = await join(source, relativePath);
      const destPath = await join(dest, relativePath);

      const destFileExists = await exists(destPath);
      if (!destFileExists) {
        console.error(`[Move] Integrity: missing file ${relativePath}`);
        return false;
      }

      const sourceStat = await stat(sourcePath);
      const destStat = await stat(destPath);

      if (sourceStat.size !== destStat.size) {
        console.error(`[Move] Integrity: size mismatch for ${relativePath} (${sourceStat.size} vs ${destStat.size})`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('[Move] Integrity check error:', error);
    return false;
  }
}

/**
 * Lista todos os arquivos de um diretório recursivamente
 * Retorna caminhos relativos ao diretório raiz
 * @param {string} dir - Diretório raiz
 * @param {string} [prefix=''] - Prefixo para recursão
 * @returns {Promise<string[]>}
 */
async function listFilesRecursive(dir, prefix = '') {
  const files = [];
  const entries = await readDir(dir);

  for (const entry of entries) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory) {
      const subFiles = await listFilesRecursive(
        await join(dir, entry.name),
        relativePath
      );
      files.push(...subFiles);
    } else {
      files.push(relativePath);
    }
  }

  return files;
}

// ─── HELPERS ───────────────────────────────────────────

/**
 * Remove um diretório de forma segura (ignora erros)
 */
async function safeRemove(path) {
  try {
    const pathExists = await exists(path);
    if (pathExists) {
      await remove(path, { recursive: true });
    }
  } catch (e) {
    console.warn(`[Move] Erro ao remover "${path}":`, e);
  }
}

/**
 * Sanitiza nome para uso como pasta
 * "Minha Biblioteca!" → "Minha Biblioteca"
 */
function sanitizeFolderName(name) {
  return name
    .replace(/[<>:"/\\|?*]/g, '') // remove caracteres inválidos para Windows
    .trim()
    || 'Workspace';
}
