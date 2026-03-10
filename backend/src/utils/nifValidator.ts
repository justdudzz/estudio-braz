/**
 * Valida um NIF (Número de Identificação Fiscal) de Portugal usando o algoritmo de Módulo 11.
 */
export const isValidNIF = (nif: string | number): boolean => {
  const nifStr = String(nif).replace(/\s/g, '');
  
  if (!/^[0-9]{9}$/.test(nifStr)) return false;

  const firstDigit = nifStr[0];
  const validFirstDigits = ['1', '2', '3', '5', '6', '8', '9'];
  if (!validFirstDigits.includes(firstDigit)) return false;

  let checkDigit = 0;
  for (let i = 0; i < 8; i++) {
    checkDigit += Number(nifStr[i]) * (9 - i);
  }

  const remainder = checkDigit % 11;
  const expectedDigit = remainder < 2 ? 0 : 11 - remainder;

  return Number(nifStr[8]) === expectedDigit;
};
