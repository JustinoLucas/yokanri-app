/**
 * Helper functions for managing status-related date fields
 * Handles automatic updates of dataInicioLeitura and dataFimLeitura
 */

/**
 * Calculates which date fields should be updated based on status change
 * @param {Object} obra - Current obra data
 * @param {string} novoStatus - New status value
 * @param {string} statusAntigo - Previous status value (optional)
 * @returns {Object} - Object with date field updates
 */
export function calculateStatusDateUpdates(obra, novoStatus, statusAntigo = null, config = null) {
  const find = (id) => config?.statusLeitura?.find(s => s.id === id)?.label;
  const labelLendo = find('lendo') ?? 'Lendo';
  const labelCompleto = find('completo') ?? 'Completo';
  const labelPausado = find('pausado') ?? 'Pausado';

  const updates = {};

  if (novoStatus === labelLendo && !obra.dataInicioLeitura) {
    if (statusAntigo !== labelPausado) {
      updates.dataInicioLeitura = new Date().toISOString();
    }
  }

  if (novoStatus === labelCompleto && !obra.dataFimLeitura) {
    updates.dataFimLeitura = new Date().toISOString();
  }

  if (statusAntigo === labelCompleto && novoStatus === labelLendo) {
    updates.dataFimLeitura = null;
  }

  return updates;
}

/**
 * Calculates reading time in days
 * @param {Object} obra - Obra with date fields
 * @returns {number|null} - Days spent reading, or null if incomplete data
 */
export function calculateReadingTime(obra) {
  if (!obra.dataInicioLeitura || !obra.dataFimLeitura) {
    return null;
  }

  const inicio = new Date(obra.dataInicioLeitura);
  const fim = new Date(obra.dataFimLeitura);
  const dias = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24));

  return dias > 0 ? dias : 0;
}
