import { prisma } from "@/lib/prisma";

function cache<T extends (...args: never[]) => unknown>(fn: T): T {
  let pending: Promise<unknown> | undefined;
  return ((...args: never[]) => {
    if (!pending) {
      pending = Promise.resolve(fn(...args)).finally(() => {
        pending = undefined;
      });
    }
    return pending;
  }) as T;
}

export const getSystemConfig = cache(async () => {
  const config = await prisma.systemConfig.findFirst();
  if (!config) throw new Error("SystemConfig não encontrada. Correr seed.");
  return config;
});

export async function calculateGuestFee(guestCount: number): Promise<number> {
  const config = await getSystemConfig();
  return config.invitationFeeCents * guestCount;
}

export async function convertUsdToMzn(usdCents: number): Promise<number> {
  const config = await getSystemConfig();
  return Math.round((usdCents / 100) * config.bimExchangeRate * 100);
}