export function isStrongPassword(password: string): boolean {
  if (password.length < 12) {
    return false;
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  return hasUppercase && hasLowercase && hasNumber && hasSpecial;
}
