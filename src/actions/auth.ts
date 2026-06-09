"use server";

import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import { PLAYER_IDENTITIES } from '../lib/player_identities';

export async function getAvailableAvatars() {
  const users = await prisma.user.findMany({ select: { avatarSeed: true } });
  const usedAvatars = new Set(users.map(u => u.avatarSeed));
  return PLAYER_IDENTITIES.filter(p => !usedAvatars.has(p.avatarUrl));
}

export async function registerUser(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const inviteCode = formData.get("inviteCode") as string;
  const fullName = formData.get("name") as string;
  const avatarSeed = formData.get("avatarSeed") as string;

  if (!username || !password || !inviteCode) {
    return { error: "All fields are required" };
  }

  // 1. Validate Invite Code
  const codeRecord = await prisma.inviteCode.findUnique({
    where: { code: inviteCode }
  });

  if (!codeRecord) {
    return { error: "Invalid invite code" };
  }

  if (codeRecord.isUsed) {
    return { error: "Invite code has already been used" };
  }

  // 2. Validate Username
  const existingUser = await prisma.user.findUnique({
    where: { username }
  });

  if (existingUser) {
    return { error: "Username already taken" };
  }

  // 3. Create User
  const passwordHash = await bcrypt.hash(password, 10);
  
  try {
    // Transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          username,
          fullName,
          avatarSeed,
          passwordHash,
          role: "USER",
          cashBalance: 10000,
        }
      });

      await tx.inviteCode.update({
        where: { code: inviteCode },
        data: { isUsed: true, usedBy: username }
      });
    });

    return { success: true };
  } catch (err: any) {
    return { error: "Failed to register user. Please try again." };
  }
}

export async function validateInviteCode(inviteCode: string) {
  if (!inviteCode) {
    return { error: "Invite code is required" };
  }

  const codeRecord = await prisma.inviteCode.findUnique({
    where: { code: inviteCode }
  });

  if (!codeRecord) {
    return { error: "Invalid invite code" };
  }

  if (codeRecord.isUsed) {
    return { error: "Invite code has already been used" };
  }

  return { success: true };
}
