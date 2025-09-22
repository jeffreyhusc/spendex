import { Router } from "express";
import { z } from "zod";
import { PrismaClient, Role } from "@prisma/client";
import { hashPassword, verifyPassword, signJwt } from "../auth";

const prisma = new PrismaClient();
export const authRouter = Router();

const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

authRouter.post("/signup", async (req, res) => {
  const parsed = credsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already in use" });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, role: Role.USER },
  });

  const token = signJwt({ userId: user.id, role: user.role });
  return res.status(201).json({ token });
});

authRouter.post("/login", async (req, res) => {
  const parsed = credsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const ok = await verifyPassword(user.passwordHash, password);
  if (!ok) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signJwt({ userId: user.id, role: user.role });
  return res.status(200).json({ token });
});
