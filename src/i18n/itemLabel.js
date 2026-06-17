/**
 * Retorna o label de exibição de um item de config (status/gênero).
 * - Item com translationKey (padrão, não customizado) → usa a tradução do idioma ativo
 * - Item sem translationKey (customizado pelo usuário) → usa o label salvo como está
 */
export function getItemLabel(item, t) {
  if (item?.translationKey) return t(item.translationKey) || item.label;
  return item?.label ?? '';
}
