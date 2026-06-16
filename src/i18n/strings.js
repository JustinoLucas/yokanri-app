import stringsData from './strings.json';
import languagesData from './languages.json';

export const LANGUAGES = languagesData;

/**
 * Retorna a função de tradução `t(key)` para o idioma informado.
 * Faz fallback para pt-BR se a chave não existir no idioma selecionado.
 */
export function getT(language) {
  const lang = stringsData[language] || stringsData['pt-BR'];
  const fallback = stringsData['pt-BR'];
  return (key) => lang[key] ?? fallback[key] ?? key;
}

export default stringsData;
