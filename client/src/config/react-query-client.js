'use client';

import { QueryClient, QueryClientProvider } from "react-query";
import { AlertProvider } from '@/context/AlertContext';
const queryClient = new QueryClient();

export function ReactQueryProvider({ children }) {
  return (
    
      <AlertProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </AlertProvider>
  );
}
