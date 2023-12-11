import {headers} from 'next/headers';

import {appRouter} from '@/server/api/root';
import {createTRPCContext} from '@/server/api/trpc';

type Caller = ReturnType<typeof appRouter.createCaller>;

let caller: Caller | null = null;

// Cache the caller, since this runs per-request anyways.
const getCaller = () => {
  // This fn should be async if create context is async
  if (!caller) {
    caller = appRouter.createCaller(
      createTRPCContext({
        // @ts-expect-error - Await this if async
        req: {
          headers: headers(),
        },
      }),
    );
  }
  return caller;
};
// @ts-expect-error - https://github.com/t3-oss/create-t3-app/issues/1669
const routeOrCallProxy = (path: (string | symbol)[]) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return new Proxy<Function>( // We use a fn type because it tricks webpack into letting this actually run
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    getCaller, // Any function will do, since we override apply
    {
      get: (_, prop) => {
        if (caller) {
          // Route to deeper path in the api caller, for example api.edge.user.get().
          //  This is unlikely to be called if caller exists, but just in case.
          let val: unknown = caller;
          // eslint-disable-next-line no-restricted-syntax
          for (const p of path) {
            // @ts-expect-error - this is a hack to get the types to work
            val = val[p];
          }
          // @ts-expect-error - this is a hack to get the types to work
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return val[prop];
        }
        return routeOrCallProxy([...path, prop]) as unknown;
      },
      // Note: this is where you would insert async if the context was async
      apply: (_, __, args) => {
        // Function call should retrieve actual result, so we ensure that the caller exists at this point.
        const caller = getCaller(); // Await this if ctx async
        let val: unknown = caller;
        // eslint-disable-next-line no-restricted-syntax
        for (const p of path) {
          // @ts-expect-error - this is a hack to get the types to work
          val = val[p];
        }
        // @ts-expect-error - this is a hack to get the types to work
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
        return val(...args);
      },
    },
  );
};

export const api = new Proxy<Caller>({} as Caller, {
  get: (_, prop) => {
    if (caller) {
      return caller[prop as keyof Caller];
    }
    return routeOrCallProxy([prop]) as unknown;
  },
});
