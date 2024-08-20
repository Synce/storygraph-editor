import 'server-only'; // Make sure you can't import this on client

import {worldRouter} from '@/server/api/routers/world';
import {createTRPCRouter} from '@/server/api/trpc';

import {productionsRouter} from './routers/productions';
import {worldExportRouter} from './routers/worldExport';
import {worldLoaderRouter} from './routers/worldLoader';
import {worldMapRouter} from './routers/worldMap';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  world: worldRouter,
  worldLoader: worldLoaderRouter,
  worldMap: worldMapRouter,
  worldExport: worldExportRouter,
  productions: productionsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
