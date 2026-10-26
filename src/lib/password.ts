export interface PasswordStrength {
  score: number; // 0 to 4
  label: 'Too weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  feedback: string[];
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  if (!password) {
    return { score: 0, label: 'Too weak', color: 'bg-border', feedback: ['Enter a password'] };
  }

  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('At least 8 characters required');
  }

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include both uppercase and lowercase letters');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include at least one number');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include a special symbol (@, #, $, etc.)');
  }

  const levels: Record<number, { label: PasswordStrength['label']; color: string }> = {
    0: { label: 'Too weak', color: 'bg-danger' },
    1: { label: 'Weak', color: 'bg-danger' },
    2: { label: 'Fair', color: 'bg-warning' },
    3: { label: 'Good', color: 'bg-status-inprogress' },
    4: { label: 'Strong', color: 'bg-success' },
  };

  const current = levels[score] || levels[0];

  return {
    score,
    label: current.label,
    color: current.color,
    feedback,
  };
}
