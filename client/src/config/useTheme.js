'use client';

import { useQuery } from "react-query";

export function useTheme() {
  return useQuery({
    queryKey: ['theme'],
    queryFn: () => {
      const theme = document.documentElement.getAttribute('data-theme');
      return theme || 'light'; 
    },
    staleTime: Infinity,
  });
}