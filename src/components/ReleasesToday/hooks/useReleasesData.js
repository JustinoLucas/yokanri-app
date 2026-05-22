import { useMemo } from 'react';
import { getDiasOrdenados, lancaNoDia, isLancamentoIndeterminado } from '../utils/releaseCalculations';
import { useConfig } from '../../../context/ConfigContext';
import { filterNsfwObras } from '../../../utils/nsfwUtils';

export const useReleasesData = (obras, filterStatusLeitura) => {
  const config = useConfig();

  const diasOrdenados = useMemo(() => getDiasOrdenados(), []);

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
