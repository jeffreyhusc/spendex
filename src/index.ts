import express from "express";
import cors from "cors";
import { env } from "./env";
import { PrismaClient } from "@prisma/client";
import { authRouter } from "./routes/auth";
import { requireAuth, requireAdmin } from "./middleware/auth";

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/", authRouter);

app.get("/users/count", requireAuth, requireAdmin, async (_req, res) => {
  const count = await prisma.user.count();
  res.json({ count });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(env.port, () => {
  console.log(`Spendex API listening on http://localhost:${env.port}`);
});
