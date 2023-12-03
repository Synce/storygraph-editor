import '@/styles/globals.css';

import {Inter} from 'next/font/google';
import {headers} from 'next/headers';

import {TRPCReactProvider} from '@/trpc/react';
import {Toaster} from '@components/Toaster';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'Story Graph Editor',
  description: 'Story Graph Editor',
};

const RootLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <TRPCReactProvider headers={headers()}>{children}</TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  );
};
export default RootLayout;
