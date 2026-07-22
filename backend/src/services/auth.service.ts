import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { signToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import type { RegisterInput, LoginInput, UpdateProfileInput, ChangePasswordInput } from '../utils/validation/auth.schema';

const SALT_ROUNDS = 10;

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role ?? 'STAFF',
    },
  });

  const token = signToken({ userId: user.id, role: user.role });

  return { user: sanitizeUser(user), token };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.isActive) {
    throw new AppError('Invalid email or password', 401);
  }

  const isValidPassword = await bcrypt.compare(input.password, user.password);
  if (!isValidPassword) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken({ userId: user.id, role: user.role });

  return { user: sanitizeUser(user), token };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return sanitizeUser(user);
}

function sanitizeUser<T extends { password: string }>(user: T) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  if (input.email) {
    const existing = await prisma.user.findFirst({
      where: { email: input.email, NOT: { id: userId } },
    });
    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }
  }

  const data: { name?: string; email?: string; avatarUrl?: string | null } = { ...input };
  if (input.avatarUrl === '') data.avatarUrl = null;

  const user = await prisma.user.update({ where: { id: userId }, data });
  return sanitizeUser(user);
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isValid = await bcrypt.compare(input.currentPassword, user.password);
  if (!isValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  const hashedPassword = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
}
