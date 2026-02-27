export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeString = (str: string): string => {
  if (!str) return '';
  return str.replace(/<[^>]*>?/gm, '');
};

export const isValidPassword = (pass: string): boolean => {
  return pass.length >= 6;
};
