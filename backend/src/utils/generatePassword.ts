import crypto from 'crypto';

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';

/**
 * Generates a random temporary password for accounts created by an admin.
 * Excludes visually ambiguous characters (0/O, 1/l/I) to keep it easy to
 * read/type if it ever needs to be relayed manually.
 */
export function generateTempPassword(length = 12): string {
  const bytes = crypto.randomBytes(length);
  let password = '';
  for (let i = 0; i < length; i++) {
    password += CHARSET[bytes[i] % CHARSET.length];
  }
  return password;
}