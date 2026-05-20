// Tipos e constantes para o sistema de Obras

export const TIPO_OBRA = {
  COREANO: 'Coreano',
  CHINES: 'Chinês',
  JAPONES: 'Japonês'
};

export const STATUS_OBRA = {
  EM_ANDAMENTO: 'Em andamento',
  COMPLETO: 'Completo',
  HIATO: 'Hiato',
  CANCELADO: 'Cancelado'
};

export const STATUS_LEITURA = {
  LENDO: 'Lendo',
  COMPLETO: 'Completo',
  DROPADO: 'Dropado',
  PLANEJA_LER: 'Planeja ler',
  PAUSADO: 'Pausado'
};

export const DIAS_SEMANA = {
  DOMINGO: 'Domingo',
  SEGUNDA: 'Segunda-feira',
  TERCA: 'Terça-feira',
  QUARTA: 'Quarta-feira',
  QUINTA: 'Quinta-feira',
  SEXTA: 'Sexta-feira',
  SABADO: 'Sábado',
  VARIAVEL: 'Variável',
  NAO_DEFINIDO: 'Não definido'
};

export const TIPO_LANCAMENTO = {
  SEMANAL: 'Semanal',
  QUINZENAL: 'Quinzenal',
  MENSAL: 'Mensal',
  IRREGULAR: 'Irregular'
};

export const GENEROS = [
  'Ação',
  'Adulto',
  'Apocalíptico',
  'Artes Marciais',
  'Aventura',
  'Comédia',
  'Crime',
  'Cultivo',
  'Drama',
  'Dungeon',
  'Escolar',
  'Esportes',
  'Fantasia',
  'Ficção Científica',
  'Game',
  'Harém',
  'Histórico',
  'Horror',
  'Isekai',
  'Magia',
  'Mecha',
  'Militar',
  'Mistério',
  'Mitologia',
  'Murim',
  'Música',
  'Psicológico',
  'Realidade Virtual',
  'Reencarnação',
  'Regressão',
  'Romance',
  'Shoujo',
  'Shounen',
  'Sistema',
  'Slice of Life',
  'Sobrenatural',
  'Super Poderes',
  'Suspense',
  'Thriller',
  'Viagem no Tempo',
  'Zumbi'
];

/**
 * Cria um objeto Obra vazio com valores padrão
 */
export function createEmptyObra() {
  return {
    id: generateUUID(),
    nome: '',
    nomeAlternativo: '',
    autor: '',
    studio: '',
    tipo: TIPO_OBRA.COREANO,
    generos: [],

    status: STATUS_OBRA.EM_ANDAMENTO,
    statusUsuario: STATUS_LEITURA.PLANEJA_LER,
    capituloAtual: 0,
    capituloAtualUsuario: 0,

    nota: 0,
    notaUsuario: 0,
    favorito: false,

    // Ano de lançamento do primeiro capítulo
    anoLancamento: null,

    // Campos de lançamento
    tipoLancamento: TIPO_LANCAMENTO.IRREGULAR,
    diasLancamento: [], // Usado para Semanal e Quinzenal
    intervaloSemanas: 2, // Para Quinzenal (padrão: a cada 2 semanas)
    dataReferenciaQuinzenal: null, // Data de referência para calcular ciclo quinzenal
    diaDoMes: 1, // Para Mensal (dia fixo do mês)
    detalhesLancamento: '', // Descrição livre para casos irregulares

    dataAdicionado: new Date().toISOString(),
    dataAtualizado: new Date().toISOString(),

    // ==================== STATISTICS (v3.0) ====================
    // Campos para estatísticas e dashboard
    dataInicioLeitura: null, // ISO date string - quando começou a ler
    dataFimLeitura: null, // ISO date string - quando terminou de ler

    // ==================== LINKS ====================
    // Sistema de múltiplos links
    // Estrutura: [{ nome: 'Site Brasil', url: 'https://...', principal: true }]
    // - nome: Nome do site (ex: "Se Liga Nerd", "Site Original")
    // - url: URL completa do link
    // - principal: boolean - Apenas um link pode ser principal (usado nos cards)
    links: [],
    autoIncrementOnLink: false,

    // ==================== CAPAS ====================
    // Sistema de múltiplas capas
    capas: [],

    notas: ''
  };
}

/**
 * Gera um UUID simples
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Valida os dados de uma obra
 */
export function validateObra(obra) {
  const errors = [];

  if (!obra.nome || obra.nome.trim() === '') {
    errors.push('Nome é obrigatório');
  }


  if (obra.nota < 0 || obra.nota > 10) {
    errors.push('Nota deve estar entre 0 e 10');
  }

  if (obra.notaUsuario < 0 || obra.notaUsuario > 10) {
    errors.push('Sua nota deve estar entre 0 e 10');
  }

  return errors;
}

/**
 * Retorna o dia da semana atual
 */
export function getDiaSemanAtual() {
  const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return dias[new Date().getDay()];
}

/**
 * Filtra obras que lançam no dia especificado
 */
export function getObrasPorDia(obras, dia) {
  return obras.filter(m => {
    if (Array.isArray(m.diasLancamento)) {
      return m.diasLancamento.includes(dia);
    }
    return false;
  });
}

/**
 * Verifica se uma obra lança hoje
 */
export function lancaHoje(obra) {
  const hoje = new Date();
  const diaSemana = getDiaSemanAtual();
  const diaDoMes = hoje.getDate();

  if (!obra.tipoLancamento) {
    return false;
  }

  switch (obra.tipoLancamento) {
    case TIPO_LANCAMENTO.SEMANAL:
      return obra.diasLancamento?.includes(diaSemana) || false;

    case TIPO_LANCAMENTO.QUINZENAL:
      return verificaCicloQuinzenal(
        hoje,
        obra.dataReferenciaQuinzenal,
        obra.intervaloSemanas || 2,
        obra.diasLancamento || []
      );

    case TIPO_LANCAMENTO.MENSAL:
      return diaDoMes === obra.diaDoMes;

    case TIPO_LANCAMENTO.IRREGULAR:
      return false; // Nunca marca como "lança hoje"

    default:
      return false;
  }
}

/**
 * Verifica se hoje está no ciclo quinzenal correto
 */
function verificaCicloQuinzenal(hoje, dataReferencia, intervaloSemanas, diasSemana) {
  if (!dataReferencia || !diasSemana || diasSemana.length === 0) {
    return false;
  }

  // Verifica se hoje é um dos dias da semana configurados
  const diaSemanaHoje = getDiaSemanAtual();
  if (!diasSemana.includes(diaSemanaHoje)) {
    return false;
  }

  const referencia = new Date(dataReferencia);

  // Normaliza as datas para meia-noite
  const refNorm = new Date(referencia.getFullYear(), referencia.getMonth(), referencia.getDate());
  const hojeNorm = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  // Calcula a diferença em dias
  const diffTime = hojeNorm.getTime() - refNorm.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // Verifica se a diferença em dias é múltiplo exato do ciclo (intervalo * 7 dias)
  const diasPorCiclo = 7 * intervaloSemanas;

  return diffDays >= 0 && diffDays % diasPorCiclo === 0;
}


/**
 * Retorna uma string descritiva do padrão de lançamento
 */
export function getDescricaoLancamento(obra) {
  if (!obra.tipoLancamento) {
    return 'Não definido';
  }

  switch (obra.tipoLancamento) {
    case TIPO_LANCAMENTO.SEMANAL:
      if (!obra.diasLancamento || obra.diasLancamento.length === 0) {
        return 'Semanal (dias não definidos)';
      }
      return `Toda ${obra.diasLancamento.join(', ')}`;

    case TIPO_LANCAMENTO.QUINZENAL:
      if (!obra.diasLancamento || obra.diasLancamento.length === 0) {
        return `A cada ${obra.intervaloSemanas || 2} semanas`;
      }
      return `A cada ${obra.intervaloSemanas || 2} semanas (${obra.diasLancamento.join(', ')})`;

    case TIPO_LANCAMENTO.MENSAL:
      return `Todo dia ${obra.diaDoMes}`;

    case TIPO_LANCAMENTO.IRREGULAR:
      return obra.detalhesLancamento || 'Lançamento irregular';

    default:
      return 'Não definido';
  }
}
