/**
 * strings.js — Adaptador de i18n para o onboarding
 *
 * As strings ficam em src/i18n/strings.json (sistema unificado).
 * Este arquivo só mantém a lista de idiomas do onboarding e o helper getT().
 */

import stringsJson from '../../i18n/strings.json';

export const LANGUAGES = [
  { code: 'pt-BR', flag: '🇧🇷', native: 'Português' },
  { code: 'en',    flag: '🇺🇸', native: 'English'   },
  { code: 'es',    flag: '🇪🇸', native: 'Español'   },
  { code: 'jp',    flag: '🇯🇵', native: '日本語'     },
  { code: 'kr',    flag: '🇰🇷', native: '한국어'     },
  { code: 'ch',    flag: '🇨🇳', native: '中文'       },
];

export function getT(language) {
  const lang = stringsJson[language] ?? stringsJson['pt-BR'];
  return (key) => lang[key] ?? stringsJson['pt-BR'][key] ?? key;
}
