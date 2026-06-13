import { TIPO_LANCAMENTO } from '../../../types/obra';

const DIAS_SEMANA_COMPLETOS = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado'
];

const DIAS_SEMANA_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

/**
 * Retorna array de 7 objetos representando uma semana de dias.
 * weekOffset desloca a janela em semanas inteiras (0 = semana atual, começando hoje).
 */
export const getDiasOrdenados = (weekOffset = 0) => {
  const hoje = new Date().getDay();
  const baseOffset = weekOffset * 7;
  return Array.from({ length: 7 }, (_, i) => {
    const offset = baseOffset + i;
    const idx = ((hoje + offset) % 7 + 7) % 7;
    const data = new Date();
    data.setDate(data.getDate() + offset);
    return {
      offset,
      nomeCompleto: DIAS_SEMANA_COMPLETOS[idx],
      nomeAbrev: DIAS_SEMANA_ABREV[idx],
      diaDoMes: data.getDate(),
      mes: MESES[data.getMonth()],
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
