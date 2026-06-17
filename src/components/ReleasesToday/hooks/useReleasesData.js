import { useMemo } from 'react';
import { getDiasOrdenados, lancaNoDia, isLancamentoIndeterminado } from '../utils/releaseCalculations';
import { useConfig } from '../../../context/ConfigContext';
import { useLanguage } from '../../../i18n/LanguageContext';
import { filterNsfwObras } from '../../../utils/nsfwUtils';

export const useReleasesData = (obras, filterStatusLeitura, weekOffset = 0) => {
  const config = useConfig();
  const { language } = useLanguage();

  const diasOrdenados = useMemo(() => getDiasOrdenados(weekOffset, language), [weekOffset, language]);

  const obrasAtivas = useMemo(() => {
    // Aplica filtro NSFW (modo 'hidden') antes de qualquer outro filtro
    const obrasFiltradas = filterNsfwObras(obras, config);
    // Compara por ID estável — obras armazenam IDs desde a v2
    return obrasFiltradas.filter(m =>
      m.statusUsuario === filterStatusLeitura &&
      m.status !== 'completo' &&
      m.status !== 'cancelado'
    );
  }, [obras, config, filterStatusLeitura]);

  const dias = useMemo(() =>
    diasOrdenados.map(dia => ({
      ...dia,
      lancamentos: obrasAtivas.filter(m => lancaNoDia(m, dia.offset)),
    })),
    [obrasAtivas, diasOrdenados]
  );

  const lancamentosIndeterminados = useMemo(() =>
    obrasAtivas.filter(isLancamentoIndeterminado),
    [obrasAtivas]
  );

  return { dias, lancamentosIndeterminados };
};
