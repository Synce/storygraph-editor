import {PrismaClient} from '@prisma/client';

import {env} from '@/env.mjs';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  }).$extends({
    name: 'change Id to GivenId',
    result: {
      character: {
        GivenId: {
          needs: {
            GivenId: true,
            Id: true,
          },
          compute(data) {
            return data.GivenId ?? data.Id;
          },
        },
      },
      item: {
        GivenId: {
          needs: {
            GivenId: true,
            Id: true,
          },
          compute(data) {
            return data.GivenId ?? data.Id;
          },
        },
      },
      location: {
        GivenId: {
          needs: {
            GivenId: true,
            Id: true,
          },
          compute(data) {
            return data.GivenId ?? data.Id;
          },
        },
      },
      narration: {
        GivenId: {
          needs: {
            GivenId: true,
            Id: true,
          },
          compute(data) {
            return data.GivenId ?? data.Id;
          },
        },
      },
    },
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

export const db = globalForPrisma.prisma ?? prismaClientSingleton();

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
