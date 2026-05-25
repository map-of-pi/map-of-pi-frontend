'use client';

import { ThemeProvider } from 'next-themes';


import AppContextProvider from '../../context/AppContextProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" enableColorScheme={false}>
      <AppContextProvider>
        {children}
      </AppContextProvider>
    </ThemeProvider>
  );
}
