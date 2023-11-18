'use client';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {loggerLink, unstable_httpBatchStreamLink} from '@trpc/client';
import {createTRPCReact} from '@trpc/react-query';
import {useState} from 'react';

import {type AppRouter} from '@/server/api/root';

import {getUrl, transformer} from './shared';

export const api = createTRPCReact<AppRouter>();

type TRPCReactProviderProps = {
  children: React.ReactNode;
  headers: Headers;
};

export const TRPCReactProvider = ({
  headers,
  children,
}: TRPCReactProviderProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    api.createClient({
      transformer,
      links: [
        loggerLink({
          enabled: op =>
            process.env.NODE_ENV === 'development' ||
            (op.direction === 'down' && op.result instanceof Error),
        }),
        unstable_httpBatchStreamLink({
          url: getUrl(),
          headers() {
            const heads = new Map(headers);
            heads.set('x-trpc-source', 'react');
            return Object.fromEntries(heads);
          },
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  );
};
