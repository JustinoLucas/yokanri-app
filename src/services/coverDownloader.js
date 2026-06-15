/**
 * Helper para baixar a capa escolhida na busca de APIs externas e
 * convertê-la em um File, pronto para ser usado pelo useCapasManager
 * (mesmo fluxo de upload manual de imagem).
 */
import { apiFetch } from './httpClient';

const MIME_BY_EXT = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

/**
 * Baixa a imagem de uma URL e retorna como File
 * @param {string} url - URL da capa
 * @param {string} baseName - Nome base do arquivo (sem extensão)
 * @returns {Promise<File>}
 */
export async function downloadCoverAsFile(url, baseName = 'capa') {
  const response = await apiFetch(url);

  if (!response.ok) {
    throw new Error(`Erro ao baixar capa: ${response.status}`);
  }

  const blob = await response.blob();
  const extFromUrl = url.split('?')[0].split('.').pop().toLowerCase();
  const ext = MIME_BY_EXT[extFromUrl] ? extFromUrl : 'jpg';
  const type = blob.type || MIME_BY_EXT[ext];

  return new File([blob], `${baseName}.${ext}`, { type });
}

export default { downloadCoverAsFile };
