import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

/**
 * Verifica se há uma nova versão disponível no GitHub Releases.
 *
 * @returns {Promise<import('@tauri-apps/plugin-updater').Update|null>}
 *   Objeto Update (com `.version`, `.body`, `.downloadAndInstall()`) ou null
 *   se já estiver na versão mais recente.
 */
export const checkForUpdate = async () => {
  try {
    return await check();
  } catch (error) {
    console.error('Erro ao verificar atualizações:', error);
    return null;
  }
};

/**
 * Baixa e instala uma atualização, reportando progresso via callback.
 *
 * @param {import('@tauri-apps/plugin-updater').Update} update
 * @param {(info: { status: 'started'|'progress'|'finished', contentLength?: number, downloaded?: number }) => void} onProgress
 */
export const downloadAndInstall = async (update, onProgress) => {
  let downloaded = 0;
  let contentLength = 0;

  await update.downloadAndInstall((event) => {
    switch (event.event) {
      case 'Started':
        contentLength = event.data.contentLength;
        onProgress?.({ status: 'started', contentLength, downloaded: 0 });
        break;
      case 'Progress':
        downloaded += event.data.chunkLength;
        onProgress?.({ status: 'progress', contentLength, downloaded });
        break;
      case 'Finished':
        onProgress?.({ status: 'finished', contentLength, downloaded: contentLength });
        break;
    }
  });
};

/**
 * Reinicia o app para aplicar a atualização instalada.
 */
export const restartApp = async () => {
  await relaunch();
};
