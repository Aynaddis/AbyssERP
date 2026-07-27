/**
 * Creates (or promotes) an ADMIN account, run directly against the database.
 *
 * This is intentionally NOT an HTTP endpoint — it's a one-time setup script
 * you run yourself from the server/your machine, the same way Django's
 * `createsuperuser` or Strapi's admin bootstrap works. No public attack
 * surface, no hardcoded credentials sitting in the repo.
 *
 * Interactive:
 *   npm run create-admin
 *
 * Non-interactive (e.g. scripted deployment):
 *   ADMIN_NAME="Jane Doe" ADMIN_EMAIL="jane@example.com" ADMIN_PASSWORD="something-long" npm run create-admin
 */
import 'dotenv/config';
import readline from 'readline/promises';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function prompt(rl: readline.Interface, question: string): Promise<string> {
  const answer = await rl.question(question);
  return answer.trim();
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    let name = process.env.ADMIN_NAME?.trim() ?? '';
    let email = process.env.ADMIN_EMAIL?.trim() ?? '';
    let password = process.env.ADMIN_PASSWORD ?? '';

    if (!name) name = await prompt(rl, 'Admin name: ');
    if (!email) email = await prompt(rl, 'Admin email: ');
    if (!password) password = await prompt(rl, 'Admin password (min 6 characters): ');

    if (name.length < 2) throw new Error('Name must be at least 2 characters.');
    if (!isValidEmail(email)) throw new Error('That email address doesn\'t look valid.');
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      if (existing.role === 'ADMIN') {
        console.log(`\n"${email}" is already an ADMIN. Nothing to do.`);
        return;
      }
      await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN', password: hashedPassword, isActive: true },
      });
      console.log(`\nPromoted existing account "${email}" to ADMIN and updated its password.`);
      return;
    }

    await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'ADMIN' },
    });
    console.log(`\nCreated ADMIN account for "${email}". You can log in with it now.`);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(`\nFailed to create admin: ${err instanceof Error ? err.message : err}`);
  process.exitCode = 1;
});