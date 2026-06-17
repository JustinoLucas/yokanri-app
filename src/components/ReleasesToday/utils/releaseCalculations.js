import { TIPO_LANCAMENTO } from '../../../types/obra';

// Usado internamente pelo lancaNoDia() para comparar com obra.diasLancamento (PT sempre)
const DIAS_SEMANA_COMPLETOS = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado'
];

/**
 * Retorna array de 7 objetos representando uma semana de dias.
 * weekOffset desloca a janela em semanas inteiras (0 = semana atual, começando hoje).
 * locale é usado apenas para exibição dos nomes — o matching interno usa PT.
 */
export const getDiasOrdenados = (weekOffset = 0, locale = 'pt-BR') => {
  const hoje = new Date().getDay();
  const baseOffset = weekOffset * 7;
  return Array.from({ length: 7 }, (_, i) => {
    const offset = baseOffset + i;
    const data = new Date();
    data.setDate(data.getDate() + offset);
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    return {
      offset,
      nomeCompleto: cap(data.toLocaleDateString(locale, { weekday: 'long' })),
      nomeAbrev:    cap(data.toLocaleDateString(locale, { weekday: 'short' })),
      diaDoMes:     data.getDate(),
      mes:          data.toLocaleDateString(locale, { month: 'long' }),
      date:         data,
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

/**
 * Converte um nome de dia em PT (ex: 'Segunda-feira') para o locale informado.
 * Retorna o nome original se não encontrado.
 */
export const formatDiaParaLocale = (diaPT, locale = 'pt-BR') => {
  const idx = DIAS_SEMANA_COMPLETOS.indexOf(diaPT);
  if (idx === -1) return diaPT;
  const date = new Date();
  const diff = (idx - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + diff);
  const name = date.toLocaleDateString(locale, { weekday: 'long' });
  return name.charAt(0).toUpperCase() + name.slice(1);
};
