import { useMemo } from 'react';
import { getDiasOrdenados, lancaNoDia, isLancamentoIndeterminado } from '../utils/releaseCalculations';
import { useConfig } from '../../../context/ConfigContext';

export const useReleasesData = (obras, filterStatusLeitura) => {
  const config = useConfig();
  const labelCompleto = config?.statusObra?.find(s => s.id === 'completo')?.label ?? 'Completo';
  const labelCancelado = config?.statusObra?.find(s => s.id === 'cancelado')?.label ?? 'Cancelado';

  const diasOrdenados = useMemo(() => getDiasOrdenados(), []);

  const obrasAtivas = useMemo(() =>
    obras.filter(m =>
      m.statusUsuario === filterStatusLeitura &&
      m.status !== labelCompleto &&
      m.status !== labelCancelado
    ),
    [obras, filterStatusLeitura, labelCompleto, labelCancelado]
  );

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
