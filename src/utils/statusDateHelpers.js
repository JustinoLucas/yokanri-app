/**
 * Helper functions for managing status-related date fields
 * Handles automatic updates of dataInicioLeitura and dataFimLeitura
 */

/**
 * Calculates which date fields should be updated based on status change.
 *
 * novoStatus / statusAntigo são IDs estáveis ('lendo', 'completo', 'pausado', …).
 * O parâmetro `config` foi mantido por compatibilidade mas não é mais usado.
 *
 * @param {Object} obra - Current obra data
 * @param {string} novoStatus - New status ID
 * @param {string} statusAntigo - Previous status ID (optional)
 * @param {Object} [config] - (ignorado — mantido para compatibilidade)
 * @returns {Object} - Object with date field updates
 */
export function calculateStatusDateUpdates(obra, novoStatus, statusAntigo = null, config = null) {
  const updates = {};

  if (novoStatus === 'lendo' && !obra.dataInicioLeitura) {
    if (statusAntigo !== 'pausado') {
      updates.dataInicioLeitura = new Date().toISOString();
    }
  }

  if (novoStatus === 'completo' && !obra.dataFimLeitura) {
    updates.dataFimLeitura = new Date().toISOString();
  }

  if (statusAntigo === 'completo' && novoStatus === 'lendo') {
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
