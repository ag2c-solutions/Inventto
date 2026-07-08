/**
 * Converte e formata um valor inteiro para um número decimal (float) com base na quantidade de casas decimais informada.
 * Exemplo: formatToDecimal(1500, 2) => 15.00
 *
 * @param value O valor inteiro a ser convertido (ex: em centavos).
 * @param decimalPlaces O número de casas decimais desejadas (padrão é 2).
 * @returns O valor convertido para decimal.
 */
export const formatToDecimal = (
  value: number,
  decimalPlaces: number = 2
): number => {
  if (value === null || value === undefined || isNaN(value)) {
    return value;
  }

  return Number((value / Math.pow(10, decimalPlaces)).toFixed(decimalPlaces));
};

/**
 * Converte um valor decimal (float) para um inteiro com base na quantidade de casas decimais informada.
 * Inverso de formatToDecimal. Exemplo: formatToInteger(15.00, 2) => 1500 (centavos).
 *
 * @param value O valor decimal a ser convertido (ex: em reais).
 * @param decimalPlaces O número de casas decimais consideradas (padrão é 2).
 * @returns O valor convertido para inteiro.
 */
export const formatToInteger = (
  value: number,
  decimalPlaces: number = 2
): number => {
  if (value === null || value === undefined || isNaN(value)) {
    return value;
  }

  return Math.round(value * Math.pow(10, decimalPlaces));
};
