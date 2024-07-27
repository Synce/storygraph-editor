import {PrismaClient} from '@prisma/client';
import {withBark} from 'prisma-extension-bark';

import {env} from '@/env.mjs';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  }).$extends(withBark({modelNames: ['worldNode']}));
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

export const db = globalForPrisma.prisma ?? prismaClientSingleton();

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
