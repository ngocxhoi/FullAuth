import { PrismaClient } from "@prisma/client";
import { config } from "../config/app.config";

declare global {
  var prisma: PrismaClient | undefined;
}

const db = globalThis.prisma || new PrismaClient();

if (config.NODE_ENV !== "production") globalThis.prisma = db;

export default db;
