export type PasswordStrengthLevel = 0 | 1 | 2 | 3 | 4;

export function getPasswordStrength(password: string): {
  score: PasswordStrengthLevel;
  checks: {
    length: boolean;
    lower: boolean;
    upper: boolean;
    number: boolean;
    symbol: boolean;
  };
} {
  const checks = {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  const score = (Object.values(checks).filter(Boolean).length as PasswordStrengthLevel);
  return { score, checks };
}
