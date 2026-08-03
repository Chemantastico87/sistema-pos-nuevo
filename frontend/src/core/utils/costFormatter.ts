/**
 * Formateador de precio de compra con soporte para "Sin coste registrado".
 * Evita asumir coste de 0 € para no corromper estadísticas de beneficio o margen.
 */
export const formatCostPrice = (
  costPrice: number | null | undefined,
  formatMoneyFn: (val: number) => string
): { isRegistered: boolean; formatted: string } => {
  if (costPrice === null || costPrice === undefined || isNaN(costPrice)) {
    return {
      isRegistered: false,
      formatted: 'Sin coste registrado',
    };
  }
  return {
    isRegistered: true,
    formatted: formatMoneyFn(costPrice),
  };
};

/**
 * Calcula margen (%) y beneficio por unidad solo si existe costo registrado.
 */
export const calculateProductProfitability = (
  salePrice: number,
  costPrice: number | null | undefined
) => {
  if (costPrice === null || costPrice === undefined || isNaN(costPrice)) {
    return {
      hasCost: false,
      profitPerUnit: null,
      marginPercent: null,
    };
  }

  const profitPerUnit = salePrice - costPrice;
  const marginPercent = salePrice > 0 ? (profitPerUnit / salePrice) * 100 : 0;

  return {
    hasCost: true,
    profitPerUnit,
    marginPercent: Math.round(marginPercent * 100) / 100,
  };
};
