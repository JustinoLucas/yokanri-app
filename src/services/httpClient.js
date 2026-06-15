/**
 * Cliente HTTP unificado para chamadas a APIs externas (AniList, MangaDex,
 * MangaUpdates, etc).
 *
 * Usa o fetch do plugin tauri-plugin-http, que executa a requisição pelo
 * lado nativo (Rust) e evita as restrições de CORS do webview. Fora do
 * runtime Tauri (ex.: preview no navegador), cai para o fetch global.
 */
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export const apiFetch = isTauri ? tauriFetch : window.fetch.bind(window);
