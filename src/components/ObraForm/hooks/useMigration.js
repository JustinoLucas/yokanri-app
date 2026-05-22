import { createEmptyObra, TIPO_LANCAMENTO } from '../../../types/obra';

/**
 * Custom hook for data migration
 * Handles backward compatibility from legacy formats to v3.0
 *
 * ⚠️ REMOVER NA v4.0 ⚠️
 * Este código existe apenas para migrar dados antigos do Lucas.
 * Após todos os dados serem convertidos e salvos no formato v3.0,
 * este arquivo inteiro pode ser deletado.
 *
 * MIGRATION HISTORY:
 * - v1.0-v1.1: Single cover (capa, capaLocal) + single/multiple links (linkSiteBrasil, linkOriginal)
 * - v2.0: Multiple covers (capas[]) + multiple links (links[])
 * - v3.0: Added statistics tracking (dataInicioLeitura, dataFimLeitura)
 *
 * QUANDO REMOVER (v4.0):
 * 1. Deletar este arquivo: useMigration.js
 * 2. Remover import em App.jsx
 * 3. Remover chamada migrateObraData em App.jsx
 * 4. Remover import e uso em useObraForm.js
 */
export const useMigration = () => {
  /**
   * Migrates obra data from old format to new format (v3.0)
   * ⚠️ REMOVER NA v4.0 - Após dados do Lucas serem todos migrados
   * @param {Object} data - The obra data to migrate
   * @returns {Object} - Migrated obra data
   */
  const migrateObraData = (data) => {
    if (!data) return createEmptyObra();

    const migrated = { ...data };

    // ⚠️ REMOVER NA v4.0 - Início da migração de dados antigos
    // =================================================================

    // ==================== TIPO MIGRATION ====================
    // ⚠️ REMOVER NA v4.0
    // Old: COREANO, CHINES, JAPONES (uppercase)
    // New: Coreano, Chinês, Japonês (proper case)
    if (migrated.tipo === 'COREANO') migrated.tipo = 'Coreano';
    if (migrated.tipo === 'CHINES') migrated.tipo = 'Chinês';
    if (migrated.tipo === 'JAPONES') migrated.tipo = 'Japonês';

    // ==================== STATUS OBRA MIGRATION ====================
    // ⚠️ REMOVER NA v4.0
    // Converte formatos antigos → ID estável (v2):
    //   UPPERCASE (v1 antigo) → ID
    //   Label string (v1 DB)  → ID
    if (migrated.status === 'EM_ANDAMENTO' || migrated.status === 'Em andamento') migrated.status = 'em-andamento';
    if (migrated.status === 'COMPLETO'     || migrated.status === 'Completo')     migrated.status = 'completo';
    if (migrated.status === 'HIATO'        || migrated.status === 'Hiato')        migrated.status = 'hiato';
    if (migrated.status === 'CANCELADO'    || migrated.status === 'Cancelado')    migrated.status = 'cancelado';
    if (migrated.status === 'Não definido')                                        migrated.status = 'nao-definido';

    // ==================== STATUS LEITURA MIGRATION ====================
    // ⚠️ REMOVER NA v4.0
    if (migrated.statusUsuario === 'LENDO'      || migrated.statusUsuario === 'Lendo')       migrated.statusUsuario = 'lendo';
    if (migrated.statusUsuario === 'COMPLETO'   || migrated.statusUsuario === 'Completo')    migrated.statusUsuario = 'completo';
    if (migrated.statusUsuario === 'DROPADO'    || migrated.statusUsuario === 'Dropado')     migrated.statusUsuario = 'dropado';
    if (migrated.statusUsuario === 'PLANEJA_LER'|| migrated.statusUsuario === 'Planeja ler') migrated.statusUsuario = 'planeja-ler';
    if (migrated.statusUsuario === 'PAUSADO'    || migrated.statusUsuario === 'Pausado')     migrated.statusUsuario = 'pausado';
    if (migrated.statusUsuario === 'Não definido')                                            migrated.statusUsuario = 'nao-definido';

    // ==================== GENEROS MIGRATION ====================
    // ⚠️ REMOVER NA v4.0
    // Old: Wuxia
    // New: Murim
    if (Array.isArray(migrated.generos)) {
      migrated.generos = migrated.generos.map(genero =>
        genero === 'Wuxia' ? 'Murim' : genero
      );
    }

    // ==================== RELEASE SCHEDULE MIGRATION ====================
    // ⚠️ REMOVER NA v4.0
    // Old: diaLancamento (single day string)
    // New: diasLancamento (array of days) + tipoLancamento
    if (!migrated.tipoLancamento) {
      if (migrated.diaLancamento && !migrated.diasLancamento) {
        if (migrated.diaLancamento !== 'Não definido') {
          migrated.diasLancamento = [migrated.diaLancamento];
          migrated.tipoLancamento = TIPO_LANCAMENTO.SEMANAL;
        } else {
          migrated.diasLancamento = [];
          migrated.tipoLancamento = TIPO_LANCAMENTO.IRREGULAR;
        }
      } else if (Array.isArray(migrated.diasLancamento) && migrated.diasLancamento.length > 0) {
        migrated.tipoLancamento = TIPO_LANCAMENTO.SEMANAL;
      } else {
        migrated.tipoLancamento = TIPO_LANCAMENTO.IRREGULAR;
      }
    }

    // ⚠️ REMOVER NA v4.0 - Initialize new release schedule fields if they don't exist
    if (!migrated.intervaloSemanas) migrated.intervaloSemanas = 2;
    if (migrated.dataReferenciaQuinzenal === undefined) migrated.dataReferenciaQuinzenal = null;
    if (!migrated.diaDoMes) migrated.diaDoMes = 1;
    if (!migrated.detalhesLancamento) migrated.detalhesLancamento = '';

    // ==================== CAPAS MIGRATION (v1.0 → v2.0) ====================
    // ⚠️ REMOVER NA v4.0
    // Old: capa (string), capaLocal (boolean)
    // New: capas (array of { nome, local, principal })
    if (!Array.isArray(migrated.capas) || migrated.capas.length === 0) {
      migrated.capas = [];

      // Migrate from old single cover format
      if (migrated.capa) {
        migrated.capas.push({
          nome: migrated.capa,
          local: migrated.capaLocal || false,
          principal: true
        });
      }
    }

    // ⚠️ REMOVER NA v4.0 - Remove old cover fields after migration
    delete migrated.capa;
    delete migrated.capaLocal;

    // ==================== LINKS MIGRATION (v1.0 → v2.0) ====================
    // ⚠️ REMOVER NA v4.0
    // Old: linkSiteBrasil, nomeLink, linkOriginal
    // New: links (array of { nome, url, principal })
    if (!Array.isArray(migrated.links) || migrated.links.length === 0) {
      migrated.links = [];

      // Migrate linkSiteBrasil (principal link)
      if (migrated.linkSiteBrasil) {
        migrated.links.push({
          nome: migrated.nomeLink || 'Site Brasil',
          url: migrated.linkSiteBrasil,
          principal: true
        });
      }

      // Migrate linkOriginal (secondary link)
      if (migrated.linkOriginal) {
        migrated.links.push({
          nome: 'Link Original',
          url: migrated.linkOriginal,
          principal: !migrated.linkSiteBrasil // Only principal if no linkSiteBrasil
        });
      }

      // If we added linkOriginal as principal, make sure linkSiteBrasil is not principal
      if (migrated.linkOriginal && migrated.linkSiteBrasil) {
        migrated.links[1].principal = false;
      }
    }

    // ⚠️ REMOVER NA v4.0 - Remove old link fields after migration
    delete migrated.linkSiteBrasil;
    delete migrated.nomeLink;
    delete migrated.linkOriginal;
    delete migrated.diaLancamento; // Also remove old release day field

    // ⚠️ REMOVER NA v4.0 - Initialize autoIncrementOnLink if not exists
    if (migrated.autoIncrementOnLink === undefined) {
      migrated.autoIncrementOnLink = false;
    }

    // ==================== STATISTICS FIELDS (v3.0) ====================
    // ⚠️ REMOVER NA v4.0
    // New fields for dashboard/statistics
    // dataInicioLeitura: ISO date string when user started reading
    // dataFimLeitura: ISO date string when user finished reading

    // ⚠️ REMOVER NA v4.0 - REGRA: Se está lendo/pausado/completo, DEVE ter dataInicioLeitura
    // Comparação por ID (após migração acima os campos já estão em formato ID)
    if (!migrated.dataInicioLeitura) {
      if (migrated.statusUsuario === 'lendo' ||
          migrated.statusUsuario === 'pausado' ||
          migrated.statusUsuario === 'completo') {
        // Usa dataAdicionado como proxy (melhor estimativa)
        migrated.dataInicioLeitura = migrated.dataAdicionado || new Date().toISOString();
      }
    }

    // ⚠️ REMOVER NA v4.0 - REGRA: Se está completo, DEVE ter dataFimLeitura
    if (!migrated.dataFimLeitura && migrated.statusUsuario === 'completo') {
      // Usa dataAtualizado como proxy (quando foi marcado como completo)
      migrated.dataFimLeitura = migrated.dataAtualizado || new Date().toISOString();
    }

    // ⚠️ REMOVER NA v4.0 - Initialize if undefined (para outros status como "Planeja ler" ou "Dropado")
    if (migrated.dataInicioLeitura === undefined) {
      migrated.dataInicioLeitura = null;
    }
    if (migrated.dataFimLeitura === undefined) {
      migrated.dataFimLeitura = null;
    }

    // ⚠️ REMOVER NA v4.0 - Fim da migração de dados antigos
    // =================================================================

    return migrated;
  };

  return { migrateObraData };
};

export default useMigration;
