/**
 * Shared password validation utilities
 */

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
}

export function getPasswordRequirements(): string[] {
  return [
    'At least 8 characters long',
    'At least one lowercase letter (a-z)',
    'At least one uppercase letter (A-Z)',
    'At least one number (0-9)'
  ];
}

export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
  isValid: boolean;
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 25;
  } else {
    feedback.push('Add more characters (minimum 8)');
  }

  if (/(?=.*[a-z])/.test(password)) {
    score += 25;
  } else {
    feedback.push('Add a lowercase letter');
  }

  if (/(?=.*[A-Z])/.test(password)) {
    score += 25;
  } else {
    feedback.push('Add an uppercase letter');
  }

  if (/(?=.*\d)/.test(password)) {
    score += 25;
  } else {
    feedback.push('Add a number');
  }

  // Bonus points for special characters
  if (/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
    score += 10;
  }

  return {
    score: Math.min(score, 110), // Allow bonus points to exceed 100
    feedback,
    isValid: score >= 100
  };
}