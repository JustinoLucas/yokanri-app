import stringsData from './strings.json';
import languagesData from './languages.json';

export const LANGUAGES = languagesData;

/**
 * Retorna a função de tradução `t(key)` para o idioma informado.
 * Faz fallback para pt-BR se a chave não existir no idioma selecionado.
 *
 * stringsData é lido dentro da função retornada (não na closure externa)
 * para garantir que HMR do Vite atualize corretamente o módulo.
 */
export function getT(language) {
  return (key) => {
    const lang     = stringsData[language] || stringsData['pt-BR'];
    const fallback = stringsData['pt-BR'];
    return lang[key] ?? fallback[key] ?? key;
  };
}

export default stringsData;
