import 'server-only'; // Make sure you can't import this on client

import {worldRouter} from '@/server/api/routers/world';
import {createTRPCRouter} from '@/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  world: worldRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
