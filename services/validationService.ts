/**
 * validationService.ts
 * Utilitários para sanitização e validação defensiva de dados cadastrais (CPF, e-mails, telefones, strings).
 */

/**
 * Validação rigorosa de algoritmo de CPF brasileiro (Dígitos verificadores via módulo 11).
 */
export const validateCPF = (cpfInput: string): boolean => {
  if (!cpfInput) return false;

  // Extrai apenas os números
  const cleanCPF = cpfInput.replace(/\D/g, '');

  if (cleanCPF.length !== 11) return false;

  // Rejeita sequências conhecidas de dígitos iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Cálculo do 1º dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  const digit1 = rev === 10 || rev === 11 ? 0 : rev;
  if (digit1 !== parseInt(cleanCPF.charAt(9), 10)) return false;

  // Cálculo do 2º dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  const digit2 = rev === 10 || rev === 11 ? 0 : rev;
  if (digit2 !== parseInt(cleanCPF.charAt(10), 10)) return false;

  return true;
};

/**
 * Formata CPF para o padrão 000.000.000-00
 */
export const formatCPF = (cpfInput: string): string => {
  const cleanCPF = (cpfInput || '').replace(/\D/g, '').slice(0, 11);
  if (cleanCPF.length <= 3) return cleanCPF;
  if (cleanCPF.length <= 6) return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3)}`;
  if (cleanCPF.length <= 9) return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3, 6)}.${cleanCPF.slice(6)}`;
  return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3, 6)}.${cleanCPF.slice(6, 9)}-${cleanCPF.slice(9, 11)}`;
};

/**
 * Validação de e-mail seguindo RFC 5322 simplificada
 */
export const validateEmail = (emailInput: string): boolean => {
  if (!emailInput) return false;
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return re.test(emailInput.trim());
};

/**
 * Formata número de telefone brasileiro (DDD + 8 ou 9 dígitos)
 */
export const formatPhone = (phoneInput: string): string => {
  const digits = (phoneInput || '').replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

/**
 * Sanitização básica de strings para prevenção de injeção de tags e caracteres de controle
 */
export const sanitizeString = (input: string | undefined | null, maxLength = 255): string => {
  if (!input) return '';
  return input
    .replace(/[<>\0]/g, '') // Remove caracteres perigosos
    .trim()
    .slice(0, maxLength);
};

