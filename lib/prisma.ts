import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL no está definida");
}

const adapter = new PrismaPg({
  connectionString,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const clienteExistente = globalForPrisma.prisma as
  | (PrismaClient & {
      notificacion?: unknown;
      plan?: unknown;
      suscripcion?: unknown;
      pago?: unknown;
    })
  | undefined;

export const prisma =
  clienteExistente &&
  clienteExistente.notificacion &&
  clienteExistente.plan &&
  clienteExistente.suscripcion &&
  clienteExistente.pago
    ? clienteExistente
    : new PrismaClient({
        adapter,
      });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}