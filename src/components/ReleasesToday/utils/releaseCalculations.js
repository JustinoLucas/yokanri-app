import { TIPO_LANCAMENTO } from '../../../types/obra';

const DIAS_SEMANA_COMPLETOS = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado'
];

const DIAS_SEMANA_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Retorna array de 7 objetos representando hoje + próximos 6 dias
 */
export const getDiasOrdenados = () => {
  const hoje = new Date().getDay();
  return Array.from({ length: 7 }, (_, offset) => {
    const idx = (hoje + offset) % 7;
    return {
      offset,
      nomeCompleto: DIAS_SEMANA_COMPLETOS[idx],
      nomeAbrev: DIAS_SEMANA_ABREV[idx],
    };
  });
};

/**
 * Verifica se uma obra lança no dia com o offset dado (0 = hoje, 1 = amanhã, etc.)
 */
export const lancaNoDia = (obra, dayOffset) => {
  if (!obra.tipoLancamento) return false;

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + dayOffset);

  const diaSemana = DIAS_SEMANA_COMPLETOS[targetDate.getDay()];
  const diaDoMes = targetDate.getDate();

  switch (obra.tipoLancamento) {
    case TIPO_LANCAMENTO.SEMANAL:
      return obra.diasLancamento?.includes(diaSemana) || false;

    case TIPO_LANCAMENTO.QUINZENAL:
      if (!obra.diasLancamento?.includes(diaSemana)) return false;
      if (!obra.dataReferenciaQuinzenal) return false;
      return verificaCicloQuinzenal(obra, targetDate);

    case TIPO_LANCAMENTO.MENSAL:
      return diaDoMes === obra.diaDoMes;

    default:
      return false;
  }
};

const verificaCicloQuinzenal = (obra, targetDate) => {
  const referencia = new Date(obra.dataReferenciaQuinzenal);
  const refNorm = new Date(referencia.getFullYear(), referencia.getMonth(), referencia.getDate());
  const targetNorm = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

  const diffDays = Math.round((targetNorm - refNorm) / (1000 * 60 * 60 * 24));
  const diasPorCiclo = 7 * (obra.intervaloSemanas || 2);

  return diffDays >= 0 && diffDays % diasPorCiclo === 0;
};

/**
 * Verifica se uma obra tem lançamento indeterminado (irregular)
 */
export const isLancamentoIndeterminado = (obra) =>
  obra.tipoLancamento === TIPO_LANCAMENTO.IRREGULAR;
