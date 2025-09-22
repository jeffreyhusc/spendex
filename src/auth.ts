import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { env } from "./env";

export type UserTokenPayload = {
  userId: string;
  role: "USER" | "ADMIN";
};

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain);
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

export function signJwt(payload: UserTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { algorithm: "HS256", expiresIn: "7d" });
}

export function verifyJwt(token: string): UserTokenPayload | null {
  try {
    return jwt.verify(token, env.jwtSecret) as UserTokenPayload;
  } catch {
    return null;
  }
}
